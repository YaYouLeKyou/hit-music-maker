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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { ARTISTS_DATABASE } = require("./public/artistes_presets.js");

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = (process.env.NODE_ENV || "").toLowerCase() === "production";

// --- Security : Helmet (X-Frame-Options, X-Content-Type-Options, HSTS, …) ---
// CSP est configuré pour autoriser les CDN utilisés par le frontend
// (Tailwind CDN, lamejs, esm.sh) tout en bloquant les sources non autorisées.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "https://cdn.tailwindcss.com",
                    "https://cdn.jsdelivr.net",
                    "https://esm.sh",
                    "https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js",
                    "'unsafe-inline'"
                ],
                styleSrc: [
                    "'self'",
                    "https://fonts.googleapis.com",
                    "https://cdnjs.cloudflare.com",
                    "'unsafe-inline'"
                ],
                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com",
                    "https://cdnjs.cloudflare.com"
                ],
                imgSrc: ["'self'", "data:", "blob:", "https:"],
                mediaSrc: ["'self'", "data:", "blob:", "https:"],
                connectSrc: [
                    "'self'",
                    "https://*.blob.vercel-storage.com",
                    "https://graph.facebook.com",
                    "https://*.facebook.com",
                    "https://*.instagram.com"
                ],
                workerSrc: ["'self'", "blob:"],
                childSrc: ["'self'", "blob:"],
                frameSrc: ["'self'", "https://*.suno.com", "https://*.udio.com", "https://*.facebook.com", "https://*.instagram.com"]
            }
        }
    })
);

// --- Security : CORS restreint à l'origine de production ---
// On évite que n'importe quel site puisse appeler les API publiques depuis
// le navigateur (attaque CSRF inter-orages / abus de quota).
const ALLOWED_ORIGIN =
    process.env.PUBLIC_BASE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || `http://localhost:${PORT}`;
app.use(
    cors({
        origin: ALLOWED_ORIGIN,
        methods: ["GET", "POST", "OPTIONS"],
        credentials: false,
    })
);

// --- Security : rate-limiting global sur /api (anti-abus / DoS) ---
// Le webhook Stripe est exclu : il s'agit de requêtes serveur→serveur de
// Stripe (rejouées en cas d'échec) qui ne doivent pas être bloquées.
// ⚠️ Sur Vercel (serverless), le store mémoire est éphémère par invocation :
//    penser à passer à un store persistant (Redis) en prod si volume important.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 60, // 60 requêtes / IP / 15 min (routes légères)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de requêtes, réessayez plus tard." },
});
app.use((req, res, next) => {
    if (req.path.startsWith("/api") && req.path !== "/api/stripe/webhook") {
        return apiLimiter(req, res, next);
    }
    return next();
});

// --- Middleware ---
// Le webhook Stripe exige le corps BRUT pour vérifier la signature :
// on ne parse pas le JSON sur ce chemin précis.
app.use((req, res, next) => {
    if (req.path === "/api/stripe/webhook" || req.path === "/api/blob-upload") return next();
    return express.json({ limit: "1mb" })(req, res, next);
});

// --- Fichiers statiques (frontend) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Configuration Groq ---
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// --- Configuration Gemini (fallback LLM quand Groq est en 429 / indisponible) ---
const GEMINI_API_KEY = process.env.BANANA_API_KEY || process.env.GEMINI_API_KEY || "";
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// --- Configuration Stripe (« Publier en direct » : service payant) ---
const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (STRIPE_ENABLED) {
    try {
        stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    } catch (e) {
        console.warn("[STRIPE] SDK non chargé :", e.message);
    }
}
const STRIPE_PRICE_EUR = Math.max(0.5, parseFloat(process.env.STRIPE_PRICE_EUR || "1.99"));

/** Sauvegarde une commande JSON dans Blob (chemin déterministe). */
async function saveOrder(order) {
    const { put } = require("@vercel/blob");
    await put(`orders/${order.id}.json`, JSON.stringify(order), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json"
    });
}

