/**
 * Tests du module lyrics_structure.js
 * ------------------------------------
 * Vérifie la conversion structure de preset -> blocs canoniques FR,
 * la normalisation des types renvoyés par l'IA et le nettoyage des tags.
 * Exécution : node tests/test_lyrics_skeleton.js
 */
"use strict";

const assert = require("assert");
const {
    buildLyricsSkeletonFromStructure,
    toCanonicalLyricsType,
    cleanAiBlockText,
    splitStructureTokens
} = require("../public/lyrics_structure.js");

// --- 1. Preset « Reggae Bob Marley » : structure complète -----------------
const reggae = buildLyricsSkeletonFromStructure("intro, verse, refrain, verse, refrain, bridge, refrain, outro");
assert.deepStrictEqual(reggae.map((b) => b.type), [
    "Intro", "Couplet 1", "Refrain", "Couplet 2", "Refrain", "Pont", "Refrain", "Outro"
]);
assert.ok(reggae.every((b) => b.text === ""), "Les blocs du squelette doivent avoir un texte vide");

// --- 2. Structure avec couplets lettrés (présets STUDIO) ------------------
const presetA = buildLyricsSkeletonFromStructure("intro, couplet-a, refrain, couplet-b, refrain, bridge, outro");
assert.deepStrictEqual(presetA.map((b) => b.type), [
    "Intro", "Couplet 1", "Refrain", "Couplet 2", "Refrain", "Pont", "Outro"
]);

// --- 3. Structures compactes « verse-chorus » -----------------------------
const compact = buildLyricsSkeletonFromStructure("verse-chorus");
assert.deepStrictEqual(compact.map((b) => b.type), ["Couplet 1", "Refrain"]);

// --- 4. Structures non reconnues -> squelette par défaut ------------------
const fallback = buildLyricsSkeletonFromStructure("aaba");
assert.deepStrictEqual(fallback.map((b) => b.type), [
    "Intro", "Couplet 1", "Refrain", "Couplet 2", "Refrain", "Pont", "Outro"
]);
const fallback2 = buildLyricsSkeletonFromStructure("");
assert.strictEqual(fallback2.length, 7);
const fallback3 = buildLyricsSkeletonFromStructure("through-composed");
assert.strictEqual(fallback3.length, 7);

// --- 5. Normalisation des types renvoyés par l'IA (FR / EN / ES) ----------
const counters = { verse: 0 };
assert.strictEqual(toCanonicalLyricsType("Intro", counters, { fallbackRaw: true }), "Intro");
assert.strictEqual(toCanonicalLyricsType("Verse 1", counters, { fallbackRaw: true }), "Couplet 1");
assert.strictEqual(toCanonicalLyricsType("Verse", counters, { fallbackRaw: true }), "Couplet 2");
assert.strictEqual(toCanonicalLyricsType("Pre-Chorus", counters, { fallbackRaw: true }), "Pré-refrain");
assert.strictEqual(toCanonicalLyricsType("Chorus", counters, { fallbackRaw: true }), "Refrain");
assert.strictEqual(toCanonicalLyricsType("Final Chorus", counters, { fallbackRaw: true }), "Refrain");
assert.strictEqual(toCanonicalLyricsType("Bridge", counters, { fallbackRaw: true }), "Pont");
assert.strictEqual(toCanonicalLyricsType("Outro", counters, { fallbackRaw: true }), "Outro");
// Tags espagnols
assert.strictEqual(toCanonicalLyricsType("Verso 1", counters, { fallbackRaw: true }), "Couplet 1");
assert.strictEqual(toCanonicalLyricsType("Pre-Coro", counters, { fallbackRaw: true }), "Pré-refrain");
assert.strictEqual(toCanonicalLyricsType("Coro", counters, { fallbackRaw: true }), "Refrain");
assert.strictEqual(toCanonicalLyricsType("Puente", counters, { fallbackRaw: true }), "Pont");
// Types spéciaux mappés vers un canonique (Pont), inconnu : conservé tel quel
assert.strictEqual(toCanonicalLyricsType("Instrumental Break", counters, { fallbackRaw: true }), "Pont");
assert.strictEqual(toCanonicalLyricsType("aaba", counters), null);
assert.strictEqual(toCanonicalLyricsType("", counters), null);

// --- 6. Nettoyage des tags dans le texte des blocs ------------------------
assert.strictEqual(
    cleanAiBlockText("[Intro] (susurrando) En la luz fría", "Intro"),
    "(susurrando) En la luz fría"
);
assert.strictEqual(
    cleanAiBlockText("[Verse 1]\nCada scroll es un latido", "Verse 1"),
    "Cada scroll es un latido"
);
assert.strictEqual(cleanAiBlockText("Texte sans tag", "Refrain"), "Texte sans tag");
assert.strictEqual(cleanAiBlockText(null, "Refrain"), "");

// --- 7. Découpe des tokens -------------------------------------------------
assert.deepStrictEqual(splitStructureTokens("intro, verse-chorus, outro"), ["intro", "verse", "chorus", "outro"]);
assert.deepStrictEqual(splitStructureTokens("intro, pre-refrain, outro"), ["intro", "pre-refrain", "outro"]);

console.log("✅ Tous les tests lyrics_structure sont passés ("
    + (7) + " groupes de vérifications)");