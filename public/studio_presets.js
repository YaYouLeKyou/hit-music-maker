/* ============================================================
   Studio Presets – profils de configuration prédéfinis
   ============================================================ */

// ------------------------------------------------------------
// 1. Profils spécifiques (ciblés)
// ------------------------------------------------------------

const STUDIO_PRESETS = [
  {
    id: "beatles",
    label: "The Beatles",
    type: "artist",
    aliases: ["beatles", "les beatles", "beattles", "the beatles"],
    config: "band",
    style: "Rock / Pop",
    artist: "The Beatles",
    drums:   { style: "Live drum kit, brushed snare", kit: "Acoustic", bpm: 120, groove: "Straight", fills: true },
    harmony: { key: "C", mode: "major", progression: "I–V–vi–IV", voicing: "Close vocal harmonies" },
    bass:    { style: "Melodic bass", role: "Groove + counter-melody", character: "Warm" },
    guitar:  { type: "Electric + Acoustic", role: "Rhythm + Lead" },
    keys:    { type: "Piano / Hammond" },
    vocals:  { style: "Harmonized lead", range: "Tenor", singerStyle1: "Rock / Pop", singerArtist1: "The Beatles" },
    lyrics:  { language: "Anglais", structure: "Couplet / Refrain", theme: "Love, storytelling" },
    production: { atmosphere: "Warm / Vintage", reference: "60s Abbey Road", effects: ["reverb","tape"] },
    mixMode: false
  },
  {
    id: "drill-parisien",
    label: "Drill Parisien",
    type: "artist",
    aliases: ["drill", "jul", "gazo", "parisien", "drill paris"],
    config: "solo",
    style: "Drill Marseille",
    artist: "Jul",
    drums:   { style: "Marseille drill sliding 808s, ghost snares, fast triplet hi-hats with pitch slides, heavy acoustic kick", kit: "808", bpm: 140, groove: "Sliding", fills: true },
    harmony: { key: "Ab", mode: "minor", progression: "Chord progression épicée", voicing: "Autotune melodio" },
    bass:    { style: "808 sub punch", role: "Pulsant", character: "Darker" },
    guitar:  { type: "Distorted delay", role: "Lead melodic" },
    keys:    { type: "Minimal synth pad" },
    vocals:  { style: "Auto‑tune melodio", range: "Autotune", singerStyle1: "Drill", singerArtist1: "Jul" },
    lyrics:  { language: "Français", structure: "Couplet rapide / Refrain énergique", theme: "Street life" },
    production: { atmosphere: "Dark / melancholic night", reference: "SoundCloud Drill 2024", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "synthwave-80s",
    label: "Synthwave 80s",
    type: "style",
    aliases: ["synthwave", "synth", "80s", "retro", "neon"],
    config: "duo",
    style: "Synthwave",
    artist: "",
    drums:   { style: "Synthesized kick, echo snare", kit: "Digital", bpm: 100, groove: "Synced", fills: false },
    harmony: { key: "D", mode: "major", progression: "Pre‑chorus → chorus", voicing: "Analog synths" },
    bass:    { style: "Analog sub", role: "Pad", character: "Glassy" },
    guitar:  { type: "Analog delay", role: "Braid" },
    keys:    { type: "Synth pads" },
    vocals:  { style: "Vocal chops / pitch", range: "Auto", singerStyle1: "Synthwave", singerArtist1: "" },
    lyrics:  { language: "Anglais", structure: "Intro / Drop", theme: "Retro futuristic" },
    production: { atmosphere: "Neon / cold", reference: "Blade Runner", effects: ["delay","filter"] },
    mixMode: false
  },
  {
    id: "afrobeat-cotonou",
    label: "Afrobeat Cotonou",
    type: "style",
    aliases: ["afrobeat", "yom", "cotonou", "late", "black-rose"],
    config: "ensemble",
    style: "Afro-beat",
    artist: "",
    drums:   { style: "Djembe, tambour, dunun", kit: "Acoustic", bpm: 108, groove: "Groove africain", fills: true },
    harmony: { key: "Gb", mode: "minor", progression: "Cyclique pentatonique", voicing: "Voix collectives" },
    bass:    { style: "D'jembe bass", role: "Swing", character: "Round" },
    guitar:  { type: "Jazz‑fusion", role: "Solo impressionniste" },
    keys:    { type: "Xylophone polyphonique" },
    vocals:  { style: "Chant traditionnel + flow", range: "Baritone", singerStyle1: "Afrobeat", singerArtist1: "" },
    lyrics:  { language: "Français / Yoruba", structure: "Verse / Refrain / Break", theme: "Urban poetry" },
    production: { atmosphere: "Vibrant / festive", reference: "Afrobeat 2023", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "psytrance-peak",
    label: "Psytrance Hardcore",
    type: "style",
    aliases: ["psytrance", "goa", "trance", "euphoric", "full‑on"],
    config: "solo",
    style: "Psytrance",
    artist: "",
    drums:   { style: "Kick 150 bpm, clap 75 bpm, synth arps", kit: "Drum machine", bpm: 144, groove: "Aggressive", fills: true },
    harmony: { key: "C", mode: "major", progression: "Rising arps → kick", voicing: "Progressive" },
    bass:    { style: "Supersaw sub", role: "Ground", character: "Heavy" },
    guitar:  { type: "Lead trance", role: "Blaster" },
    keys:    { type: "Progressive synths" },
    vocals:  { style: "Melodic lead / header", range: "Full", singerStyle1: "Psytrance", singerArtist1: "" },
    lyrics:  { language: "Anglais", structure: "Build‑up / Drop", theme: "Euphoric journey" },
    production: { atmosphere: "Neuronal / intense", reference: "Psytrance 90s", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "house-parisien",
    label: "House Parisien (Techno French)",
    type: "style",
    aliases: ["house", "techno", "parisien", "french house", "koyote"],
    config: "duo",
    style: "Techno",
    artist: "",
    drums:   { style: "909 drum machine, sliced hi‑hats, filtered kick", kit: "Analog", bpm: 124, groove: "Minimal", fills: false },
    harmony: { key: "D", mode: "minor", progression: "4‑bar loop", voicing: "Deep synths" },
    bass:    { style: "303 sub", role: "Rythm", character: "Minimal" },
    guitar:  { type: "Vocoder", role: "Melodic" },
    keys:    { type: "LFOs slowly modulating" },
    vocals:  { style: "Vocoder / spoken", range: "Digital", singerStyle1: "House", singerArtist1: "" },
    lyrics:  { language: "Anglais", structure: "Intro / Break", theme: "Nachtmental" },
    production: { atmosphere: "Clean / clinical", reference: "Koyote 2022", effects: ["delay","filter"] },
    mixMode: false
  },
  {
    id: "drill-atlanta",
    label: "Atlanta Trap",
    type: "style",
    aliases: ["atld", "trap", "atlanta", "zion", "official"],
    config: "solo",
    style: "Trap / Drill",
    artist: "",
    drums:   { style: "808s + 808 kicks, hi‑hats + claps, fast snare rolls", kit: "808", bpm: 138, groove: "Aggressive", fills: true },
    harmony: { key: "F", mode: "minor", progression: "Chords disonants", voicing: "Auto‑tune" },
    bass:    { style: "808 punch", role: "Pulsant", character: "Harsh" },
    guitar:  { type: "Distorted clean", role: "Side‑chained" },
    keys:    { type: "Side‑chained pads" },
    vocals:  { style: "Autotuned male", range: "Auto", singerStyle1: "Trap", singerArtist1: "" },
    lyrics:  { language: "Anglais", structure: "Couplet / Refrain fort", theme: "Street drama" },
    production: { atmosphere: "Dark / gritty", reference: "Atlanta Drill 2023", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "vintage-soul",
    label: "Soul Vintage (60s)",
    type: "style",
    aliases: ["soul", "vintage", "60s", "stadium", "classic"],
    config: "quartet",
    style: "Soul",
    artist: "",
    drums:   { style: "Live kit, brushed snare", kit: "Acoustic", bpm: 92, groove: "Swing", fills: true },
    harmony: { key: "B♭", mode: "major", progression: "ii–V–I", voicing: "4‑part harmony" },
    bass:    { style: "Walking upright", role: "Melodic", character: "Smooth" },
    guitar:  { type: "Clean tone", role: "Rhythm" },
    keys:    { type: "Orchestral pads" },
    vocals:  { style: "N’Borgée soulful", range: "Baritone", singerStyle1: "Soul", singerArtistλη: "" },
    lyrics:  { language: "Anglais", structure: "Verse / Bridge / Chorus", theme: "Love / loss" },
    production: { atmosphere: "Analog / warm", reference: "Stax 1968", effects: ["reverb","tape"] },
    mixMode: false
  },
  {
    id: "reggaeton-caribe",
    label: "Reggaeton Caraïbes",
    type: "style",
    aliases: ["reggaeton", "latin", "caribe", "dem bow", "trapper"],
    config: "duo",
    style: "Reggaeton",
    artist: "",
    drums:   { style: "Dem bow riddim, clave latine", kit: "Electronic", bpm: 96, groove: "Danceable", fills: false },
    harmony: { key: "E♭", mode: "minor", progression: "Miestra", voicing: "Accords syncopés" },
    bass:    { style: "Reggaeton sub", role: "Rythm", character: "Sharp" },
    guitar:  { type: "Acoustic latin", role: "Accent" },
    keys:    { type: "Synth caribe" },
    vocals:  { style: "Dem bow chorus", range: "Auto", singerStyle1: "Reggaeton", singerArtist1: "" },
    lyrics:  { language: "Español", structure: "Versos + refrain", theme: "Life, love, party" },
    production: { atmosphere: "Vibrant tropical", reference: "Calle Ocho 2023", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "kpop-fusion",
    label: "K‑Pop Dance Fusion",
    type: "style",
    aliases: ["kpop", "jpop", "dance", "c-pop", "korean"],
    config: " groupe",
    style: "K‑Pop",
    artist: "",
    drums:   { style: "Electronic kits, hi‑hats, crash cymbals", kit: "Electronic", bpm: 120, groove: "Frenetic", fills: true },
    harmony: { key: "A", mode: "major", progression: "Pre‑chorus → explosive chorus", voicing: "4‑track vocal stacked" },
    bass:    { style: "Deep 808", role: "Pulsant", character: "Heavy" },
    guitar:  { type: "Distorted chords", role: "Bridge" },
    keys:    { type: "Arpeggiated synths" },
    vocals:  { style: "Auto‑tuned melodio", range: "Soprano", singerStyle1: "K‑Pop", singerArtist1: "" },
    lyrics:  { language: "Coréen", structure: "Intro → Build‑up → Drop", theme: "Love & Friendship" },
    production: { atmosphere: "High‑energy", reference: "BTS 2023", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "metal-epic",
    label: "Heavy Metal Epic",
    type: "style",
    aliases: ["metal", "rock", "heavy", "guitar", "true", "screaming"],
    config: "trio",
    style: "Metal",
    artist: "",
    drums:   { style: "Double bass drums, blast beats, paradiddles", kit: "Acoustic", bpm: 180, groove: "Aggressive", fills: true },
    harmony: { key: "D♭", mode: "minor", progression: "Riff → solo → outro", voicing: "Riff‑centric" },
    bass:    { style: "Power chord", role: "Anchor", character: "Rythmic" },
    guitar:  { type: "Solo LEAD", role: "Epic" },
    keys:    { type: "Organ pads" },
    vocals:  { style: "Cryl", range: "Full", singerStyle1: "Metal", singerArtist1: "" },
    lyrics:  { language: "Anglais", structure: "Verse → Solo → Outro", theme: "Rites, rebellion" },
    production: { atmosphere: "Aggressive / violent", reference: "Metallica 1991", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "jazz-modern",
    label: "Jazz Moderne (Nu‑Jazz)",
    type: "style",
    aliases: ["jazz", "nu‑jazz", "smooth", "instrumental", "finger", "bass"],
    config: "quatuor",
    style: "Jazz",
    artist: "",
    drums:   { style: "Brush, brushes on piano", kit: "Acoustic", bpm: 110, groove: "Lay‑back", fills: false },
    harmony: { key: "F", mode: "major", progression: "Turnarounds", voicing: "Extended chords" },
    bass:    { style: "Walking", role: "Line", character: "Swing" },
    guitar:  { type: "Plectrum", role: "Solo impressionniste" },
    keys:    { type: "Vibraphone, vibes" },
    vocals:  { style: "Scat + lyrics", range: "Baritone", singerStyle1: "Jazz", singerArtist1: "" },
    lyrics:  { language: "Anglais", structure: "Standards", theme: "Improvisation" },
    production: { atmosphere: "Lounge / cool", reference: "Miles Davis 1959", effects: ["reverb","delay"] },
    mixMode: false
  }
];

// ------------------------------------------------------------
// 2. Génération automatique de presets à partir de ARTISTS_DATABASE
// ------------------------------------------------------------

function buildArtistPreset(artist) {
    if (typeof ARTISTS_DATABASE === "undefined") return null;
    const g = artist.genre || "";
    const bpmRange = artist.bpm_range || "120-128";
    const bpmMin = parseInt(bpmRange.split("-")[0]) || 120;

    return {
        id: artist.name.toLowerCase().replace(/[^a-z0-9]/gi, "").substring(0, 30),
        label: artist.name,
        type: "artist",
        aliases: [artist.name.toLowerCase(), (artist.language || "").toLowerCase(), ...g.split("/").map(w => w.trim().toLowerCase())],
        config: artist.name.includes("The") || artist.name.includes("Les") ? (artist.name.includes("Beastie") ? "group" : "band") : "solo",
        style: g.split("/")[0].trim(),
        artist: artist.name,
        drums:   {
            style: artist.drum_style || "Modern kit",
            kit: "808 / Acoustic",
            bpm: bpmMin,
            groove: "Standard",
            fills: g.includes("Drill") || g.includes("Trap") || g.includes("House")
        },
        harmony: {
            key: "C",
            mode: g.includes("Minor") || g.includes("Dark") ? "minor" : "major",
            progression: "Progression simple",
            voicing: "Simple"
        },
        bass:    { style: "Modern bass", role: "Rythm", character: "Standard" },
        guitar:  { type: "Rhythm / Lead", role: "Rhythm" },
        keys:    { type: "Pads / Lead" },
        vocals:  { style: "Melodic", range: "Standard", singerStyle1: g, singerArtist1: artist.name },
        lyrics:  { language: artist.language || "Anglais", structure: "Verse / Refrain", theme: "Generic" },
        production: { atmosphere: "Standard", reference: "Standard", effects: ["reverb", "delay"] },
        mixMode: false
    };
}

// ------------------------------------------------------------
// 3. Toutes les données des presets (ciblés + générés)
// ------------------------------------------------------------

const ALL_PRESETS = STUDIO_PRESETS.concat((ARTISTS_DATABASE || []).map(buildArtistPreset).filter(Boolean));

// ------------------------------------------------------------
// 4. Fonctions d’aide
// ------------------------------------------------------------

function resolveProfileType(query) {
    if (!query) return [];
    const normalized = query.toLowerCase().trim();
    const exact = ALL_PRESETS.filter(p =>
        p.id === normalized ||
        p.aliases?.includes(normalized) ||
        p.label.toLowerCase() === normalized
    );
    if (exact.length) return exact;
    return ALL_PRESETS.filter(p =>
        p.id.includes(normalized) ||
        p.aliases?.some(alias => alias.includes(normalized)) ||
        p.label.toLowerCase().includes(normalized)
    );
}

function pickCamelotKey(a, b, ratio) {
    const keys = [a, b].filter(k => k);
    if (keys.length <= 1) return keys[0];
    return keys[Math.round((1 - ratio) * keys.length)]; // biaisé vers la première si ratio bas
}

function applyPresetToState(state, preset) {
    state.config = preset.config;
    state.style = preset.style;
    state.artist = preset.artist;
    if (preset.drums) { state.drumStyle = preset.drums.style; state.drumBpm = preset.drums.bpm; }
    if (preset.harmony) { state.harmonyKey = preset.harmony.key; state.harmonyMode = preset.harmony.mode; state.harmonyProgression = preset.harmony.progression; state.harmonyVoicing = preset.harmony.voicing; }
    if (preset.bass) { state.bassStyle = preset.bass.style; state.bassRole = preset.bass.role; state.bassCharacter = preset.bass.character; }
    if (preset.guitar) { state.guitarType = preset.guitar.type; state.guitarRole = preset.guitar.role; }
    if (preset.keys) { state.keysType = preset.keys.type; }
    if (preset.vocals) { state.vocalStyle = preset.vocals.style; state.vocalRange = preset.vocals.range; if (preset.vocals.singerStyle1) state.singerStyle1 = preset.vocals.singerStyle1; if (preset.vocals.singerArtist1) state.singerArtist1 = preset.vocals.singerArtist1; }
    if (preset.lyrics) { state.lyricsLanguage = preset.lyrics.language; state.lyricsStructure = preset.lyrics.structure; state.lyricsTheme = preset.lyrics.theme; }
    if (preset.production) { state.productionAtmosphere = preset.production.atmosphere; state.productionReference = preset.production.reference; state.productionEffects = preset.production.effects || []; }
    // Ne pas écraser mixMode à moins que explicitement défini
    if (preset.mixMode !== undefined) state.mixMode = preset.mixMode;
}

// ------------------------------------------------------------
// 5. Export de tout
// ------------------------------------------------------------

window.STUDIO_PRESETS = STUDIO_PRESETS;
window.ARTIST_PRESETS = ALL_PRESETS;
window.applyPresetToState = applyPresetToState;
window.resolveProfileType = resolveProfileType;
window.buildArtistPreset = buildArtistPreset;
window.pickCamelotKey = pickCamelotKey;