/** Charge une commande depuis Blob ; null si absente/indisponible. */
async function loadOrder(orderId) {
    if (!orderId || !/^[a-z0-9-]{6,64}$/i.test(orderId)) return null;
    try {
        const { head } = require("@vercel/blob");
        const meta = await head(`orders/${orderId}.json`);
        const res = await fetch(meta.url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/** Soumet une tâche de génération à Suno. Rejette avec un message clair sinon. */
async function submitSunoTask({ title, stylePrompt, lyrics }) {
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
        if (data && data.code === 429) throw new Error("Crédits Suno insuffisants.");
        throw new Error(data?.msg || `réponse inattendue (${sunoResponse.status})`);
    }
    const taskId = data?.data?.taskId;
    if (!taskId) throw new Error("Suno n'a pas renvoyé de taskId.");
    return taskId;
}

/** Interroge Suno pour un taskId. Retourne { status, tracks }. */
async function fetchSunoTracks(taskId) {
    const sunoResponse = await fetch(
        `${SUNO_API_BASE}/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${SUNO_API_KEY}` } }
    );
    const data = await sunoResponse.json().catch(() => null);
    if (!sunoResponse.ok || !data || data.code !== 200) return { status: "UNKNOWN", tracks: [] };
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
    return { status: d.status || "UNKNOWN", tracks };
}

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
        "3. COVER PROMPT : Génère un prompt visuel en ANGLAIS décrivant l'ambiance, les couleurs,",
        "   le style artistique et l'atmosphère de la pochette d'album (ex: neon cityscape, dark synthwave...).",
        "",
        "Réponds STRICTEMENT sous forme d'objet JSON valide (sans texte hors du JSON) :",
        "{",
        '  "generatedTheme": "Titre/Résumé du thème profond généré",',
        '  "artistUsed": "' + artistName + '",',
        '  "stylePrompt": "Prompt audio en anglais pour Suno",',
        '  "coverPrompt": "Prompt visuel en anglais pour la pochette d\'album",',
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

        let rawContent = null;
        let usedFallback = false;

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

            const isRateLimit = groqResponse.status === 429;
            if (isRateLimit && GEMINI_API_KEY) {
                console.warn(`[generate] Groq rate limit (429) — bascule vers Gemini : ${detail}`);
                usedFallback = true;
            } else {
                const status = groqResponse.status === 401 ? 401 : 502;
                return res.status(status).json({
                    error: `Erreur API Groq (${groqResponse.status}) : ${detail || "réponse inattendue"}`
                });
            }
        } else {
            const data = await groqResponse.json();
            rawContent = data?.choices?.[0]?.message?.content;
            if (!rawContent && GEMINI_API_KEY) {
                console.warn("[generate] Réponse Groq vide — bascule vers Gemini.");
                usedFallback = true;
            }
        }

        if (usedFallback) {
            console.log("[generate] Génération via Gemini (fallback Groq)…");
            try {
                rawContent = await callGemini({
                    theme: typeof theme === "string" ? theme.trim() : "",
                    artist,
                    isAutoMode: Boolean(isAutoMode)
                });
            } catch (geminiErr) {
                console.error("[generate] Fallback Gemini échoué :", geminiErr.message);
                return res.status(502).json({
                    error: `Groq indisponible et fallback Gemini échoué : ${geminiErr.message}`
                });
            }
        }

        // Extraction robuste du JSON (gère les balises markdown éventuelles)
        let parsed;
        try {
            parsed = extractJson(rawContent);
        } catch (parseErr) {
            console.error("[generate] Échec parsing JSON :", parseErr.message);
            return res.status(502).json({
                error: "Impossible d'extraire un JSON valide de la réponse du modèle.",
                raw: (rawContent || "").slice(0, 2000)
            });
        }

        // Normalisation de la réponse
        const result = {
            generatedTheme: typeof parsed.generatedTheme === "string" ? parsed.generatedTheme : "",
            artistUsed: typeof parsed.artistUsed === "string" && parsed.artistUsed
                ? parsed.artistUsed
                : (artist ? artist.name : ""),
            stylePrompt: typeof parsed.stylePrompt === "string" ? parsed.stylePrompt : "",
            coverPrompt: typeof parsed.coverPrompt === "string" ? parsed.coverPrompt : "",
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

/** POST /api/instagram/finalize — body: { creationId } */
app.post("/api/instagram/finalize", express.json(), async (req, res) => {
    try {
        const { creationId } = req.body || {};
        if (!creationId || !/^\d+$/.test(String(creationId))) {
            return res.status(400).json({ error: "creationId requis." });
        }
        const result = await require("./social_publisher.js").finalizeInstagramReel(creationId);
        res.json(result);
    } catch (err) {
        console.error("[IG-FINALIZE] Erreur :", err.message);
        res.status(500).json({ status: "error", error: err.message });
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

// ============================================================
// STRIPE — « Publier en direct » (service payant)
// ============================================================

/** POST /api/stripe/checkout — body: { title, stylePrompt, lyrics, theme, artistUsed } */
app.post("/api/stripe/checkout", async (req, res) => {
    try {
        if (!STRIPE_ENABLED || !stripe) {
            return res.status(501).json({
                error: "Le service « Publier en direct » est momentanément indisponible (paiement non configuré). Utilisez « Upload & Publier », gratuit."
            });
        }
        const { title = "", stylePrompt = "", lyrics = "", theme = "", artistUsed = "" } = req.body || {};
        if (!stylePrompt?.trim() && !lyrics?.trim()) {
            return res.status(400).json({ error: "Lyrics ou Style Prompt requis." });
        }

        const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await saveOrder({
            id: orderId,
            createdAt: new Date().toISOString(),
            status: "pending_payment",
            params: { title: String(title).slice(0, 80), stylePrompt: String(stylePrompt).slice(0, 1000), lyrics: String(lyrics).slice(0, 5000) },
            meta: { theme: String(theme).slice(0, 300), artistUsed: String(artistUsed).slice(0, 60) }
        });

        const origin = process.env.PUBLIC_BASE_URL || req.headers.origin || `http://localhost:${PORT}`;
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: "eur",
                    unit_amount: Math.round(STRIPE_PRICE_EUR * 100),
                    product_data: { name: "Publication en direct — Music Hit Maker" }
                }
            }],
            metadata: { orderId },
            success_url: `${origin}/?order=${orderId}`,
            cancel_url: `${origin}/?canceled=1`
        });

        console.log(`[STRIPE] Session créée pour ${orderId} (${STRIPE_PRICE_EUR} €)`);
        res.json({ url: session.url, orderId });
    } catch (err) {
                console.error("[STRIPE] Erreur checkout :", err.message);
        // En prod, on ne fuit pas l'erreur interne (ex: détails Stripe) vers le client.
        const safeMsg = IS_PROD
            ? "Erreur lors de la création de la session de paiement. Réessayez ou contactez le support."
            : err.message;
        res.status(500).json({ error: safeMsg });
    }
});

