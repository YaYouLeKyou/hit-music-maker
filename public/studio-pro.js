/**
 * Studio Pro - Music Hit Maker
 * Logique frontend : configuration avancée, sélecteurs dynamiques, assembleur de prompt Suno.
 */

"use strict";

// ============================================================
// Constantes & état
// ============================================================

const LS_STUDIO_PRO = "mhms_studio_pro_state";

let state = {
    config: "solo",
    style: "",
    artist: "",
    instrumentalOnly: false,
    drumStyle: "",
    drumKit: "",
    drumBpm: 120,
    drumGroove: "straight",
    drumFills: false,
    harmonyKey: "",
    harmonyMode: "major",
    harmonyProgression: "auto",
    harmonyVoicing: "auto",
    bassStyle: "",
    bassRole: "groove",
    bassCharacter: "warm",
    guitarType: "",
    guitarRole: "rhythm",
    keysType: "",
    vocalStyle: "",
    vocalRange: "auto",
    singerStyle1: "",
    singerStyle2: "",
    singerArtist1: "",
    singerArtist2: "",
    lyricsLanguage: "fr",
    lyricsStructure: "auto",
    lyricsTheme: "",
    lyricsText: "",
    lyricsBlocks: [],
    productionAtmosphere: "",
    productionReference: "",
    productionEffects: ["reverb"],
    mixMode: false,
    mixStyles: [],
    mixArtists: [],
    finalPrompt: "",
    instrumentCards: []
};

// ============================================================
// Utilitaires
// ============================================================

const $ = (id) => document.getElementById(id);

function escapeHtml(str) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

function toast(message, type = "success") {
    const colors = {
        success: "bg-emerald-600",
        error: "bg-red-600",
        info: "bg-purple-600",
        warning: "bg-amber-500 text-black"
    };
    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        info: "fa-circle-info",
        warning: "fa-triangle-exclamation"
    };
    const el = document.createElement("div");
    el.className = `${colors[type] || colors.info} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-sm animate-[fadeIn_.2s_ease]`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
    const container = $("toast-container");
    if (container) {
        container.appendChild(el);
        setTimeout(() => {
            el.style.transition = "opacity .3s, transform .3s";
            el.style.opacity = "0";
            el.style.transform = "translateX(20px)";
            setTimeout(() => el.remove(), 320);
        }, 3200);
    }
}

async function copyToClipboard(text, successMsg) {
    try {
        await navigator.clipboard.writeText(text);
        toast(successMsg || "Copié dans le presse-papiers !");
    } catch (_) {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        toast(successMsg || "Copié dans le presse-papiers !");
    }
}

// ============================================================
//  Gestion des presets Studio Pro (chips + select)
// ============================================================

function applyPresetToState(preset) {
    if (!preset) return;
    state.config = preset.config || "solo";
    state.style = preset.style || "";
    state.artist = preset.artist || "";
    if (preset.drums) {
        state.drumStyle = preset.drums.style;
        state.drumKit = preset.drums.kit || "";
        state.drumBpm = preset.drums.bpm;
        state.drumGroove = preset.drums.groove || "straight";
        state.drumFills = !!preset.drums.fills;
    }
    if (preset.harmony) {
        state.harmonyKey = preset.harmony.key;
        state.harmonyMode = preset.harmony.mode;
        state.harmonyProgression = preset.harmony.progression;
        state.harmonyVoicing = preset.harmony.voicing;
    }
    if (preset.bass) {
        state.bassStyle = preset.bass.style;
        state.bassRole = preset.bass.role;
        state.bassCharacter = preset.bass.character;
    }
    if (preset.guitar) {
        state.guitarType = preset.guitar.type;
        state.guitarRole = preset.guitar.role;
    }
    if (preset.keys) {
        state.keysType = preset.keys.type;
    }
    if (!state.instrumentalOnly && preset.vocals) {
        state.vocalStyle = preset.vocals.style;
        state.vocalRange = preset.vocals.range;
        if (preset.vocals.singerStyle1) state.singerStyle1 = preset.vocals.singerStyle1;
        if (preset.vocals.singerArtist1) state.singerArtist1 = preset.vocals.singerArtist1;
    } else if (state.instrumentalOnly) {
        state.vocalStyle = "";
        state.vocalRange = "auto";
        state.singerStyle1 = "";
        state.singerStyle2 = "";
        state.singerArtist1 = "";
        state.singerArtist2 = "";
    }
    if (preset.lyrics && !state.instrumentalOnly) {
        state.lyricsLanguage = preset.lyrics.language;
        state.lyricsStructure = preset.lyrics.structure;
        state.lyricsTheme = preset.lyrics.theme;
    } else if (state.instrumentalOnly) {
        state.lyricsLanguage = "fr";
        state.lyricsStructure = "intro, couplet-a, refrain, couplet-b, refrain, bridge, outro";
        state.lyricsTheme = "";
        state.lyricsText = "";
    }
    if (preset.production) {
        state.productionAtmosphere = preset.production.atmosphere;
        state.productionReference = preset.production.reference;
        state.productionEffects = preset.production.effects || ["reverb", "delay"];
    }
    if (preset.mixMode !== undefined) state.mixMode = preset.mixMode;
        // Cartes d'instruments : modèle de config + éventuels extras du preset,
    // puis complète TOUTES les cartes (jamais vides) avec valeurs par défaut.
    const cfg = preset.config || state.config;
    const template = getConfigTemplate(cfg);
    const templateMap = new Map(template.map(c => [c.id, { ...c }]));

    if (preset.extras && Array.isArray(preset.extras)) {
        preset.extras.forEach(extra => {
            const base = INSTRUMENT_LIBRARY[extra.type] || INSTRUMENT_LIBRARY[extra.section] || INSTRUMENT_LIBRARY.custom;
            templateMap.set(extra.id, {
                id: extra.id,
                label: extra.label || base.label,
                section: extra.section || base.section,
                type: extra.type || base.section || "custom",
                icon: base.icon,
                color: base.color,
                style: extra.style || base.style,
                role: extra.role || base.role,
                character: extra.character || base.character
            });
        });
    }

    state.instrumentCards = Array.from(templateMap.values()).map(c => fillCardDefaults(c));
    saveState();
    syncUiFromState();
    const label = preset.label ? `Configuration appliquée : ${preset.label}` : "Configuration appliquée";
    toast(label, "success");
}

function applyMixProfiles(presetA, presetB, ratio = 0.5) {
    if (!presetA || !presetB) return;
    const a = {...presetA};
    const b = {...presetB};
    state.config = a.config || "solo";
    state.style = a.style || "";
    state.artist = a.artist || "";

    const pick = (aVal, bVal) => Math.random() > ratio ? aVal : bVal;

    if (a.drums && b.drums) {
        state.drumStyle = pick(a.drums.style, b.drums.style);
        state.drumKit = pick(a.drums.kit, b.drums.kit);
        state.drumBpm = Math.round(pick(a.drums.bpm, b.drums.bpm));
        state.drumGroove = pick(a.drums.groove, b.drums.groove);
        state.drumFills = pick(a.drums.fills, b.drums.fills);
    }
    if (a.harmony && b.harmony) {
        state.harmonyKey = pick(a.harmony.key, b.harmony.key);
        state.harmonyMode = pick(a.harmony.mode, b.harmony.mode);
        state.harmonyProgression = pick(a.harmony.progression, b.harmony.progression);
        state.harmonyVoicing = pick(a.harmony.voicing, b.harmony.voicing);
    }
    if (a.bass && b.bass) {
        state.bassStyle = pick(a.bass.style, b.bass.style);
        state.bassRole = pick(a.bass.role, b.bass.role);
        state.bassCharacter = pick(a.bass.character, b.bass.character);
    }
    if (a.guitar && b.guitar) {
        state.guitarType = pick(a.guitar.type, b.guitar.type);
        state.guitarRole = pick(a.guitar.role, b.guitar.role);
    }
    if (a.keys && b.keys) {
        state.keysType = pick(a.keys.type, b.keys.type);
    }
    if (a.vocals && b.vocals) {
        state.vocalStyle = pick(a.vocals.style, b.vocals.style);
        state.vocalRange = pick(a.vocals.range, b.vocals.range);
        state.singerStyle1 = pick(a.vocals.singerStyle1 || "", b.vocals.singerStyle1 || "");
        state.singerArtist1 = pick(a.vocals.singerArtist1 || "", b.vocals.singerArtist1 || "");
    }
    if (a.lyrics && b.lyrics) {
        state.lyricsLanguage = pick(a.lyrics.language, b.lyrics.language);
        state.lyricsStructure = pick(a.lyrics.structure, b.lyrics.structure);
        state.lyricsTheme = pick(a.lyrics.theme, b.lyrics.theme);
    }
    if (a.production && b.production) {
        state.productionAtmosphere = pick(a.production.atmosphere, b.production.atmosphere);
        state.productionReference = pick(a.production.reference, b.production.reference);
        state.productionEffects = [ ...a.production.effects, ...b.production.effects ].filter((v, i, s) => s.indexOf(v) === i);
    }

    const template = getConfigTemplate(state.config);
    const templateMap = new Map(template.map(c => [c.id, c]));
    const extrasA = a.extras || [];
    const extrasB = b.extras || [];
    const allExtras = [...extrasA, ...extrasB];
    allExtras.forEach(extra => {
        templateMap.set(extra.id, { ...extra });
    });
    state.instrumentCards = Array.from(templateMap.values()).map(c => fillCardDefaults(c));

    saveState();
    syncUiFromState();
    toast(`Profil mixé appliqué : ${a.label} ↔ ${b.label}`, "info");
}

