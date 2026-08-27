/**
 * Music Hit Maker Studio - Module de publication sociale
 * -------------------------------------------------------
 * Publie la "Chanson du Jour" sur :
 *   - Facebook Page  : photo (pochette) + légende, ou message texte si pas d'image.
 *   - Instagram      : image + légende via l'API Graph (container -> publish).
 *
 * Variables d'environnement requises (.env) :
 *   FB_PAGE_ACCESS_TOKEN   : token d'accès à la Page Facebook
 *   FACEBOOK_PAGE_ID       : ID de la Page Facebook
 *   INSTAGRAM_ACCOUNT_ID   : ID du compte professionnel Instagram (lié à la page)
 *   INSTAGRAM_ACCESS_TOKEN : token d'accès Instagram (même token que la page)
 *
 * Fonctionnement Instagram :
 *   1. L'image doit être accessible via une URL publique.
 *      - Si hit.coverPath est déjà une URL http(s), on l'utilise directement.
 *      - Sinon on publie d'abord la pochette sur la Page Facebook (photo),
 *        puis on récupère son URL source (CDN public) pour le container IG.
 *   2. POST /{ig-user-id}/media  { image_url, caption }  -> creation_id
 *   3. Poll GET /{creation_id}?fields=status_code jusqu'à FINISHED
 *   4. POST /{ig-user-id}/media_publish { creation_id }
 */

"use strict";

const fs = require("fs");
const path = require("path");

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "";
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || "";
const IG_USER_ID = process.env.INSTAGRAM_ACCOUNT_ID || "";
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || "";

const NL = String.fromCharCode(10);

// ============================================================
// Légende commune (caption)
// ============================================================

// Nom d'artiste affiché sur les publications (page Facebook/Instagram)
const POST_ARTIST_NAME = "Music Hit Maker";

function buildCaption(hit) {
    const lines = [
        "🎵 CHANSON DU JOUR — " + POST_ARTIST_NAME,
        "",
    ];

    // Titre saisi manuellement dans la box « Titre de la chanson »
    if (hit.songTitle) {
        lines.push("🎶 Titre : « " + String(hit.songTitle).slice(0, 80) + " »");
    }

    lines.push(
        "🎤 Artiste : " + POST_ARTIST_NAME,
        "💭 Thème : " + (hit.generatedTheme || "Création originale").slice(0, 200),
    );

    if (hit.stylePrompt) {
        lines.push("🎛️ Style : " + hit.stylePrompt.slice(0, 180));
    }

    // Lien d'écoute si la musique a été générée (Suno/Udio)
    if (hit.music && hit.music.audioUrl) {
        lines.push("🎧 Écoutez la chanson complète : " + hit.music.audioUrl);
    }

    // Extrait des paroles : privilégie le refrain, sinon début des paroles.
    // Regex multilingue : Refrain (FR) / Chorus (EN) / Coro (ES) selon la
    // langue d'écriture imposée par l'artiste de référence.
    let excerpt = "";
    if (Array.isArray(hit.blocks) && hit.blocks.length) {
        const refrain = hit.blocks.find(
            (b) => /(refrain|chorus|coro)/i.test(b.type) && b.text.trim()
        );
        const source = refrain || hit.blocks.find((b) => b.text.trim());
        if (source) excerpt = "[" + source.type + "]" + NL + source.text.trim();
    }
    if (!excerpt && hit.lyrics) excerpt = hit.lyrics;

    if (excerpt) {
        lines.push("", "📝 Extrait :", excerpt.slice(0, 800));
    }

    lines.push(
        "",
        "#chansondujour #hitdujour #musique #music #newmusic #hitmaker" +
        " #rapfrancais #beatmaking #studiomusique #suno #aicomposer"
    );

    return lines.join(NL);
}

// ============================================================
// Helpers Graph API
// ============================================================