/** POST /api/stripe/webhook — corps brut requis (signature Stripe). */
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            req.body,
            req.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err) {
        console.error("[STRIPE] Webhook signature invalide :", err.message);
        return res.status(400).json({ error: `Webhook signature invalide : ${err.message}` });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (!orderId) return res.json({ received: true });

        const order = await loadOrder(orderId);
        if (!order) return res.json({ received: true });

        // Anti-replay : chaque commande n'est traitée qu'une seule fois
        if (order.status !== "pending_payment") return res.json({ received: true });

        order.paymentId = session.payment_intent || null;
        order.status = "generating";
        await saveOrder(order);
        console.log(`[STRIPE] Paiement validé pour ${orderId} — lancement Suno…`);

        try {
            // Frais Suno engagés seulement à partir de ce point
            order.taskId = await submitSunoTask(order.params);
            await saveOrder(order);
        } catch (err) {
            // Aucun frais Suno engagé -> remboursement automatique
            console.error(`[STRIPE] Génération impossible pour ${orderId} : ${err.message} — remboursement.`);
            try {
                if (session.payment_intent) {
                    await stripe.refunds.create({ payment_intent: session.payment_intent });
                }
                order.status = "refunded";
                order.error = err.message;
                await saveOrder(order);
            } catch (refErr) {
                console.error("[STRIPE] Remboursement impossible :", refErr.message);
                order.status = "failed";
                order.error = `${err.message} | Remboursement manuel requis (${refErr.message})`;
                await saveOrder(order);
            }
        }
    }

    res.json({ received: true });
});