function initPresetChipsAndSelect() {
    const chips = document.querySelectorAll(".studio-preset-chip");
    const artistSelect = $("artist-preset-select");

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            const presetId = chip.dataset.preset;
            const preset = window.ARTIST_PRESETS.find(p => p.id === presetId);
            if (preset) {
                // Mémorise le modèle choisi : « Appliquer la config auto » le ré-appliquera
                state.selectedPresetId = presetId;
                applyPresetToState(preset);
            }
        });
    });

    if (artistSelect) {
        artistSelect.addEventListener("change", () => {
            const presetId = artistSelect.value;
            if (!presetId) return;
            const preset = window.ARTIST_PRESETS.find(p => p.id === presetId);
            if (preset) {
                // Mémorise le modèle choisi : « Appliquer la config auto » le ré-appliquera
                state.selectedPresetId = presetId;
                applyPresetToState(preset);
            }
        });
    }
}

// Bascule entre l'onglet « Modèle (rapide) » et « Détaillée (manuel) »
function initConfigTabs() {
    const tabModele = $("tab-modele");
    const tabDetaillee = $("tab-detaillee");
    const panelModele = $("config-panel-modele");
    const panelDetaillee = $("config-panel-detaillee");
    if (!tabModele || !tabDetaillee || !panelModele || !panelDetaillee) return;

    const activeClasses = ["bg-fuchsia-600", "text-white", "shadow-md", "shadow-fuchsia-600/25"];
    const idleClasses = ["bg-[#0f0f1a]", "text-gray-400", "border", "border-purple-800/70", "hover:border-fuchsia-500/50"];

    function activateTab(selected) {
        const isModele = selected === "modele";
        panelModele.classList.toggle("hidden", !isModele);
        panelDetaillee.classList.toggle("hidden", isModele);
        [tabModele, tabDetaillee].forEach(tab => {
            const isActive = (tab === tabModele) === isModele;
            tab.classList.remove(...activeClasses, ...idleClasses);
            tab.classList.add(...(isActive ? activeClasses : idleClasses));
        });
    }

    tabModele.addEventListener("click", () => activateTab("modele"));
    tabDetaillee.addEventListener("click", () => activateTab("detaillee"));
}

async function loadStudioPresets() {
    const presets = window.ARTIST_PRESETS || [];
    const select = $("artist-preset-select");
    if (!select) return;
    select.innerHTML = '<option value="">-- Choisir un artiste --</option>';
    if (!presets.length) return;

    const fragment = document.createDocumentFragment();
    presets.forEach(preset => {
        const option = document.createElement("option");
        option.value = preset.id;
        option.textContent = preset.label;
        fragment.appendChild(option);
    });
    select.appendChild(fragment);
}

// ============================================================
//  Auto-configuration intelligente
// ============================================================

function findBestPresetMatch(style, artist) {
    const all = window.ARTIST_PRESETS || [];
    const s = (style || "").toLowerCase().trim();
    const a = (artist || "").toLowerCase().trim();
    if (!s && !a) return null;

    const exact = all.find(p =>
        (s && p.style && p.style.toLowerCase() === s) ||
        (a && p.artist && p.artist.toLowerCase() === a)
    );
    if (exact) return exact;

    const partial = all.find(p =>
        (s && p.style && p.style.toLowerCase().includes(s)) ||
        (a && p.artist && p.artist.toLowerCase().includes(a))
    );
    if (partial) return partial;

    return null;
}

function generateDefaultsFromConfig(style, artist) {
    const s = (style || "").toLowerCase();
    const defaults = {
        config: "solo",
        style: style,
        artist: artist,
        drums: {
            style: "Modern drum kit",
            kit: "808",
            bpm: 120,
            groove: "Straight",
            fills: false
        },
        harmony: {
            key: "C",
            mode: "major",
            progression: "I–V–vi–IV",
            voicing: "Close"
        },
        bass: {
            style: "Modern bass",
            role: "Groove",
            character: "Warm"
        },
        guitar: {
            type: "Electric",
            role: "Rhythm"
        },
        keys: {
            type: "Pads"
        },
        vocals: {
            style: "Melodic",
            range: "Auto",
            singerStyle1: style,
            singerArtist1: artist
        },
        lyrics: {
            language: "Français",
            structure: "intro, couplet-a, refrain, couplet-b, refrain, bridge, outro",
            theme: ""
        },
        production: {
            atmosphere: "Standard",
            reference: style || "Standard",
            effects: ["reverb", "delay"]
        },
        mixMode: false,
        instrumentCards: []
    };

    if (s.includes("hip-hop") || s.includes("trap") || s.includes("drill")) {
        defaults.drums = { style: "808 kit, ghost snares, fast hi-hats", kit: "808", bpm: 140, groove: "Straight", fills: true };
        defaults.harmony = { key: "C#", mode: "minor", progression: "Dark loop", voicing: "Minimal" };
        defaults.bass = { style: "808 sub", role: "Pulsant", character: "Darker" };
        defaults.vocals = { style: "Auto-tune melodio", range: "Auto", singerStyle1: "Hip-Hop", singerArtist1: artist };
        defaults.production = { atmosphere: "Dark / Moody", reference: "Hip-Hop / Trap", effects: ["reverb", "delay"] };
    } else if (s.includes("rock")) {
        defaults.drums = { style: "Live drum kit", kit: "Acoustic", bpm: 128, groove: "Straight", fills: true };
        defaults.harmony = { key: "E", mode: "minor", progression: "Power chords", voicing: "Open" };
        defaults.bass = { style: "Pick bass", role: "Groove", character: "Aggressive" };
        defaults.guitar = { type: "Electric distorted", role: "Lead + Rhythm" };
        defaults.vocals = { style: "Powerful", range: "Full", singerStyle1: "Rock", singerArtist1: artist };
        defaults.production = { atmosphere: "Warm / Aggressive", reference: "Rock", effects: ["reverb", "distortion"] };
    } else if (s.includes("jazz")) {
        defaults.drums = { style: "Brush kit", kit: "Acoustic", bpm: 110, groove: "Swing", fills: false };
        defaults.harmony = { key: "Bb", mode: "major", progression: "ii-V-I", voicing: "Extended" };
        defaults.bass = { style: "Upright walking", role: "Melodic", character: "Smooth" };
        defaults.guitar = { type: "Jazz guitar clean", role: "Solo" };
        defaults.vocals = { style: "Smooth jazz scat", range: "Baritone", singerStyle1: "Jazz", singerArtist1: artist };
        defaults.production = { atmosphere: "Lounge / warm", reference: "Jazz", effects: ["reverb"] };
    } else if (s.includes("electro") || s.includes("electronic")) {
        defaults.drums = { style: "Electronic drum machine", kit: "Electronic", bpm: 128, groove: "Straight", fills: false };
        defaults.harmony = { key: "D", mode: "minor", progression: "Arpeggiated", voicing: "Synth" };
        defaults.bass = { style: "Synthesized bass", role: "Lead", character: "Sharp" };
        defaults.keys = { type: "Synth lead" };
        defaults.vocals = { style: "Vocoder / chopped", range: "Digital", singerStyle1: "Electronic", singerArtist1: artist };
        defaults.production = { atmosphere: "Clean / digital", reference: "Electronic", effects: ["delay", "filter"] };
    } else if (s.includes("reggae")) {
        defaults.drums = { style: "One drop", kit: "Acoustic", bpm: 76, groove: "Reggae", fills: false };
        defaults.harmony = { key: "G", mode: "major", progression: "One drop", voicing: "Loose" };
        defaults.bass = { style: "Thick bass", role: "Groove", character: "Round" };
        defaults.guitar = { type: "Skank rhythm", role: "Offbeat" };
        defaults.vocals = { style: "Laid back", range: "Baritone", singerStyle1: "Reggae", singerArtist1: artist };
        defaults.production = { atmosphere: "Warm / sunny", reference: "Reggae", effects: ["reverb", "delay"] };
    } else if (s.includes("jazz")) {
        defaults.drums = { style: "Brush kit", kit: "Acoustic", bpm: 110, groove: "Swing", fills: false };
        defaults.harmony = { key: "Bb", mode: "major", progression: "ii-V-I", voicing: "Extended" };
        defaults.bass = { style: "Upright walking", role: "Melodic", character: "Smooth" };
        defaults.guitar = { type: "Jazz guitar clean", role: "Solo" };
        defaults.vocals = { style: "Smooth jazz scat", range: "Baritone", singerStyle1: "Jazz", singerArtist1: artist };
        defaults.production = { atmosphere: "Lounge / warm", reference: "Jazz", effects: ["reverb"] };
    } else if (s.includes("afrobeat")) {
        defaults.drums = { style: "Djembe, dunun, percussions", kit: "Acoustic", bpm: 108, groove: "Afro groove", fills: true };
        defaults.harmony = { key: "Gb", mode: "minor", progression: "Cyclique", voicing: "Collective" };
        defaults.bass = { style: "Percussive bass", role: "Swing", character: "Round" };
        defaults.guitar = { type: "Jazz-fusion", role: "Solo" };
        defaults.vocals = { style: "Chant traditionnel + flow", range: "Baritone", singerStyle1: "Afrobeat", singerArtist1: artist };
        defaults.production = { atmosphere: "Vibrant / festive", reference: "Afrobeat", effects: ["reverb", "delay"] };
    } else if (s.includes("metal")) {
        defaults.drums = { style: "Double bass, blast beats", kit: "Acoustic", bpm: 180, groove: "Aggressive", fills: true };
        defaults.harmony = { key: "Db", mode: "minor", progression: "Riff-based", voicing: "Distorted" };
        defaults.bass = { style: "Power chord bass", role: "Anchor", character: "Heavy" };
        defaults.guitar = { type: "Distorted lead", role: "Epic solo" };
        defaults.vocals = { style: "Screaming / growling", range: "Full", singerStyle1: "Metal", singerArtist1: artist };
        defaults.production = { atmosphere: "Aggressive / violent", reference: "Metal", effects: ["reverb", "distortion"] };
    }

    if (state.instrumentalOnly) {
        defaults.vocals = { style: "", range: "auto", singerStyle1: "", singerArtist1: "" };
        defaults.lyrics = { language: "Français", structure: "intro, couplet-a, refrain, couplet-b, refrain, bridge, outro", theme: "" };
    }

    const template = getConfigTemplate(state.config);
    defaults.instrumentCards = template.map(card => ({ ...card }));

    return defaults;
}