async function graphGet(endpoint, params = {}) {
    const url = new URL(`${GRAPH_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url, { method: "GET" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        throw new Error(`Graph API GET ${endpoint} : ${msg}`);
    }
    return data;
}

async function graphPostForm(endpoint, fields = {}) {
    const body = new URLSearchParams();
    Object.entries(fields).forEach(([k, v]) => body.set(k, String(v)));
    const res = await fetch(`${GRAPH_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        throw new Error(`Graph API POST ${endpoint} : ${msg}`);
    }
    return data;
}

/** Upload multipart (photo binaire) vers la Page Facebook */
async function uploadPhotoToFacebook(imageBuffer, filename, caption) {
    const form = new FormData();
    form.append("access_token", FB_PAGE_ACCESS_TOKEN);
    form.append("caption", caption);
    form.append("file", new Blob([imageBuffer]), filename);

    const res = await fetch(`${GRAPH_BASE}/${FB_PAGE_ID}/photos`, {
        method: "POST",
        body: form
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        throw new Error(`Upload photo Facebook : ${msg}`);
    }
    return data; // { id, post_id? }
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ============================================================
// FACEBOOK
// ============================================================

/**
 * Publie la chanson du jour sur la Page Facebook.
 * Ordre de priorité pour la pochette :
 *   1. URL publique existante (hit.coverPath http)
 *   2. Buffer en mémoire (hit.coverBuffer) — fonctionne même sur Vercel
 *   3. Fichier local (hit.coverPath)
 *   4. Rien -> simple post texte (/feed)
 */
async function publishFacebook(hit, caption) {
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
        console.warn("⚠️ [SOCIAL] Facebook non configuré (FB_PAGE_ACCESS_TOKEN / FACEBOOK_PAGE_ID) — publication ignorée.");
        return null;
    }

    console.log("📘 [SOCIAL] Publication Facebook en cours…");

    // Cas 1 : pochette déjà disponible en ligne
    if (hit.coverPath && /^https?:\/\//i.test(hit.coverPath)) {
        const data = await graphPostForm(`${FB_PAGE_ID}/photos`, {
            url: hit.coverPath,
            caption,
            access_token: FB_PAGE_ACCESS_TOKEN
        });
        const postId = data.post_id || data.id;
        console.log(`✅ [SOCIAL] Facebook publié (photo URL) : https://facebook.com/${postId}`);
        return { postId, imageUrl: hit.coverPath };
    }

    // Cas 2 : pochette en mémoire (buffer) — aucun disque requis
    if (hit.coverBuffer && Buffer.isBuffer(hit.coverBuffer) && hit.coverBuffer.length > 100) {
        const data = await uploadPhotoToFacebook(hit.coverBuffer, "cover.jpg", caption);
        const postId = data.post_id || data.id;
        console.log(`✅ [SOCIAL] Facebook publié (photo mémoire) : https://facebook.com/${postId}`);

        let imageUrl = null;
        try {
            const info = await graphGet(data.id, { fields: "images", access_token: FB_PAGE_ACCESS_TOKEN });
            if (Array.isArray(info.images) && info.images.length) {
                imageUrl = info.images[0].source;
            }
        } catch (e) {
            console.warn("⚠️ [SOCIAL] Impossible de récupérer l'URL de la photo FB : " + e.message);
        }
        return { postId, imageUrl };
    }

    // Cas 3 : pochette locale (fichier)
    if (hit.coverPath && fs.existsSync(hit.coverPath)) {
        const buffer = fs.readFileSync(hit.coverPath);
        const data = await uploadPhotoToFacebook(buffer, path.basename(hit.coverPath), caption);
        const postId = data.post_id || data.id;
        console.log(`✅ [SOCIAL] Facebook publié (photo fichier) : https://facebook.com/${postId}`);

        // Récupère l'URL publique de la photo (utile pour Instagram)
        let imageUrl = null;
        try {
            const info = await graphGet(data.id, { fields: "images", access_token: FB_PAGE_ACCESS_TOKEN });
            if (Array.isArray(info.images) && info.images.length) {
                imageUrl = info.images[0].source;
            }
        } catch (e) {
            console.warn("⚠️ [SOCIAL] Impossible de récupérer l'URL de la photo FB : " + e.message);
        }
        return { postId, imageUrl };
    }

    // Cas 3 : aucune pochette -> post texte
    const data = await graphPostForm(`${FB_PAGE_ID}/feed`, {
        message: caption,
        access_token: FB_PAGE_ACCESS_TOKEN
    });
    console.log(`✅ [SOCIAL] Facebook publié (texte) : https://facebook.com/${data.id}`);
    return { postId: data.id, imageUrl: null };
}

// ============================================================
// INSTAGRAM
// ============================================================

/**
 * Publie la chanson du jour sur Instagram (image + légende).
 * Nécessite une URL d'image publique (imageUrl), typiquement obtenue
 * depuis la photo publiée sur la Page Facebook.
 */
async function publishInstagram(hit, imageUrl, caption) {
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
        console.warn("⚠️ [SOCIAL] Instagram non configuré (INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN) — publication ignorée.");
        return null;
    }

    if (!imageUrl) {
        console.warn("⚠️ [SOCIAL] Pas d'URL d'image publique disponible — publication Instagram impossible (l'API IG exige une image).");
        return null;
    }

    console.log("📸 [SOCIAL] Publication Instagram en cours…");

    // 1. Création du container média
    const container = await graphPostForm(`${IG_USER_ID}/media`, {
        image_url: imageUrl,
        caption,
        access_token: IG_ACCESS_TOKEN
    });
    const creationId = container.id;
    console.log(`📦 [SOCIAL] Container Instagram créé : ${creationId}`);

    // 2. Attente de la fin du traitement côté Meta
    let statusCode = "IN_PROGRESS";
    for (let i = 0; i < 30; i++) {
        await sleep(3000);
        const status = await graphGet(creationId, {
            fields: "status_code,status",
            access_token: IG_ACCESS_TOKEN
        });
        statusCode = status.status_code || "IN_PROGRESS";
        if (statusCode === "FINISHED") break;
        if (statusCode === "ERROR" || statusCode === "EXPIRED") {
            throw new Error(`Container Instagram en échec (${statusCode}) : ${status.status || "?"}`);
        }
    }
    if (statusCode !== "FINISHED") {
        throw new Error("Timeout : le container Instagram n'a pas fini d'être traité.");
    }

    // 3. Publication effective
    const published = await graphPostForm(`${IG_USER_ID}/media_publish`, {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN
    });

    console.log(`✅ [SOCIAL] Instagram publié : https://instagram.com/p/${published.id}`);
    return { postId: published.id };
}

// ============================================================
// VIDÉOS : Page Facebook + Reels Instagram
// ============================================================

/**
 * Publie une vidéo sur la Page Facebook.
 * - Fichier local : upload multipart vers /{page-id}/videos
 * - URL http(s)   : paramètre file_url
 * Retourne { postId, videoId, sourceUrl|null }.
 */
async function publishFacebookVideo(hit, videoSource, caption) {
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
        console.warn("⚠️ [SOCIAL] Facebook non configuré — publication vidéo ignorée.");
        return null;
    }

    let data;
    if (/^https?:\/\//i.test(videoSource)) {
        data = await graphPostForm(`${FB_PAGE_ID}/videos`, {
            file_url: videoSource,
            description: caption,
            access_token: FB_PAGE_ACCESS_TOKEN
        });
    } else {
        if (!fs.existsSync(videoSource)) throw new Error("Fichier vidéo introuvable : " + videoSource);
        const form = new FormData();
        form.append("access_token", FB_PAGE_ACCESS_TOKEN);
        form.append("description", caption);
        form.append("source", new Blob([fs.readFileSync(videoSource)]), path.basename(videoSource));
        const res = await fetch(`${GRAPH_BASE}/${FB_PAGE_ID}/videos`, { method: "POST", body: form });
        data = await res.json().catch(() => null);
        if (!res.ok || !data || data.error) {
            throw new Error(`Upload vidéo Facebook : ${data?.error?.message || "HTTP " + res.status}`);
        }
    }

    const videoId = data.id;
    const postId = data.post_id || videoId;
    console.log(`✅ [SOCIAL] Vidéo Facebook publiée : https://facebook.com/${postId}`);

    // Récupère l'URL publique du MP4 (CDN Meta). C'est cette URL qui servira
    // de video_url pour le Reel Instagram (l'API Graph l'exige désormais).
    // La vidéo doit être encodée par Facebook : on attend donc plus longtemps.
    let sourceUrl = null;
    const maxTries = 12;
    for (let attempt = 1; attempt <= maxTries; attempt++) {
        try {
            const info = await graphGet(videoId, { fields: "source", access_token: FB_PAGE_ACCESS_TOKEN });
            if (info.source) {
                sourceUrl = info.source;
                console.log(`✅ [SOCIAL] URL source vidéo FB obtenue (essai ${attempt}/${maxTries})`);
                break;
            }
        } catch (e) {
            console.warn(`⚠️ [SOCIAL] source vidéo FB non dispo (${attempt}/${maxTries}) : ${e.message}`);
        }
        if (attempt < maxTries) await sleep(5000);
    }
    if (!sourceUrl) {
        console.warn("⚠️ [SOCIAL] URL source vidéo FB toujours indisponible — Reel Instagram compromis (repli photo).");
    }

    return { postId, videoId, sourceUrl };
}

