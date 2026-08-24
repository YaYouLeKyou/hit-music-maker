/**
 * Music Hit Maker Studio - Générateur de vidéo « pochette animée »
 * -----------------------------------------------------------------
 * Assemble la pochette (image fixe) et la chanson en un MP4
 * H.264/AAC compatible avec :
 *   - la publication vidéo sur Page Facebook (/{page-id}/videos)
 *   - les Reels Instagram (/{ig-user-id}/media media_type=REELS)
 *
 * Utilise le binaire ffmpeg embarqué (ffmpeg-static) : aucun ffmpeg
 * n'a besoin d'être installé sur la machine ou sur Vercel.
 */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

/** Chemin du binaire ffmpeg (surchargeable via FFMPEG_PATH). */
function getFfmpegPath() {
    return process.env.FFMPEG_PATH || require("ffmpeg-static");
}

/**
 * Génère une vidéo carrée 1080x1080 (pochette + audio).
 * @param {object} opts
 * @param {string} opts.imagePath  chemin de la pochette (png/jpg)
 * @param {string} opts.audioPath  chemin du fichier audio (mp3/wav/m4a…)
 * @param {string} [opts.outPath]  chemin MP4 de sortie (défaut : tmp)
 * @param {number} [opts.duration] durée max en secondes (défaut VIDEO_MAX_DURATION=60)
 * @returns {Promise<{path:string, duration:number}>}
 */
function createCoverVideo({ imagePath, audioPath, outPath, duration }) {
    const maxDuration = Math.min(
        Number(duration || process.env.VIDEO_MAX_DURATION || 60),
        600
    );

    if (!fs.existsSync(imagePath)) return Promise.reject(new Error("Pochette introuvable : " + imagePath));
    if (!fs.existsSync(audioPath)) return Promise.reject(new Error("Audio introuvable : " + audioPath));

    const outputPath = outPath ||
        path.join(os.tmpdir(), `hit-video-${Date.now()}.mp4`);

    const args = [
        "-y",
        "-loop", "1",                       // image bouclée
        "-i", imagePath,
        "-i", audioPath,
        "-t", String(maxDuration),          // borne la durée
        "-vf", [
            "scale=1080:1080:force_original_aspect_ratio=decrease",
            "pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=#12101f",
            "format=yuv420p",
            "fps=15"
        ].join(","),
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "26",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",                        // s'arrête à la fin de l'audio si plus court
        "-movflags", "+faststart",          // lecture progressive (requis Meta)
        outputPath
    ];

    return new Promise((resolve, reject) => {
        console.log(`🎬 [VIDEO] Encodage MP4 (${maxDuration}s max)…`);
        const ff = spawn(getFfmpegPath(), args, { windowsHide: true });

        let stderr = "";
        ff.stderr.on("data", (d) => { stderr += d.toString(); });
        ff.on("error", reject);
        ff.on("close", (code) => {
            if (code === 0 && fs.existsSync(outputPath)) {
                const size = fs.statSync(outputPath).size;
                console.log(`✅ [VIDEO] Vidéo générée : ${outputPath} (${(size / 1024 / 1024).toFixed(2)} Mo)`);
                resolve({ path: outputPath, duration: maxDuration });
            } else {
                reject(new Error("ffmpeg a échoué (code " + code + ") : " + stderr.slice(-500)));
            }
        });
    });
}

module.exports = { createCoverVideo, getFfmpegPath };