/** GET /api/order/:id/status — polling du front. */
app.get("/api/order/:id/status", async (req, res) => {
    try {
        const order = await loadOrder(req.params.id);
        if (!order) return res.status(404).json({ error: "Commande introuvable." });

        // Avance le statut quand une tâche Suno est en cours
        if (order.status === "generating" && order.taskId && !order.tracks) {
            const { status, tracks } = await fetchSunoTracks(order.taskId);
            if (/SUCCESS/i.test(status) && tracks.length > 0) {
                order.status = "done";
                order.tracks = tracks;
                await saveOrder(order);
            } else if (/FAILED|ERROR|SUBSCRIBE/i.test(status)) {
                // Crédits Suno consommés -> pas de remboursement auto (règle métier)
                order.status = "failed";
                order.error = "La génération a échoué côté Suno après engagement des crédits.";
                await saveOrder(order);
            }
        }

        res.json({
            id: order.id,
            status: order.status,
            error: order.error || null,
            tracks: order.tracks || null
        });
    } catch (err) {
        console.error("[ORDER] Erreur statut :", err.message);
        res.status(500).json({ error: err.message });
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

// ============================================================
// VERCEL BLOB : upload direct navigateur -> stockage persistant
// Contourne la limite de 4,5 Mo des requêtes serverless.
// Nécessite BLOB_READ_WRITE_TOKEN (créer un store Blob dans Vercel).
// ============================================================
app.post("/api/upload-url", async (req, res) => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(501).json({
            error: "Stockage Blob non configuré sur ce déploiement (BLOB_READ_WRITE_TOKEN manquant)."
        });
    }
    try {
        const { handleUpload } = require("@vercel/blob/client");
        const jsonResponse = await handleUpload({
            request: req,
            body: req.body,
            onBeforeGenerateToken: async () => ({
                allowedContentTypes: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/ogg", "audio/*"],
                maximumSizeInBytes: 100 * 1024 * 1024, // 100 Mo max
                tokenPayload: JSON.stringify({ t: Date.now() }),
            }),
            onUploadCompleted: async ({ blob }) => {
                console.log("[BLOB] Upload terminé :", blob.url);
            },
        });
        res.json(jsonResponse);
    } catch (err) {
        console.error("[BLOB] Erreur handleUpload :", err.message);
        res.status(400).json({ error: err.message });
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

/** Appelle l'API Gemini en mode texte (fallback LLM). */
async function callGemini({ theme, artist, isAutoMode }) {
    const systemPrompt = buildSystemPrompt({ theme, artist, isAutoMode });
    const userInstruction = [
        "Génère la chanson complète conformément aux instructions du système.",
        "Réponds UNIQUEMENT avec l'objet JSON valide, sans texte autour, sans balises markdown."
    ].join("\n");
    const combinedPrompt = systemPrompt + "\n\n" + userInstruction;

    const url = `${GEMINI_API_BASE}/${GEMINI_TEXT_MODEL}:generateContent`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: combinedPrompt }] }],
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

// ============================================================
// PERSISTANCE VERCEL BLOB — stockage permanent des fichiers générés
// ============================================================
const blobAvailable = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Copie un buffer vers Vercel Blob (URL publique permanente).
 * @param {Buffer} buffer
 * @param {string} prefix dossier Blob (ex: tracks, covers)
 * @param {string} ext extension (ex: .mp4)
 */
async function persistToBlob(buffer, prefix, ext) {
    const { put } = require("@vercel/blob");
    const fileUrl = await put(
        `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`,
        buffer,
        {
            access: "public",
            contentType: ext === ".mp3" ? "audio/mpeg"
                : ext === ".mp4" ? "video/mp4"
                : ext === ".png" ? "image/png"
                : "application/octet-stream"
        }
    );
    console.log(`[BLOB] Fichier permanent : ${fileUrl.url}`);
    return fileUrl.url;
}

/**
 * Route POST /api/blob-upload?filename=xxx — pattern serveur (fichier < ~4 Mo).
 * Le corps brut de la requête EST le fichier (comme l'exemple Vercel).
 */
app.post("/api/blob-upload", async (req, res) => {
    try {
        if (!blobAvailable()) {
            return res.status(501).json({ error: "Stockage Blob non configuré." });
        }
        const { filename } = req.query || {};
        if (!filename || !/[\w-]+\.[a-z0-9]{2,5}$/i.test(String(filename))) {
            return res.status(400).json({ error: "Nom de fichier invalide." });
        }
        const { put } = require("@vercel/blob");
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const bodyBuffer = Buffer.concat(chunks);
        const blob = await put(`uploads/${filename}`, bodyBuffer, {
            access: "public",
            addRandomSuffix: false
        });
        res.json({ url: blob.url });
    } catch (err) {
        console.error("[BLOB-UPLOAD] Erreur :", err.message);
        res.status(500).json({ error: err.message });
    }
});

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
        // Sources acceptées : fichier téléversé (disque OU mémoire), URL Blob
        // (upload cloud navigateur), ou lien direct Suno/Udio/CDN.
        const audioSource = req.file?.path || req.file?.buffer || req.body?.blobAudioUrl || req.body?.audioUrl;
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
            coverPrompt = "",       // prompt de pochette (prioritaire sur stylePrompt)
            artistUsed = "Artiste Polyvalent"
        } = req.body;
        console.log(`[PUBLISH] Metadata - Style: ${stylePrompt.substring(0, 30)}..., Cover: ${coverPrompt.substring(0, 30)}..., Artist: ${artistUsed}`);

        // Rend l'audio disponible localement (public/uploads) pour la lecture
        // dans « Published Tracks » : les liens Suno/Udio expirent ou ne sont
        // pas des fichiers MP3 directs jouables par le navigateur.
        let localAudioUrl = null;
        // URL persistante (Vercel Blob) utilisée pour les liens d'écoute des posts
        let persistedAudioUrl = null;
        try {
            if (req.file?.buffer) {
                // Stockage mémoire (Vercel)
                localAudioUrl = persistAudioBuffer(req.file.buffer, path.extname(req.file.originalname) || ".mp3");
            } else if (req.file?.path) {
                localAudioUrl = persistUploadedAudio(req.file.path);
            } else if (req.body?.blobAudioUrl && /^https?:\/\//i.test(req.body.blobAudioUrl)) {
                // Fichier téléversé via Vercel Blob : URL publique permanente.
                // On en télécharge une copie locale (pour la vidéo) et on garde
                // l'URL Blob comme lien d'écoute durable dans les posts/tracks.
                persistedAudioUrl = req.body.blobAudioUrl;
                localAudioUrl = await downloadAudioLocally(persistedAudioUrl);
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
                const hfPrompt = coverPrompt || stylePrompt || artistUsed;
                const hf = await social.generateHFArtwork(hfPrompt, process.env.HF_API_KEY);
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

        // --- Persistance Vercel Blob (URLs permanentes) ---
        // Si Blob est configuré, on copie les fichiers générés dans le stockage
        // persistant : la pochette, l'audio et la vidéo.
        let audioUrlFinal = localAudioUrl || null;
        let coverUrlFinal = publicCoverUrl;
        let videoUrlFinal = null;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const { put } = require("@vercel/blob");
            try {
                if (videoPath && fs.existsSync(videoPath)) {
                    const v = await put(`videos/${Date.now()}-${path.basename(videoPath)}`, fs.readFileSync(videoPath), { access: "public", addRandomSuffix: false });
                    videoUrlFinal = v.url;
                }
                if (localAudioUrl && fs.existsSync(path.join(PUBLIC_UPLOADS_DIR, path.basename(localAudioUrl)))) {
                    const a = await put(`audio/${Date.now()}-${path.basename(localAudioUrl)}`, fs.readFileSync(path.join(PUBLIC_UPLOADS_DIR, path.basename(localAudioUrl))), { access: "public", addRandomSuffix: false });
                    audioUrlFinal = a.url;
                }
                if (coverPath && fs.existsSync(coverPath)) {
                    const c = await put(`covers/${Date.now()}-${path.basename(coverPath)}`, fs.readFileSync(coverPath), { access: "public", addRandomSuffix: false });
                    coverUrlFinal = c.url;
                }
                console.log(`[PUBLISH] Persistance Blob OK — vidéo : ${videoUrlFinal || "—"} | audio : ${audioUrlFinal || "—"} | pochette : ${coverUrlFinal || "—"}`);
            } catch (blobErr) {
                console.warn(`[PUBLISH] Persistance Blob impossible : ${blobErr.message}`);
            }
        }

        console.log(`[PUBLISH] Caption: ${social.buildCaption({ stylePrompt, artistUsed }).substring(0, 50)}...`);

        // --- Génération de la vidéo (pochette + audio) pour Facebook/Reels ---
        // Nécessite un audio LOCAL + une pochette fichier.
        // Instagram : 60 s max (rupload < ~6-7 Mo). Facebook : durée complète de la
        // chanson (pas de plafond 60 s) — on génère donc deux rendus.
        let videoPath = null;
        let videoPathFull = null;
        if (localAudioUrl && coverPath) {
            try {
                const { createCoverVideo } = require("./video_maker.js");
                const audioFile = path.join(PUBLIC_UPLOADS_DIR, path.basename(localAudioUrl));
                // Reel Instagram : 60 s (défaut / limite rupload).
                const igResult = await createCoverVideo({
                    imagePath: coverPath,
                    audioPath: audioFile,
                    outPath: path.join(PUBLIC_UPLOADS_DIR, `video-${Date.now()}.mp4`)
                });
                videoPath = igResult.path;
                // Facebook : vidéo complète uniquement hors serverless (Vercel free = 60s).
                // Sur Vercel, on saute le rendu intégral pour éviter le timeout ;
                // Facebook recevra le clip 60s (videoPath) en repli.
                if (!IS_SERVERLESS) {
                    const fbDuration = Number(process.env.VIDEO_MAX_DURATION_FULL || 300);
                    const fbResult = await createCoverVideo({
                        imagePath: coverPath,
                        audioPath: audioFile,
                        outPath: path.join(PUBLIC_UPLOADS_DIR, `video-full-${Date.now()}.mp4`),
                        duration: fbDuration
                    });
                    videoPathFull = fbResult.path;
                }
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
            music: { audioUrl: persistedAudioUrl || req.body?.audioUrl || "" },
            coverPath,
            coverBuffer,
            videoPath,
            videoPathFull,
            videoUrl: videoUrlFinal,
            coverPrompt,
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
            coverUrl: coverUrlFinal,
            audioUrl: audioUrlFinal,
            videoUrl: videoUrlFinal,
            videoGenerated: !!videoPath,
            instagramPendingCreationId: publishResult.instagramPendingCreationId || null
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

// --- Global error handler (masque les erreurs internes en prod) ---
// Capture les erreurs non gérées (async/await sans try/catch). En prod, on
// renvoie un message générique pour ne pas fuiter d'infos internes.
app.use((err, req, res, next) => {
    console.error("[SERVER] Erreur non gérée :", err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
        error: IS_PROD ? "Erreur interne du serveur." : (err.message || "Erreur interne."),
    });
});

// Export pour le déploiement serverless (Vercel)
module.exports = app;