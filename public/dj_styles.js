/* ============================================================
   DJ Pro — Styles, métadonnées et utilitaires DJ
   ============================================================ */

// ------------------------------------------------------------
// 1. Catalogue de styles DJ
// ------------------------------------------------------------

const DJ_STYLES = [
    {
        id: "selecta",
        label: "DJ Selecta",
        bpm: [160, 180],
        energy: [7, 10],
        vibe: "underground",
        description: "Bass lourd, drums martiales, flow alterné, sélection pointue.",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["dub", "world", "hiphop", "techno"]
    },
    {
        id: "hiphop",
        label: "DJ Hip Hop",
        bpm: [80, 110],
        energy: [4, 8],
        vibe: "groove",
        description: "Boom bap, boom bap moderne, scratch, breaks, soul samples.",
        transitionTypes: ["cut", "beatmatch", "scratch"],
        compatibleWith: ["funk", "soul", "jazz", "dub"]
    },
    {
        id: "world",
        label: "DJ World",
        bpm: [90, 140],
        energy: [3, 9],
        vibe: "global",
        description: "Afrobeat, latino, oriental, tribal, percussions du monde.",
        transitionTypes: ["cut", "filter", "crossfade"],
        compatibleWith: ["funk", "latin", "afrobeat", "dub"]
    },
    {
        id: "funk",
        label: "DJ Funk",
        bpm: [100, 130],
        energy: [5, 9],
        vibe: "groove",
        description: "Funk, disco, boogie, breaks, bass line groovy.",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["disco", "soul", "hiphop", "club"]
    },
    {
        id: "techno",
        label: "DJ Techno",
        bpm: [120, 150],
        energy: [6, 10],
        vibe: "dark",
        description: "Techno minimal, hard techno, industrial, 4/4 kicks.",
        transitionTypes: ["cut", "filter", "build-up"],
        compatibleWith: ["industrial", "electro", "club", "minimal"]
    },
    {
        id: "club",
        label: "DJ Club",
        bpm: [120, 140],
        energy: [6, 10],
        vibe: "party",
        description: "House, electro house, commercial club, drops.",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["techno", "electro", "house", "pop"]
    },
    {
        id: "psytrance",
        label: "DJ Psytrance",
        bpm: [138, 150],
        energy: [7, 10],
        vibe: "trance",
        description: "Psytrance, progressive, Goa, leads hypnotiques.",
        transitionTypes: ["build-up", "filter", "drop"],
        compatibleWith: ["trance", "techno", "electro", "goa-psy"]
    },
    {
        id: "dub",
        label: "DJ Dub",
        bpm: [70, 100],
        energy: [2, 6],
        vibe: "chill",
        description: "Dub, reggae, echoes, space, bass profond.",
        transitionTypes: ["crossfade", "filter", "delay"],
        compatibleWith: ["reggae", "world", "hiphop", "selecta"]
    },
    {
        id: "drum-and-bass",
        label: "DJ Drum & Bass",
        bpm: [160, 180],
        energy: [7, 10],
        vibe: "energetic",
        description: "DnB, jungle, breaks, basslines complexes.",
        transitionTypes: ["cut", "drop", "rewind"],
        compatibleWith: ["jungle", "breakbeat", "techno", "electro"]
    },
    {
        id: "garage",
        label: "DJ Garage / Grime",
        bpm: [130, 150],
        energy: [5, 8],
        vibe: "urban",
        description: "UK Garage, grime, 2-step, bass wobbly.",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["dubstep", "hiphop", "electro", "club"]
    },
    {
        id: "breakbeat",
        label: "DJ Breakbeat",
        bpm: [120, 140],
        energy: [5, 8],
        vibe: "energetic",
        description: "Breakbeat, big beat, breaks, scratch.",
        transitionTypes: ["cut", "beatmatch", "scratch"],
        compatibleWith: ["hiphop", "funk", "drum-and-bass", "techno"]
    },
    {
        id: "deep-house",
        label: "DJ Deep House",
        bpm: [110, 125],
        energy: [3, 6],
        vibe: "chill",
        description: "Deep house, groovy, chords, vocals.",
        transitionTypes: ["crossfade", "filter", "build-up"],
        compatibleWith: ["house", "techno", "club", "jazz"]
    },
    {
        id: "minimal",
        label: "DJ Minimal",
        bpm: [120, 132],
        energy: [3, 7],
        vibe: "dark",
        description: "Minimal techno, loops, micro-details.",
        transitionTypes: ["filter", "build-up", "cut"],
        compatibleWith: ["techno", "deep-house", "electro", "club"]
    },
    {
        id: "tech-house",
        label: "DJ Tech House",
        bpm: [122, 130],
        energy: [5, 8],
        vibe: "groove",
        description: "Tech house, groove, bass, percussif.",
        transitionTypes: ["cut", "filter", "beatmatch"],
        compatibleWith: ["techno", "house", "club", "minimal"]
    },
    {
        id: "electro",
        label: "DJ Electro",
        bpm: [120, 140],
        energy: [5, 9],
        vibe: "energetic",
        description: "Electro, synth bass, robotiques.",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["techno", "club", "electro-house", "breakbeat"]
    },
    {
        id: "synthwave",
        label: "DJ Synthwave",
        bpm: [80, 110],
        energy: [4, 7],
        vibe: "retro",
        description: "Retrowave, 80s, neon, pads.",
        transitionTypes: ["crossfade", "filter", "build-up"],
        compatibleWith: ["electro", "house", "pop", "disco"]
    },
    {
        id: "drill",
        label: "DJ Drill",
        bpm: [130, 150],
        energy: [7, 10],
        vibe: "dark",
        description: "Drill, 808s, hi-hats rapides.",
        transitionTypes: ["cut", "drop", "filter"],
        compatibleWith: ["trap", "hiphop", "grime", "selecta"]
    },
    {
        id: "trap",
        label: "DJ Trap",
        bpm: [130, 150],
        energy: [6, 9],
        vibe: "dark",
        description: "Trap, 808s, hi-hats, ad-libs.",
        transitionTypes: ["cut", "drop", "filter"],
        compatibleWith: ["drill", "hiphop", "electro", "club"]
    },
    {
        id: "rnb-soul",
        label: "DJ R&B / Soul",
        bpm: [80, 110],
        energy: [3, 7],
        vibe: "smooth",
        description: "R&B, soul, grooves, vocals.",
        transitionTypes: ["crossfade", "beatmatch", "filter"],
        compatibleWith: ["hiphop", "funk", "jazz", "disco"]
    },
    {
        id: "jazz",
        label: "DJ Jazz / Nu-Jazz",
        bpm: [90, 120],
        energy: [2, 6],
        vibe: "smooth",
        description: "Jazz, nu-jazz, breaks, samples.",
        transitionTypes: ["crossfade", "beatmatch", "filter"],
        compatibleWith: ["funk", "soul", "hiphop", "deep-house"]
    },
    {
        id: "bass-dubstep",
        label: "DJ Bass / Dubstep",
        bpm: [140, 150],
        energy: [7, 10],
        vibe: "dark",
        description: "Dubstep, bass, drops, wobble.",
        transitionTypes: ["cut", "drop", "filter"],
        compatibleWith: ["garage", "drum-and-bass", "techno", "electro"]
    },
    {
        id: "hardstyle",
        label: "DJ Hardstyle",
        bpm: [140, 160],
        energy: [8, 10],
        vibe: "energetic",
        description: "Hardstyle, kicks, leads, reverse.",
        transitionTypes: ["build-up", "drop", "cut"],
        compatibleWith: ["techno", "psytrance", "electro", "club"]
    },
    {
        id: "goa-psy",
        label: "DJ Goa / Psy",
        bpm: [138, 148],
        energy: [7, 10],
        vibe: "trance",
        description: "Goa, psytrance, full-on, leads.",
        transitionTypes: ["build-up", "filter", "drop"],
        compatibleWith: ["psytrance", "trance", "techno", "electro"]
    },
    {
        id: "uk-garage",
        label: "DJ UK Garage",
        bpm: [130, 140],
        energy: [4, 7],
        vibe: "groove",
        description: "2-step, bassline, vocals.",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["garage", "grime", "house", "dubstep"]
    },
    {
        id: "amapiano",
        label: "DJ Amapiano",
        bpm: [110, 120],
        energy: [4, 8],
        vibe: "groove",
        description: "Amapiano, log drum, piano, vocals.",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["afrobeat", "house", "deep-house", "world"]
    },
    {
        id: "baile-funk",
        label: "DJ Baile Funk",
        bpm: [130, 150],
        energy: [7, 10],
        vibe: "party",
        description: "Funk carioca, baile, 808s.",
        transitionTypes: ["cut", "drop", "filter"],
        compatibleWith: ["reggaeton", "latin", "club", "electro"]
    },
    {
        id: "dancehall",
        label: "DJ Dancehall",
        bpm: [100, 120],
        energy: [6, 9],
        vibe: "party",
        description: "Dancehall, reggaeton, riddims.",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["dub", "reggae", "latin", "world"]
    },
    {
        id: "cumbia-tribal",
        label: "DJ Cumbia / Tribal",
        bpm: [90, 130],
        energy: [3, 7],
        vibe: "global",
        description: "Cumbia, tribal, percussions.",
        transitionTypes: ["crossfade", "filter", "cut"],
        compatibleWith: ["world", "latin", "funk", "afrobeat"]
    },
    {
        id: "kpop-jpop",
        label: "DJ K-Pop / J-Pop",
        bpm: [100, 130],
        energy: [5, 9],
        vibe: "party",
        description: "K-pop, J-pop, anthems, drops.",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["club", "electro", "pop", "asian"]
    },
    {
        id: "metal",
        label: "DJ Metal",
        bpm: [120, 200],
        energy: [8, 10],
        vibe: "dark",
        description: "Metal, rock, distorsion, blast beats.",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["rock", "industrial", "electro", "hardstyle"]
    },
    {
        id: "reggae",
        label: "DJ Reggae",
        bpm: [70, 100],
        energy: [2, 5],
        vibe: "chill",
        transitionTypes: ["crossfade", "filter", "delay"],
        compatibleWith: ["dub", "world", "dancehall", "hiphop"]
    },
    {
        id: "latin",
        label: "DJ Latin",
        bpm: [90, 130],
        energy: [4, 8],
        vibe: "global",
        transitionTypes: ["cut", "filter", "crossfade"],
        compatibleWith: ["world", "reggaeton", "funk", "afrobeat"]
    },
    {
        id: "afrobeat",
        label: "DJ Afrobeat",
        bpm: [100, 120],
        energy: [5, 9],
        vibe: "global",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["world", "latin", "funk", "amapiano"]
    },
    {
        id: "disco",
        label: "DJ Disco",
        bpm: [110, 130],
        energy: [5, 9],
        vibe: "groove",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["funk", "house", "electro", "pop"]
    },
    {
        id: "house",
        label: "DJ House",
        bpm: [118, 130],
        energy: [4, 8],
        vibe: "groove",
        transitionTypes: ["crossfade", "filter", "build-up"],
        compatibleWith: ["deep-house", "tech-house", "club", "techno"]
    },
    {
        id: "trance",
        label: "DJ Trance",
        bpm: [132, 142],
        energy: [6, 9],
        vibe: "trance",
        transitionTypes: ["build-up", "filter", "drop"],
        compatibleWith: ["psytrance", "goa-psy", "electro", "club"]
    },
    {
        id: "industrial",
        label: "DJ Industrial",
        bpm: [120, 150],
        energy: [7, 10],
        vibe: "dark",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["techno", "metal", "electro", "hardstyle"]
    },
    {
        id: "goa",
        label: "DJ Goa",
        bpm: [138, 148],
        energy: [7, 10],
        vibe: "trance",
        transitionTypes: ["build-up", "filter", "drop"],
        compatibleWith: ["psytrance", "trance", "techno", "electro"]
    },
    {
        id: "jungle",
        label: "DJ Jungle",
        bpm: [160, 180],
        energy: [7, 10],
        vibe: "energetic",
        transitionTypes: ["cut", "drop", "rewind"],
        compatibleWith: ["drum-and-bass", "breakbeat", "dub", "hiphop"]
    },
    {
        id: "dubstep",
        label: "DJ Dubstep",
        bpm: [140, 150],
        energy: [7, 10],
        vibe: "dark",
        transitionTypes: ["cut", "drop", "filter"],
        compatibleWith: ["garage", "drum-and-bass", "techno", "electro"]
    },
    {
        id: "grime",
        label: "DJ Grime",
        bpm: [138, 148],
        energy: [6, 9],
        vibe: "urban",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["garage", "hiphop", "drill", "electro"]
    },
    {
        id: "pop",
        label: "DJ Pop",
        bpm: [100, 130],
        energy: [4, 8],
        vibe: "party",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["club", "electro", "house", "kpop-jpop"]
    },
    {
        id: "rock",
        label: "DJ Rock",
        bpm: [120, 160],
        energy: [6, 9],
        vibe: "energetic",
        transitionTypes: ["cut", "beatmatch", "filter"],
        compatibleWith: ["metal", "industrial", "electro", "punk"]
    },
    {
        id: "ambient",
        label: "DJ Ambient",
        bpm: [60, 100],
        energy: [1, 4],
        vibe: "chill",
        transitionTypes: ["crossfade", "filter", "delay"],
        compatibleWith: ["dub", "jazz", "deep-house", "chillout"]
    },
    {
        id: "chillout",
        label: "DJ Chillout",
        bpm: [80, 110],
        energy: [1, 4],
        vibe: "chill",
        transitionTypes: ["crossfade", "filter", "delay"],
        compatibleWith: ["ambient", "dub", "jazz", "deep-house"]
    },
    {
        id: "asian",
        label: "DJ Asian",
        bpm: [90, 130],
        energy: [4, 8],
        vibe: "global",
        transitionTypes: ["cut", "filter", "crossfade"],
        compatibleWith: ["kpop-jpop", "world", "electro", "club"]
    },
    {
        id: "punk",
        label: "DJ Punk",
        bpm: [160, 200],
        energy: [8, 10],
        vibe: "energetic",
        transitionTypes: ["cut", "scratch", "filter"],
        compatibleWith: ["rock", "metal", "hardstyle", "breakbeat"]
    },
    {
        id: "reggaeton",
        label: "DJ Reggaeton",
        bpm: [90, 110],
        energy: [5, 9],
        vibe: "party",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["latin", "dancehall", "baile-funk", "club"]
    },
    {
        id: "electro-house",
        label: "DJ Electro House",
        bpm: [126, 132],
        energy: [6, 9],
        vibe: "energetic",
        transitionTypes: ["cut", "filter", "drop"],
        compatibleWith: ["electro", "club", "house", "techno"]
    }
];

