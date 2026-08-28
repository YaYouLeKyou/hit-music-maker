/**
 * Test d'intégration : presets Studio enrichis (lyrics) + squelettes
 * -------------------------------------------------------------------
 * Charge artistes_presets.js + studio_presets.js dans un contexte VM
 * navigateur-like et vérifie que la config auto produit des thématiques
 * lyrics enrichies pour toute la BDD d'artistes, plus le squelette de
 * blocs dérivé de la structure du modèle.
 * Exécution : node tests/test_studio_presets_lyrics.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ctx = { console, window: {}, setTimeout };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/artistes_presets.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/studio_presets.js"), "utf8"), ctx);

const LyricsStructure = require("../public/lyrics_structure.js");

const presets = ctx.window.ARTIST_PRESETS;
console.log("Nombre total de presets (studio + BDD) :", presets.length);

// 1. Preset généré depuis la BDD pour Bob Marley
const bob = presets.find((p) => p.id === "bobmarley");
if (!bob) throw new Error("Preset bobmarley introuvable");
console.log("\n--- buildArtistPreset (Bob Marley) — lyrics enrichies ---");
console.log("language  :", bob.lyrics.language);
console.log("structure :", bob.lyrics.structure);
console.log("theme     :", bob.lyrics.theme.slice(0, 140) + "…");
const skel = LyricsStructure.buildLyricsSkeletonFromStructure(bob.lyrics.structure);
console.log("squelette :", skel.map((b) => b.type).join(" | "));
if (bob.lyrics.theme.toLowerCase().includes("generic")) throw new Error("Theme 'Generic' non enrichi !");
if (bob.lyrics.structure.includes("Verse / Refrain")) throw new Error("Structure non enrichie !");

// 2. Aucune thématique 'Generic' ne doit subsister dans toute la BDD
const genericCount = presets.filter((p) => p.lyrics && p.lyrics.theme === "Generic").length;
console.log("\npresets avec theme 'Generic' restants :", genericCount);
if (genericCount > 0) throw new Error("Des presets ont encore theme: Generic");

// 3. Preset studio « Reggae Bob Marley » (chip)
const studioReggae = presets.find((p) => p.id === "reggae-bob-marley");
console.log("\n--- STUDIO_PRESET reggae-bob-marley ---");
console.log("structure :", studioReggae.lyrics.structure);
console.log("theme     :", studioReggae.lyrics.theme);
console.log("squelette :", LyricsStructure.buildLyricsSkeletonFromStructure(studioReggae.lyrics.structure).map((b) => b.type).join(" | "));

console.log("\n✅ Test d'intégration presets/lyrics : OK");