/**
 * Étape 1 — Crée le conteneur Reel Instagram et y téléverse la vidéo.
 * Priorité : upload binaire resumable direct (rupload, bytes bruts) depuis le
 * fichier local — c'est le seul flux qui garantit qu'Instagram reçoit la
 * piste audio (le fichier source). Le video_url public est un repli quand il
 * n'y a pas de fichier local.
 * Retourne { creationId } — la publication se fait via finalizeInstagramReel().
 */
async function createInstagramReelContainer(hit, videoUrl, localVideoPath, caption) {
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
        throw new Error("Instagram non configuré (INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN).");
    }

    // CAS 1 : fichier local disponible -> upload resumable direct (bytes bruts).
    // Le flux documenté Meta ne nécessite AUCUNE URL publique et envoie la
    // vidéo exacte (audio compris) via le protocole rupload.
    if (localVideoPath && fs.existsSync(localVideoPath)) {
        console.log("📦 [SOCIAL] Init conteneur Reel Instagram (resumable, upload direct)…");
        const init = await graphPostForm(`${IG_USER_ID}/media`, {
            media_type: "REELS",
            upload_type: "resumable",
            caption,
            share_to_feed: "true",
            access_token: IG_ACCESS_TOKEN
        });
        const creationId = init.id;
        if (!creationId) {
            throw new Error("Réponse inattendue à l'init du Reel Instagram (resumable) : " + JSON.stringify(init));
        }

        const videoBytes = fs.readFileSync(localVideoPath);
        const total = videoBytes.length;
        console.log(`📤 [SOCIAL] Upload resumable vers Instagram (${(total / 1048576).toFixed(1)} Mo)…`);
        // Protocole rupload de Meta (doc officielle) : le corps de la requête
        // POST doit contenir les BYTES BRUTS du MP4 (avec la piste audio),
        // via --data-binary — PAS de multipart/form-data (rejeté → 400).
        // NB : on utilise l'URL construite avec GRAPH_VERSION (ex: v21.0) et
        // NON l'URL `uri` renvoyée par l'init — Meta renvoie parfois une `uri`
        // à version incohérente (ex: v26.0) rejetée en 400 "ProcessingFailedError".
        const uploadUrl = `https://rupload.facebook.com/ig-api-upload/${GRAPH_VERSION}/${creationId}`;
        const up = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Authorization": `OAuth ${IG_ACCESS_TOKEN}`,
                "offset": "0",
                "file_size": String(total)
            },
            body: videoBytes // bytes bruts du MP4 (avec la piste audio)
        });
        const ud = await up.json().catch(() => null);
        if (!up.ok || !ud || ud.success !== true) {
            const errText = ud ? JSON.stringify(ud) : await up.text().catch(() => "");
            throw new Error(`envoi vidéo Instagram (resumable) : HTTP ${up.status} ${errText}`);
        }
        console.log("✅ [SOCIAL] Vidéo envoyée à Instagram (resumable).");
        return { creationId };
    }

    // CAS 2 : pas de fichier local mais URL vidéo publique -> container video_url.
    // Repli quand le disque local /tmp n'est pas disponible (rare).
    if (videoUrl && /^https?:\/\//i.test(videoUrl)) {
        console.log("📦 [SOCIAL] Création du conteneur Reel Instagram (video_url)…");
        const container = await graphPostForm(`${IG_USER_ID}/media`, {
            media_type: "REELS",
            video_url: videoUrl,
            caption,
            share_to_feed: "true",
            access_token: IG_ACCESS_TOKEN
        });
        const creationId = container.id;
        if (!creationId) {
            throw new Error("Réponse inattendue à la création du Reel Instagram (video_url) : " + JSON.stringify(container));
        }
        console.log(`✅ [SOCIAL] Conteneur Reel Instagram créé (video_url) : ${creationId}`);
        return { creationId };
    }

    throw new Error("aucune source vidéo disponible pour le Reel");
}

