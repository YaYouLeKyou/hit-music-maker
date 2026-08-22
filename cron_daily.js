/**
 * Music Hit Maker Studio - Job quotidien STANDALONE (sans serveur)
 * -----------------------------------------------------------------
 * Script exécutable directement en ligne de commande, conçu pour
 * GitHub Actions (100% cloud, 100% gratuit) ou tout cron local.
 *
 * Pipeline :
 *   1. Importe la BDD ARTISTS_DATABASE depuis public/artistes_presets.js
 *   2. Sélectionne aléatoirement un artiste studio
 *   3. Contacte l'API Groq (fetch natif) avec process.env.GROQ_API_KEY
 *      -> Fallback automatique sur Gemini si Groq échoue
 *   4. Génère : thème profond/introspectif, stylePrompt Suno/Udio,
 *      imagePrompt (pochette d'album) et paroles structurées
 *   5. Génère la pochette d'album via Nano Banana (image Gemini)
 *      avec process.env.BANANA_API_KEY -> cover_of_the_day.png
 *   6. Affiche le résultat dans la console
 *   7. Sauvegarde le hit dans hits/hit-<date>.json (+ pochette)
 *   8. Envoie une notification Discord si DISCORD_WEBHOOK_URL est défini
 *
 * Usage :
 *   node cron_daily.js            # exécution unique
 *   node cron_daily.js --dry-run  # sans sauvegarde ni notification
 */

"use strict";

const fs = require("fs");
const path = require("path");

const { ARTISTS_DATABASE } = require("./public/artistes_presets.js");

// ============================================================
// Configuration
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Clé Gemini (utilisée pour le fallback LLM ET pour l'image Nano Banana)
const GEMINI_API_KEY = process.env.BANANA_API_KEY || process.env.GEMINI_API_KEY || "";
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "nano-banana-pro-preview";
const GEMINI_IMAGE_FALLBACK_MODEL = process.env.GEMINI_IMAGE_FALLBACK_MODEL || "gemini-2.5-flash-image";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const DRY_RUN = process.argv.includes("--dry-run");

const NL = String.fromCharCode(10); // saut de ligne fiable

if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    console.error("❌ [CRON] Aucune clé LLM fournie. Définissez au moins GROQ_API_KEY");
    console.error("   (ou BANANA_API_KEY / GEMINI_API_KEY pour le fallback Gemini).");
    process.exit(1);
}

/** Rappel des secrets GitHub à configurer */
function printSecretsReminder() {
    console.log("📌 [CRON] Rappel configuration GitHub (Settings > Secrets and variables > Actions) :");
    console.log("   • GROQ_API_KEY     : votre clé gsk_... (obligatoire)");
    console.log("   • BANANA_API_KEY   : votre clé Gemini/Nano Banana (pochette + fallback)");
    console.log("   • DISCORD_WEBHOOK_URL : optionnel (notification du hit du jour)");
    console.log("");
}

// ============================================================
// Prompt système (Directeur Artistique d'élite - thème profond)
// ============================================================

