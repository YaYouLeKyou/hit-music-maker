/**
 * Music Hit Maker Studio - Test de publication sociale
 * -----------------------------------------------------
 * Simule une "Chanson du Jour" et la publie réellement sur
 * Facebook (Page) et Instagram afin de vérifier la configuration.
 *
 * Usage :
 *   node test_social_post.js
 */

"use strict";

require("dotenv").config();
const path = require("path");
const { publishToAllSocial } = require("./social_publisher.js");
const { generateFallbackCover } = require("./cover_fallback.js");

const NL = String.fromCharCode(10);

// Chanson factice représentant la "Chanson du Jour"
const hit = {
    date: new Date().toISOString(),
    provider: "test",
    generatedTheme: "L'aliénation numérique et la quête de réel dans un monde saturé d'écrans",
    artistUsed: "Artiste Test Studio",
    stylePrompt: "Dark melodic trap, 128 BPM, 808 bass, atmospheric piano, haunting autotuned vocals",
    imagePrompt: "",
    blocks: [
        {
            type: "Refrain",
            text: "Écrans allumés, cœurs éteints" + NL +
                "On scrolle la vie au lieu de la sentir" + NL +
                "Dans le bruit du monde, je cherche un signe" + NL +
                "Un vrai cœur qui bat, pas une notification"
        },
        {
            type: "Couplet 1",
            text: "Test de publication automatique — Music Hit Maker Studio."
        }
    ],
    lyrics: "",
    coverPath: null
};

hit.lyrics = hit.blocks
    .map((b) => "[" + b.type + "]" + NL + b.text)
    .join(NL + NL);

(async () => {
    try {
        console.log("🧪 [TEST] Vérification de la publication Facebook + Instagram…");
        console.log("   FB_PAGE_ID        : " + (process.env.FACEBOOK_PAGE_ID || "(manquant)"));
        console.log("   IG_ACCOUNT_ID     : " + (process.env.INSTAGRAM_ACCOUNT_ID || "(manquant)"));
        console.log("   FB token présent  : " + (process.env.FB_PAGE_ACCESS_TOKEN ? "oui" : "NON"));
        console.log("   IG token présent  : " + (process.env.INSTAGRAM_ACCESS_TOKEN ? "oui" : "NON"));
        console.log("");

        // Garantit une image locale (pochette de secours) pour la publication
        if (!hit.coverPath) {
            hit.coverPath = generateFallbackCover(path.join(__dirname, "hits"));
            console.log("🖼️ [TEST] Pochette prête : " + hit.coverPath);
        }

        const results = await publishToAllSocial(hit);

        console.log("");
        console.log("──────────── RÉSULTATS ────────────");
        console.log("Facebook  : " + (results.facebook ? "✅ publié (post " + results.facebook.postId + ")" : "❌ échec"));
        console.log("Instagram : " + (results.instagram ? "✅ publié (post " + results.instagram.postId + ")" : "❌ échec"));
        console.log("───────────────────────────────────");

        const ok = results.facebook && results.instagram;
        process.exit(ok ? 0 : 1);
    } catch (err) {
        console.error("❌ [TEST] Erreur :", err.message);
        process.exit(1);
    }
})();