function handleAutoConfigure() {
    const style = state.style;
    const artist = state.artist;
    const mixMode = state.mixMode;
    const mixStyles = state.mixStyles || [];
    const mixArtists = state.mixArtists || [];

    // 1) Priorité : le modèle (preset) explicitement choisi dans l'onglet « Modèle »
    if (state.selectedPresetId) {
        const chosen = (window.ARTIST_PRESETS || []).find(p => p.id === state.selectedPresetId);
        if (chosen) {
            applyPresetToState(chosen);
            toast(`Config auto appliquée : ${chosen.label}`, "success");
            return;
        }
    }

    if (!style && !artist) {
        // Aucun style/artiste explicite : on génère tout de même une configuration
        // de base à partir de la config choisie et des réglages saisis manuellement.
        const defaults = generateDefaultsFromConfig("", "");
        defaults.config = state.config || "solo";
        applyPresetToState(defaults);
        toast("Configuration automatique de base appliquée. Choisissez un style ou un artiste pour un réglage plus précis.", "info");
        return;
    }

    if (mixMode && mixStyles.length >= 2) {
        const presetA = findBestPresetMatch(mixStyles[0], mixArtists[0] || artist);
        const presetB = findBestPresetMatch(mixStyles[1], mixArtists[1] || artist);
        if (presetA && presetB) {
            applyMixProfiles(presetA, presetB, 0.5);
            toast("Configuration automatique appliquée (Mode Mix)", "success");
            return;
        }
    }

    const preset = findBestPresetMatch(style, artist);
    if (preset) {
        applyPresetToState(preset);
        toast(`Configuration automatique appliquée : ${preset.label}`, "success");
        return;
    }

    const defaults = generateDefaultsFromConfig(style, artist);
    applyPresetToState(defaults);
    toast("Configuration automatique appliquée (par défaut)", "success");
}


function getAllGenres() {
    if (typeof ARTISTS_DATABASE === "undefined") return [];
    const genres = new Set();
    ARTISTS_DATABASE.forEach(artist => {
        if (artist.genre) {
            genres.add(artist.genre.trim());
        }
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b, "fr"));
}

function getArtistsByGenre(genre) {
    if (typeof ARTISTS_DATABASE === "undefined") return [];
    if (!genre) return ARTISTS_DATABASE;
    const lower = genre.toLowerCase();
    return ARTISTS_DATABASE.filter(artist => {
        const g = (artist.genre || "").toLowerCase();
        return g.includes(lower);
    });
}


function populateStyleSelect() {
    const select = $("style-select");
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">— Tous les styles —</option>';
    const genres = getAllGenres();
    genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        select.appendChild(option);
    });
    if (current) select.value = current;
}

function populateArtistSelect(genre = "") {
    const select = $("artist-style");
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">— Choisissez un artiste —</option>';
    const artists = getArtistsByGenre(genre);
    const groups = {
        "Français / Francophonie": artists.filter(a => a.language === "Français"),
        "US / UK": artists.filter(a => a.language === "Anglais"),
        "Latino": artists.filter(a => a.language === "Espagnol")
    };
    for (const [groupLabel, groupArtists] of Object.entries(groups)) {
        if (groupArtists.length === 0) continue;
        const optgroup = document.createElement("optgroup");
        optgroup.label = groupLabel;
        groupArtists.forEach(artist => {
            const option = document.createElement("option");
            option.value = artist.name;
            option.textContent = `${artist.name} (${artist.genre})`;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    }
    if (current) select.value = current;
}

function populateMixSelects() {
    const genres = getAllGenres();
    const mixStyle2 = $("mix-style-2");
    const mixStyle3 = $("mix-style-3");
    const mixArtist2 = $("mix-artist-2");
    const mixArtist3 = $("mix-artist-3");

    [mixStyle2, mixStyle3].forEach(select => {
        if (!select) return;
        const current = select.value;
        const baseLabel = select.id.includes("mix-style-2") ? "— Style 2 —" : "— Style 3 (optionnel) —";
        select.innerHTML = `<option value="">${baseLabel}</option>`;
        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            select.appendChild(option);
        });
        if (current) select.value = current;
    });

    [mixArtist2, mixArtist3].forEach(select => {
        if (!select) return;
        const current = select.value;
        const baseLabel = select.id.includes("mix-artist-2") ? "— Artiste 2 —" : "— Artiste 3 (optionnel) —";
        select.innerHTML = `<option value="">${baseLabel}</option>`;
        if (typeof ARTISTS_DATABASE !== "undefined") {
            const groups = {
                "Français / Francophonie": ARTISTS_DATABASE.filter(a => a.language === "Français"),
                "US / UK": ARTISTS_DATABASE.filter(a => a.language === "Anglais"),
                "Latino": ARTISTS_DATABASE.filter(a => a.language === "Espagnol")
            };
            for (const [groupLabel, groupArtists] of Object.entries(groups)) {
                if (groupArtists.length === 0) continue;
                const optgroup = document.createElement("optgroup");
                optgroup.label = groupLabel;
                groupArtists.forEach(artist => {
                    const option = document.createElement("option");
                    option.value = artist.name;
                    option.textContent = `${artist.name} (${artist.genre})`;
                    optgroup.appendChild(option);
                });
                select.appendChild(optgroup);
            }
        }
        if (current) select.value = current;
    });
}

// ============================================================
// Configuration musicale
// ============================================================

function updateConfigCards() {
    document.querySelectorAll(".config-card").forEach(card => {
        card.classList.toggle("active", card.dataset.config === state.config);
    });
}

// ------------------------------------------------------------
// Bibliothèque d'instruments (types utilisables dans les cartes)
// ------------------------------------------------------------
const INSTRUMENT_LIBRARY = {
    guitar:     { label: "Guitare", section: "guitar", icon: "fa-guitar", color: "text-purple-400", style: "Electric", role: "Rhythm", character: "Warm" },
    keys:       { label: "Clavier / Piano", section: "keys", icon: "fa-piano-keyboard", color: "text-blue-400", style: "Grand Piano", role: "Chords", character: "Warm" },
    bass:       { label: "Basse", section: "bass", icon: "fa-sliders-h", color: "text-green-400", style: "Pick bass", role: "Groove", character: "Warm" },
    drums:      { label: "Percussions", section: "drums", icon: "fa-drum", color: "text-pink-400", style: "Acoustic kit", role: "Rythm", character: "Punchy" },
    strings:    { label: "Cordes", section: "strings", icon: "fa-violin", color: "text-cyan-400", style: "Quartet", role: "Pad", character: "Warm" },
    brass:      { label: "Cuivres", section: "brass", icon: "fa-trumpet", color: "text-amber-400", style: "Stabs", role: "Accent", character: "Bright" },
    woodwinds:  { label: "Vent", section: "woodwinds", icon: "fa-wind", color: "text-teal-400", style: "Section", role: "Melody", character: "Bright" },
    synth:      { label: "Synth", section: "synth", icon: "fa-wave-square", color: "text-lime-400", style: "Analog lead", role: "Lead", character: "Sharp" },
    organ:      { label: "Orgue", section: "organ", icon: "fa-burst", color: "text-indigo-400", style: "Hammond", role: "Fill", character: "Warm" },
    percussion: { label: "Perc. supplémentaire", section: "percussion", icon: "fa-cube", color: "text-yellow-400", style: "Shakers / congas", role: "Groove", character: "Organic" },
    vocals:     { label: "Voix supplémentaire", section: "vocals", icon: "fa-microphone", color: "text-red-400", style: "Backing vocals", role: "Harmony", character: "Smooth" },
    custom:     { label: "Instrument (libre)", section: "custom", icon: "fa-cube", color: "text-slate-400", style: "", role: "", character: "" }
};

// Ordre d'affichage du picker "Ajouter un instrument"
const INSTRUMENT_TYPE_ORDER = ["guitar", "keys", "bass", "drums", "strings", "brass", "woodwinds", "synth", "organ", "percussion", "vocals", "custom"];