// ------------------------------------------------------------
// 2. Mapping artistes -> styles DJ
// ------------------------------------------------------------

const ARTIST_DJ_MAP = {
    "Bob Marley": ["dub", "dancehall", "reggae"],
    "Tiken Jah Fakoly": ["dub", "world", "afrobeat"],
    "Alpha Blondy": ["dub", "reggae", "world"],
    "Kendrick Lamar": ["hiphop", "jazz"],
    "Drake": ["hiphop", "rnb-soul"],
    "J. Cole": ["hiphop", "jazz"],
    "Kanye West": ["hiphop", "electro"],
    "Eminem": ["hiphop", "breakbeat"],
    "Central Cee": ["hiphop", "drill", "garage"],
    "Travis Scott": ["hiphop", "trap", "electro"],
    "James Brown": ["funk", "soul", "breakbeat"],
    "Parliament": ["funk", "electro"],
    "Daft Punk": ["electro", "funk", "disco"],
    "Earth Wind & Fire": ["funk", "disco", "soul"],
    "Charlotte de Witte": ["techno", "minimal", "club"],
    "Amelie Lens": ["techno", "industrial", "club"],
    "Carl Cox": ["techno", "minimal"],
    "Jeff Mills": ["techno", "industrial"],
    "Black Coffee": ["deep-house", "club", "afrobeat"],
    "Infected Mushroom": ["psytrance", "goa-psy", "electro"],
    "Astrix": ["psytrance", "goa-psy"],
    "Vini Vici": ["psytrance", "goa-psy"],
    "Goldie": ["drum-and-bass", "jungle", "jazz"],
    "Roni Size": ["drum-and-bass", "jungle"],
    "Sub Focus": ["drum-and-bass", "electro"],
    "Skepta": ["garage", "grime", "drill"],
    "Stormzy": ["garage", "grime", "hiphop"],
    "Burial": ["garage", "dubstep", "ambient"],
    "The Weeknd": ["rnb-soul", "electro", "club"],
    "Beyoncé": ["rnb-soul", "pop", "club"],
    "Frank Ocean": ["rnb-soul", "jazz"],
    "Nujabes": ["jazz", "hiphop", "ambient"],
    "Bonobo": ["jazz", "deep-house", "ambient"],
    "FKJ": ["jazz", "funk", "deep-house"],
    "Kavinsky": ["synthwave", "electro", "disco"],
    "M83": ["synthwave", "electro", "ambient"],
    "Justice": ["electro", "funk", "club"],
    "Bad Bunny": ["reggaeton", "dancehall", "club"],
    "J Balvin": ["reggaeton", "latin", "club"],
    "Burna Boy": ["afrobeat", "world", "dancehall"],
    "Wizkid": ["afrobeat", "world", "rnb-soul"],
    "Rammstein": ["metal", "industrial", "techno"],
    "Metallica": ["metal", "rock", "hardstyle"],
    "Jul": ["drill", "selecta", "hiphop"],
    "Ninho": ["hiphop", "trap", "drill"],
    "Aya Nakamura": ["afrobeat", "rnb-soul", "dancehall"],
    "SCH": ["hiphop", "trap", "drill"],
    "Damso": ["hiphop", "rnb-soul", "jazz"],
    "Booba": ["hiphop", "trap", "electro"],
    "Tiakola": ["afrobeat", "world", "latin"],
    "Gazo": ["drill", "selecta", "hiphop"],
    "PLK": ["hiphop", "trap", "drill"],
    "Zola": ["drill", "trap", "selecta"],
    "SDM": ["drill", "selecta", "hiphop"],
    "Theodora": ["club", "electro", "hiphop"],
    "Lil Baby": ["trap", "hiphop", "drill"],
    "Future": ["trap", "electro", "drill"],
    "21 Savage": ["trap", "drill", "hiphop"],
    "Playboi Carti": ["trap", "electro", "club"],
    "Don Toliver": ["trap", "rnb-soul", "electro"],
    "Karol G": ["reggaeton", "latin", "club"],
    "Rauw Alejandro": ["reggaeton", "rnb-soul", "latin"],
    "Feid": ["reggaeton", "latin", "club"],
    "Anuel AA": ["trap", "latin", "drill"],
    "Myke Towers": ["reggaeton", "latin", "trap"],
    "Ozuna": ["reggaeton", "latin", "rnb-soul"],
    "Maluma": ["reggaeton", "latin", "pop"]
};