/**
 * Étape 2 — Vérifie le traitement du conteneur et publie si prêt.
 * Retourne { status: "published"|"processing"|"error", postId?, error? }.
 */
async function finalizeInstagramReel(creationId) {
    const status = await graphGet(creationId, {
        fields: "status_code,status",
        access_token: IG_ACCESS_TOKEN
    });
    const code = status.status_code || "IN_PROGRESS";

    if (code === "FINISHED") {
        const published = await graphPostForm(`${IG_USER_ID}/media_publish`, {
            creation_id: creationId,
            access_token: IG_ACCESS_TOKEN
        });
        console.log(`✅ [SOCIAL] Reel Instagram publié : https://instagram.com/p/${published.id}`);
        return { status: "published", postId: published.id };
    }
    if (code === "ERROR" || code === "EXPIRED") {
        return { status: "error", error: status.status || code };
    }
    return { status: "processing", message: status.status || "" };
}

// ============================================================
// Orchestration : publie sur les deux plateformes
// ============================================================

/**
 * Publie le hit du jour sur Facebook (vidéo complète de la chanson) puis Instagram (Reel 60s).
 * - Facebook : hit.videoPathFull (durée complète) > hit.videoPath > hit.videoUrl.
 * - Instagram : Reel 60s via rupload depuis hit.videoPath (audio jouable), ou video_url.
 *   En cas d'échec vidéo, repli automatique sur le flux photo/texte.
 * - Chaque plateforme échoue indépendamment (non bloquant).
 * Retourne { facebook: {...}|null, instagram: {...}|null }.
 *
 * @param {object} hit   données du hit (coverPath, videoPath, customCaption…)
 * @param {(platform:string, pct:number, message:string)=>void} [onEvent]
 *        canal optionnel de progression : appelé à chaque étape plateforme
 *        pour alimenter la barre de téléchargement côté navigateur (SSE).
 */