function buildSystemPrompt(artist) {
    const artistName = artist.name;

    return [
        "Tu es un Directeur Artistique, Parolier et Producteur Audio d'élite.",
        "Ton rôle est de générer la structure complète et les paroles d'une chanson à succès.",
        "",
        "MODE CRÉATION AUTO & THÈMES PROFONDS :",
        "- N'utilise PAS de thèmes génériques (fête, amour basique, argent).",
        "- GÉNÈRE UN THÈME PROFOND, INTROSPECTIF ET MARQUANT. Exemples de directions :",
        "  * L'aliénation numérique et la quête de réel dans un monde saturé d'écrans.",
        "  * Le poids du succès, la solitude au sommet et la trahison des proches.",
        "  * La nostalgie de l'enfance face à la violence du passage à l'âge adulte.",
        "  * La dualité entre la lumière publique et l'obscurité intérieure.",
        "  * L'héritage familial, les sacrifices invisibles des parents et la rédemption.",
        "",
        "DONNÉES STUDIO DE L'ARTISTE CIBLE :",
        "- Nom : " + artistName,
        "- Genre : " + artist.genre,
        "- Plage BPM : " + artist.bpm_range,
        "- Instruments : " + artist.instruments,
        "- Diction & Flow : " + artist.flow_signature,
        "- Preset Audio : " + artist.prompt_audio_preset,
        "",
        "INSTRUCTIONS STRICTES :",
        "1. PAROLES & MÉTRIQUE : Écris des paroles profondes avec une vraie poésie moderne.",
        "   Respecte la Flow Signature de " + artistName + ". Inclus des balises [Intro], [Couplet 1],",
        "   [Pré-refrain], [Refrain], [Couplet 2], [Pont], [Outro] et des annotations (Ad-libs, chœurs).",
        "2. STYLE PROMPT (SUNO/UDIO) : Génère un prompt audio en ANGLAIS précis incluant genre,",
        "   BPM exact, instrumentation et texture vocale.",
        "3. IMAGE PROMPT (POCHETTE D'ALBUM) : Génère un prompt visuel en ANGLAIS, très descriptif",
        "   et cinématographique, parfaitement adapté au thème profond généré et à l'univers de",
        "   l'artiste. Il doit inclure : style artistique, ambiance, palette de couleurs, cadrage,",
        "   éclairage, et se terminer par 'album cover art, 8k, highly detailed'.",
        "",
        "Réponds STRICTEMENT sous forme d'objet JSON valide (sans texte hors du JSON) :",
        "{",
        '  "generatedTheme": "Titre/Résumé du thème profond généré",',
        '  "artistUsed": "' + artistName + '",',
        '  "stylePrompt": "Prompt audio en anglais pour Suno",',
        '  "imagePrompt": "Detailed cinematic 8k album cover art, dark aesthetic, moody lighting, highly detailed...",',
        '  "blocks": [',
        '    { "type": "Intro", "text": "paroles..." },',
        '    { "type": "Couplet 1", "text": "paroles..." },',
        '    { "type": "Refrain", "text": "paroles..." },',
        '    { "type": "Outro", "text": "paroles..." }',
        "  ]",
        "}"
    ].join(NL);
}

const USER_INSTRUCTION = [
    "Génère la chanson complète conformément aux instructions du système.",
    "Réponds UNIQUEMENT avec l'objet JSON valide, sans texte autour, sans balises markdown."
].join(NL);

/** Extrait le premier objet JSON valide d'une réponse LLM (gère ```json … ```) */
function extractJson(text) {
    const cleaned = text.replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("Aucun objet JSON trouvé dans la réponse du modèle.");
    }
    return JSON.parse(cleaned.slice(start, end + 1));
}

// ============================================================
// Génération LLM : Groq (principal) -> Gemini (fallback)
// ============================================================

async function callGroq(artist) {
    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.9,
            max_tokens: 4096,
            messages: [
                { role: "system", content: buildSystemPrompt(artist) },
                { role: "user", content: USER_INSTRUCTION }
            ]
        })
    });

    if (!response.ok) {
        let detail = "";
        try {
            const errBody = await response.json();
            detail = errBody?.error?.message || JSON.stringify(errBody);
        } catch (_) {
            detail = "";
        }
        throw new Error(`Erreur API Groq (${response.status}) : ${detail || "réponse inattendue"}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("Réponse vide de l'API Groq.");
    return rawContent;
}

async function callGemini(artist) {
    const url = `${GEMINI_API_BASE}/${GEMINI_TEXT_MODEL}:generateContent`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: buildSystemPrompt(artist) + NL + NL + USER_INSTRUCTION }] }],
            generationConfig: { temperature: 0.9, responseMimeType: "application/json" }
        })
    });

    if (!response.ok) {
        let detail = "";
        try {
            const errBody = await response.json();
            detail = errBody?.error?.message || JSON.stringify(errBody);
        } catch (_) {
            detail = "";
        }
        throw new Error(`Erreur API Gemini (${response.status}) : ${detail || "réponse inattendue"}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || "").join("").trim();
    if (!text) throw new Error("Réponse vide de l'API Gemini.");
    return text;
}

