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
    app = require("express")();
    app.use((req, res) => {
        res.status(500).json({
            error: "Erreur au chargement du serveur.",
            detail: process.env.NODE_ENV === "production" ? undefined : String(err.message)
        });
    });
}

module.exports = (req, res) => {
    return app(req, res);
};
