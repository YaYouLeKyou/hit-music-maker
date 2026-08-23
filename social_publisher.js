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

function buildCaption(hit) {
    const lines = [
        "🎵 CHANSON DU JOUR — Music Hit Maker Studio",
        "",
        "🎤 Artiste : " + (hit.artistUsed || "Artiste Polyvalent"),
        "💭 Thème : " + (hit.generatedTheme || "Création originale").slice(0, 200),
    ];

    if (hit.stylePrompt) {
        lines.push("🎛️ Style : " + hit.stylePrompt.slice(0, 180));
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
 * - Avec pochette locale : upload photo + caption.
 * - Avec pochette URL : photo via paramètre url.
 * - Sans pochette : simple post texte (/feed).
 * Retourne { postId, imageUrl|null }.
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

    // Cas 2 : pochette locale (fichier)
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
// Orchestration : publie sur les deux plateformes
// ============================================================

/**
 * Publie le hit du jour sur Facebook puis Instagram.
 * - La photo est d'abord envoyée sur Facebook afin d'obtenir une URL
 *   publique exploitable par l'API Instagram.
 * - Chaque plateforme échoue indépendamment (non bloquant).
 * Retourne { facebook: {...}|null, instagram: {...}|null }.
 */
async function publishToAllSocial(hit) {
    const caption = buildCaption(hit);
    const results = { facebook: null, instagram: null };

    // --- Facebook ---
    try {
        results.facebook = await publishFacebook(hit, caption);
    } catch (err) {
        console.error("❌ [SOCIAL] Échec publication Facebook :", err.message);
    }

    // --- Instagram ---
    try {
        const igImageUrl = (results.facebook && results.facebook.imageUrl) ||
            (hit.coverPath && /^https?:\/\//i.test(hit.coverPath) ? hit.coverPath : null);
        results.instagram = await publishInstagram(hit, igImageUrl, caption);
    } catch (err) {
        console.error("❌ [SOCIAL] Échec publication Instagram :", err.message);
    }

    return results;
}

module.exports = {
    buildCaption,
    publishFacebook,
    publishInstagram,
    publishToAllSocial
};