async function generateDailyHit() {
    // 1. Artiste aléatoire dans la BDD studio
    const artist = ARTISTS_DATABASE[Math.floor(Math.random() * ARTISTS_DATABASE.length)];
    console.log("🎲 [CRON] Artiste sélectionné : " + artist.name + " (" + artist.genre + ")");

    // 2. Appel LLM : Groq d'abord, fallback Gemini
    let rawContent = null;
    let llmProvider = "groq/" + GROQ_MODEL;

    if (GROQ_API_KEY) {
        console.log("🧠 [CRON] Génération du thème profond et des paroles via Groq…");
        try {
            rawContent = await callGroq(artist);
        } catch (groqErr) {
            console.warn("⚠️ [CRON] Groq indisponible (" + groqErr.message + ")");
            if (!GEMINI_API_KEY) throw groqErr;
            console.log("🔁 [CRON] Bascule automatique vers Gemini…");
        }
    }

    if (!rawContent && GEMINI_API_KEY) {
        llmProvider = "gemini/" + GEMINI_TEXT_MODEL;
        rawContent = await callGemini(artist);
    }

    if (!rawContent) throw new Error("Aucun fournisseur LLM disponible.");

    const parsed = extractJson(rawContent);

    // 3. Normalisation du résultat
    const hit = {
        date: new Date().toISOString(),
        provider: llmProvider,
        generatedTheme: typeof parsed.generatedTheme === "string" ? parsed.generatedTheme : "",
        artistUsed: typeof parsed.artistUsed === "string" && parsed.artistUsed ? parsed.artistUsed : artist.name,
        stylePrompt: typeof parsed.stylePrompt === "string" ? parsed.stylePrompt : "",
        imagePrompt: typeof parsed.imagePrompt === "string" ? parsed.imagePrompt : "",
        blocks: Array.isArray(parsed.blocks)
            ? parsed.blocks
                .filter((b) => b && typeof b === "object")
                .map((b) => ({
                    type: typeof b.type === "string" ? b.type : "Couplet",
                    text: typeof b.text === "string" ? b.text : ""
                }))
            : [],
        lyrics: "",
        coverPath: null
    };

    // Lyrics complets prêts à coller dans Suno/Udio
    // (on retire une éventuelle balise dupliquée en tête du texte du bloc)
    hit.lyrics = hit.blocks
        .map((b) => "[" + b.type + "]" + NL + b.text.trim().replace(/^\s*\[[^\]]*\]\s*/, ""))
        .join(NL + NL);

    return hit;
}

// ============================================================
// Pochette d'album via Nano Banana (génération d'image Gemini)
// ============================================================

async function generateCoverArt(hit) {
    if (!GEMINI_API_KEY) {
        console.warn("⚠️ [CRON] BANANA_API_KEY/GEMINI_API_KEY absente — pochette ignorée.");
        return;
    }
    if (!hit.imagePrompt) {
        console.warn("⚠️ [CRON] Pas d'imagePrompt généré — pochette ignorée.");
        return;
    }

    console.log("🎨 [CRON] Génération de la pochette d'album via Nano Banana…");

    const prompt = "Generate an album cover art image. " + hit.imagePrompt +
        " Square format, no text overlay unless stylistically essential.";

    // Essaie le modèle principal (Nano Banana) puis le modèle de secours
    const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_FALLBACK_MODEL];
    let data = null;

    for (const model of modelsToTry) {
        const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (response.ok) {
            data = await response.json();
            break;
        }

        let detail = "";
        try {
            const errBody = await response.json();
            detail = errBody?.error?.message || JSON.stringify(errBody);
        } catch (_) {
            detail = "";
        }
        console.warn("⚠️ [CRON] Modèle image « " + model + " » indisponible (" + response.status + ") : " + detail);
    }

    if (!data) {
        console.warn("⚠️ [CRON] Génération de pochette échouée sur tous les modèles image.");
        return;
    }
    const parts = data?.candidates?.[0]?.content?.parts || [];

    // Recherche de l'image en base64 dans la réponse
    const imagePart = parts.find((p) => p.inlineData && p.inlineData.data);

    if (imagePart) {
        const mimeType = imagePart.inlineData.mimeType || "image/png";
        const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? ".jpg" : ".png";
        const dir = path.join(__dirname, "hits");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, "cover_of_the_day" + ext);
        fs.writeFileSync(filePath, Buffer.from(imagePart.inlineData.data, "base64"));
        hit.coverPath = filePath;
        console.log("🖼️ [CRON] Pochette sauvegardée : " + filePath);
        return;
    }

    // Certains modèles renvoient une URL ou du texte descriptif
    const textPart = parts.find((p) => p.text);
    if (textPart && /^https?:\/\//.test(textPart.text.trim())) {
        hit.coverPath = textPart.text.trim();
        console.log("🖼️ [CRON] URL de la pochette générée : " + hit.coverPath);
    } else {
        console.warn("⚠️ [CRON] Aucune image retournée par Nano Banana (réponse texte uniquement).");
    }
}