// ------------------------------------------------------------
// 3. Scraping simulé + cache
// ------------------------------------------------------------

const DJ_SCRAPED_CACHE_KEY = "mhms_dj_scraped_tracks";

const DJ_SCRAPED_TRACKS = [
    { id: "scrape-1", title: "Midnight Echoes", artist: "Neon Pulse", djStyle: "synthwave", bpm: 105, energy: 5, key: "Am", duration: 210 },
    { id: "scrape-2", title: "Bass Cathedral", artist: "Subterranea", djStyle: "dub", bpm: 85, energy: 4, key: "Dm", duration: 245 },
    { id: "scrape-3", title: "Riddim Warrior", artist: "Jungle Lord", djStyle: "drum-and-bass", bpm: 174, energy: 9, key: "Fm", duration: 320 },
    { id: "scrape-4", title: "Solar Flare", artist: "Goa Mission", djStyle: "psytrance", bpm: 144, energy: 8, key: "Cm", duration: 380 },
    { id: "scrape-5", title: "Concrete Jungle", artist: "Urban Flow", djStyle: "garage", bpm: 138, energy: 6, key: "Gm", duration: 195 },
    { id: "scrape-6", title: "Lagos Groove", artist: "Afro Beats Co.", djStyle: "afrobeat", bpm: 118, energy: 7, key: "Eb", duration: 260 },
    { id: "scrape-7", title: "Miami Vice", artist: "Retro Rider", djStyle: "synthwave", bpm: 98, energy: 4, key: "F#m", duration: 230 },
    { id: "scrape-8", title: "Acid Rain", artist: "303 Dynasty", djStyle: "techno", bpm: 135, energy: 7, key: "Bm", duration: 340 },
    { id: "scrape-9", title: "Samba do Futuro", artist: "Tropic Bass", djStyle: "latin", bpm: 126, energy: 6, key: "Dm", duration: 215 },
    { id: "scrape-10", title: "Boom Bap Therapy", artist: "Vinyl Soul", djStyle: "hiphop", bpm: 92, energy: 5, key: "Cm", duration: 180 },
    { id: "scrape-11", title: "Stellar Drift", artist: "Deep Space", djStyle: "deep-house", bpm: 118, energy: 3, key: "Ab", duration: 290 },
    { id: "scrape-12", title: "War Dub", artist: "Echo Chamber", djStyle: "dub", bpm: 78, energy: 3, key: "Em", duration: 270 },
    { id: "scrape-13", title: "Rave Machine", artist: "Acid Test", djStyle: "hardstyle", bpm: 150, energy: 9, key: "Fm", duration: 200 },
    { id: "scrape-14", title: "2-Step City", artist: "Bassline UK", djStyle: "uk-garage", bpm: 138, energy: 5, key: "Gm", duration: 225 },
    { id: "scrape-15", title: "Tribal Sunrise", artist: "Percussion Lab", djStyle: "cumbia-tribal", bpm: 124, energy: 4, key: "Dm", duration: 310 }
];

