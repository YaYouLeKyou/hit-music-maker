/**
 * extract_json.js — Extraction robuste d'un objet JSON depuis la réponse d'un LLM.
 * Partage entre server.js, cron_daily.js et tests.
 *
 * Gère :
 * - les balises markdown ```json ... ``` et le texte autour,
 * - les guillemets droits non échappés à l'intérieur des chaînes (paroles),
 * - les réponses tronquées en fin de bloc (bout de génération coupé).
 */
"use strict";

/**
 * Répare les guillemets droits non échappés à l'intérieur des chaînes JSON
 * (erreur classique des LLM : « elle m'a dit "oui" » dans un texte de paroles).
 * @param {string} raw
 * @returns {string}
 */
function repairJsonQuotes(raw) {
    let out = "";
    let inStr = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (inStr) {
            if (escaped) {
                out += ch;
                escaped = false;
                continue;
            }
            if (ch === "\\") {
                out += ch;
                escaped = true;
                continue;
            }
            if (ch === '"') {
                // Un " est un terminateur de chaîne uniquement si le prochain
                // caractère NON-ESPACE est un séparateur JSON (, } ] : ou la fin
                // du flux ; sinon c'est un guillemet intérieur à échapper.
                // Ex : « "oui" hier » -> guillemet intérieur (o = lettre).
                // Ex : « "valeur" } » -> terminateur (} = séparateur).
                let j = i + 1;
                while (j < raw.length && /\s/.test(raw[j])) j++;
                const next = raw[j];
                if (next === undefined || /[,}\]:]/.test(next)) {
                    inStr = false;
                    out += '"';
                } else {
                    out += '\\"';
                }
                continue;
            }
            out += ch;
        } else {
            out += ch;
            if (ch === '"') inStr = true;
        }
    }
    return out;
}

/**
 * Répare les guillemets droits non échappés puis ferme les structures JSON
 * ouvertes (accolades/crochets non refermés en fin de réponse tronquée).
 * @param {string} str - portion JSON (déjà coupée à un `}` ou `]`)
 * @returns {string|null} chaîne JSON équilibrée, ou null si incohérente
 */
function balanceAndParse(str) {
    const repaired = repairJsonQuotes(str);
    // Suit une pile d'ouvertures `{` / `[` hors des chaînes pour refermer
    // correctement (une `[` non fermée doit être refermée par `]`, pas `}`).
    const stack = [];
    let inStr = false;
    let escaped = false;
    for (let i = 0; i < repaired.length; i++) {
        const ch = repaired[i];
        if (inStr) {
            if (escaped) { escaped = false; continue; }
            if (ch === "\\") { escaped = true; continue; }
            if (ch === '"') inStr = false;
            continue;
        }
        if (ch === '"') { inStr = true; continue; }
        if (ch === "{" || ch === "[") stack.push(ch);
        else if (ch === "}" || ch === "]") {
            // Vérifie la cohérence de la fermeture
            const top = stack[stack.length - 1];
            const expected = top === "{" ? "}" : top === "[" ? "]" : null;
            if (expected === ch) stack.pop();
            else if (expected !== null) return null; // incohérent, pas la bonne coupe
        }
    }
    // Referme dans l'ordre inverse (LIFO)
    let closers = "";
    for (let i = stack.length - 1; i >= 0; i--) {
        closers += stack[i] === "{" ? "}" : "]";
    }
    try {
        return JSON.parse(repaired + closers);
    } catch (_) {
        return null;
    }
}

/**
 * Tente de récupérer l'objet JSON complet en tronquant progressivement l'extrémité
 * lorsqu'un JSON est coupé (limite de tokens) : on garde la plus grande portion qui
 * se termine par une structure fermée.
 * @param {string} raw
 * @returns {object|null}
 */
function parseBestEffort(raw) {
    const str = raw.trim();
    const end = str.lastIndexOf("}");
    if (end <= 1) return null;
    let start = str.indexOf("{");
    let cut = end;
    let attempts = 0;
    while (cut >= start && attempts < 200) {
        const candidate = balanceAndParse(str.slice(start, cut + 1));
        if (candidate) return candidate;
        const prevEnd = str.lastIndexOf("}", cut - 1);
        if (prevEnd <= start) break;
        cut = prevEnd;
        attempts++;
    }
    return null;
}

/**
 * Extrait le premier objet JSON valide d'une chaîne, en ignorant les balises
 * markdown ```json ... ``` et le texte autour. Tolérant aux erreurs du LLM :
 * - guillemets non échappés à l'intérieur des chaînes (paroles),
 * - réponse tronquée en fin de bloc.
 * @param {string} text
 * @returns {object}
 */
function extractJson(text) {
    const cleaned = String(text || "").replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("{");
    if (start === -1) {
        throw new Error("Aucun objet JSON trouvé dans la réponse.");
    }
    const sliced = cleaned.slice(start);
    const end = sliced.lastIndexOf("}");

    // 1) JSON strict (cas nominal)
    try {
        return JSON.parse(sliced);
    } catch (_) { /* on tente les réparations ci-dessous */ }

    // 2) Sous-chaîne entre la première { et la dernière } (balises / texte autour)
    if (end > 0) {
        try {
            return JSON.parse(sliced.slice(0, end + 1));
        } catch (_) { /* on continue */ }
    }

    // 3) Réparation des guillemets intérieurs non échappés
    try {
        return JSON.parse(repairJsonQuotes(sliced));
    } catch (_) { /* on continue */ }

    // 4) JSON tronqué (coupe au dernier objet/bloc complet)
    const best = parseBestEffort(sliced);
    if (best) return best;

    throw new Error("Aucun objet JSON valide et complet dans la réponse.");
}

module.exports = { extractJson, repairJsonQuotes, parseBestEffort };