const CONFIG_CARD_TEMPLATES = {
        solo: [
        { id: "extra-guitar-keys", label: "Guitare / Clavier", type: "guitar", section: "guitar", style: "Electric", role: "Rhythm", character: "Warm" }
    ],
    duo: [
        { id: "guitar-keys-1", label: "Guitare / Clavier 1", type: "guitar", section: "guitar", style: "Electric", role: "Rhythm", character: "Warm" },
        { id: "guitar-keys-2", label: "Guitare / Clavier 2", type: "keys", section: "keys", style: "Synth pad", role: "Texture", character: "Dreamy" }
    ],
    band: [
        { id: "guitar2", label: "Guitare 2", type: "guitar", section: "guitar", style: "Electric lead", role: "Solo", character: "Aggressive" },
        { id: "strings", label: "Strings", type: "strings", section: "strings", style: "Quartet", role: "Pad", character: "Warm" }
    ],
        orchestra: [
        { id: "strings", label: "Strings", type: "strings", section: "strings", style: "Full orchestra", role: "Pad", character: "Warm" },
        { id: "brass", label: "Brass", type: "brass", section: "brass", style: "Full brass section", role: "Accent", character: "Bright" },
        { id: "woodwinds", label: "Woodwinds", type: "woodwinds", section: "woodwinds", style: "Section", role: "Melody", character: "Bright" },
        { id: "harp", label: "Harpe", type: "keys", section: "keys", style: "Pedal harp", role: "Arp", character: "Ethereal" }
    ],
    opera: [
        { id: "strings", label: "Strings", type: "strings", section: "strings", style: "Orchestra", role: "Pad", character: "Warm" },
        { id: "brass", label: "Brass", type: "brass", section: "brass", style: "Stabs", role: "Accent", character: "Bright" },
        { id: "pipe-organ", label: "Orgue à tuyaux", type: "organ", section: "organ", style: "Pipe organ", role: "Bass / Fill", character: "Majestic" }
    ],
    urban: [
        { id: "synth1", label: "Synth 1", type: "synth", section: "synth", style: "808 sub-bass layer", role: "Bass", character: "Darker" },
        { id: "synth2", label: "Synth 2", type: "synth", section: "synth", style: "Pad", role: "Texture", character: "Warm" }
    ],
    reggae: [
        { id: "guitar", label: "Guitare Skank", type: "guitar", section: "guitar", style: "Skank offbeat", role: "Offbeat", character: "Choppy" },
        { id: "brass-perc", label: "Brass / Percussion", type: "brass", section: "brass", style: "Horn stabs", role: "Accent", character: "Bright" }
    ],
    rock: [
        { id: "guitar1", label: "Guitare 1 (Lead)", type: "guitar", section: "guitar", style: "Electric distorted", role: "Solo", character: "Aggressive" },
        { id: "guitar2", label: "Guitare 2 (Rhythm)", type: "guitar", section: "guitar", style: "Electric crunch", role: "Rhythm", character: "Powerful" }
    ],
    electronic: [
        { id: "synth-lead", label: "Synth Lead", type: "synth", section: "synth", style: "Analog lead", role: "Lead", character: "Sharp" },
        { id: "synth-pad", label: "Synth Pad", type: "synth", section: "synth", style: "Pad", role: "Texture", character: "Dreamy" }
    ],
    jazz: [
        { id: "piano", label: "Piano", type: "keys", section: "keys", style: "Grand piano", role: "Chords", character: "Smooth" },
        { id: "brass", label: "Brass", type: "brass", section: "brass", style: "Section stabs", role: "Accent", character: "Warm" }
    ]
};

function tweakCardByStyle(card, style) {
    const s = (style || "").toLowerCase();
    if (s.includes("reggae") || s.includes("rasta")) {
        if (card.section === "guitar") { card.style = "Skank offbeat"; card.role = "Offbeat"; card.character = "Choppy"; }
        if (card.section === "bass") { card.style = "Thick round bass"; card.role = "Groove"; card.character = "Round"; }
        if (card.section === "drums") { card.style = "One drop"; card.role = "Rythm"; card.character = "Loose"; }
    } else if (s.includes("jazz") || s.includes("blues")) {
        if (card.section === "drums") { card.style = "Brush kit"; card.role = "Swing"; card.character = "Smooth"; }
        if (card.section === "bass") { card.style = "Upright walking"; card.role = "Melodic"; card.character = "Smooth"; }
        if (card.section === "keys") { card.style = "Grand piano"; card.role = "Chords"; card.character = "Smooth"; }
        if (card.section === "guitar") { card.style = "Jazz guitar clean"; card.role = "Solo"; card.character = "Warm"; }
    } else if (s.includes("hip-hop") || s.includes("trap") || s.includes("drill")) {
        if (card.section === "synth" || card.section === "bass") { card.style = "808 sub"; card.role = "Pulsant"; card.character = "Darker"; }
        if (card.section === "drums") { card.style = "808 kit"; card.role = "Rythm"; card.character = "Sharp"; }
    } else if (s.includes("rock") || s.includes("metal") || s.includes("punk")) {
        if (card.section === "guitar") { card.style = "Electric distorted"; card.role = "Lead + Rhythm"; card.character = "Aggressive"; }
        if (card.section === "bass") { card.style = "Pick bass"; card.role = "Groove"; card.character = "Aggressive"; }
        if (card.section === "drums") { card.style = "Live kit"; card.role = "Rythm"; card.character = "Powerful"; }
    } else if (s.includes("electro") || s.includes("electronic") || s.includes("dance") || s.includes("house")) {
        if (card.section === "synth") { card.style = "Analog lead"; card.role = "Lead"; card.character = "Sharp"; }
        if (card.section === "bass") { card.style = "Synthesized bass"; card.role = "Lead"; card.character = "Sharp"; }
    } else if (s.includes("classique") || s.includes("orchestre") || s.includes("philharmo") || s.includes("opera")) {
        if (card.section === "strings") { card.style = "Orchestral"; card.role = "Pad"; card.character = "Warm"; }
        if (card.section === "brass") { card.style = "Symphonic"; card.role = "Accent"; card.character = "Majestic"; }
    }
    return card;
}

// Complète une carte d'instruments (vide ou partielle) avec les valeurs par
// défaut de sa catégorie + paufinage selon le style courant.
function fillCardDefaults(card) {
    const lib = INSTRUMENT_LIBRARY[card.type] || INSTRUMENT_LIBRARY[card.section] || INSTRUMENT_LIBRARY.custom;
    const out = {
        id: card.id || ("card-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7)),
        label: card.label || lib.label,
        section: card.section || lib.section,
        type: card.type || lib.section || "custom",
        icon: lib.icon,
        color: lib.color,
        style: card.style || lib.style,
        role: card.role || lib.role,
        character: card.character || lib.character
    };
    tweakCardByStyle(out, state.style);
    // ne jamais écraser une valeur explicitement fournie par le preset/utilisateur
    if (card.style) out.style = card.style;
    if (card.role) out.role = card.role;
    if (card.character) out.character = card.character;
    if (card.label) out.label = card.label;
    if (card.icon && card.color) { out.icon = card.icon; out.color = card.color; }
    return out;
}

function getConfigTemplate(config) {
    return CONFIG_CARD_TEMPLATES[config] || CONFIG_CARD_TEMPLATES.solo;
}

function getConfigInstruments() {
    const labels = {
        solo: "Solo instrument + vocals",
        duo: "Duo : 2 voices/instruments",
        band: "Band : drums, bass, guitar/keys, vocals",
        orchestra: "Orchestra : strings, winds, percussion",
        opera: "Opera : classical vocals, orchestra",
        urban: "Urban : 808s, synths, drums, vocals",
        reggae: "Reggae : one drop drums, deep bass, guitar",
        rock: "Rock : distorted guitars, drums, bass, vocals",
        electronic: "Electronic : synths, drum machine, pads, vocals",
        jazz: "Jazz : piano/bass/drums trio, horns, vocals"
    };
    return labels[state.config] || labels.solo;
}

function renderInstrumentCards() {
    const container = $("instrument-cards-container");
    if (!container) return;
    container.innerHTML = "";
    const cards = state.instrumentCards || [];
    cards.forEach(card => {
        const el = document.createElement("div");
        el.className = "bg-[#0f0f1a] border border-purple-800/70 rounded-xl p-4 space-y-2";
        el.innerHTML = `
            <div class="flex items-center justify-between">
                                <label class="text-xs font-medium text-gray-300 flex items-center gap-2">
                    <i class="fa-solid ${card.icon || "fa-cube"} ${card.color || "text-slate-400"}"></i>
                    <span>${escapeHtml(card.label)}</span>
                    <span class="text-[10px] text-gray-500 bg-[#1a1a2e] rounded px-1.5 py-0.5">${escapeHtml(card.type || "custom")}</span>
                </label>
                <button type="button" class="text-xs text-red-400 hover:text-red-300" data-remove-card="${escapeHtml(card.id)}" title="Supprimer">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <input type="text" value="${escapeHtml(card.style || "")}" data-card-id="${escapeHtml(card.id)}" data-card-key="style" placeholder="Style" class="w-full rounded-lg bg-[#1a1a2e] border border-purple-800/70 px-2 py-1.5 text-xs outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30">
            <input type="text" value="${escapeHtml(card.role || "")}" data-card-id="${escapeHtml(card.id)}" data-card-key="role" placeholder="Rôle" class="w-full rounded-lg bg-[#1a1a2e] border border-purple-800/70 px-2 py-1.5 text-xs outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30">
            <input type="text" value="${escapeHtml(card.character || "")}" data-card-id="${escapeHtml(card.id)}" data-card-key="character" placeholder="Caractère" class="w-full rounded-lg bg-[#1a1a2e] border border-purple-800/70 px-2 py-1.5 text-xs outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30">
        `;
        container.appendChild(el);
    });

    container.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", (e) => {
            const cardId = e.target.dataset.cardId;
            const key = e.target.dataset.cardKey;
            const card = state.instrumentCards.find(c => c.id === cardId);
            if (card) {
                card[key] = e.target.value;
                saveState();
            }
        });
    });

    container.querySelectorAll("button[data-remove-card]").forEach(btn => {
        btn.addEventListener("click", () => {
            const cardId = btn.dataset.removeCard;
            state.instrumentCards = state.instrumentCards.filter(c => c.id !== cardId);
            saveState();
            renderInstrumentCards();
        });
    });
}

