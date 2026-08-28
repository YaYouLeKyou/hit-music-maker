/* ============================================================
   Studio Presets – profils de configuration prédéfinis
   Un modèle par grand style, inspiré d'un grand artiste.
   ============================================================ */

// ------------------------------------------------------------
// 1. Profils majeurs (1 par grand style)
// ------------------------------------------------------------

const STUDIO_PRESETS = [
  {
    id: "rock-pop-beatles",
    label: "Rock-Pop Beatles",
    type: "artist",
    aliases: ["beatles", "rock pop", "pop rock", "les beatles", "the beatles"],
    config: "band",
    style: "Rock / Pop",
    artist: "The Beatles",
    drums:   { style: "Kit acoustique, grosse caisse chaude, charley ouvert, cymbales brillantes", kit: "Acoustic", bpm: 120, groove: "Straight", fills: true },
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
    id: "reggae-bob-marley",
    label: "Reggae Bob Marley",
    type: "artist",
    aliases: ["bob marley", "reggae", "rasta", "jamaica", "one love"],
    config: "band",
    style: "Reggae",
    artist: "Bob Marley",
    drums:   { style: "One drop riddim, charley offbeat, grosse caisse sur 3", kit: "Acoustic", bpm: 76, groove: "Reggae", fills: false },
    harmony: { key: "G", mode: "major", progression: "One drop", voicing: "Loose" },
    bass:    { style: "Thick bass", role: "Groove", character: "Round" },
    guitar:  { type: "Skank rhythm", role: "Offbeat" },
    keys:    { type: "Organ shuffle" },
    vocals:  { style: "Laid back", range: "Baritone", singerStyle1: "Reggae", singerArtist1: "Bob Marley" },
    lyrics:  { language: "Anglais", structure: "Verse / Chorus", theme: "Unity, resistance, love" },
    production: { atmosphere: "Warm / sunny", reference: "Exodus 1977", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "funk-stevie-wonder",
    label: "Funk Stevie Wonder",
    type: "artist",
    aliases: ["stevie wonder", "funk", "motown", "soul funk", "superstition"],
    config: "band",
    style: "Funk",
    artist: "Stevie Wonder",
    drums:   { style: "Tight drummer, ghost notes, open hi-hats", kit: "Acoustic", bpm: 104, groove: "Funk", fills: true },
    harmony: { key: "Bb", mode: "minor", progression: "ii–V–I funk", voicing: "Extended chords" },
    bass:    { style: "Slap bass", role: "Groove", character: "Punchy" },
    guitar:  { type: "Clean rhythm + Wah solo", role: "Rhythm + Lead" },
    keys:    { type: "Clavinet / Hohner" },
    vocals:  { style: "Soulful", range: "Tenor", singerStyle1: "Funk", singerArtist1: "Stevie Wonder" },
    lyrics:  { language: "Anglais", structure: "Verse / Chorus", theme: "Social consciousness, love" },
    production: { atmosphere: "Warm / punchy", reference: "Superstition 1972", effects: ["reverb","phaser"] },
    mixMode: false
  },
  {
    id: "drill-gazo",
    label: "Drill Gazo",
    type: "artist",
    aliases: ["gazo", "drill", "jul", "paris", "mr beast", "drill paris"],
    config: "solo",
    style: "Drill",
    artist: "Gazo",
    drums:   { style: "Sliding 808s, ghost snares, fast triplet hi-hats with pitch slides, heavy acoustic kick", kit: "808", bpm: 140, groove: "Sliding", fills: true },
    harmony: { key: "Ab", mode: "minor", progression: "Chord progression épicée", voicing: "Autotune melodio" },
    bass:    { style: "808 sub punch", role: "Pulsant", character: "Darker" },
    guitar:  { type: "Distorted delay", role: "Lead melodic" },
    keys:    { type: "Minimal synth pad" },
    vocals:  { style: "Auto‑tune melodio", range: "Autotune", singerStyle1: "Drill", singerArtist1: "Gazo" },
    lyrics:  { language: "Français", structure: "Couplet rapide / Refrain énergique", theme: "Street life" },
    production: { atmosphere: "Dark / melancholic night", reference: "SoundCloud Drill 2024", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "hip-hop-travis-scott",
    label: "Hip-Hop Travis Scott",
    type: "artist",
    aliases: ["travis scott", "hip hop", "trap", "astroworld", "cactus jack"],
    config: "solo",
    style: "Hip-Hop / Trap",
    artist: "Travis Scott",
    drums:   { style: "808s + 808 kicks, hi-hats + claps, fast snare rolls, atmospheric pads", kit: "808", bpm: 138, groove: "Aggressive", fills: true },
    harmony: { key: "F", mode: "minor", progression: "Chords disonants", voicing: "Auto‑tune" },
    bass:    { style: "808 punch", role: "Pulsant", character: "Harsh" },
    guitar:  { type: "Distorted clean", role: "Side‑chained" },
    keys:    { type: "Side‑chained pads" },
    vocals:  { style: "Autotuned male", range: "Auto", singerStyle1: "Trap", singerArtist1: "Travis Scott" },
    lyrics:  { language: "Anglais", structure: "Couplet / Refrain fort", theme: "Party, success, struggle" },
    production: { atmosphere: "Dark / gritty", reference: "Astroworld 2018", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "synthwave-kavinsky",
    label: "Synthwave Kavinsky",
    type: "artist",
    aliases: ["kavinsky", "synthwave", "retro", "80s", "neon", "outrun"],
    config: "duo",
    style: "Synthwave",
    artist: "Kavinsky",
    drums:   { style: "Synthesized kick, echo snare, gated reverb", kit: "Digital", bpm: 100, groove: "Synced", fills: false },
    harmony: { key: "D", mode: "major", progression: "Pre‑chorus → chorus", voicing: "Analog synths" },
    bass:    { style: "Analog sub", role: "Pad", character: "Glassy" },
    guitar:  { type: "Analog delay", role: "Lead" },
    keys:    { type: "Synth pads" },
    vocals:  { style: "Vocal chops / pitch", range: "Auto", singerStyle1: "Synthwave", singerArtist1: "Kavinsky" },
    lyrics:  { language: "Anglais", structure: "Intro / Drop", theme: "Retro futuristic, night drive" },
    production: { atmosphere: "Neon / cold", reference: "OutRun 2013", effects: ["delay","filter"] },
    mixMode: false
  },
  {
    id: "afrobeat-burna-boy",
    label: "Afrobeat Burna Boy",
    type: "artist",
    aliases: ["burna boy", "afrobeat", "afrobeats", "nigerian", "london"],
    config: "ensemble",
    style: "Afro-beat",
    artist: "Burna Boy",
    drums:   { style: "Djembe, shakers, percussions, log drums", kit: "Acoustic", bpm: 108, groove: "Afro groove", fills: true },
    harmony: { key: "Gb", mode: "minor", progression: "Cyclique pentatonique", voicing: "Voix collectives" },
    bass:    { style: "Percussive bass", role: "Swing", character: "Round" },
    guitar:  { type: "Jazz‑fusion", role: "Solo impressionniste" },
    keys:    { type: "Synth pads / organ" },
    vocals:  { style: "Chant traditionnel + flow", range: "Baritone", singerStyle1: "Afrobeat", singerArtist1: "Burna Boy" },
    lyrics:  { language: "Anglais / Pidgin", structure: "Verse / Refrain / Break", theme: "African pride, diaspora" },
    production: { atmosphere: "Vibrant / festive", reference: "African Giant 2019", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "house-dua-lipa",
    label: "House Dua Lipa",
    type: "artist",
    aliases: ["dua lipa", "house", "pop house", "french house", "disco"],
    config: "duo",
    style: "House / Disco",
    artist: "Dua Lipa",
    drums:   { style: "909 drum machine, sliced hi-hats, filtered kick, four-on-the-floor", kit: "Analog", bpm: 124, groove: "Minimal", fills: false },
    harmony: { key: "D", mode: "minor", progression: "4‑bar loop", voicing: "Deep synths" },
    bass:    { style: "303 sub", role: "Rythm", character: "Minimal" },
    guitar:  { type: "Disco guitar chops", role: "Accent" },
    keys:    { type: "Piano chords / synth stabs" },
    vocals:  { style: "Disco pop", range: "Mezzo-soprano", singerStyle1: "Pop", singerArtist1: "Dua Lipa" },
    lyrics:  { language: "Anglais", structure: "Intro / Verse / Chorus", theme: "Love, dance, confidence" },
    production: { atmosphere: "Clean / clinical", reference: "Future Nostalgia 2020", effects: ["delay","filter"] },
    mixMode: false
  },
  {
    id: "soul-marvin-gaye",
    label: "Soul Marvin Gaye",
    type: "artist",
    aliases: ["marvin gaye", "soul", "motown", "rnb", "quiet storm"],
    config: "quartet",
    style: "Soul / R&B",
    artist: "Marvin Gaye",
    drums:   { style: "Live kit, brushed snare, rimshots", kit: "Acoustic", bpm: 92, groove: "Swing", fills: true },
    harmony: { key: "B♭", mode: "major", progression: "ii–V–I", voicing: "4‑part harmony" },
    bass:    { style: "Walking upright", role: "Melodic", character: "Smooth" },
    guitar:  { type: "Clean tone", role: "Rhythm" },
    keys:    { type: "Piano / Rhodes" },
    vocals:  { style: "Smooth soulful", range: "Baritone", singerStyle1: "Soul", singerArtist1: "Marvin Gaye" },
    lyrics:  { language: "Anglais", structure: "Verse / Bridge / Chorus", theme: "Love, social issues" },
    production: { atmosphere: "Analog / warm", reference: "What's Going On 1971", effects: ["reverb","tape"] },
    mixMode: false
  },
  {
    id: "jazz-miles-davis",
    label: "Jazz Miles Davis",
    type: "artist",
    aliases: ["miles davis", "jazz", "modal jazz", "cool jazz", "trumpet"],
    config: "quatuor",
    style: "Jazz",
    artist: "Miles Davis",
    drums:   { style: "Brush, brushes on drums, light ride", kit: "Acoustic", bpm: 110, groove: "Lay-back", fills: false },
    harmony: { key: "F", mode: "major", progression: "Turnarounds", voicing: "Extended chords" },
    bass:    { style: "Walking", role: "Line", character: "Swing" },
    guitar:  { type: "Plectrum", role: "Solo impressionniste" },
    keys:    { type: "Piano comping" },
    vocals:  { style: "Scat + lyrics", range: "Baritone", singerStyle1: "Jazz", singerArtist1: "Miles Davis" },
    lyrics:  { language: "Anglais", structure: "Standards", theme: "Improvisation" },
    production: { atmosphere: "Lounge / cool", reference: "Kind of Blue 1959", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "metal-metallica",
    label: "Metal Metallica",
    type: "artist",
    aliases: ["metallica", "metal", "heavy metal", "thrash", "rock metal"],
    config: "trio",
    style: "Metal",
    artist: "Metallica",
    drums:   { style: "Double bass drums, blast beats, paradiddles", kit: "Acoustic", bpm: 180, groove: "Aggressive", fills: true },
    harmony: { key: "D♭", mode: "minor", progression: "Riff → solo → outro", voicing: "Riff‑centric" },
    bass:    { style: "Power chord", role: "Anchor", character: "Rythmic" },
    guitar:  { type: "Solo LEAD", role: "Epic" },
    keys:    { type: "Organ pads" },
    vocals:  { style: "Cryl", range: "Full", singerStyle1: "Metal", singerArtist1: "Metallica" },
    lyrics:  { language: "Anglais", structure: "Verse → Solo → Outro", theme: "Rites, rebellion" },
    production: { atmosphere: "Aggressive / violent", reference: "Master of Puppets 1986", effects: ["reverb","delay"] },
    mixMode: false
  },
  {
    id: "orchestral-philharmonic",
    label: "Orchestre Philharmonique",
    type: "style",
    aliases: ["orchestre", "philharmonique", "classique", "symphony", "strings", "orchestral"],
    config: "orchestra",
    style: "Classique / Orchestral",
    artist: "",
    drums:   { style: "Timpani, cymbals, triangle", kit: "Orchestral", bpm: 108, groove: "Lento", fills: false },
    harmony: { key: "D", mode: "major", progression: "Sonata form", voicing: "Full orchestral" },
    bass:    { style: "Double bass", role: "Foundation", character: "Deep" },
    guitar:  { type: "Harpe / Celesta", role: "Color" },
    keys:    { type: "Piano / Celesta" },
    vocals:  { style: "Operatic / Choir", range: "Full", singerStyle1: "Classique", singerArtist1: "" },
    lyrics:  { language: "Latin / Allemand", structure: "Aria / Chorus", theme: "Epic, dramatic" },
    production: { atmosphere: "Grand / cathedral", reference: "Berlin Philharmonic", effects: ["reverb","hall"] },
    mixMode: false
  },
  {
    id: "opera",
    label: "Opéra",
    type: "style",
    aliases: ["opera", "opéra", "lyrique", "aria", "classique vocal"],
    config: "opera",
    style: "Opéra / Lyrique",
    artist: "",
    drums:   { style: "Timpani, orchestral percussion", kit: "Orchestral", bpm: 80, groove: "Rubato", fills: false },
    harmony: { key: "C", mode: "major", progression: "Da capo aria", voicing: "Orchestral tutti" },
    bass:    { style: "Cello / Double bass", role: "Foundation", character: "Deep" },
    guitar:  { type: "Harp", role: "Arpeggios" },
    keys:    { type: "Piano / Pipe organ" },
    vocals:  { style: "Bel canto", range: "Full opera", singerStyle1: "Opéra", singerArtist1: "" },
    lyrics:  { language: "Italien / Français", structure: "Aria / Recitative", theme: "Tragedy, love, destiny" },
    production: { atmosphere: "Theatrical / hall", reference: "La Scala Milan", effects: ["reverb","hall"] },
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
// 4. Fonctions d'aide
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
    return keys[Math.round((1 - ratio) * keys.length)];
}

function applyPresetToState(state, preset) {
    if (!preset) return;
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
