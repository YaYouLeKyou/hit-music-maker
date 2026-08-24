/**
 * Music Hit Maker Studio - Backend Server
 * - Sert les fichiers statiques du dossier public/
 * - POST /api/generate        : génération paroles/style via Groq (BDD artistes + mode Auto)
 * - POST /api/suno/generate   : soumission musicale à Suno (+ statut)
 * - POST /api/udio/generate   : fallback Udio via udioapi.pro (+ statut)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { ARTISTS_DATABASE } = require("./public/artistes_presets.js");

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
const SUNO_MODEL = process.env.SUNO_MODEL || "V4";

// --- Configuration Udio (fallback - udioapi.pro) ---
const UDIO_API_BASE = process.env.UDIO_API_BASE || "https://udioapi.pro/api";
const UDIO_API_KEY = process.env.UDIO_API_KEY || "";
const UDIO_MODEL = process.env.UDIO_MODEL || "chirp-v4-5";

/**
 * Construit le System Prompt du Directeur Artistique d'élite.
 * Deux modes :
 *  - Création Auto ou thème vide : Groq invente un thème philosophique,
 *    introspectif ou sociétal fort.
 *  - Classique : le thème imposé par l'utilisateur est respecté.
 */
function buildSystemPrompt({ theme, artist, isAutoMode }) {
    const artistName = artist ? artist.name : "Artiste Polyvalent";

    let themeBlock;
    if (isAutoMode || !theme) {
        themeBlock = [
            "MODE CRÉATION AUTO & THÈMES PROFONDS :",
            "- N'utilise PAS de thèmes génériques (fête, amour basique, argent).",
            "- GÉNÈRE UN THÈME PROFOND, INTROSPECTIF ET MARQUANT. Exemples de directions :",
            "  * L'aliénation numérique et la quête de réel dans un monde saturé d'écrans.",
            "  * Le poids du succès, la solitude au sommet et la trahison des proches.",
            "  * La nostalgie de l'enfance face à la violence du passage à l'âge adulte.",
            "  * La dualité entre la lumière publique et l'obscurité intérieure.",
            "  * L'héritage familial, les sacrifices invisibles des parents et la rédemption."
        ].join("\n");
    } else {
        themeBlock = "- Thème imposé : " + theme;
    }

    return [
        "Tu es un Directeur Artistique, Parolier et Producteur Audio d'élite.",
        "Ton rôle est de générer la structure complète et les paroles d'une chanson à succès.",
        "",
        themeBlock,
        "",
        "DONNÉES STUDIO DE L'ARTISTE CIBLE :",
        "- Nom : " + artistName,
        "- Genre : " + (artist ? artist.genre : "Modern Rap / Trap"),
        "- Plage BPM : " + (artist ? artist.bpm_range : "120-130"),
        "- Instruments : " + (artist ? artist.instruments : "808, Piano, Synth"),
        "- Diction & Flow : " + (artist ? artist.flow_signature : "Melodic, dynamic flow"),
        "- Preset Audio : " + (artist ? artist.prompt_audio_preset : "Modern production, polished mix"),
        "",
        "INSTRUCTIONS STRICTES :",
        "1. PAROLES & MÉTRIQUE : Écris des paroles profondes avec une vraie poésie moderne.",
        "   Respecte la Flow Signature de " + artistName + ". Inclus des balises [Intro], [Couplet 1],",
        "   [Pré-refrain], [Refrain], [Couplet 2], [Pont], [Outro] et des annotations (Ad-libs, chœurs).",
        "2. STYLE PROMPT (SUNO/UDIO) : Génère un prompt audio en ANGLAIS précis incluant genre,",
        "   BPM exact, instrumentation et texture vocale.",
        "",
        "Réponds STRICTEMENT sous forme d'objet JSON valide (sans texte hors du JSON) :",
        "{",
        '  "generatedTheme": "Titre/Résumé du thème profond généré",',
        '  "artistUsed": "' + artistName + '",',
        '  "stylePrompt": "Prompt audio en anglais pour Suno",',
        '  "blocks": [',
        '    { "type": "Intro", "text": "paroles..." },',
        '    { "type": "Couplet 1", "text": "paroles..." },',
        '    { "type": "Refrain", "text": "paroles..." },',
        '    { "type": "Outro", "text": "paroles..." }',
        "  ]",
        "}"
    ].join("\n");
}

