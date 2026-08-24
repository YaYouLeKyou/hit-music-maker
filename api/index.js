/**
 * Point d'entrée serverless Vercel.
 * Réutilise l'application Express complète définie dans server.js
 * (API generate/suno/udio/publish + routes dynamiques /uploads).
 */
const app = require("../server.js");

module.exports = app;