function buildInstrumentPicker() {
    const picker = $("instrument-type-picker");
    if (!picker) return;
    picker.innerHTML = "";
    INSTRUMENT_TYPE_ORDER.forEach(typeKey => {
        const lib = INSTRUMENT_LIBRARY[typeKey];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "type-pick-btn flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0f1a] border border-purple-800/70 hover:bg-purple-700/30 text-left transition";
        btn.dataset.type = typeKey;
        btn.innerHTML = `<i class="fa-solid ${lib.icon} ${lib.color} mr-1"></i><span class="text-sm">${lib.label}</span>`;
        btn.addEventListener("click", () => addInstrumentCardOfType(typeKey));
        picker.appendChild(btn);
    });
    // bouton "Annuler" pour refermer le picker sans ajouter
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "type-pick-btn flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-red-300 text-sm";
    cancel.dataset.type = "";
    cancel.innerHTML = `<i class="fa-solid fa-xmark mr-1"></i>Annuler`;
    cancel.addEventListener("click", hideInstrumentPicker);
    picker.appendChild(cancel);
}

function addInstrumentCard() {
    const picker = $("instrument-type-picker");
    if (!picker) return;
    buildInstrumentPicker();
    picker.classList.remove("hidden");
    picker.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function addInstrumentCardOfType(typeKey) {
    if (typeKey === "" || typeKey === "cancel") { hideInstrumentPicker(); return; }
    const lib = INSTRUMENT_LIBRARY[typeKey] || INSTRUMENT_LIBRARY.custom;
    const id = "card-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const card = {
        id, label: lib.label, section: lib.section, type: typeKey,
        style: lib.style, role: lib.role, character: lib.character,
        icon: lib.icon, color: lib.color
    };
    state.instrumentCards = state.instrumentCards || [];
    state.instrumentCards.push(fillCardDefaults(card));
    hideInstrumentPicker();
    saveState();
    renderInstrumentCards();
    toast(`Instrument ajouté : ${lib.label}`, "success");
}

function hideInstrumentPicker() {
    const picker = $("instrument-type-picker");
    if (picker) picker.classList.add("hidden");
}


function removeInstrumentCard(id) {
    state.instrumentCards = (state.instrumentCards || []).filter(c => c.id !== id);
    saveState();
    renderInstrumentCards();
}

// ============================================================
// Création détaillée des paroles (blocs, comme Studio)
// ============================================================

const LYRICS_BLOCK_TYPES = ["Intro", "Couplet 1", "Couplet 2", "Pré-refrain", "Refrain", "Pont", "Outro"];

const LYRICS_BLOCK_ICONS = {
    "Intro": "fa-play",
    "Couplet 1": "fa-microphone-lines",
    "Couplet 2": "fa-microphone-lines",
    "Pré-refrain": "fa-arrow-trend-up",
    "Refrain": "fa-star",
    "Pont": "fa-bridge",
    "Outro": "fa-flag-checkered"
};

const LYRICS_BLOCK_COLORS = {
    "Intro": "border-sky-500/60",
    "Couplet 1": "border-purple-500/60",
    "Couplet 2": "border-purple-500/60",
    "Pré-refrain": "border-amber-500/60",
    "Refrain": "border-fuchsia-500/70",
    "Pont": "border-teal-500/60",
    "Outro": "border-rose-500/60"
};

// Formate les blocs comme dans Studio : [Type]\ntexte
function buildLyricsFromBlocks() {
    return (state.lyricsBlocks || [])
        .map(b => "[" + b.type + "]\n" + String(b.text || "").trim())
        .join("\n\n");
}

function updateLyricsPreview() {
    const previewEl = $("lyrics-preview");
    if (!previewEl) return;
    const text = buildLyricsFromBlocks();
    previewEl.textContent = text || "— L'aperçu de vos paroles apparaîtra ici —";
}

function normalizeLyricsBlocks(blocks) {
    if (!Array.isArray(blocks)) return [];
    return blocks
        .filter(b => b && typeof b === "object")
        .map(b => ({
            type: typeof b.type === "string" && b.type ? b.type : "Couplet 1",
            text: typeof b.text === "string" ? b.text : ""
        }));
}

function renderLyricsBlocks() {
    state.lyricsBlocks = normalizeLyricsBlocks(state.lyricsBlocks);
    const container = $("lyrics-blocks-container");
    const emptyEl = $("lyrics-blocks-empty");
    if (!container) return;

    container.innerHTML = state.lyricsBlocks.map((block, index) => {
        const icon = LYRICS_BLOCK_ICONS[block.type] || "fa-music";
        const color = LYRICS_BLOCK_COLORS[block.type] || "border-purple-500/60";
        const options = LYRICS_BLOCK_TYPES.map(t =>
            `<option value="${escapeHtml(t)}" ${t === block.type ? "selected" : ""}>${escapeHtml(t)}</option>`
        ).join("");
        return `
        <div class="block-card rounded-xl bg-[#221d42] border-l-4 ${color} border border-purple-900/50 p-4 shadow-md" data-block-index="${index}">
            <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid ${icon} text-fuchsia-400"></i>
                <select data-block-action="type" data-block-index="${index}" class="flex-1 rounded-md bg-night border border-purple-900/60 p-1.5 text-sm outline-none focus:border-fuchsia-500">${options}</select>
                <button type="button" data-block-action="up" data-block-index="${index}" title="Monter" class="w-8 h-8 rounded-md bg-purple-900/50 hover:bg-purple-700 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed" ${index === 0 ? "disabled" : ""}><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" data-block-action="down" data-block-index="${index}" title="Descendre" class="w-8 h-8 rounded-md bg-purple-900/50 hover:bg-purple-700 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed" ${index === state.lyricsBlocks.length - 1 ? "disabled" : ""}><i class="fa-solid fa-arrow-down"></i></button>
                <button type="button" data-block-action="delete" data-block-index="${index}" title="Supprimer" class="w-8 h-8 rounded-md bg-red-900/50 hover:bg-red-700 transition text-sm"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea data-block-action="text" data-block-index="${index}" rows="3" placeholder="Écrivez les paroles de cette section..."
                class="w-full rounded-lg bg-[#0f0f1a] border border-purple-800/70 p-3 text-sm leading-relaxed outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 font-mono">${escapeHtml(block.text)}</textarea>
        </div>`;
    }).join("");

    if (emptyEl) emptyEl.classList.toggle("hidden", state.lyricsBlocks.length > 0);
    updateLyricsPreview();
}

function moveLyricsBlock(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= state.lyricsBlocks.length) return;
    const [moved] = state.lyricsBlocks.splice(index, 1);
    state.lyricsBlocks.splice(target, 0, moved);
    renderLyricsBlocks();
    saveState();
}

function addLyricsBlock(type) {
    state.lyricsBlocks.push({ type: LYRICS_BLOCK_TYPES.includes(type) ? type : "Couplet 1", text: "" });
    renderLyricsBlocks();
    saveState();
    const container = $("lyrics-blocks-container");
    if (container && container.lastElementChild) {
        container.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

// Sauvegarde différée pendant la frappe (évite d'écrire le localStorage à chaque touche)
let lyricsSaveTimer = null;
function scheduleLyricsSave() {
    if (lyricsSaveTimer) clearTimeout(lyricsSaveTimer);
    lyricsSaveTimer = setTimeout(() => {
        lyricsSaveTimer = null;
        saveState();
    }, 400);
}

function initLyricsBlocks() {
    document.querySelectorAll(".add-lyrics-block").forEach(btn => {
        btn.addEventListener("click", () => addLyricsBlock(btn.dataset.blockType));
    });

    const skeletonBtn = $("btn-lyrics-skeleton");
    if (skeletonBtn) {
        skeletonBtn.addEventListener("click", () => {
            state.lyricsBlocks = [
                { type: "Intro", text: "" },
                { type: "Couplet 1", text: "" },
                { type: "Refrain", text: "" },
                { type: "Couplet 2", text: "" },
                { type: "Refrain", text: "" },
                { type: "Pont", text: "" },
                { type: "Outro", text: "" }
            ];
            renderLyricsBlocks();
            saveState();
            toast("Squelette de paroles créé — remplissez chaque section.", "success");
        });
    }

    const clearBtn = $("btn-lyrics-clear");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (state.lyricsBlocks.length === 0) return;
            state.lyricsBlocks = [];
            renderLyricsBlocks();
            saveState();
        });
    }

    // Délégation d'événements pour les cartes de blocs
    const container = $("lyrics-blocks-container");
    if (container) {
        container.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-block-action]");
            if (!btn) return;
            const index = parseInt(btn.dataset.blockIndex, 10);
            const action = btn.dataset.blockAction;
            if (action === "up") moveLyricsBlock(index, -1);
            else if (action === "down") moveLyricsBlock(index, 1);
            else if (action === "delete") {
                state.lyricsBlocks.splice(index, 1);
                renderLyricsBlocks();
                saveState();
            }
        });
        container.addEventListener("change", (e) => {
            const el = e.target.closest("[data-block-action]");
            if (!el || el.dataset.blockAction !== "type") return;
            const index = parseInt(el.dataset.blockIndex, 10);
            if (state.lyricsBlocks[index]) {
                state.lyricsBlocks[index].type = el.value;
                renderLyricsBlocks();
                saveState();
            }
        });
        container.addEventListener("input", (e) => {
            const el = e.target.closest("[data-block-action]");
            if (!el || el.dataset.blockAction !== "text") return;
            const index = parseInt(el.dataset.blockIndex, 10);
            if (state.lyricsBlocks[index]) {
                state.lyricsBlocks[index].text = el.value;
                updateLyricsPreview();
                scheduleLyricsSave();
            }
        });
    }
}

// ============================================================
// Synchronisation UI <-> state
// ============================================================
// Assembleur de prompt Suno
// ============================================================