/**
 * Route POST /api/generate
 * Body attendu : { apiKey?, theme?, targetArtist?, isAutoMode? }
 * Relaye la requête vers Groq et renvoie { generatedTheme, artistUsed, stylePrompt, blocks }.
 */
app.post("/api/generate", async (req, res) => {
    try {
        const { apiKey: clientKey, theme, targetArtist, isAutoMode } = req.body || {};

        // Priorité à la clé du client (localStorage), sinon fallback sur le .env du serveur
        const apiKey = clientKey && typeof clientKey === "string" && clientKey.trim().length >= 10
            ? clientKey.trim()
            : process.env.GROQ_API_KEY;

        if (!apiKey || apiKey.trim().length < 10) {
            return res.status(400).json({
                error: "Clé API Groq manquante ou invalide. Renseignez votre clé dans l'en-tête de l'application ou dans le fichier .env du serveur."
            });
        }

        // Sélection de l'artiste dans la BDD studio, ou choix aléatoire en mode Auto
        let artist = ARTISTS_DATABASE.find(
            (a) => a.name.toLowerCase() === String(targetArtist || "").toLowerCase()
        );
        if ((isAutoMode || !targetArtist) && !artist) {
            artist = ARTISTS_DATABASE[Math.floor(Math.random() * ARTISTS_DATABASE.length)];
        }
        // Artiste saisi manuellement (absent de la BDD) : profil générique
        // construit autour du nom fourni pour guider le LLM.
        if (!artist && targetArtist && !isAutoMode) {
            const customName = String(targetArtist).trim();
            console.log(`[GENERATE] Artiste personnalisé (hors BDD) : ${customName}`);
            artist = {
                name: customName,
                genre: "au style de l'artiste",
                bpm_range: "90-140",
                instruments: "au choix cohérent avec l'univers de l'artiste",
                flow_signature: "signature propre à cet artiste",
                prompt_audio_preset: "modern production, polished mix"
            };
        }

        const systemPrompt = buildSystemPrompt({
            theme: typeof theme === "string" ? theme.trim() : "",
            artist,
            isAutoMode: Boolean(isAutoMode)
        });

        const userContent = [
            "Génère la chanson complète conformément aux instructions du système.",
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
                max_tokens: 4096,
                messages: [
                    { role: "system", content: systemPrompt },
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
            generatedTheme: typeof parsed.generatedTheme === "string" ? parsed.generatedTheme : "",
            artistUsed: typeof parsed.artistUsed === "string" && parsed.artistUsed
                ? parsed.artistUsed
                : (artist ? artist.name : ""),
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
            // Messages d'erreur explicites selon le code renvoyé par Suno
            if (data && data.code === 429) {
                return res.status(402).json({
                    error: "Crédits Suno insuffisants. Rechargez votre compte sur le portail de votre fournisseur d'API Suno puis réessayez."
                });
            }
            if (data && /model/i.test(data.msg || "")) {
                return res.status(502).json({
                    error: `Modèle Suno invalide (${SUNO_MODEL}). Valeurs acceptées : V3_5, V4_5ALL, V4, V4_5, V4_5PLUS, V5 ou V5_5 (configurable via SUNO_MODEL dans .env).`
                });
            }
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
 * Route POST /api/udio/generate
 * Body attendu : { title: string, stylePrompt: string, lyrics: string }
 * Soumet la génération musicale à Udio (udioapi.pro) et renvoie { taskId }.
 * Utilisé automatiquement en fallback si Suno échoue.
 */
app.post("/api/udio/generate", async (req, res) => {
    try {
        if (!UDIO_API_KEY) {
            return res.status(400).json({ error: "UDIO_API_KEY manquante dans le fichier .env du serveur." });
        }

        const { title, stylePrompt, lyrics } = req.body || {};

        if ((!lyrics || !lyrics.trim()) && (!stylePrompt || !stylePrompt.trim())) {
            return res.status(400).json({ error: "Lyrics ou Style Prompt requis pour générer la musique." });
        }

        const udioResponse = await fetch(`${UDIO_API_BASE}/v2/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${UDIO_API_KEY}`
            },
            body: JSON.stringify({
                model: UDIO_MODEL,
                prompt: String(lyrics || "").slice(0, 5000),
                style: String(stylePrompt || "").slice(0, 1000),
                title: String(title || "Sans titre").slice(0, 80),
                make_instrumental: false
            })
        });

        const data = await udioResponse.json().catch(() => null);

        if (!udioResponse.ok || !data || data.code !== 200) {
            if (data && data.code === 401) {
                return res.status(401).json({ error: "Clé API Udio invalide ou expirée." });
            }
            const msg = data?.message || `réponse inattendue (${udioResponse.status})`;
            return res.status(502).json({ error: `Erreur API Udio : ${msg}` });
        }

        const taskId = data?.data?.task_id || data?.workId;
        if (!taskId) {
            return res.status(502).json({ error: "Udio n'a pas renvoyé de taskId (workId)." });
        }

        console.log(`[udio] Tâche soumise : ${taskId}`);
        res.json({ taskId });
    } catch (err) {
        console.error("[udio] Erreur generate :", err);
        res.status(500).json({ error: "Erreur interne du serveur : " + err.message });
    }
});

/**
 * Route GET /api/udio/status/:taskId
 * Interroge le statut de la tâche Udio (feed) et renvoie les pistes audio si prêtes.
 * Réponse normalisée identique à /api/suno/status : { status, tracks }.
 */
app.get("/api/udio/status/:taskId", async (req, res) => {
    try {
        if (!UDIO_API_KEY) {
            return res.status(400).json({ error: "UDIO_API_KEY manquante dans le fichier .env du serveur." });
        }

        const { taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({ error: "taskId requis." });
        }

        const udioResponse = await fetch(
            `${UDIO_API_BASE}/v2/feed?workId=${encodeURIComponent(taskId)}`,
            { headers: { Authorization: `Bearer ${UDIO_API_KEY}` } }
        );

        const data = await udioResponse.json().catch(() => null);

        if (!udioResponse.ok || !data || data.code !== 200) {
            const msg = data?.message || `réponse inattendue (${udioResponse.status})`;
            return res.status(502).json({ error: `Erreur API Udio : ${msg}` });
        }

        const d = data.data || {};
        const items = Array.isArray(d.response_data) ? d.response_data : [];

        // Détection d'échec (modération, contenu inapproprié…)
        const failedItem = items.find((t) => t.fail_message || t.error_message);
        if (failedItem) {
            return res.json({
                status: "FAILED",
                tracks: [],
                detail: failedItem.fail_message || failedItem.error_message
            });
        }

        const tracks = items
            .filter((t) => t.audio_url)
            .map((t) => ({
                id: t.id || "",
                title: t.title || "Sans titre",
                audioUrl: t.audio_url,
                streamAudioUrl: t.audio_url,
                duration: typeof t.duration === "number" ? t.duration : null
            }));

        // Génération terminée quand tous les segments ont leur audio
        const allDone = items.length > 0 && items.every((t) => t.audio_url);
        const status = d.type === "SUCCESS" && allDone ? "SUCCESS" : "PROCESSING";

        res.json({ status, tracks });
    } catch (err) {
        console.error("[udio] Erreur status :", err);
        res.status(500).json({ error: "Erreur interne du serveur : " + err.message });
    }
});

/**
 * Extrait le premier objet JSON valide d'une chaîne,
 * en ignorant les balises markdown ```json ... ``` et le texte autour.
 */
/**
 * Route POST /api/caption
 * Body : { theme, stylePrompt, songTitle, artistUsed }
 * Rédige le texte du post social (Facebook/Instagram) via Groq.
 * Le texte reste entièrement modifiable côté client avant publication.
 */
app.post("/api/caption", async (req, res) => {
    try {
        const { apiKey: clientKey } = req.body || {};
        const apiKey = clientKey && typeof clientKey === "string" && clientKey.trim().length >= 10
            ? clientKey.trim()
            : process.env.GROQ_API_KEY;

        if (!apiKey || apiKey.trim().length < 10) {
            return res.status(400).json({ error: "Clé API Groq manquante ou invalide." });
        }

        const { theme = "", stylePrompt = "", songTitle = "", artistUsed = "" } = req.body || {};

        const systemPrompt = [
            "Tu es community manager de la page musicale « Music Hit Maker ».",
            "Rédige le texte d'une publication Facebook/Instagram pour annoncer une nouvelle chanson.",
            "",
            "CONSIGNES STRICTES :",
            "- Français, ton enthousiaste et accrocheur.",
            "- 2 à 4 phrases courtes maximum.",
            "- 2 ou 3 emojis bien placés, pas plus.",
            "- Termine par une ligne de 4 à 6 hashtags pertinents.",
            "- N'inclus PAS de lien d'écoute (il est ajouté automatiquement par le système).",
            "- Ne mentionne pas explicitement que la chanson est générée par IA.",
            "- Réponds UNIQUEMENT avec le texte du post : pas de guillemets, pas de commentaire, pas de titre."
        ].join("\n");

        const userDetails = [
            songTitle ? `Titre de la chanson : « ${String(songTitle).slice(0, 80)} »` : null,
            artistUsed ? `Artiste : ${String(artistUsed).slice(0, 60)}` : null,
            theme ? `Thème/inspiration : ${String(theme).slice(0, 300)}` : null,
            stylePrompt ? `Style musical : ${String(stylePrompt).slice(0, 300)}` : null
        ].filter(Boolean).join("\n") || "Chanson inédite du répertoire de la page.";

        const groqResponse = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                temperature: 1,
                max_tokens: 400,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userDetails }
                ]
            })
        });

        if (!groqResponse.ok) {
            const detail = await groqResponse.text().catch(() => "");
            return res.status(502).json({
                error: `Erreur API Groq (${groqResponse.status}) : ${detail.slice(0, 200) || "réponse inattendue"}`
            });
        }

        const data = await groqResponse.json();
        const caption = data?.choices?.[0]?.message?.content?.trim() || "";
        if (!caption) {
            return res.status(502).json({ error: "Groq n'a renvoyé aucun texte." });
        }

        res.json({ caption });
    } catch (err) {
        console.error("[CAPTION] Erreur :", err.message);
        res.status(500).json({ error: err.message });
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

// --- Détection serverless (Vercel) ---
// Doit être défini AVANT toute écriture disque : le filesystem est en
// lecture seule sur Vercel, seul /tmp est accessible en écriture.
const IS_SERVERLESS = !!process.env.VERCEL;

/** Crée un dossier uniquement si nécessaire, sans jamais planter au boot. */
function ensureDir(dir) {
    if (!dir || require("fs").existsSync(dir)) return;
    try {
        require("fs").mkdirSync(dir, { recursive: true });
    } catch (err) {
        console.warn(`[BOOT] Impossible de créer ${dir} : ${err.message}`);
    }
}

// --- Multer configuration for file uploads ---
// Le dossier de destination doit exister sinon Multer échoue.
// (local uniquement : sur Vercel on utilise le stockage mémoire)
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!IS_SERVERLESS) ensureDir(UPLOADS_DIR);