async function publishToAllSocial(hit, onEvent) {
    // Texte du post rédigé dans la modale (prérempli par l'IA, modifiable),
    // sinon légende standard générée par buildCaption().
    const caption = (hit.customCaption && String(hit.customCaption).trim()) || buildCaption(hit);
    const results = { facebook: null, instagram: null };

    /**
     * Relais d'étape vers le front (barre de progression SSE). Aucune erreur
     * du canal de progression ne doit jamais interrompre la publication.
     */
    function step(platform, pct, message) {
        console.log("📣 [SOCIAL][" + platform + "] (" + pct + "%) " + message);
        if (typeof onEvent !== "function") return;
        try { onEvent(platform, pct, message); } catch (e) { /* canal mort : ignoré */ }
    }

    const hasVideo = !!(hit.videoPath || hit.videoUrl);

    if (hasVideo) {
        console.log("🎬 [SOCIAL] Vidéo disponible — publication en mode vidéo/Reel.");

        // --- Facebook : vidéo (musique complète) ---
        step("facebook", 72, "Envoi de la vidéo COMPLETE sur Facebook (musique entière + pochette)…");
        try {
            results.facebook = await publishFacebookVideo(hit, hit.videoPathFull || hit.videoPath || hit.videoUrl, caption);
            step("facebook", 80, "Facebook : vidéo avec la chanson complète publiée ✅");
        } catch (err) {
            results.facebookError = err.message;
            console.error("❌ [SOCIAL] Échec publication vidéo Facebook : " + err.message);
            step("facebook", 80, "Facebook : échec de la vidéo — " + err.message);
        }

        // --- Instagram : Reel en 2 étapes ---
        // Étape 1 (ici) : création du conteneur + envoi de la vidéo
        // (fichier local via rupload, sinon URL publique).
        // Étape 2 (front) : polling /api/instagram/finalize jusqu'à publication.
        let reelCreationId = null;
        try {
            step("instagram", 82, "Instagram : création du Reel avec l'extrait de 60 s…");
            const reelUrl = (results.facebook && results.facebook.sourceUrl) || hit.videoUrl || null;
            const container = await createInstagramReelContainer(
                hit,
                reelUrl,
                hit.videoPath || null,
                caption
            );
            reelCreationId = container.creationId;
            results.instagramPendingCreationId = reelCreationId;
            step("instagram", 90, "Instagram : Meta traite votre Reel — finalisation automatique en cours…");
            console.log(`📦 [SOCIAL] Reel Instagram en traitement (${reelCreationId}) — la publication sera finalisée par le client.`);
        } catch (err) {
            results.instagramError = err.message;
            console.error("❌ [SOCIAL] Échec création Reel Instagram : " + err.message);
            step("instagram", 90, "Instagram : échec du Reel — tentative via la pochette…");
        }

        // FB vidéo OK et conteneur IG créé -> le front finalise l'Instagram
        if (results.facebook && reelCreationId) return results;

        // Sinon on retente ce qui a échoué via le flux photo ci-dessous
        console.log("↩️ [SOCIAL] Repli sur le flux photo pour la/les plateforme(s) en échec…");
    }

    // --- Flux photo/texte (fallback) ---
    if (!results.facebook) {
        try {
            if (onEvent) onEvent("facebook", 80, "Facebook : envoi de la publication…");
            results.facebook = await publishFacebook(hit, caption);
            if (onEvent) onEvent("facebook", 84, "Facebook publié ✓");
        } catch (err) {
            results.facebookError = err.message;
            console.error("❌ [SOCIAL] Échec publication Facebook :", err.message);
        }
    }

    if (!results.instagram && !results.instagramPendingCreationId) {
        let igImageUrl = (results.facebook && results.facebook.imageUrl) ||
            (hit.coverPath && /^https?:\/\//i.test(hit.coverPath) ? hit.coverPath : null);

        // Pas d'URL publique ? On publie la pochette sur Facebook pour récupérer
        // une URL CDN publique (imageUrl) directement utilisable par Instagram.
        if (!igImageUrl && hit.coverPath) {
            try {
                const fbPhoto = await publishFacebook(hit, caption);
                if (fbPhoto && fbPhoto.imageUrl) {
                    igImageUrl = fbPhoto.imageUrl;
                    if (!results.facebook) results.facebook = fbPhoto;
                }
            } catch (e) {
                console.warn("⚠️ [SOCIAL] Impossible d'obtenir une URL d'image publique via Facebook : " + e.message);
            }
        }

        if (igImageUrl) {
            try {
                step("instagram", 86, "Instagram : envoi de la pochette + légende…");
                results.instagram = await publishInstagram(hit, igImageUrl, caption);
                if (onEvent) onEvent("instagram", 92, "Instagram publié ✓");
            } catch (err) {
                results.instagramError = err.message;
                console.error("❌ [SOCIAL] Échec publication Instagram :", err.message);
            }
        } else {
            results.instagramError = results.instagramError || "Pas d'URL d'image publique disponible pour Instagram.";
        }
    }

    return results;
}

// ============================================================
// POCHETTE DE SECOURS : Hugging Face (Stable Diffusion / FLUX)
// ============================================================

const HF_DEFAULT_MODEL = process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-3-medium-diffusers";

/** Construit les URLs d'inférence HF (routeur récent puis endpoint historique). */
function hfText2ImageEndpoints(model) {
    return [
        `https://router.huggingface.co/hf-inference/models/${model}`,
        `https://api-inference.huggingface.co/models/${model}`
    ];
}

async function hfRequest(url, apiKey, prompt) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json",
            "Accept": "image/png"
        },
        body: JSON.stringify({ inputs: prompt })
    });
}