function assemblePrompt() {
    const parts = [];

    if (state.style) {
        parts.push(`Genre/Style : ${state.style}`);
    }

    if (state.artist) {
        parts.push(`Artiste de référence : ${state.artist}`);
    }

    parts.push(`Configuration : ${getConfigInstruments()}`);

    if (state.drumStyle || state.drumKit || state.drumBpm || state.drumGroove || state.drumFills) {
        const drumParts = [];
        if (state.drumStyle) drumParts.push(`style de batterie : ${state.drumStyle}`);
        if (state.drumKit) drumParts.push(`kit : ${state.drumKit}`);
        if (state.drumBpm) drumParts.push(`BPM : ${state.drumBpm}`);
        if (state.drumGroove) drumParts.push(`groove : ${state.drumGroove}`);
        if (state.drumFills) drumParts.push("fills et breaks inclus");
        parts.push(`Batterie : ${drumParts.join(", ")}`);
    }

    if (state.harmonyKey || state.harmonyMode || state.harmonyProgression !== "auto" || state.harmonyVoicing !== "auto") {
        const harmonyParts = [];
        if (state.harmonyKey) harmonyParts.push(`tonalité : ${state.harmonyKey}`);
        if (state.harmonyMode) harmonyParts.push(`mode : ${state.harmonyMode}`);
        if (state.harmonyProgression !== "auto") harmonyParts.push(`progression : ${state.harmonyProgression}`);
        if (state.harmonyVoicing !== "auto") harmonyParts.push(`voicings : ${state.harmonyVoicing}`);
        parts.push(`Harmonie : ${harmonyParts.join(", ")}`);
    }

    if (state.bassStyle || state.bassRole || state.bassCharacter) {
        const bassParts = [];
        if (state.bassStyle) bassParts.push(`style : ${state.bassStyle}`);
        if (state.bassRole) bassParts.push(`rôle : ${state.bassRole}`);
        if (state.bassCharacter) bassParts.push(`caractère : ${state.bassCharacter}`);
        parts.push(`Basse : ${bassParts.join(", ")}`);
    }

    if (state.guitarType || state.guitarRole || state.keysType) {
        const guitarParts = [];
        if (state.guitarType) guitarParts.push(`guitare : ${state.guitarType}`);
        if (state.guitarRole) guitarParts.push(`rôle : ${state.guitarRole}`);
        if (state.keysType) guitarParts.push(`claviers : ${state.keysType}`);
        parts.push(`Guitares & Claviers : ${guitarParts.join(", ")}`);
    }

    if (!state.instrumentalOnly && (state.vocalStyle || state.vocalRange !== "auto" || state.singerStyle1 || state.singerStyle2 || state.singerArtist1 || state.singerArtist2)) {
        const vocalParts = [];
        if (state.vocalStyle) vocalParts.push(`style vocal : ${state.vocalStyle}`);
        if (state.vocalRange !== "auto") vocalParts.push(`tessiture : ${state.vocalRange}`);
        if (state.singerStyle1 || state.singerStyle2) {
            vocalParts.push(`mix vocal : ${[state.singerStyle1, state.singerStyle2].filter(Boolean).join(" + ")}`);
        }
        if (state.singerArtist1 || state.singerArtist2) {
            vocalParts.push(`artistes vocaux : ${[state.singerArtist1, state.singerArtist2].filter(Boolean).join(" + ")}`);
        }
        parts.push(`Chant : ${vocalParts.join(", ")}`);
    }

    if (!state.instrumentalOnly && (state.lyricsLanguage || state.lyricsStructure !== "auto" || state.lyricsTheme || state.lyricsText || (state.lyricsBlocks && state.lyricsBlocks.length > 0))) {
        const lyricsParts = [];
        if (state.lyricsLanguage) lyricsParts.push(`langue : ${state.lyricsLanguage}`);
        if (state.lyricsStructure !== "auto") lyricsParts.push(`structure : ${state.lyricsStructure}`);
        if (state.lyricsTheme) lyricsParts.push(`thème : ${state.lyricsTheme}`);
        parts.push(`Paroles : ${lyricsParts.join(", ")}`);
        // Paroles complètes : les blocs détaillés sont prioritaires, sinon le texte libre
        const lyricsFullText = buildLyricsFromBlocks() || state.lyricsText;
        if (lyricsFullText) parts.push(lyricsFullText);
    }

    if (state.productionAtmosphere || state.productionReference || state.productionEffects.length > 0) {
        const prodParts = [];
        if (state.productionAtmosphere) prodParts.push(`ambiance : ${state.productionAtmosphere}`);
        if (state.productionReference) prodParts.push(`référence : ${state.productionReference}`);
        if (state.productionEffects.length > 0) prodParts.push(`effets : ${state.productionEffects.join(", ")}`);
        parts.push(`Production : ${prodParts.join(", ")}`);
    }

    if (state.instrumentCards && state.instrumentCards.length > 0) {
        const cardLines = [];
        state.instrumentCards.forEach(card => {
            const cardParts = [];
            if (card.style) cardParts.push(`style : ${card.style}`);
            if (card.role) cardParts.push(`rôle : ${card.role}`);
            if (card.character) cardParts.push(`caractère : ${card.character}`);
            if (cardParts.length) cardLines.push(`- ${card.label} : ${cardParts.join(", ")}`);
        });
        if (cardLines.length) parts.push(`Instruments :\n${cardLines.join("\n")}`);
    }

    if (state.mixMode && (state.mixStyles.length >= 2 || state.mixArtists.length >= 2)) {
        parts.push("MODE MIX ACTIVÉ : fusionne intelligemment les styles et artistes suivants :");
        if (state.mixStyles.length >= 2) {
            parts.push(`- Styles : ${state.mixStyles.join(" + ")}`);
        }
        if (state.mixArtists.length >= 2) {
            parts.push(`- Artistes : ${state.mixArtists.join(" + ")}`);
        }
        parts.push("Crée un titre hybride original qui respecte l'essence de chaque influence.");
    }

    return parts.join("\n");
}

// ============================================================
// Sauvegarde / chargement
// ============================================================

function saveState() {
    localStorage.setItem(LS_STUDIO_PRO, JSON.stringify(state));
}

function loadState() {
    try {
        const raw = localStorage.getItem(LS_STUDIO_PRO);
        if (raw) {
            const parsed = JSON.parse(raw);
            state = { ...state, ...parsed };
        }
    } catch (_) {
        // État corrompu, on garde les valeurs par défaut
    }
}

// ============================================================
// Synchronisation UI <-> state
// ============================================================

function syncUiFromState() {
    updateConfigCards();

    const styleSelect = $("style-select");
    const artistSelect = $("artist-style");
    if (styleSelect && state.style) styleSelect.value = state.style;
    if (artistSelect && state.artist) artistSelect.value = state.artist;

    // Normalisation des libellés -> valeurs d'option des <select>
const NORMALIZE_MAPS = {
    "drum-kit": { "808": "808", "acoustic": "acoustic", "electronic": "electronic" },
    "vocal-range": { "Tenor": "tenor", "Baritone": "baritone", "Basse": "bass", "Full": "full" },
    "harmony-progression": { "I–V–vi–IV": "I-V-vi-IV", "ii–V–I": "ii-V-I", "I–vi–IV–V": "I-vi-IV-V" }
};

function normLabel(str) {
    return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u2012-\u2019]/g, "-").replace(/\s+/g, "");
}

// Applique une valeur (texte libre ou valeur) à un <select> en toute sûreté :
// - match par value exact,
// - sinon correspondance par texte (normalisé, ignore accents/casse/tirets),
// - sinon crée une <option personnalisée> contenant la valeur texte.
function applySelectValue(select, raw) {
    if (!select || raw === undefined || raw === null) return;
    const val = String(raw).trim();
    if (val === "") { select.value = ""; return; }
    if (select.value === val) return;
    if (select.querySelector(`option[value="${val}"]`)) { select.value = val; return; }
    const map = NORMALIZE_MAPS[select.id];
    if (map && map[val] && select.querySelector(`option[value="${map[val]}"]`)) { select.value = map[val]; return; }
    const norm = normLabel(val);
    const best = Array.from(select.options).find(o => o.value && normLabel(o.text) === norm);
    if (best) { select.value = best.value; return; }
    const custom = document.createElement("option");
    custom.value = val;
    custom.textContent = `${val} (perso)`;
    select.insertBefore(custom, select.firstChild);
    select.value = val;
}

const setVal = (id, val) => {
    const el = $(id);
    if (!el) return;
    if (el.tagName === "SELECT") applySelectValue(el, val);
    else el.value = val;
};
const setChecked = (id, val) => { const el = $(id); if (el) el.checked = val; };

    setVal("drum-style", state.drumStyle);
    setVal("drum-kit", state.drumKit);
    setVal("drum-bpm", state.drumBpm);
    setVal("drum-bpm-value", state.drumBpm);
    setVal("drum-groove", state.drumGroove);
    setChecked("drum-fills", state.drumFills);

    setVal("harmony-key", state.harmonyKey);
    setVal("harmony-mode", state.harmonyMode);
    setVal("harmony-progression", state.harmonyProgression);
    setVal("harmony-voicing", state.harmonyVoicing);

    setVal("bass-style", state.bassStyle);
    setVal("bass-role", state.bassRole);
    setVal("bass-character", state.bassCharacter);

    setVal("guitar-type", state.guitarType);
    setVal("guitar-role", state.guitarRole);
    setVal("keys-type", state.keysType);

    setVal("vocal-style", state.vocalStyle);
    setVal("vocal-range", state.vocalRange);
    setVal("singer-style-1", state.singerStyle1);
    setVal("singer-style-2", state.singerStyle2);
    setVal("singer-artist-1", state.singerArtist1);
    setVal("singer-artist-2", state.singerArtist2);

    setVal("lyrics-language", state.lyricsLanguage);
    setVal("lyrics-structure", state.lyricsStructure);
    setVal("lyrics-theme", state.lyricsTheme);
    setVal("lyrics-text", state.lyricsText);
    renderLyricsBlocks();

    setVal("production-atmosphere", state.productionAtmosphere);
    setVal("production-reference", state.productionReference);
    const effContainer = $("production-effects");
    if (effContainer) {
        effContainer.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.checked = (state.productionEffects || []).includes(cb.value);
        });
    }

    setChecked("mix-mode-toggle", state.mixMode);
    const mixStyleGroup = $("mix-style-group");
    const mixArtistGroup = $("mix-artist-group");
    if (mixStyleGroup) mixStyleGroup.classList.toggle("hidden", !state.mixMode);
    if (mixArtistGroup) mixArtistGroup.classList.toggle("hidden", !state.mixMode);

    setVal("mix-style-2", state.mixStyles[1] || "");
    setVal("mix-style-3", state.mixStyles[2] || "");
    setVal("mix-artist-2", state.mixArtists[1] || "");
    setVal("mix-artist-3", state.mixArtists[2] || "");

    setVal("final-prompt", state.finalPrompt);

    setChecked("instrumental-only", state.instrumentalOnly);
    const vocalControls = $("vocal-controls");
    const lyricsSection = $("lyrics-section");
    if (vocalControls) vocalControls.classList.toggle("hidden", state.instrumentalOnly);
    if (lyricsSection) lyricsSection.classList.toggle("hidden", state.instrumentalOnly);

    renderInstrumentCards();
}