// --- Dossier d'écriture pour les fichiers générés à l'exécution ---
// En local : public/uploads (servi par express.static).
// Sur Vercel (serverless) : /tmp + route dynamique /uploads/:file.
const PUBLIC_UPLOADS_DIR = IS_SERVERLESS
    ? require("os").tmpdir()
    : path.join(__dirname, "public", "uploads");
ensureDir(PUBLIC_UPLOADS_DIR);

// Route de secours : sert les fichiers générés à l'exécution quand
// express.static ne les trouve pas (cas Vercel / dossier temporaire).
app.get("/uploads/:filename", (req, res) => {
    const filename = path.basename(req.params.filename); // anti path-traversal
    const filePath = path.join(PUBLIC_UPLOADS_DIR, filename);
    if (!require("fs").existsSync(filePath)) {
        return res.status(404).json({ error: "Fichier non trouvé (il a peut-être expiré)." });
    }
    const ext = path.extname(filename).toLowerCase();
    const mime = ext === ".mp3" ? "audio/mpeg"
        : ext === ".wav" ? "audio/wav"
        : ext === ".ogg" ? "audio/ogg"
        : ext === ".m4a" ? "audio/mp4"
        : ext === ".mp4" ? "video/mp4"
        : "application/octet-stream";
    res.setHeader("Content-Type", mime);
    require("fs").createReadStream(filePath).pipe(res);
});

