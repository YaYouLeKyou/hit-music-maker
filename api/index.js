/**
 * Point d'entrée serverless Vercel.
 * Réutilise l'application Express complète définie dans server.js
 * (API generate/suno/udio/publish + routes dynamiques /uploads).
 */
let app;
try {
    app = require("../server.js");
} catch (err) {
    console.error("[VERCEL] Échec du chargement de server.js :", err);
    app = null;
}

module.exports = (req, res, next) => {
    if (!app) {
        res.status(500).json({
            error: "Erreur au chargement du serveur.",
            detail: process.env.NODE_ENV === "production" ? undefined : "server.js failed to load"
        });
        return;
    }
    try {
        return app(req, res, next);
    } catch (err) {
        console.error("[VERCEL] Erreur pendant le traitement de la requête :", err);
        if (res.headersSent) {
            console.error("[VERCEL] Réponse déjà envoyée, impossible de répondre.");
            return;
        }
        res.status(500).json({
            error: process.env.NODE_ENV === "production" ? "Erreur interne du serveur." : (err.message || "Erreur interne."),
        });
    }
};
