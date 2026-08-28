"use strict";
/**
 * tests/test_lyrics_language.js
 * -------------------------------------------------------------
 * Valide la règle « la langue des paroles suit la langue de
 * l'artiste de référence » :
 *   1. Chaque artiste de la BDD est résolu vers la bonne langue.
 *   2. Les configs par langue sont cohérentes (balises, exemples).
 *   3. Le prompt système de server.js est correctement injecté
 *      pour un artiste anglais / espagnol / français / inconnu.
 *   4. cron_daily.js et social_publisher.js sont branchés.
 * Aucun réseau ni clé API requis. Lancer : node tests/test_lyrics_language.js
 */

process.env.VERCEL = "true"; // empêche app.listen() lors du require de server.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { ARTISTS_DATABASE } = require("../public/artistes_presets.js");
const {
    LYRICS_LANGUAGE_CONFIGS,
    resolveLyricsLanguage,
    buildLyricsLanguageBlock,
    normalizeBlockType,
    normalizeBlockTypes
} = require("../lyrics_language.js");

let passed = 0;
function check(label, fn) {
    try {
        fn();
        passed++;
        console.log("  ✅ " + label);
    } catch (err) {
        console.error("  ❌ " + label);
        console.error("     " + err.message);
        process.exitCode = 1;
    }
}

console.log("\n[1] Résolution langue <-> champ BDD sur les "
    + ARTISTS_DATABASE.length + " artistes");

// Langues cibles avec résolution explicite ; toute langue au-delà de
// {Français, Anglais, Espagnol} retombe sur le français (fallback historique),
// exactement comme les artistes déjà présents (Kabyle, Arabe, Portugais,
// Tamazight, Bambara, Kreyòl, Italien, Latin, Allemand, ...).
const expectedMap = { "Français": "fr", "Anglais": "en", "Espagnol": "es" };
const counts = { fr: 0, en: 0, es: 0 };

check("chaque artiste mappe vers une langue résolue valide", () => {
    for (const a of ARTISTS_DATABASE) {
        assert(a.language && typeof a.language === "string", `langue manquante : ${a.name}`);
        const got = resolveLyricsLanguage(a.language);
        assert(["fr", "en", "es"].includes(got), `${a.name} (${a.language}) -> code ${got} inattendu`);
        const expected = expectedMap[a.language] || "fr";
        assert.strictEqual(got, expected, `${a.name} (${a.language}) -> ${got} (attendu ${expected})`);
        counts[got]++;
    }
});

check("la répartition résolue couvre toute la BDD de façon cohérente", () => {
    assert.strictEqual(counts.fr + counts.en + counts.es, ARTISTS_DATABASE.length,
        "la somme des langues résolues doit couvrir tous les artistes");
    assert.deepStrictEqual(Object.keys(counts).sort(), ["en", "es", "fr"]);
});

check("la BDD contient les nouvelles entrées orchestrales & opéra", () => {
    const names = new Set(ARTISTS_DATABASE.map((a) => a.name));
    assert(names.has("Hans Zimmer"), "Hans Zimmer manque de la BDD orchestre");
    assert(names.has("Carmina Burana"), "Carmina Burana manque de la BDD opéra");
    assert(ARTISTS_DATABASE.some((a) => /^Orchestre/.test(a.genre) && a.language === "Anglais"),
        "aucune entrée orchestrale en anglais");
    assert(ARTISTS_DATABASE.some((a) => /^Opéra/.test(a.genre) && a.language === "Latin"),
        "aucune entrée opéra en latin");
    assert(ARTISTS_DATABASE.some((a) => /^Opéra/.test(a.genre) && a.language === "Italien"),
        "aucune entrée opéra en italien");
});

check("valeurs variantes & inconnues -> défaut français", () => {
    assert.strictEqual(resolveLyricsLanguage("Anglais"), "en");
    assert.strictEqual(resolveLyricsLanguage(""), "fr");
    assert.strictEqual(resolveLyricsLanguage("Klingon"), "fr");
});

console.log("\n[2] Cohérence des configurations par langue");

check("balises et exemples propres à chaque langue", () => {
    assert(LYRICS_LANGUAGE_CONFIGS.fr.structuralTags.includes("[Couplet 1]"));
    assert(LYRICS_LANGUAGE_CONFIGS.en.structuralTags.includes("[Verse 1]")
        && LYRICS_LANGUAGE_CONFIGS.en.structuralTags.includes("[Chorus]"));
    assert(LYRICS_LANGUAGE_CONFIGS.es.structuralTags.includes("[Verso 1]")
        && LYRICS_LANGUAGE_CONFIGS.es.structuralTags.includes("[Coro]"));
    assert(!LYRICS_LANGUAGE_CONFIGS.es.structuralTags.includes("Verse"));
    assert(!LYRICS_LANGUAGE_CONFIGS.en.structuralTags.includes("Verso"));
});

console.log("\n[3] Injection dans le prompt système (server.js)");

// VERCEL=true est déjà posé avant le require : server.js ne démarre pas
// l'écoute HTTP et expose buildSystemPrompt pour ce test.
const serverApp = require("../server.js");
const buildSystemPrompt = serverApp.buildSystemPrompt;
assert.strictEqual(typeof buildSystemPrompt, "function",
    "server.js doit exposer buildSystemPrompt via module.exports");

function promptFor(artist) {
    return buildSystemPrompt({ theme: "", artist, isAutoMode: true });
}

