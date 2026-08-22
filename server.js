/**
 * Music Hit Maker Studio - Backend Server
 * Sert les fichiers statiques du dossier public/ et relaie les requêtes
 * de génération vers l'API Groq (https://api.groq.com/openai/v1/chat/completions).
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --- Fichiers statiques (frontend) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Configuration Groq ---
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// --- Configuration Suno (API non-officielle type sunoapi.org / apibox) ---
const SUNO_API_BASE = process.env.SUNO_API_BASE || "https://api.sunoapi.org/api/v1";
const SUNO_API_KEY = process.env.SUNO_API_KEY || "";
const SUNO_MODEL = process.env.SUNO_MODEL || "v4";

const SYSTEM_PROMPT = [
    "Tu es un directeur artistique et auteur-compositeur à succès.",
    "Génère une structure de paroles rythmée avec balises [Intro], [Couplet], [Refrain], [Pont], [Outro]",
    "et propose un Style Prompt optimisé pour les générateurs audio IA (Suno/Udio).",
    "Réponds STRICTEMENT sous la forme d'un objet JSON valide au format :",
    "{",
    '  "stylePrompt": "string",',
    '  "blocks": [',
    '    { "type": "Intro", "text": "string" },',
    '    { "type": "Refrain", "text": "string" }',
    "  ]",
    "}"
].join("\n");

/**
 * Route POST /api/generate
 * Body attendu : { apiKey: string, style: string, theme: string }
 * Relaye la requête vers Groq et renvoie le JSON parsé.
 */
app.post("/api/generate", async (req, res) => {
    try {
        const { apiKey: clientKey, style, theme } = req.body || {};

        // Priorité à la clé du client (localStorage), sinon fallback sur le .env du serveur
        const apiKey = clientKey && typeof clientKey === "string" && clientKey.trim().length >= 10
            ? clientKey.trim()
            : process.env.GROQ_API_KEY;

        if (!apiKey || apiKey.trim().length < 10) {
            return res.status(400).json({
                error: "Clé API Groq manquante ou invalide. Renseignez votre clé dans l'en-tête de l'application ou dans le fichier .env du serveur."
            });
        }

        if (!theme || typeof theme !== "string" || !theme.trim()) {
            return res.status(400).json({ error: "Le thème du morceau est requis." });
        }

        const userContent = [
            `Style cible : ${style && style.trim() ? style.trim() : "au choix du directeur artistique"}`,
            `Thème souhaité : ${theme.trim()}`,
            "",
            "Génère des paroles complètes et un Style Prompt optimisé Suno/Udio.",
            "Réponds UNIQUEMENT avec l'objet JSON valide, sans texte autour, sans balises markdown."
        ].join("\n");

        const groqResponse = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                temperature: 0.9,
                max_tokens: 2048,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userContent }
                ]
            })
        });

        if (!groqResponse.ok) {
            let detail = "";
            try {
                const errBody = await groqResponse.json();
                detail = errBody?.error?.message || JSON.stringify(errBody);
            } catch (_) {
                detail = await groqResponse.text().catch(() => "");
            }
            const status = groqResponse.status === 401 ? 401 : 502;
            return res.status(status).json({
                error: `Erreur API Groq (${groqResponse.status}) : ${detail || "réponse inattendue"}`
            });
        }

        const data = await groqResponse.json();
        const rawContent = data?.choices?.[0]?.message?.content;

        if (!rawContent) {
            return res.status(502).json({ error: "Réponse vide de l'API Groq." });
        }

        // Extraction robuste du JSON (gère les balises markdown éventuelles)
        let parsed;
        try {
            parsed = extractJson(rawContent);
        } catch (parseErr) {
            console.error("[generate] Échec parsing JSON Groq :", parseErr.message);
            return res.status(502).json({
                error: "Impossible d'extraire un JSON valide de la réponse du modèle.",
                raw: rawContent.slice(0, 2000)
            });
        }

        // Normalisation de la réponse
        const result = {
            stylePrompt: typeof parsed.stylePrompt === "string" ? parsed.stylePrompt : "",
            blocks: Array.isArray(parsed.blocks)
                ? parsed.blocks
                    .filter((b) => b && typeof b === "object")
                    .map((b) => ({
                        type: typeof b.type === "string" ? b.type : "Couplet",
                        text: typeof b.text === "string" ? b.text : ""
                    }))
                : []
        };

        res.json(result);
    } catch (err) {
        console.error("[generate] Erreur serveur :", err);
        res.status(500).json({ error: "Erreur interne du serveur : " + err.message });
    }
});