/** Vérifie qu'un buffer ressemble à un fichier audio (magic bytes courants). */
function looksLikeAudio(buffer) {
    if (!buffer || buffer.length < 16) return false;
    const head = buffer.subarray(0, 16);
    if (head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) return true;              // ID3 (MP3)
    if (head[0] === 0xff && (head[1] & 0xe0) === 0xe0) return true;                          // frame MPEG
    if (head.toString("ascii", 0, 4) === "OggS") return true;                                // OGG
    if (head.toString("ascii", 0, 4) === "fLaC") return true;                                // FLAC
    if (head.toString("ascii", 0, 4) === "RIFF") return true;                                // WAV
    if (head.toString("ascii", 4, 8) === "ftyp") return true;                                // MP4/M4A
    return false;
}

/** Stocke un buffer audio et renvoie son URL statique ("/uploads/xxx.mp3"). */
function persistAudioBuffer(buffer, ext) {
    const filename = `audio-${Date.now()}${ext || ".mp3"}`;
    require("fs").writeFileSync(path.join(PUBLIC_UPLOADS_DIR, filename), buffer);
    console.log(`[PUBLISH] Audio stocké : ${filename}`);
    return `/uploads/${filename}`;
}

/**
 * Télécharge un audio distant et le stocke localement afin qu'il soit
 * jouable depuis « Published Tracks » (les liens Suno/Udio expirent ou
 * ne sont pas des MP3 directs). Retourne l'URL locale.
 */