function getScrapedTracks(djStyle) {
    try {
        const cached = localStorage.getItem(DJ_SCRAPED_CACHE_KEY);
        const parsed = cached ? JSON.parse(cached) : [];
        const list = parsed.length ? parsed : DJ_SCRAPED_TRACKS;
        if (!djStyle) return list;
        return list.filter(t => t.djStyle === djStyle);
    } catch (_) {
        return djStyle ? DJ_SCRAPED_TRACKS.filter(t => t.djStyle === djStyle) : DJ_SCRAPED_TRACKS;
    }
}

function getScrapedTrackById(id) {
    return getScrapedTracks().find(t => t.id === id) || null;
}

// ------------------------------------------------------------
// 4. Utilitaires DJ
// ------------------------------------------------------------

function getDjStylesForArtist(artistName) {
    return ARTIST_DJ_MAP[artistName] || [];
}

function getArtistsForDjStyle(styleId) {
    if (typeof ARTISTS_DATABASE === "undefined") return [];
    return ARTISTS_DATABASE.filter(artist => getDjStylesForArtist(artist.name).includes(styleId));
}

function getAllDjStyles() {
    return DJ_STYLES.map(s => ({ id: s.id, label: s.label, vibe: s.vibe, bpm: s.bpm, energy: s.energy }));
}