/**
 * Génère une pochette d'album via l'API d'inférence Hugging Face
 * (Stable Diffusion XL par défaut). Sauvegarde l'image localement
 * dans public/covers/ et retourne { path }.
 * Lève une exception si tous les modèles/endpoints échouent.
 */
async function generateHFArtwork(prompt, apiKey, model = HF_DEFAULT_MODEL) {
    if (!apiKey) throw new Error("Clé Hugging Face manquante (HF_API_KEY dans .env).");

    const fullPrompt =
        "album cover art for a song, " + prompt +
        ", vibrant colors, cinematic lighting, highly detailed digital art, square composition";

    let lastError = null;

    for (const url of hfText2ImageEndpoints(model)) {
        try {
            console.log("🎨 [HF] Génération pochette via " + model);
            let res = await hfRequest(url, apiKey, fullPrompt);

            // Modèle encore en cours de chargement côté HF -> on patiente et retente une fois
            if (res.status === 503) {
                const info = await res.json().catch(() => ({}));
                const waitSec = Math.min(Math.ceil(info.estimated_time || 20), 45);
                console.log(`⏳ [HF] Modèle en chargement, nouvelle tentative dans ${waitSec}s…`);
                await sleep(waitSec * 1000);
                res = await hfRequest(url, apiKey, fullPrompt);
            }

            if (!res.ok) {
                lastError = new Error(`${model} : HTTP ${res.status}`);
                console.warn("⚠️ [HF] Endpoint KO (" + url + ") : " + lastError.message);
                continue;
            }

            const contentType = res.headers.get("content-type") || "";
            const buffer = Buffer.from(await res.arrayBuffer());
            if (!contentType.startsWith("image/") || buffer.length < 1000) {
                lastError = new Error(`${model} : réponse non-image (${contentType || "type inconnu"})`);
                console.warn("⚠️ [HF] " + lastError.message);
                continue;
            }

            // Aucune écriture disque ici : le buffer est renvoyé à l'appelant
            // (le filesystem est en lecture seule sur Vercel).
            const ext = contentType.includes("jpeg") ? ".jpg" : ".png";
            console.log(`✅ [HF] Pochette générée en mémoire (${(buffer.length / 1024).toFixed(0)} Ko, ${ext})`);
            return { buffer, ext };
        } catch (err) {
            lastError = err;
            console.warn("⚠️ [HF] Erreur endpoint : " + err.message);
        }
    }

    throw lastError || new Error("Génération Hugging Face impossible.");
}

module.exports = {
    buildCaption,
    generateHFArtwork,
    publishFacebook,
    publishFacebookVideo,
    publishInstagram,
    createInstagramReelContainer,
    finalizeInstagramReel,
    publishToAllSocial
};