async function downloadAudioLocally(audioUrl) {
    // Message explicite pour les liens de partage Suno (page HTML, pas un MP3)
    if (/suno\.com\/s\//i.test(audioUrl)) {
        throw new Error("lien de partage suno.com/s/ détecté : ce n'est pas un MP3 direct. Utilisez l'URL CDN retournée par l'API (ex : https://cdn1.suno.ai/xxxx.mp3) ou téléversez le fichier.");
    }
    const res = await fetch(audioUrl, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") || "";
    const buffer = Buffer.from(await res.arrayBuffer());
    if (!contentType.includes("audio") && !looksLikeAudio(buffer)) {
        throw new Error(`contenu non audio (${contentType || "type inconnu"}) — le lien n'est pas un fichier MP3 direct`);
    }
    const ext = /mpeg|mp3/i.test(contentType) ? ".mp3"
        : /ogg/i.test(contentType) ? ".ogg"
        : /wav/i.test(contentType) ? ".wav"
        : /mp4|m4a/i.test(contentType) ? ".m4a"
        : ".mp3";
    console.log(`[PUBLISH] Audio téléchargé (${(buffer.length / 1024 / 1024).toFixed(2)} Mo)`);
    return persistAudioBuffer(buffer, ext);
}

/** Copie un fichier MP3 téléversé vers le dossier runtime et renvoie son URL. */
function persistUploadedAudio(filePath) {
    const filename = `audio-${Date.now()}${path.extname(filePath) || ".mp3"}`;
    const dest = path.join(PUBLIC_UPLOADS_DIR, filename);
    require("fs").copyFileSync(filePath, dest);
    console.log(`[PUBLISH] Fichier uploadé copié : ${filename}`);
    return `/uploads/${filename}`;
}

// Multer : stockage disque en local, mémoire sur Vercel (filesystem en lecture seule)
const upload = require('multer')({
    storage: IS_SERVERLESS
        ? require('multer').memoryStorage()
        : require('multer').diskStorage({
            destination: (req, file, cb) => cb(null, UPLOADS_DIR),
            filename: (req, file, cb) => cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`)
        }),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max (Instagram limit)
    fileFilter: (req, file, cb) => {
        if (/^audio\//i.test(file.mimetype) || /\.mp3$/i.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error("Format de fichier non supporté : un fichier audio (MP3) est requis."));
        }
    }
});

// --- PUBLISH ENDPOINT ---
app.post("/api/publish", upload.single('file'), async (req, res) => {
    console.log("[PUBLISH] Starting manual upload/publish process");

    const social = require('./social_publisher.js');
    const { generateFallbackCover } = require('./cover_fallback.js');

    try {
        // Get audio source
        const audioSource = req.file?.path || req.body?.audioUrl;
        if (!audioSource) {
            console.error("[PUBLISH] No audio source provided");
            return res.status(400).json({ error: "Aucune source audio fournie : renseignez un lien Suno/Udio ou téléversez un fichier MP3." });
        }
        console.log(`[PUBLISH] Audio source: ${audioSource}`);

        // Extract metadata
        const {
            stylePrompt = "",
            theme = "",
            songTitle = "",
            caption = "",          // texte du post rédigé dans la modale (prérempli IA)
            artistUsed = "Artiste Polyvalent"
        } = req.body;
        console.log(`[PUBLISH] Metadata - Style: ${stylePrompt.substring(0, 30)}..., Artist: ${artistUsed}`);

        // Rend l'audio disponible localement (public/uploads) pour la lecture
        // dans « Published Tracks » : les liens Suno/Udio expirent ou ne sont
        // pas des fichiers MP3 directs jouables par le navigateur.
        let localAudioUrl = null;
        try {
            if (req.file?.buffer) {
                // Stockage mémoire (Vercel)
                localAudioUrl = persistAudioBuffer(req.file.buffer, path.extname(req.file.originalname) || ".mp3");
            } else if (req.file?.path) {
                localAudioUrl = persistUploadedAudio(req.file.path);
            } else if (req.body?.audioUrl && /^https?:\/\//i.test(req.body.audioUrl)) {
                localAudioUrl = await downloadAudioLocally(req.body.audioUrl);
            }
        } catch (audioErr) {
            console.warn("[PUBLISH] Audio non téléchargeable localement : " + audioErr.message);
        }

        // Génère la pochette : Stable Diffusion (HF) sinon fallback local.
        // La pochette est conservée EN MÉMOIRE (coverBuffer) pour l'upload
        // Facebook — indispensable sur Vercel où le disque est en lecture
        // seule. Une copie fichier est écrite dans la zone inscriptible
        // (/tmp sur Vercel) pour l'encodage vidéo et le service /uploads/.
        let coverPath = null;      // fichier (lecture ffmpeg / URL statique)
        let coverBuffer = null;    // mémoire (upload FB direct)
        let coverGenerated = false;
        try {
            if (typeof social.generateHFArtwork === "function" && process.env.HF_API_KEY) {
                console.log("[PUBLISH] Génération pochette via Stable Diffusion (HF)");
                const hf = await social.generateHFArtwork(stylePrompt || artistUsed, process.env.HF_API_KEY);
                coverBuffer = hf?.buffer || null;
            } else {
                console.log("[PUBLISH] HF indisponible — pochette de secours locale");
            }
        } catch (hfErr) {
            console.warn("[PUBLISH] Échec HF (" + hfErr.message + ") — fallback local");
        }

        try {
            if (coverBuffer) {
                // Sauvegarde du buffer HF dans la zone inscriptible
                coverPath = path.join(PUBLIC_UPLOADS_DIR, `cover-${Date.now()}.png`);
                require("fs").writeFileSync(coverPath, coverBuffer);
            } else {
                // Fallback PNG généré localement puis chargé en mémoire
                coverPath = generateFallbackCover(PUBLIC_UPLOADS_DIR);
                coverBuffer = require("fs").readFileSync(coverPath);
            }
            coverGenerated = true;
            console.log(`[PUBLISH] Cover prête : ${coverPath}`);
        } catch (fbErr) {
            console.error("[PUBLISH] Pochette impossible :", fbErr.message);
            coverPath = null;
            coverBuffer = null;
        }

        // URL publique de la pochette : servie par express.static (local) ou
        // par la route dynamique /uploads/:file (/tmp sur Vercel)
        const publicCoverUrl = coverPath ? `/uploads/${path.basename(coverPath)}` : null;

        console.log(`[PUBLISH] Caption: ${social.buildCaption({ stylePrompt, artistUsed }).substring(0, 50)}...`);

        // --- Génération de la vidéo (pochette + audio) pour Facebook/Reels ---
        // Nécessite un audio LOCAL + une pochette fichier.
        let videoPath = null;
        if (localAudioUrl && coverPath) {
            try {
                const { createCoverVideo } = require("./video_maker.js");
                const audioFile = path.join(PUBLIC_UPLOADS_DIR, path.basename(localAudioUrl));
                const result = await createCoverVideo({
                    imagePath: coverPath,
                    audioPath: audioFile,
                    outPath: path.join(PUBLIC_UPLOADS_DIR, `video-${Date.now()}.mp4`)
                });
                videoPath = result.path;
            } catch (vidErr) {
                console.warn("⚠️ [PUBLISH] Génération vidéo impossible — repli photo : " + vidErr.message);
            }
        }

        // Publish to social platforms
        const publishResult = await social.publishToAllSocial({
            artistUsed,
            generatedTheme: theme,
            stylePrompt,
            songTitle,
            music: { audioUrl: req.body?.audioUrl || "" },
            coverPath,
            coverBuffer,
            videoPath,
            customCaption: typeof caption === "string" ? caption.trim() : ""
        });

        const fbOk = !!publishResult.facebook;
        const igOk = !!publishResult.instagram;

        if (!fbOk && !igOk) {
            console.error("[PUBLISH] Publication failed on every platform",
                JSON.stringify({ facebookError: publishResult.facebookError, instagramError: publishResult.instagramError }));
            return res.status(502).json({
                error: "La publication a échoué sur toutes les plateformes.",
                details: {
                    facebook: publishResult.facebookError || (publishResult.facebook === null ? "Non configurée (token/page manquant dans .env)" : null),
                    instagram: publishResult.instagramError || (publishResult.instagram === null ? "Non configurée ou image publique indisponible" : null)
                }
            });
        }

        console.log(`[PUBLISH] Publication completed — Facebook: ${fbOk ? "OK" : "KO"}, Instagram: ${igOk ? "OK" : "KO"}`);
        res.json({
            status: "SUCCESS",
            facebook: fbOk ? {
                id: publishResult.facebook.postId,
                url: `https://facebook.com/${publishResult.facebook.postId}`
            } : null,
            instagram: igOk ? {
                id: publishResult.instagram.postId,
                url: `https://instagram.com/p/${publishResult.instagram.postId}`
            } : null,
            details: {
                facebook: publishResult.facebookError || null,
                instagram: publishResult.instagramError || null
            },
            coverGenerated,
            coverUrl: publicCoverUrl,
            audioUrl: localAudioUrl,
            videoGenerated: !!videoPath
        });

    } catch (err) {
        console.error("[PUBLISH] Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Démarrage ---
// En local : le serveur écoute sur PORT.
// Sur Vercel : process.env.VERCEL est défini, on exporte simplement l'app
// (elle est consommée par api/index.js en tant que fonction serverless).
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log("==============================================");
        console.log("  Music Hit Maker Studio");
        console.log(`  Serveur démarré : http://localhost:${PORT}`);
        console.log(`  Modèle Groq     : ${GROQ_MODEL}`);
        console.log(`  Artistes BDD    : ${ARTISTS_DATABASE.length}`);
        console.log("==============================================");
    });
}

// Export pour le déploiement serverless (Vercel)
module.exports = app;