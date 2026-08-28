/**
 * Music Hit Maker Studio - Structure des paroles (blocs canoniques)
 * ------------------------------------------------------------------
 * Outil partagé (navigateur + Node) utilisé par Studio Pro :
 * - Convertit la structure texte d'un preset (« intro, verse, refrain, ... »)
 *   en un squelette de blocs de paroles aux types canoniques FR
 *   (Intro / Couplet N / Pré-refrain / Refrain / Pont / Outro).
 * - Normalise les types de blocs renvoyés par l'IA (tags FR / EN / ES)
 *   vers ces mêmes types canoniques FR.
 * - Nettoie le texte des blocs (suppression des tags [Section] résiduels).
 *
 * Utilisé par public/studio-pro.js et tests/test_lyrics_skeleton.js.
 */

"use strict";

/** Squelette complet par défaut (identique au bouton « Squelette » de Studio Pro). */
const LYRICS_SKELETON_DEFAULT = [
    "Intro",
    "Couplet 1",
    "Refrain",
    "Couplet 2",
    "Refrain",
    "Pont",
    "Outro"
];

/**
 * Mots-clés reconnus comme sections de structure. Utilisé pour découper
 * les structures compactes du type « verse-chorus » en plusieurs blocs,
 * tout en préservant « couplet-a », « pre-refrain », « through-composed »...
 */
const LYRICS_STRUCTURE_KEYWORDS = /^(intro|couplet|verse|verso|refrain|chorus|coro|pont|bridge|outro|hook|drop|break|finale|aaba|through|composed|auto)$/;

/**
 * Découpe une structure texte en tokens élémentaires.
 * « intro, verse-chorus, outro » -> ["intro", "verse", "chorus", "outro"]
 * « pre-refrain » / « couplet-a » restent entiers.
 * @param {string} structure
 * @returns {string[]}
 */
function splitStructureTokens(structure) {
    return String(structure || "")
        .split(/[,;]+/)
        .map((token) => token.trim())
        .filter(Boolean)
        .flatMap((token) => {
            const normParts = token
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .split("-");
            if (normParts.length > 1 && normParts.every((p) => LYRICS_STRUCTURE_KEYWORDS.test(p.trim()))) {
                return token.split("-");
            }
            return [token];
        });
}

/**
 * Traduit un libellé de section (token de structure ou type renvoyé par
 * l'IA, en FR / EN / ES) vers le type de bloc canonique FR de Studio Pro.
 * @param {string} raw - libellé brut (« Verse 1 », « Chorus », « Coro »...)
 * @param {{verse?: number}} [counters] - compteur mutué pour numéroter les couplets
 * @param {{fallbackRaw?: boolean}} [opts] - fallbackRaw: conserve le libellé
 *        brut si non reconnu (blocs IA) au lieu de l'ignorer (squelettes)
 * @returns {string|null}
 */
function toCanonicalLyricsType(raw, counters, opts) {
    const norm = String(raw || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    if (!norm) return null;

    if (/^intro/.test(norm)) return "Intro";
    if (/^(pre-?refrain|pre-?chorus|pre-?coro|pre-?hook)/.test(norm)) return "Pré-refrain";
    if (/final/.test(norm) && /(chorus|refrain|coro)/.test(norm)) return "Refrain";
    if (/^(refrain|chorus|coro|hook)/.test(norm)) return "Refrain";
    if (/^(pont|bridge|puente|drop|break|solo|instrumental)/.test(norm)) return "Pont";
    if (/^outro/.test(norm)) return "Outro";

    const verseMatch = norm.match(/^(couplet|verse|verso)\s*-?\s*(\d+|[ab])?\b/);
    if (verseMatch) {
        const c = counters || {};
        let num = parseInt(verseMatch[2], 10);
        if (!num) {
            c.verse = (c.verse || 0) + 1;
            num = c.verse;
        } else {
            c.verse = Math.max(c.verse || 0, num);
        }
        return "Couplet " + num;
    }

    if (opts && opts.fallbackRaw) {
        const rawTrimmed = String(raw).trim();
        return rawTrimmed || null;
    }
    return null;
}

/**
 * Construit un squelette de blocs de paroles (texte vide) à partir de la
 * structure texte d'un preset. Structures compactes ou non reconnues
 * (« aaba », « through-composed », « auto »...) -> squelette complet par défaut.
 * @param {string} structure
 * @returns {{type: string, text: string}[]}
 */
function buildLyricsSkeletonFromStructure(structure) {
    const counters = { verse: 0 };
    const types = [];
    splitStructureTokens(structure).forEach((token) => {
        const type = toCanonicalLyricsType(token, counters);
        if (type) types.push(type);
    });
    if (types.length === 0) {
        // Aucune section reconnue (aaba, through-composed, auto, vide...) :
        // on retombe sur le squelette complet par défaut.
        return LYRICS_SKELETON_DEFAULT.map((type) => ({ type, text: "" }));
    }
    return types.map((type) => ({ type, text: "" }));
}

/**
 * Nettoie le texte d'un bloc renvoyé par l'IA : supprime le tag
 * « [Section] » collé en tête (le type est déjà porté par le bloc).
 * @param {string} text
 * @param {string} [blockType] - type d'origine renvoyé par le modèle
 * @returns {string}
 */
function cleanAiBlockText(text, blockType) {
    let out = String(text || "").replace(/\r\n/g, "\n").trim();
    if (blockType) {
        const escaped = String(blockType).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        out = out.replace(new RegExp("^\\s*\\[" + escaped + "\\]\\s*", "i"), "");
    }
    // Filet de sécurité : un éventuel tag [Section] résiduel en tête
    out = out.replace(/^\s*\[[^\]\n]*\]\s*(?:\n|$)/, "").trim();
    return out;
}

module.exports = {
    LYRICS_SKELETON_DEFAULT,
    splitStructureTokens,
    toCanonicalLyricsType,
    buildLyricsSkeletonFromStructure,
    cleanAiBlockText
};

// Export navigateur (chargé avant studio-pro.js)
if (typeof window !== "undefined") {
    window.LyricsStructure = {
        LYRICS_SKELETON_DEFAULT,
        splitStructureTokens,
        toCanonicalLyricsType,
        buildLyricsSkeletonFromStructure,
        cleanAiBlockText
    };
}