// ============================================================
// Sorties : console, fichier JSON, notification Discord
// ============================================================

function displayHit(hit) {
    console.log("");
    console.log("✅ [CRON] Hit du jour généré avec succès !");
    console.log("   🎤 Artiste : " + hit.artistUsed);
    console.log("   💭 Thème   : " + hit.generatedTheme);
    console.log("   🎛️ Style   : " + hit.stylePrompt.slice(0, 140) + "…");
    console.log("   🖼️ Image   : " + (hit.imagePrompt ? hit.imagePrompt.slice(0, 140) + "…" : "(non généré)"));
    console.log("   📝 Blocs   : " + hit.blocks.length + " sections");
    console.log("");
    console.log("────────────── PAROLES ──────────────");
    console.log(hit.lyrics);
    console.log("─────────────────────────────────────");
}

function saveHitToFile(hit) {
    const dir = path.join(__dirname, "hits");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filePath = path.join(dir, `hit-${dateStr}.json`);
    fs.writeFileSync(filePath, JSON.stringify(hit, null, 2), "utf8");
    console.log("💾 [CRON] Hit sauvegardé : " + filePath);
}

async function notifyDiscord(hit) {
    if (!DISCORD_WEBHOOK_URL) return;

    const content =
        "🎵 **Hit du jour — Music Hit Maker Studio**" + NL +
        "🎤 Artiste : **" + hit.artistUsed + "**" + NL +
        "💭 Thème : " + (hit.generatedTheme || "?").slice(0, 300) + NL +
        "🎛️ Style : `" + hit.stylePrompt.slice(0, 400) + "`";

    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });
        if (res.ok) {
            console.log("📣 [CRON] Notification Discord envoyée.");
        } else {
            console.warn("⚠️ [CRON] Notification Discord échouée (" + res.status + ").");
        }
    } catch (err) {
        console.warn("⚠️ [CRON] Notification Discord impossible : " + err.message);
    }
}

// ============================================================
// Point d'entrée
// ============================================================

(async () => {
    try {
        console.log("🚀 [CRON] Lancement de la création automatique du Hit quotidien...");
        console.log("   LLM principal : Groq (" + GROQ_MODEL + ")" + (GEMINI_API_KEY ? " | Fallback : Gemini" : ""));
        console.log("   Artistes BDD  : " + ARTISTS_DATABASE.length);
        printSecretsReminder();

        const hit = await generateDailyHit();

        // Pochette d'album (échec non bloquant)
        await generateCoverArt(hit);

        displayHit(hit);

        if (!DRY_RUN) {
            saveHitToFile(hit);
            await notifyDiscord(hit);
        } else {
            console.log("ℹ️ [CRON] Mode --dry-run : aucune sauvegarde ni notification.");
        }

        console.log("🏁 [CRON] Job quotidien terminé avec succès.");
    } catch (error) {
        console.error("❌ [CRON] Erreur lors de la génération quotidienne :", error.message);
        process.exit(1);
    }
})();