function getDjStyleById(id) {
    return DJ_STYLES.find(s => s.id === id) || null;
}

function getCompatibleDjStyles(styleId) {
    const style = getDjStyleById(styleId);
    if (!style || !style.compatibleWith) return [];
    return style.compatibleWith.map(id => getDjStyleById(id)).filter(Boolean);
}

function getDjEnergyLabel(energy) {
    if (energy <= 3) return "Chill";
    if (energy <= 6) return "Groove";
    if (energy <= 8) return "Energetic";
    return "Peak";
}

function buildDjPrompt(deckA, deckB, style, vibe, duration) {
    const parts = [];
    parts.push(`Je suis DJ en mode ${style}.`);
    if (deckA) parts.push(`Première piste : ${deckA.title} - ${deckA.artist} (${deckA.bpm} BPM, ${deckA.energy}/10).`);
    if (deckB) parts.push(`Piste actuelle : ${deckB.title} - ${deckB.artist} (${deckB.bpm} BPM, ${deckB.energy}/10).`);
    parts.push(`Je veux un enchaînement ${vibe} sur ${duration} minutes.`);
    parts.push("Propose 3 titres compatibles (BPM, key, énergie) et 1 type de transition adapté.");
    return parts.join("\n");
}

function getLocalSuggestions(deckA, djStyle, limit = 5) {
    const candidates = getArtistsForDjStyle(djStyle);
    return candidates.slice(0, limit).map(artist => ({
        title: artist.name,
        artist: artist.name,
        bpm: parseInt(artist.bpm_range.split("-")[0]) || 120,
        energy: 6,
        key: "Am",
        source: "database"
    }));
}