check("artiste anglais -> consignes 100% ANGLAIS", () => {
    const enArtist = ARTISTS_DATABASE.find((a) => a.language === "Anglais");
    const p = promptFor(enArtist);
    assert(p.includes("Langue imposée : ANGLAIS"), "bloc langue manquant");
    assert(p.includes("- Langue native (BDD) : Anglais"));
    assert(p.includes("[Chorus]") && p.includes('"type": "Chorus"'), "balises/blocs EN manquants");
    assert(!p.includes("Couplet 1"), "balises FR encore présentes pour un artiste EN");
});

check("artiste espagnol -> consignes 100% ESPAGNOL", () => {
    const esArtist = ARTISTS_DATABASE.find((a) => a.language === "Espagnol");
    const p = promptFor(esArtist);
    assert(p.includes("Langue imposée : ESPAGNOL"));
    assert(p.includes("[Coro]") && p.includes('"type": "Coro"'));
    assert(p.includes("rédigé en español"));
    assert(!p.includes('"type": "Refrain"') && !p.includes("[Couplet 1]"),
        "balises FR résiduelles pour ES");
});

check("artiste français -> comportement historique conservé", () => {
    const frArtist = ARTISTS_DATABASE.find((a) => a.language === "Français");
    const p = promptFor(frArtist);
    assert(p.includes("Langue imposée : FRANÇAIS"));
    assert(p.includes("[Couplet 1]") && p.includes('"type": "Refrain"'));
});

check("artiste absent de la BDD -> français (défaut)", () => {
    const p = promptFor(null);
    assert(p.includes("Langue imposée : FRANÇAIS"));
    assert(p.includes("Artiste Polyvalent"));
});

console.log("\n[4] Autres points d'intégration");

check("cron_daily.js branché sur la directive partagée", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "cron_daily.js"), "utf8");
    assert(src.includes('require("./lyrics_language.js")'));
    assert(src.includes("buildLyricsLanguageBlock(artist)"));
    assert(src.includes("langCfg.themeWord"));
});

check("social_publisher.js extrait aussi Chorus/Coro", () => {
    const src = fs.readFileSync(path.join(__dirname, "..", "social_publisher.js"), "utf8");
    assert(/refrain\|chorus\|coro/.test(src), "regex multilingue introuvable");
});

check("module tolère un profil artiste partiel ou nul", () => {
    const b = buildLyricsLanguageBlock({});
    assert(b.lines[0].includes("RÈGLE ABSOLUE"));
    assert.strictEqual(b.config.code, "fr");
    assert.strictEqual(buildLyricsLanguageBlock(null).config.code, "fr");
});

console.log("\n[5] Harmonisation des titres de sections (normalisation serveur)");

check("mapping FR -> EN : Pré-refrain/Refrain/Couplet/Pont", () => {
    assert.strictEqual(normalizeBlockType("Pré-refrain", "en"), "Pre-Chorus");
    assert.strictEqual(normalizeBlockType("Refrain final", "en"), "Final Chorus");
    assert.strictEqual(normalizeBlockType("Refrain", "en"), "Chorus");
    assert.strictEqual(normalizeBlockType("Couplet 1", "en"), "Verse 1");
    assert.strictEqual(normalizeBlockType("Couplet 2 - flow switch", "en"), "Verse 2 - flow switch");
    assert.strictEqual(normalizeBlockType("Pont", "en"), "Bridge");
    // Titres déjà anglais ou exotiques : conservés à l'identique
    assert.strictEqual(normalizeBlockType("Intro", "en"), "Intro");
    assert.strictEqual(normalizeBlockType("Skit", "en"), "Skit");
    assert.strictEqual(normalizeBlockType("", "en"), "");
});

check("mapping FR -> ES : Pre-Coro/Coro/Verso/Puente", () => {
    assert.strictEqual(normalizeBlockType("Pré-refrain", "es"), "Pre-Coro");
    assert.strictEqual(normalizeBlockType("Refrain", "es"), "Coro");
    assert.strictEqual(normalizeBlockType("Couplet 3", "es"), "Verso 3");
    assert.strictEqual(normalizeBlockType("Pont", "es"), "Puente");
});

check("no-op pour artiste francophone / langue inconnue / null", () => {
    const mixed = [{ type: "Couplet 2", text: "x" }];
    assert.deepStrictEqual(normalizeBlockTypes(mixed, { language: "Français" }), mixed);
    assert.deepStrictEqual(normalizeBlockTypes(mixed, { language: "Klingon" }), mixed);
    assert.deepStrictEqual(normalizeBlockTypes(mixed, null), mixed);
    assert.deepStrictEqual(normalizeBlockTypes(null, ARTISTS_DATABASE[0]), []);
});

check("pipeline EN complet : blocs mixtes harmonisés (cas Drake réel)", () => {
    const drake = ARTISTS_DATABASE.find((a) => a.name === "Drake");
    const out = normalizeBlockTypes([
        { type: "Couplet 1", text: "line" },
        { type: "Pré-refrain", text: "" },
        { type: "Refrain", text: "" },
        { type: "Couplet 2", text: "" },
        { type: "Pont", text: "" }
    ], drake);
    assert.deepStrictEqual(
        out.map((b) => b.type),
        ["Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Bridge"],
        "les titres français doivent être traduits pour Drake"
    );
});

console.log("\n──────────────────────────────────────────────");
if (process.exitCode) {
    console.log("❌ ÉCHEC : certains contrôles ont échoué.");
} else {
    console.log(`✅ SUCCÈS : ${passed} vérifications passées.`);
}
