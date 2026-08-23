/**
 * Music Hit Maker Studio - Pochette de secours (fallback)
 * -------------------------------------------------------
 * Génère une pochette d'album 1080x1080 en PNG pur Node.js
 * (aucune dépendance externe) : dégradé sombre + formes géométriques.
 * Utilisée quand la génération Nano Banana / Gemini échoue,
 * afin que la publication Instagram (qui exige une image) reste possible.
 */

"use strict";

const fs = require("fs");
const zlib = require("zlib");

// --- CRC32 pour les chunks PNG ---
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Encode un buffer RGB brut (w*h*3) en PNG valide */
function encodePng(width, height, rawRgb) {
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 2;   // color type : truecolor RGB
    ihdr[10] = 0;  // compression
    ihdr[11] = 0;  // filter
    ihdr[12] = 0;  // interlace

    // Ajoute le byte de filtre (0 = None) devant chaque ligne
    const stride = width * 3;
    const filtered = Buffer.alloc(height * (stride + 1));
    for (let y = 0; y < height; y++) {
        filtered[y * (stride + 1)] = 0;
        rawRgb.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }

    return Buffer.concat([
        signature,
        chunk("IHDR", ihdr),
        chunk("IDAT", zlib.deflateSync(filtered, { level: 9 })),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

// Palettes de dégradés "album cover" (haut -> bas)
const PALETTES = [
    [[18, 10, 40], [90, 20, 120], [220, 60, 80]],     // violet -> rose
    [[5, 15, 35], [15, 70, 130], [40, 200, 190]],     // bleu nuit -> turquoise
    [[25, 8, 8], [140, 30, 30], [255, 160, 50]],      // rouge sombre -> orange
    [[10, 10, 15], [45, 45, 70], [180, 180, 210]],    // noir -> argent
    [[8, 30, 20], [20, 110, 70], [230, 230, 120]]     // vert forêt -> lime
];

/**
 * Génère une pochette de secours et retourne le chemin du fichier créé.
 * @param {string} dir répertoire de sortie
 */
function generateFallbackCover(dir) {
    const W = 1080, H = 1080;
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const [cTop, cMid, cBottom] = palette;

    const raw = Buffer.alloc(W * H * 3);

    for (let y = 0; y < H; y++) {
        const t = y / (H - 1);
        // Dégradé 3 stops
        let r, g, b;
        if (t < 0.5) {
            const k = t / 0.5;
            r = cTop[0] + (cMid[0] - cTop[0]) * k;
            g = cTop[1] + (cMid[1] - cTop[1]) * k;
            b = cTop[2] + (cMid[2] - cTop[2]) * k;
        } else {
            const k = (t - 0.5) / 0.5;
            r = cMid[0] + (cBottom[0] - cMid[0]) * k;
            g = cMid[1] + (cBottom[1] - cMid[1]) * k;
            b = cMid[2] + (cBottom[2] - cMid[2]) * k;
        }

        // Cercles concentriques centrés (effet vinyle)
        const cx = W / 2, cy = H / 2;
        for (let x = 0; x < W; x++) {
            const dx = x - cx, dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let rr = r, gg = g, bb = b;

            // Anneaux du disque
            const ring = dist % 90;
            if (dist > 150 && dist < 480 && ring < 6) {
                rr *= 0.55; gg *= 0.55; bb *= 0.55;
            }
            // Centre lumineux
            if (dist < 60) {
                rr = Math.min(255, rr + 90);
                gg = Math.min(255, gg + 90);
                bb = Math.min(255, bb + 90);
            } else if (dist < 75) {
                rr *= 0.3; gg *= 0.3; bb *= 0.3;
            }
            // Vignettage
            const vig = 1 - 0.35 * (dist / (W * 0.72));
            rr *= vig; gg *= vig; bb *= vig;

            const idx = (y * W + x) * 3;
            raw[idx] = Math.max(0, Math.min(255, Math.round(rr)));
            raw[idx + 1] = Math.max(0, Math.min(255, Math.round(gg)));
            raw[idx + 2] = Math.max(0, Math.min(255, Math.round(bb)));
        }
    }

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = require("path").join(dir, "cover_of_the_day.png");
    fs.writeFileSync(filePath, encodePng(W, H, raw));
    return filePath;
}

module.exports = { generateFallbackCover };