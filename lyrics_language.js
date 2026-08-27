/**
 * Music Hit Maker Studio - Directive de langue des paroles
 * ---------------------------------------------------------
 * Déduit du champ "language" du profil artiste ("Français" | "Anglais" |
 * "Espagnol") la langue d'écriture de TOUTES les paroles générées.
 *
 * Règle métier : si l'artiste de référence n'est pas francophone, le texte
 * (paroles + thème + balises + ad-libs) est intégralement rédigé dans SA
 * langue (anglais ou espagnol), sans mélange. Les prompts techniques
 * (stylePrompt / coverPrompt / imagePrompt) restent toujours en anglais
 * (contrainte Suno/Udio/Gemini-image inchangée).
 *
 * Utilisé par server.js, cron_daily.js et tests/test_lyrics_language.js.
 */

"use strict";

const LYRICS_LANGUAGE_CONFIGS = {
    // ----- Artistes anglophones (US / UK / international) -----
    en: {
        code: "en",
        outputLanguage: "ANGLAIS",
        themeWord: "anglais",
        structuralTags: "[Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]",
        adlibs: "Ad-libs, Backing vocals",
        promptLines: [
            "L'artiste ciblé N'EST PAS francophone : il compose en ANGLAIS.",
            "Écris TOUTES les paroles 100% en ANGLAIS, comme une véritable chanson anglophone.",
            "INTERDICTION absolue de laisser la moindre phrase, ligne ou ad-lib en français ou en espagnol : aucun mélange de langues.",
            "Vocabulaire, argot et expressions idiomatiques authentiquement anglo-saxons (jamais de traduction littérale depuis le français).",
            "Les balises de structure et le champ \"generatedTheme\" sont ÉCRITS EN ANGLAIS : utilise EXACTEMENT [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] — jamais [Couplet], [Pré-refrain] ni [Refrain]."
        ],
        exampleBlocks: [
            '    { "type": "Intro", "text": "lyrics..." },',
            '    { "type": "Verse 1", "text": "lyrics..." },',
            '    { "type": "Chorus", "text": "lyrics..." },',
            '    { "type": "Outro", "text": "lyrics..." }'
        ]
    },
    // ----- Artistes hispanophones (Latino / reggaeton / trap español) -----
    es: {
        code: "es",
        outputLanguage: "ESPAGNOL",
        themeWord: "español",
        structuralTags: "[Intro], [Verso 1], [Pre-Coro], [Coro], [Verso 2], [Puente], [Outro]",
        adlibs: "Ad-libs, coros",
        promptLines: [
            "L'artiste ciblé N'EST PAS francophone : il compose en ESPAGNOL.",
            "Écris TOUTES les paroles 100% en ESPAGNOL, comme une véritable chanson latina.",
            "INTERDICTION absolue de laisser la moindre phrase, ligne ou ad-lib en français ou en anglais : aucun mélange de langues.",
            "Vocabulaire, argot et expressions idiomatiques authentiquement latinos (jamais de traduction littérale depuis le français).",
            "Les balises de structure et le champ \"generatedTheme\" sont ÉCRITS EN ESPAGNOL : utilise EXACTEMENT [Intro], [Verso 1], [Pre-Coro], [Coro], [Verso 2], [Puente], [Outro] — jamais [Couplet], [Pré-refrain] ni [Refrain]."
        ],
        exampleBlocks: [
            '    { "type": "Intro", "text": "letra..." },',
            '    { "type": "Verso 1", "text": "letra..." },',
            '    { "type": "Coro", "text": "letra..." },',
            '    { "type": "Outro", "text": "letra..." }'
        ]
    },
    // ----- Artistes francophones (comportement historique, défaut) -----
    fr: {
        code: "fr",
        outputLanguage: "FRANÇAIS",
        themeWord: "français",
        structuralTags: "[Intro], [Couplet 1], [Pré-refrain], [Refrain], [Couplet 2], [Pont], [Outro]",
        adlibs: "Ad-libs, chœurs",
        promptLines: [
            "L'artiste ciblé est francophone : écris TOUTES les paroles en FRANÇAIS.",
            "Employez le vocabulaire et l'énergie caractéristiques de son univers musical."
        ],
        exampleBlocks: [
            '    { "type": "Intro", "text": "paroles..." },',
            '    { "type": "Couplet 1", "text": "paroles..." },',
            '    { "type": "Refrain", "text": "paroles..." },',
            '    { "type": "Outro", "text": "paroles..." }'
        ]
    }
};