// ============================================================
// Peuplement des sélecteurs de chant
// ============================================================

function populateSingerSelects() {
    const genres = getAllGenres();
    const groups = {
        "Français / Francophonie": getArtistsByGenre("").filter(a => a.language === "Français"),
        "US / UK": getArtistsByGenre("").filter(a => a.language === "Anglais"),
        "Latino": getArtistsByGenre("").filter(a => a.language === "Espagnol")
    };

    ["singer-style-1", "singer-style-2"].forEach(id => {
        const select = $(id);
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">Style</option>' +
            genres.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
        if (current) select.value = current;
    });

    ["singer-artist-1", "singer-artist-2"].forEach(id => {
        const select = $(id);
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">Artiste</option>';
        for (const [label, list] of Object.entries(groups)) {
            if (!list.length) continue;
            const og = document.createElement("optgroup");
            og.label = label;
            list.forEach(a => {
                const o = document.createElement("option");
                o.value = a.name;
                o.textContent = `${a.name} (${a.genre})`;
                og.appendChild(o);
            });
            select.appendChild(og);
        }
        if (current) select.value = current;
    });
}

const LS_AI_PROVIDERS = "mhms_ai_providers";

const PROVIDER_COLORS = {
    groq:      { color: "fuchsia",   btn: "bg-fuchsia-600/80 hover:bg-fuchsia-500",    border: "border-fuchsia-500",   ring: "focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30",   text: "text-fuchsia-400",      textLight: "text-fuchsia-300",   hoverText: "hover:text-fuchsia-300" },
    gemini:    { color: "cyan",      btn: "bg-cyan-600/80 hover:bg-cyan-500",            border: "border-cyan-500",      ring: "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",           text: "text-cyan-400",         textLight: "text-cyan-300",      hoverText: "hover:text-cyan-300" },
    openrouter:{ color: "orange",    btn: "bg-orange-600/80 hover:bg-orange-500",          border: "border-orange-500",    ring: "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30",       text: "text-orange-400",       textLight: "text-orange-300",    hoverText: "hover:text-orange-300" },
    together:  { color: "indigo",    btn: "bg-indigo-600/80 hover:bg-indigo-500",          border: "border-indigo-500",    ring: "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30",       text: "text-indigo-400",       textLight: "text-indigo-300",    hoverText: "hover:text-indigo-300" },
    mistral:   { color: "purple",    btn: "bg-purple-600/80 hover:bg-purple-500",          border: "border-purple-500",    ring: "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30",       text: "text-purple-400",       textLight: "text-purple-300",    hoverText: "hover:text-purple-300" }
};

function getProviderKey(providerId) {
    const providersKeys = JSON.parse(localStorage.getItem(LS_AI_PROVIDERS) || '{}');
    return providersKeys[providerId] || "";
}

function saveProviderKey(providerId, key) {
    const providersKeys = JSON.parse(localStorage.getItem(LS_AI_PROVIDERS) || '{}');
    providersKeys[providerId] = key.trim();
    localStorage.setItem(LS_AI_PROVIDERS, JSON.stringify(providersKeys));
}

function refreshProviderKeyUi() {
    const providers = ['groq', 'gemini', 'openrouter', 'together', 'mistral'];
    providers.forEach(provider => {
        const key = getProviderKey(provider);
        const hasKey = key.length > 0;
        const input = $(`input[data-provider-key="${provider}"]`);
        if (input) {
            input.value = hasKey ? key : "";
            input.type = hasKey ? "text" : "password";
            input.placeholder = hasKey ? `Clé ${provider} configurée` : `Clé ${provider} (ex: gsk_...)`;
        }
    });
}

async function loadAiProviders() {
    try {
        const res = await fetch("/api/ai-providers");
        if (!res.ok) return;
        window._aiProvidersData = await res.json();
        const providerSelect = $("provider-select");
        if (!providerSelect || !window._aiProvidersData.providers) return;
        const lastProvider = localStorage.getItem("mhms_ai_provider") || "groq";
        
        providerSelect.innerHTML = window._aiProvidersData.providers
            .map(p => {
                const hasLocalKey = getProviderKey(p.id).length > 0;
                const isActive = p.hasServerKey || hasLocalKey;
                const statusLabel = isActive ? '🟢 Actif' : '🔴 Clé manquante';
                return `<option value="${p.id}" ${p.id === lastProvider ? "selected" : ""}>${escapeHtml(p.name)} — ${statusLabel}</option>`;
            })
            .join("");
        providerSelect.addEventListener("change", () => {
            const selectedProvider = providerSelect.value;
            loadProviderConfigPanel(selectedProvider);
        });
    } catch (e) {
        console.warn("[AI] Échec chargement providers:", e.message);
    }
}

