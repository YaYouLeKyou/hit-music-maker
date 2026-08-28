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
    productionAtmosphere: "",
    productionReference: "",
    productionEffects: ["reverb"],
    mixMode: false,
    mixStyles: [],
    mixArtists: [],
    finalPrompt: ""
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
        state.drumBpm = preset.drums.bpm;
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
    if (preset.lyrics) {
        state.lyricsLanguage = preset.lyrics.language;
        state.lyricsStructure = preset.lyrics.structure;
        state.lyricsTheme = preset.lyrics.theme;
    }
    if (preset.production) {
        state.productionAtmosphere = preset.production.atmosphere;
        state.productionReference = preset.production.reference;
        state.productionEffects = preset.production.effects || ["reverb", "delay"];
    }
    if (preset.mixMode !== undefined) state.mixMode = preset.mixMode;
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
        state.drumBpm = Math.round(pick(a.drums.bpm, b.drums.bpm));
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
            if (preset) applyPresetToState(preset);
        });
    });

    if (artistSelect) {
        artistSelect.addEventListener("change", () => {
            const presetId = artistSelect.value;
            if (!presetId) return;
            const preset = window.ARTIST_PRESETS.find(p => p.id === presetId);
            if (preset) applyPresetToState(preset);
        });
    }
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
            structure: "Verse / Refrain",
            theme: ""
        },
        production: {
            atmosphere: "Standard",
            reference: style || "Standard",
            effects: ["reverb", "delay"]
        },
        mixMode: false
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
        defaults.lyrics = { language: "Français", structure: "Verse / Refrain", theme: "" };
    }

    return defaults;
}

function handleAutoConfigure() {
    const style = state.style;
    const artist = state.artist;
    const mixMode = state.mixMode;
    const mixStyles = state.mixStyles || [];
    const mixArtists = state.mixArtists || [];

    if (!style && !artist) {
        toast("Sélectionnez d'abord un style ou un artiste.", "warning");
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
        if (state.instrumentalOnly) {
            state.vocalStyle = "";
            state.vocalRange = "auto";
            state.singerStyle1 = "";
            state.singerStyle2 = "";
            state.singerArtist1 = "";
            state.singerArtist2 = "";
            state.lyricsLanguage = "fr";
            state.lyricsStructure = "auto";
            state.lyricsTheme = "";
            state.lyricsText = "";
            const vocalControls = $("vocal-controls");
            const lyricsSection = $("lyrics-section");
            if (vocalControls) vocalControls.classList.add("hidden");
            if (lyricsSection) lyricsSection.classList.add("hidden");
            syncUiFromState();
        }
        return;
    }

    const defaults = generateDefaultsFromConfig(style, artist);
    applyPresetToState(defaults);
    toast("Configuration automatique appliquée (par défaut)", "success");
    if (state.instrumentalOnly) {
        state.vocalStyle = "";
        state.vocalRange = "auto";
        state.singerStyle1 = "";
        state.singerStyle2 = "";
        state.singerArtist1 = "";
        state.singerArtist2 = "";
        state.lyricsLanguage = "fr";
        state.lyricsStructure = "auto";
        state.lyricsTheme = "";
        state.lyricsText = "";
        const vocalControls = $("vocal-controls");
        const lyricsSection = $("lyrics-section");
        if (vocalControls) vocalControls.classList.add("hidden");
        if (lyricsSection) lyricsSection.classList.add("hidden");
        syncUiFromState();
    }
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

function getConfigInstruments() {
    const base = {
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
    return base[state.config] || base.solo;
}

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

    if (state.vocalStyle || state.vocalRange !== "auto" || state.singerStyle1 || state.singerStyle2 || state.singerArtist1 || state.singerArtist2) {
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

    if (state.lyricsLanguage || state.lyricsStructure !== "auto" || state.lyricsTheme || state.lyricsText) {
        const lyricsParts = [];
        if (state.lyricsLanguage) lyricsParts.push(`langue : ${state.lyricsLanguage}`);
        if (state.lyricsStructure !== "auto") lyricsParts.push(`structure : ${state.lyricsStructure}`);
        if (state.lyricsTheme) lyricsParts.push(`thème : ${state.lyricsTheme}`);
        if (state.lyricsText) lyricsParts.push(`paroles : ${state.lyricsText}`);
        parts.push(`Paroles : ${lyricsParts.join(", ")}`);
    }

    if (state.productionAtmosphere || state.productionReference || state.productionEffects.length > 0) {
        const prodParts = [];
        if (state.productionAtmosphere) prodParts.push(`ambiance : ${state.productionAtmosphere}`);
        if (state.productionReference) prodParts.push(`référence : ${state.productionReference}`);
        if (state.productionEffects.length > 0) prodParts.push(`effets : ${state.productionEffects.join(", ")}`);
        parts.push(`Production : ${prodParts.join(", ")}`);
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

    const setVal = (id, val) => { const el = $(id); if (el) el.value = val; };
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

    setVal("production-atmosphere", state.productionAtmosphere);
    setVal("production-reference", state.productionReference);

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

    // Configuration cards
    document.querySelectorAll(".config-card").forEach(card => {
        card.addEventListener("click", () => {
            state.config = card.dataset.config;
            updateConfigCards();
            saveState();
            toast(`Configuration : ${state.config}`, "info");
        });
    });

    // Style select
    const styleSelect = $("style-select");
    if (styleSelect) {
        styleSelect.addEventListener("change", (e) => {
            state.style = e.target.value;
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
                state.lyricsStructure = "auto";
                state.lyricsTheme = "";
                state.lyricsText = "";
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
}

document.addEventListener("DOMContentLoaded", init);