/**
 * Route POST /api/suno/generate
 * Body attendu : { title: string, stylePrompt: string, lyrics: string }
 * Soumet la génération musicale à Suno et renvoie { taskId }.
 */
app.post("/api/suno/generate", async (req, res) => {
    try {
        if (!SUNO_API_KEY) {
            return res.status(400).json({ error: "SUNO_API_KEY manquante dans le fichier .env du serveur." });
        }

        const { title, stylePrompt, lyrics } = req.body || {};

        if ((!lyrics || !lyrics.trim()) && (!stylePrompt || !stylePrompt.trim())) {
            return res.status(400).json({ error: "Lyrics ou Style Prompt requis pour générer la musique." });
        }

        const sunoResponse = await fetch(`${SUNO_API_BASE}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUNO_API_KEY}`
            },
            body: JSON.stringify({
                customMode: true,
                instrumental: false,
                model: SUNO_MODEL,
                title: String(title || "Sans titre").slice(0, 80),
                style: String(stylePrompt || "").slice(0, 1000),
                prompt: String(lyrics || "").slice(0, 5000),
                callBackUrl: process.env.SUNO_CALLBACK_URL || "https://example.com/music-hit-maker-callback"
            })
        });

        const data = await sunoResponse.json().catch(() => null);

        if (!sunoResponse.ok || !data || data.code !== 200) {
            const msg = data?.msg || `réponse inattendue (${sunoResponse.status})`;
            return res.status(502).json({ error: `Erreur API Suno : ${msg}` });
        }

        const taskId = data?.data?.taskId;
        if (!taskId) {
            return res.status(502).json({ error: "Suno n'a pas renvoyé de taskId." });
        }

        console.log(`[suno] Tâche soumise : ${taskId}`);
        res.json({ taskId });
    } catch (err) {
        console.error("[suno] Erreur generate :", err);
        res.status(500).json({ error: "Erreur interne du serveur : " + err.message });
    }
});

/**
 * Route GET /api/suno/status/:taskId
 * Interroge le statut de la tâche Suno et renvoie les pistes audio si prêtes.
 */
app.get("/api/suno/status/:taskId", async (req, res) => {
    try {
        if (!SUNO_API_KEY) {
            return res.status(400).json({ error: "SUNO_API_KEY manquante dans le fichier .env du serveur." });
        }

        const { taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({ error: "taskId requis." });
        }

        const sunoResponse = await fetch(
            `${SUNO_API_BASE}/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
            { headers: { Authorization: `Bearer ${SUNO_API_KEY}` } }
        );

        const data = await sunoResponse.json().catch(() => null);

        if (!sunoResponse.ok || !data || data.code !== 200) {
            const msg = data?.msg || `réponse inattendue (${sunoResponse.status})`;
            return res.status(502).json({ error: `Erreur API Suno : ${msg}` });
        }

        const d = data.data || {};
        let tracks = [];

        if (d.response && Array.isArray(d.response.sunoData)) {
            tracks = d.response.sunoData
                .map((t) => ({
                    id: t.id || "",
                    title: t.title || "Sans titre",
                    audioUrl: t.audioUrl || t.sourceAudioUrl || null,
                    streamAudioUrl: t.streamAudioUrl || null,
                    duration: typeof t.duration === "number" ? t.duration : null
                }))
                .filter((t) => t.audioUrl || t.streamAudioUrl);
        }

        res.json({ status: d.status || "UNKNOWN", tracks });
    } catch (err) {
        console.error("[suno] Erreur status :", err);
        res.status(500).json({ error: "Erreur interne du serveur : " + err.message });
    }
});

/**
 * Extrait le premier objet JSON valide d'une chaîne,
 * en ignorant les balises markdown ```json ... ``` et le texte autour.
 */
function extractJson(text) {
    const cleaned = text.replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("Aucun objet JSON trouvé dans la réponse.");
    }
    return JSON.parse(cleaned.slice(start, end + 1));
}

// --- Démarrage ---
app.listen(PORT, () => {
    console.log("==============================================");
    console.log("  Music Hit Maker Studio");
    console.log(`  Serveur démarré : http://localhost:${PORT}`);
    console.log(`  Modèle Groq     : ${GROQ_MODEL}`);
    console.log("==============================================");
});