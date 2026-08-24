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

    // Extrait des paroles : privilégie le refrain, sinon début des paroles
    let excerpt = "";
    if (Array.isArray(hit.blocks) && hit.blocks.length) {
        const refrain = hit.blocks.find((b) => /refrain/i.test(b.type) && b.text.trim());
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
        form.append("file", new Blob([fs.readFileSync(videoSource)]), path.basename(videoSource));
        const res = await fetch(`${GRAPH_BASE}/${FB_PAGE_ID}/videos`, { method: "POST", body: form });
        data = await res.json().catch(() => null);
        if (!res.ok || !data || data.error) {
            throw new Error(`Upload vidéo Facebook : ${data?.error?.message || "HTTP " + res.status}`);
        }
    }

    const videoId = data.id;
    const postId = data.post_id || videoId;
    console.log(`✅ [SOCIAL] Vidéo Facebook publiée : https://facebook.com/${postId}`);

    // Récupère l'URL publique du MP4 (CDN Meta) — secours uniquement :
    // la voie privilégiée pour le Reel est l'upload binaire direct
    // (rupload) qui n'a pas besoin de cette URL.
    let sourceUrl = null;
    const maxTries = 3;
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
        if (attempt < maxTries) await sleep(4000);
    }
    if (!sourceUrl) {
        console.warn("⚠️ [SOCIAL] URL source vidéo FB toujours indisponible après 45 s — Reel Instagram compromis.");
    }

    return { postId, videoId, sourceUrl };
}

/**
 * Étape 1 — Crée le conteneur Reel Instagram et y téléverse la vidéo.
 * Priorité : fichier local via l'API Resumable Upload (rupload, aucun URL
 * publique requise) ; sinon video_url publique.
 * Retourne { creationId } — la publication se fait via finalizeInstagramReel().
 */
async function createInstagramReelContainer(hit, videoUrl, localVideoPath, caption) {
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
        throw new Error("Instagram non configuré (INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN).");
    }

    const containerParams = {
        media_type: "REELS",
        caption,
        share_to_feed: "true",
        access_token: IG_ACCESS_TOKEN
    };

    let videoBytes = null;
    if (localVideoPath && fs.existsSync(localVideoPath)) {
        // Voie privilégiée : upload binaire direct (pas besoin d'URL publique)
        videoBytes = fs.readFileSync(localVideoPath);
    } else if (videoUrl && /^https?:\/\//i.test(videoUrl)) {
        containerParams.video_url = videoUrl;
    } else {
        throw new Error("aucune source vidéo disponible pour le Reel");
    }

    console.log("📦 [SOCIAL] Création du conteneur Reel Instagram…");
    const container = await graphPostForm(`${IG_USER_ID}/media`, containerParams);
    const creationId = container.id;

    if (videoBytes) {
        console.log(`📤 [SOCIAL] Envoi de la vidéo vers Instagram (${(videoBytes.length / 1048576).toFixed(1)} Mo)…`);
        const up = await fetch(
            `https://rupload.facebook.com/ig-graph-upload/${GRAPH_VERSION}/${creationId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `OAuth ${IG_ACCESS_TOKEN}`,
                    "offset": "0",
                    "file_type": "video/mp4"
                },
                body: videoBytes
            }
        );
        const ud = await up.json().catch(() => null);
        if (!up.ok || !ud || ud.success !== true) {
            throw new Error(`envoi vidéo Instagram : ${ud?.message || "HTTP " + up.status}`);
        }
        console.log("✅ [SOCIAL] Vidéo envoyée à Instagram.");
    }

    return { creationId };
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
 * Publie le hit du jour sur Facebook puis Instagram.
 * - Si une vidéo est disponible (hit.videoPath local ou hit.videoUrl http),
 *   publie une VIDÉO sur Facebook + un REEL Instagram (audio jouable).
 *   En cas d'échec vidéo, repli automatique sur le flux photo/texte.
 * - Chaque plateforme échoue indépendamment (non bloquant).
 * Retourne { facebook: {...}|null, instagram: {...}|null }.
 */
async function publishToAllSocial(hit) {
    // Texte du post rédigé dans la modale (prérempli par l'IA, modifiable),
    // sinon légende standard générée par buildCaption().
    const caption = (hit.customCaption && String(hit.customCaption).trim()) || buildCaption(hit);
    const results = { facebook: null, instagram: null };
    const hasVideo = !!(hit.videoPath || hit.videoUrl);

    if (hasVideo) {
        console.log("🎬 [SOCIAL] Vidéo disponible — publication en mode vidéo/Reel.");

        // --- Facebook : vidéo ---
        try {
            results.facebook = await publishFacebookVideo(hit, hit.videoPath || hit.videoUrl, caption);
        } catch (err) {
            console.error("❌ [SOCIAL] Échec publication vidéo Facebook : " + err.message);
        }

        // --- Instagram : Reel en 2 étapes ---
        // Étape 1 (ici) : création du conteneur + envoi de la vidéo
        // (fichier local via rupload, sinon URL publique).
        // Étape 2 (front) : polling /api/instagram/finalize jusqu'à publication.
        let reelCreationId = null;
        try {
            const reelUrl = (results.facebook && results.facebook.sourceUrl) || hit.videoUrl || null;
            const container = await createInstagramReelContainer(
                hit,
                reelUrl,
                hit.videoPath || null,
                caption
            );
            reelCreationId = container.creationId;
            results.instagramPendingCreationId = reelCreationId;
            console.log(`📦 [SOCIAL] Reel Instagram en traitement (${reelCreationId}) — la publication sera finalisée par le client.`);
        } catch (err) {
            results.instagramError = err.message;
            console.error("❌ [SOCIAL] Échec création Reel Instagram : " + err.message);
        }

        // FB vidéo OK et conteneur IG créé -> le front finalise l'Instagram
        if (results.facebook && reelCreationId) return results;

        // Sinon on retente ce qui a échoué via le flux photo ci-dessous
        console.log("↩️ [SOCIAL] Repli sur le flux photo pour la/les plateforme(s) en échec…");
    }

    // --- Flux photo/texte (fallback) ---
    if (!results.facebook) {
        try {
            results.facebook = await publishFacebook(hit, caption);
        } catch (err) {
            results.facebookError = err.message;
            console.error("❌ [SOCIAL] Échec publication Facebook :", err.message);
        }
    }

    if (!results.instagram && !results.instagramPendingCreationId) {
        try {
            const igImageUrl = (results.facebook && results.facebook.imageUrl) ||
                (hit.coverPath && /^https?:\/\//i.test(hit.coverPath) ? hit.coverPath : null);
            results.instagram = await publishInstagram(hit, igImageUrl, caption);
        } catch (err) {
            results.instagramError = err.message;
            console.error("❌ [SOCIAL] Échec publication Instagram :", err.message);
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
        ", vibrant colors, cinematic lighting, highly detailed digital art, square composition, no text";

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