/**
 * Résout le code de langue d'écriture depuis le champ brut "language".
 * Toute valeur inconnue ou absente retombe sur le français (comportement
 * historique), notamment pour les artistes personnalisés hors BDD.
 * @param {string} [languageField]
 * @returns {"en"|"es"|"fr"}
 */
function resolveLyricsLanguage(languageField) {
    const raw = String(languageField || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    if (!raw) return "fr";
    if (/^angl/.test(raw) || /^english/.test(raw) || /^en$/.test(raw)) return "en";
    if (/^espag/.test(raw) || /^hispan/.test(raw) || /^spanish/.test(raw) || /^es$/.test(raw)) return "es";
    if (/^fran/.test(raw)) return "fr";
    return "fr";
}

/**
 * Configuration complète associée au profil artiste (tolère artist null).
 * @param {{language?: string}|null|undefined} artist
 */
function getLyricsLanguageDirective(artist) {
    return LYRICS_LANGUAGE_CONFIGS[resolveLyricsLanguage(artist && artist.language)];
}

/**
 * Bloc « LANGUE D'ÉCRITURE DES PAROLES » prêt à insérer dans un prompt
 * système (sans ligne vide finale ; l'appelant gère son espacement).
 * @param {{language?: string}|null|undefined} artist
 * @returns {{config: object, lines: string[]}}
 */
function buildLyricsLanguageBlock(artist) {
    const config = getLyricsLanguageDirective(artist);
    const lines = [
        "LANGUE D'ÉCRITURE DES PAROLES (RÈGLE ABSOLUE) :",
        "- Langue imposée : " + config.outputLanguage + ".",
        ...config.promptLines.map((line) => "- " + line)
    ];
    return { config, lines };
}

/**
 * Traduit un titre de section français vers la langue cible des paroles.
 * - "Pré-refrain" -> "Pre-Chorus"/"Pre-Coro", "Refrain" -> "Chorus"/"Coro",
 *   "Couplet N" -> "Verse N"/"Verso N", "Pont" -> "Bridge"/"Puente".
 * - Les titres déjà dans la langue cible (ou exotiques) sont conservés.
 * @param {string} type
 * @param {"en"|"es"} code
 */
function normalizeBlockType(type, code) {
    const raw = String(type || "").trim();
    if (!raw || code === "fr") return raw;

    let m;
    if ((m = raw.match(/^pr[ée][-\s]?refrain\b\s*(.*)$/i))) {
        return (code === "en" ? "Pre-Chorus" : "Pre-Coro") + (m[1] ? " " + m[1].trim() : "");
    }
    if ((m = raw.match(/^refrain\s+(finale?|final)\s*(.*)$/i)) || raw.match(/^refrain\s+dissolution/i)) {
        return (code === "en" ? "Final Chorus" : "Coro Final");
    }
    if ((m = raw.match(/^refrain\b\s*(.*)$/i))) {
        return (code === "en" ? "Chorus" : "Coro") + (m[1] ? " " + m[1].trim() : "");
    }
    if ((m = raw.match(/^couplet\s*(\d+)\s*(.*)$/i))) {
        return (code === "en" ? "Verse " : "Verso ") + m[1] + (m[2] ? " " + m[2].trim() : "");
    }
    if ((m = raw.match(/^couplet\b\s*(.*)$/i))) {
        return (code === "en" ? "Verse" : "Verso") + (m[1] ? " " + m[1].trim() : "");
    }
    if ((m = raw.match(/^pont\b\s*(.*)$/i))) {
        return (code === "en" ? "Bridge" : "Puente") + (m[1] ? " " + m[1].trim() : "");
    }
    return raw;
}

/**
 * Harmonise les types de blocs d'une chanson générée avec la langue
 * imposée par l'artiste de référence (réponse du modèle parfois têtue :
 * même si les paroles sont en anglais/espagnol, il peut étiqueter les
 * sections en français). Garantit un rendu 100% cohérent côté Studio,
 * Suno/Udio et publications sociales. No-op pour les artistes francophones.
 * @param {{type?: string, text?: string}[]} blocks
 * @param {{language?: string}|null|undefined} artist
 * @returns {Array}
 */
function normalizeBlockTypes(blocks, artist) {
    const config = getLyricsLanguageDirective(artist);
    if (config.code === "fr") return Array.isArray(blocks) ? blocks : [];
    return (Array.isArray(blocks) ? blocks : []).map((block) => ({
        ...block,
        type: normalizeBlockType(block && block.type, config.code)
    }));
}

module.exports = {
    LYRICS_LANGUAGE_CONFIGS,
    resolveLyricsLanguage,
    getLyricsLanguageDirective,
    buildLyricsLanguageBlock,
    normalizeBlockType,
    normalizeBlockTypes
};