function loadProviderConfigPanel(providerId) {
    const panel = $("ai-provider-config-panel");
    if (!panel) return;
    
    const providerConfig = {
        groq: { name: "Groq", desc: "LPU ultra-rapide avec modèles open source (Mixtral, Llama). Quota gratuit mensuel généreux.", docsUrl: "https://console.groq.com/keys" },
        gemini: { name: "Google Gemini", desc: "Modèles Gemini (Flash, Pro). 1 500 requêtes / jour gratuites.", docsUrl: "https://makersuite.google.com/app/apikey" },
        openrouter: { name: "OpenRouter", desc: "Accès à des modèles gratuits (Llama, Mistral, Qwen) via un point d'accès unifié.", docsUrl: "https://openrouter.ai/keys" },
        together: { name: "Together AI", desc: "1 million de tokens gratuits à l'inscription. Modèles Llama 3, Mixtral et Qwen.", docsUrl: "https://api.together.xyz/settings/api-keys" },
        mistral: { name: "Mistral AI", desc: "Modèles open source français. Petit modèle 7B et Mixtral 8x22B.", docsUrl: "https://console.mistral.ai/api-keys/" }
    };
    
    const config = providerConfig[providerId];
    if (!config) return;

    const colors = PROVIDER_COLORS[providerId] || PROVIDER_COLORS.groq;
    const data = window._aiProvidersData?.providers?.find(p => p.id === providerId) || { models: [], defaultModel: "" };
    const key = getProviderKey(providerId);
    const hasKey = key.length > 0;
    const hasServerKey = !!data.hasServerKey;
    
    panel.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold ${colors.textLight}">${config.name}</h3>
            ${hasKey 
                ? '<span class="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Clé enregistrée ✓</span>'
                : hasServerKey 
                    ? '<span class="text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">Clé serveur ✓</span>'
                    : '<span class="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">Clé manquante</span>'
            }
        </div>
        <p class="text-xs text-slate-400 mb-3">${config.desc}</p>
        
        <!-- Modèle IA -->
        <div class="mb-3">
            <label class="block text-xs text-slate-300 mb-1">Modèle IA :</label>
            <select id="model-select-${providerId}"
                class="w-full rounded-lg bg-night border border-purple-800/70 px-3 py-2 text-sm outline-none transition-colors duration-200 ${colors.ring} cursor-pointer">
                ${data.models?.map(m => `<option value="${m.id}" ${m.id === data.defaultModel ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("") || `<option value="${escapeHtml(data.defaultModel || 'default')}">${escapeHtml(config.name)} - Modèle par défaut</option>`}
            </select>
        </div>
        
        <!-- Mode d'emploi -->
        <div class="text-xs text-slate-500 mb-3 p-3 bg-panel/50 rounded-lg">
            <strong class="${colors.textLight}">Mode d'emploi :</strong><br>
            1. Obtenez votre clé API depuis le lien ci-dessous.<br>
            2. Collez la clé dans le champ ci-dessus.<br>
            3. Laissez le modèle par défaut ou choisissez-en un autre.<br>
            Aucune sauvegarde côté serveur : vos clés restent uniquement dans votre navigateur.
        </div>
        
        <!-- Saisie de la clé API -->
        <div class="flex items-center gap-2 mb-2">
            <input type="password" data-provider-key="${providerId}" placeholder="${config.name} clé API…"
                value="${escapeHtml(key)}"
                class="flex-1 rounded-lg bg-night border border-purple-800/70 p-2 text-xs outline-none transition-colors duration-200 placeholder:text-slate-500 ${colors.border} ${colors.ring} font-mono">
            <button type="button" class="px-3 py-2 rounded-lg ${colors.btn} transition-all duration-200 text-white font-sm font-semibold active:scale-95"
                    data-provider-key="${providerId}">
                <i class="fa-solid fa-save mr-1"></i>Enregistrer
            </button>
        </div>
        <a href="${config.docsUrl}" target="_blank" rel="noopener"
            class="text-xs ${colors.text} ${colors.hoverText} inline-flex items-center">
            <i class="fa-solid fa-key mr-1"></i>Obtenir ma clé ${config.name}
        </a>
    `;
    
    panel.classList.remove("hidden");
    
    panel.querySelectorAll('button[data-provider-key]').forEach(btn => {
        btn.addEventListener("click", () => {
            const provId = btn.dataset.providerKey;
            const input = panel.querySelector(`input[data-provider-key="${provId}"]`);
            if (input && input.value.trim()) {
                saveProviderKey(provId, input.value);
                loadProviderConfigPanel(provId);
                refreshProviderKeyUi();
                toast(`Clé ${provId} sauvegardée !`, "success");
            } else {
                toast("Veuillez saisir une clé API.", "warning");
            }
        });
    });
    
    panel.querySelectorAll('input[data-provider-key]').forEach(input => {
        input.addEventListener("input", (e) => {
            saveProviderKey(e.target.dataset.providerKey, e.target.value);
            refreshProviderKeyUi();
        });
    });
}

// ============================================================
// Initialisation
// ============================================================

function init() {
    loadState();
    populateStyleSelect();
    populateArtistSelect(state.style);
    populateSingerSelects();
    if (state.mixMode) populateMixSelects();
    syncUiFromState();
    initPresetChipsAndSelect();
    initConfigTabs();
    loadStudioPresets();

    // Configuration cards
    document.querySelectorAll(".config-card").forEach(card => {
        card.addEventListener("click", () => {
                        state.config = card.dataset.config;
            state.selectedPresetId = ""; // config manuelle : le modèle choisi n'a plus la priorité
            const template = getConfigTemplate(state.config);
            state.instrumentCards = template.map(c => fillCardDefaults(c));
            updateConfigCards();
            saveState();
            syncUiFromState();
            toast(`Configuration : ${state.config}`, "info");
        });
    });

    // Style select
    const styleSelect = $("style-select");
    if (styleSelect) {
        styleSelect.addEventListener("change", (e) => {
            state.style = e.target.value;
            state.selectedPresetId = ""; // réglage manuel : priorité au détail
            populateArtistSelect(state.style);
            saveState();
            if (state.style) {
                toast("Style appliqué et artistes filtrés !", "success");
            }
        });
    }

    // Artist select
    const artistSelect = $("artist-style");
    if (artistSelect) {
        artistSelect.addEventListener("change", (e) => {
            state.artist = e.target.value;
            state.selectedPresetId = ""; // réglage manuel : priorité au détail
            saveState();
        });
    }

    // Drums
    const bind = (id, key, isCheckbox = false) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener("change", (e) => {
            state[key] = isCheckbox ? e.target.checked : e.target.value;
            if (key === "drumBpm") {
                const valEl = $("drum-bpm-value");
                if (valEl) valEl.textContent = state[key];
            }
            saveState();
        });
    };
    bind("drum-style", "drumStyle");
    bind("drum-kit", "drumKit");
    bind("drum-bpm", "drumBpm");
    bind("drum-groove", "drumGroove");
    bind("drum-fills", "drumFills", true);

    // Harmony
    bind("harmony-key", "harmonyKey");
    bind("harmony-mode", "harmonyMode");
    bind("harmony-progression", "harmonyProgression");
    bind("harmony-voicing", "harmonyVoicing");

    // Bass
    bind("bass-style", "bassStyle");
    bind("bass-role", "bassRole");
    bind("bass-character", "bassCharacter");

    // Guitar & Keys
    bind("guitar-type", "guitarType");
    bind("guitar-role", "guitarRole");
    bind("keys-type", "keysType");

    // Vocals
    bind("vocal-style", "vocalStyle");
    bind("vocal-range", "vocalRange");
    bind("singer-style-1", "singerStyle1");
    bind("singer-style-2", "singerStyle2");
    bind("singer-artist-1", "singerArtist1");
    bind("singer-artist-2", "singerArtist2");

    const instrumentalToggle = $("instrumental-only");
    const vocalControls = $("vocal-controls");
    const lyricsSection = $("lyrics-section");
    if (instrumentalToggle) {
        instrumentalToggle.addEventListener("change", (e) => {
            state.instrumentalOnly = e.target.checked;
            if (vocalControls) vocalControls.classList.toggle("hidden", state.instrumentalOnly);
            if (lyricsSection) lyricsSection.classList.toggle("hidden", state.instrumentalOnly);
            if (state.instrumentalOnly) {
                state.vocalStyle = "";
                state.vocalRange = "auto";
                state.singerStyle1 = "";
                state.singerStyle2 = "";
                state.singerArtist1 = "";
                state.singerArtist2 = "";
                state.lyricsLanguage = "fr";
                state.lyricsStructure = "intro, couplet-a, refrain, couplet-b, refrain, bridge, outro";
                state.lyricsTheme = "";
                state.lyricsText = "";
                state.lyricsBlocks = [];
                syncUiFromState();
            }
            saveState();
        });
    }

    // Lyrics
    bind("lyrics-language", "lyricsLanguage");
    bind("lyrics-structure", "lyricsStructure");
    bind("lyrics-theme", "lyricsTheme");
    bind("lyrics-text", "lyricsText");
    initLyricsBlocks();

    // Production
    bind("production-atmosphere", "productionAtmosphere");
    bind("production-reference", "productionReference");

    // Production effects
    document.querySelectorAll("#production-effects input[type='checkbox']").forEach(cb => {
        cb.addEventListener("change", () => {
            const checked = Array.from(document.querySelectorAll("#production-effects input[type='checkbox']:checked"))
                .map(c => c.value);
            state.productionEffects = checked;
            saveState();
        });
    });

    // Mix Mode
    const mixModeToggle = $("mix-mode-toggle");
    const mixStyleGroup = $("mix-style-group");
    const mixArtistGroup = $("mix-artist-group");

    function updateMixModeUI() {
        const enabled = mixModeToggle && mixModeToggle.checked;
        state.mixMode = enabled;
        if (enabled) state.selectedPresetId = ""; // mode mix : priorité au mélange manuel
        if (mixStyleGroup) mixStyleGroup.classList.toggle("hidden", !enabled);
        if (mixArtistGroup) mixArtistGroup.classList.toggle("hidden", !enabled);
        if (enabled) populateMixSelects();
        saveState();
    }

    if (mixModeToggle) {
        mixModeToggle.addEventListener("change", updateMixModeUI);
    }

    function rebuildMixArrays() {
        state.mixStyles = [
            state.style,
            $("mix-style-2")?.value || "",
            $("mix-style-3")?.value || ""
        ].filter(Boolean);

        state.mixArtists = [
            state.artist,
            $("mix-artist-2")?.value || "",
            $("mix-artist-3")?.value || ""
        ].filter(Boolean);

        saveState();
    }

    ["mix-style-2", "mix-style-3", "mix-artist-2", "mix-artist-3"].forEach(id => {
        const el = $(id);
        if (!el) return;
        el.addEventListener("change", rebuildMixArrays);
    });

    // Assemble
    const btnAssemble = $("btn-assemble");
    if (btnAssemble) {
        btnAssemble.addEventListener("click", () => {
            state.mixStyles = [
                state.style,
                $("mix-style-2") && $("mix-style-2").value || "",
                $("mix-style-3") && $("mix-style-3").value || ""
            ].filter(Boolean);
            state.mixArtists = [
                state.artist,
                $("mix-artist-2") && $("mix-artist-2").value || "",
                $("mix-artist-3") && $("mix-artist-3").value || ""
            ].filter(Boolean);
            state.finalPrompt = assemblePrompt();
            const finalPromptEl = $("final-prompt");
            if (finalPromptEl) finalPromptEl.value = state.finalPrompt;
            const statusEl = $("prompt-status");
            if (statusEl) statusEl.textContent = `Prompt assemblé (${state.finalPrompt.length} caractères)`;
            saveState();
            toast("Prompt assemblé avec succès !", "success");
        });
    }

    // Copy
    const btnCopy = $("btn-copy-final");
    if (btnCopy) {
        btnCopy.addEventListener("click", async () => {
            const text = state.finalPrompt || ($("final-prompt") && $("final-prompt").value) || "";
            if (!text) {
                toast("Aucun prompt à copier. Cliquez sur « Assembler » d'abord.", "warning");
                return;
            }
            await copyToClipboard(text, "Prompt final copié !");
        });
    }

    // AI Provider
    if (typeof loadAiProviders === "function") {
        loadAiProviders();
    }
    const btnShowProvider = $("btn-show-provider-config");
    if (btnShowProvider) {
        btnShowProvider.addEventListener("click", () => {
            const panel = $("ai-provider-config-panel");
            if (!panel) return;
            const isHidden = panel.classList.contains("hidden");
            if (isHidden) {
                const selectedProvider = $("provider-select") && $("provider-select").value;
                if (typeof loadProviderConfigPanel === "function" && selectedProvider) {
                    loadProviderConfigPanel(selectedProvider);
                }
                panel.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                panel.classList.add("hidden");
            }
        });
    }

    // Auto Configure
    const btnAutoConfigure = $("btn-auto-configure");
    if (btnAutoConfigure) {
        btnAutoConfigure.addEventListener("click", handleAutoConfigure);
    }

    // Instrument cards
    const btnAddInstrument = $("btn-add-instrument");
    if (btnAddInstrument) {
        btnAddInstrument.addEventListener("click", addInstrumentCard);
    }
}

document.addEventListener("DOMContentLoaded", init);
