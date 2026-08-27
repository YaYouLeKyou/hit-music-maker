// Database complète des presets studio artistes pour Music Hit Maker
const ARTISTS_DATABASE = [
    // ============================================================
    // FRANCE / FRANCOPHONIE (14 Artistes)
    // ============================================================
    {
        name: "Jul",
        genre: "Drill Marseille",
        bpm_range: "138-142",
        instruments: "Minor key piano, detuned dark pads, plucked acoustic guitar, heavy brass stabs, reversed vocal chops",
        drum_style: "Marseille drill sliding 808s, ghost snares, fast triplet hi-hats with pitch slides, heavy acoustic kick",
        language: "Français",
        prompt_audio_preset: "French Drill Marseille, 140 BPM, dark melancholic night atmosphere, minor key piano loop, sliding distorted 808 sub bass, crisp rapid hi-hats, heavy acoustic kick, auto-tuned melodic male vocal hook, radio-ready punchy mix, wide stereo image",
        flow_signature: "Melodic auto-tuned delivery, syncopated triplets, aggressive staccato verses transitioning into an anthemic, reverberated chorus"
    },
    {
        name: "Ninho",
        genre: "Rap / Trap FR",
        bpm_range: "125-130",
        instruments: "Melodic 808s, emotional piano, airy pads, soft plucks, subtle strings, warm bass",
        drum_style: "French trap with melodic 808s, soft claps, crisp hi-hats, minimal percussion, smooth groove",
        language: "Français",
        prompt_audio_preset: "Modern French Melodic Trap, 128 BPM, moody melancholic night vibe, minor acoustic guitar loop, sliding distorted 808 sub bass, crisp rapid hi-hats, catchy auto-tuned melodic male vocal hook, radio-ready polished mix, wide stereo image",
        flow_signature: "Smooth melodic delivery, laid-back flow, emotional phrasing, catchy melodic hooks with autotune, intimate verses"
    },
    {
        name: "Gazo",
        genre: "Drill Paris",
        bpm_range: "142-148",
        instruments: "Sliding 808s, dark synth stabs, eerie pads, distorted bass, aggressive brass",
        drum_style: "Parisian drill with sliding 808s, hard-hitting claps, fast triplet hi-hats, aggressive snare rolls",
        language: "Français",
        prompt_audio_preset: "Parisian Drill, 145 BPM, dark aggressive street atmosphere, sliding distorted 808 sub bass, eerie synth stabs, hard-hitting claps, fast triplet hi-hats, aggressive auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Aggressive drill flow, rapid-fire delivery, hard-hitting punchlines, autotuned melodic chorus, confident swagger"
    },
    {
        name: "SDM",
        genre: "Drill / Rap FR",
        bpm_range: "138-144",
        instruments: "Heavy 808s, dark piano, orchestral strings, cinematic brass, deep sub bass",
        drum_style: "French drill with heavy 808s, orchestral snare rolls, fast hi-hats, dramatic percussion",
        language: "Français",
        prompt_audio_preset: "French Drill, 140 BPM, cinematic dark atmosphere, orchestral strings, heavy 808 sub bass, dramatic snare rolls, fast hi-hats, powerful auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Confident drill flow, powerful delivery, cinematic storytelling, anthemic choruses, commanding presence"
    },
    {
        name: "Tiakola",
        genre: "Afro-trap / R&B",
        bpm_range: "105-112",
        instruments: "African percussion, melodic 808s, warm pads, plucked strings, soft brass, vocal chops",
        drum_style: "Afro-trap with djembe percussion, soft claps, groovy hi-hats, melodic drum patterns",
        language: "Français",
        prompt_audio_preset: "Afro-Trap Fusion, 108 BPM, warm vibrant atmosphere, African percussion, melodic 808 sub bass, plucked strings, catchy auto-tuned melodic male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic afro-flow, smooth R&B delivery, catchy hooks, rhythmic phrasing, emotional verses"
    },
    {
        name: "Aya Nakamura",
        genre: "Afro-pop / R&B",
        bpm_range: "98-104",
        instruments: "Afro percussion, bright synths, light bass, airy pads, soft guitar, vocal chops",
        drum_style: "Afro-pop with light percussion, soft claps, groovy hi-hats, danceable rhythm",
        language: "Français",
        prompt_audio_preset: "Afro-Pop, 100 BPM, bright vibrant atmosphere, afro percussion, light bass, bright synths, catchy melodic female vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Playful melodic delivery, catchy hooks, rhythmic French-African flow, confident feminine energy"
    },
    {
        name: "PLK",
        genre: "Rap / Trap FR",
        bpm_range: "122-128",
        instruments: "Dark piano, 808s, moody pads, subtle strings, deep bass, vinyl crackle",
        drum_style: "French trap with 808s, soft claps, laid-back hi-hats, minimal groove",
        language: "Français",
        prompt_audio_preset: "French Trap, 125 BPM, dark introspective atmosphere, minor piano loop, 808 sub bass, soft claps, laid-back hi-hats, melancholic auto-tuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Laid-back flow, introspective lyrics, smooth delivery, melancholic melodies, authentic storytelling"
    },
    {
        name: "Theodora",
        genre: "French Dark R&B / Alternative Hyperpop",
        bpm_range: "140-155",
        instruments: "Distorted heavy 808 bass, Jersey club kick patterns, aggressive electronic synths, ethereal pads, glitchy arpeggios, chopped vocal samples, sub-bass, modular synth textures",
        drum_style: "Moody Jersey club bounce with syncopated kick rolls, distorted 808 glides, fast-paced club beat, trap-inflected hi-hats, punchy claps, experimental percussion with stutter edits",
        language: "Français",
        prompt_audio_preset: "French dark R&B meets alternative hyperpop, 145 BPM, moody Jersey club bounce, distorted heavy 808 bass, aggressive electronic synth leads, ethereal auto-tuned female vocals, sensual nocturnal vibe, fast-paced club beat, experimental production with glitch textures, dark atmospheric pads, radio-ready polished mix, wide stereo image, sub-bass presence",
        flow_signature: "Sensual nocturnal whisper-to-chest-voice delivery, ethereal auto-tuned melodic hooks, hyperpop pitched vocal stacks, Jersey club rhythmic precision, experimental vocal chops, French lyrics with English ad-libs, dark feminine energy, hypnotic repetition, club-ready anthemic choruses"
    },
    {
        name: "SCH",
        genre: "Rap / Trap FR",
        bpm_range: "122-128",
        instruments: "Cinematic synths, 808s, dark piano, orchestral elements, deep bass, atmospheric pads",
        drum_style: "French trap with 808s, cinematic percussion, dramatic claps, atmospheric hi-hats",
        language: "Français",
        prompt_audio_preset: "French Trap, 125 BPM, cinematic dark atmosphere, orchestral synths, 808 sub bass, dramatic percussion, deep commanding male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Cinematic flow, deep commanding voice, storytelling verses, dramatic delivery, powerful presence"
    },
    {
        name: "Damso",
        genre: "Rap / R&B",
        bpm_range: "92-98",
        instruments: "Dark piano, 808s, moody pads, deep bass, subtle strings, atmospheric textures",
        drum_style: "Rap with 808s, soft claps, minimal hi-hats, dark groove",
        language: "Français",
        prompt_audio_preset: "Belgian Rap, 95 BPM, dark introspective atmosphere, minor piano, 808 sub bass, moody pads, deep emotional male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Dark introspective flow, deep voice, philosophical lyrics, emotional delivery, unique phrasing"
    },
    {
        name: "PNL",
        genre: "Cloud Rap / Trap",
        bpm_range: "112-118",
        instruments: "Atmospheric synths, 808s, dreamy pads, ethereal textures, soft piano, vocal chops",
        drum_style: "Cloud trap with 808s, soft claps, dreamy hi-hats, floating groove",
        language: "Français",
        prompt_audio_preset: "French Cloud Rap, 115 BPM, ethereal dreamy atmosphere, atmospheric synths, 808 sub bass, dreamy pads, autotuned melodic male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Dreamy cloud flow, autotuned melodic delivery, ethereal harmonies, floating verses, atmospheric choruses"
    },
    {
        name: "Werenoi",
        genre: "Rap / Drill FR",
        bpm_range: "136-142",
        instruments: "Heavy 808s, dark piano, orchestral strings, deep sub bass, cinematic brass",
        drum_style: "French drill with heavy 808s, powerful claps, fast hi-hats, dramatic percussion",
        language: "Français",
        prompt_audio_preset: "French Drill, 138 BPM, dark powerful atmosphere, heavy 808 sub bass, dark piano, orchestral strings, powerful auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Confident drill flow, powerful delivery, anthemic choruses, commanding presence, hard-hitting verses"
    },
    {
        name: "Zola",
        genre: "Drill / Trap FR",
        bpm_range: "140-146",
        instruments: "Sliding 808s, dark synths, eerie pads, distorted bass, aggressive brass",
        drum_style: "French drill with sliding 808s, hard claps, fast triplet hi-hats, aggressive snare rolls",
        language: "Français",
        prompt_audio_preset: "French Drill, 143 BPM, dark aggressive atmosphere, sliding 808 sub bass, eerie synths, hard claps, fast triplet hi-hats, aggressive auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Aggressive drill flow, rapid-fire delivery, autotuned melodic chorus, hard-hitting punchlines"
    },
    {
        name: "Booba",
        genre: "Rap / Trap FR",
        bpm_range: "122-128",
        instruments: "Heavy 808s, dark piano, cinematic synths, deep bass, orchestral elements",
        drum_style: "French trap with heavy 808s, powerful claps, dramatic hi-hats, hard-hitting percussion",
        language: "Français",
        prompt_audio_preset: "French Rap, 125 BPM, dark powerful atmosphere, heavy 808 sub bass, dark piano, cinematic synths, deep commanding male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Legendary flow, deep commanding voice, aggressive delivery, iconic punchlines, powerful presence"
    },

    // ============================================================
    // US / UK (12 Artistes)
    // ============================================================
    {
        name: "Drake",
        genre: "Hip-Hop / R&B",
        bpm_range: "88-96",
        instruments: "Emotional piano, warm strings, smooth 808s, soft pads, subtle guitar, vocal chops",
        drum_style: "Hip-hop with smooth 808s, soft claps, laid-back hi-hats, R&B groove",
        language: "Anglais",
        prompt_audio_preset: "Melodic Hip-Hop R&B, 92 BPM, emotional night atmosphere, minor piano, warm strings, smooth 808 sub bass, soft claps, laid-back hi-hats, melodic auto-tuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic R&B delivery, smooth flow, emotional phrasing, catchy hooks, intimate verses"
    },
    {
        name: "Kendrick Lamar",
        genre: "Hip-Hop / Conscious Rap",
        bpm_range: "88-96",
        instruments: "Jazz samples, live drums, deep bass, piano, strings, brass, vinyl crackle",
        drum_style: "Hip-hop with live drums, jazz percussion, soft claps, organic groove",
        language: "Anglais",
        prompt_audio_preset: "Conscious Hip-Hop, 92 BPM, jazz-influenced atmosphere, live drums, deep bass, piano, strings, storytelling male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Conscious flow, storytelling delivery, complex rhyme schemes, powerful verses, dynamic delivery"
    },
    {
        name: "Future",
        genre: "Trap / Mumble Rap",
        bpm_range: "132-140",
        instruments: "Heavy 808s, dark synths, eerie pads, distorted bass, vocal chops",
        drum_style: "Trap with heavy 808s, hard claps, fast hi-hats, aggressive snare rolls",
        language: "Anglais",
        prompt_audio_preset: "Heavy Trap, 136 BPM, dark futuristic atmosphere, heavy 808 sub bass, dark synths, hard claps, fast hi-hats, autotuned melodic male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Melodic mumble flow, autotuned delivery, hypnotic melodies, ad-libs, atmospheric verses"
    },
    {
        name: "Playboi Carti",
        genre: "Trap / Experimental",
        bpm_range: "138-148",
        instruments: "Experimental synths, heavy 808s, distorted bass, eerie pads, vocal chops",
        drum_style: "Experimental trap with heavy 808s, fast hi-hats, aggressive percussion, punk energy",
        language: "Anglais",
        prompt_audio_preset: "Experimental Trap, 142 BPM, avant-garde atmosphere, experimental synths, heavy 808 sub bass, distorted vocals, fast hi-hats, aggressive male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Experimental flow, distorted vocals, punk energy, ad-libs, hypnotic repetition, aggressive delivery"
    },
    {
        name: "21 Savage",
        genre: "Trap / Drill",
        bpm_range: "132-140",
        instruments: "Heavy 808s, dark piano, moody synths, deep bass, eerie pads",
        drum_style: "Trap with heavy 808s, hard claps, fast hi-hats, dark groove",
        language: "Anglais",
        prompt_audio_preset: "Dark Trap, 136 BPM, dark moody atmosphere, heavy 808 sub bass, dark piano, moody synths, deep monotone male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Deep monotone flow, aggressive delivery, dark storytelling, hard-hitting punchlines, cold delivery"
    },
    {
        name: "Travis Scott",
        genre: "Trap / Psychedelic",
        bpm_range: "132-140",
        instruments: "Psychedelic synths, heavy 808s, spacey pads, distorted bass, ad-libs, vocal chops",
        drum_style: "Trap with heavy 808s, hard claps, fast hi-hats, psychedelic percussion",
        language: "Anglais",
        prompt_audio_preset: "Psychedelic Trap, 136 BPM, spacey atmosphere, psychedelic synths, heavy 808 sub bass, spacey pads, autotuned male vocal with ad-libs, radio-ready punchy mix, wide stereo image",
        flow_signature: "Psychedelic flow, autotuned delivery, ad-libs, atmospheric verses, anthemic choruses, mumble melodies"
    },
    {
        name: "Kanye West",
        genre: "Hip-Hop / Experimental",
        bpm_range: "88-120",
        instruments: "Soul samples, piano, strings, live drums, experimental synths, choir vocals",
        drum_style: "Hip-hop with soul samples, live drums, experimental percussion, gospel elements",
        language: "Anglais",
        prompt_audio_preset: "Experimental Hip-Hop, 100 BPM, soulful atmosphere, soul samples, piano, strings, live drums, innovative male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Experimental flow, soulful delivery, gospel influences, innovative phrasing, powerful verses"
    },
    {
        name: "Eminem",
        genre: "Hip-Hop / Rap",
        bpm_range: "88-104",
        instruments: "Piano, bass, live drums, samples, strings, aggressive synths",
        drum_style: "Hip-hop with live drums, hard claps, aggressive percussion, fast groove",
        language: "Anglais",
        prompt_audio_preset: "Rap, 96 BPM, aggressive atmosphere, piano, bass, live drums, rapid-fire male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Rapid-fire flow, complex rhyme schemes, aggressive delivery, technical precision, storytelling"
    },
    {
        name: "Central Cee",
        genre: "UK Drill / Rap",
        bpm_range: "138-144",
        instruments: "Dark piano, heavy 808s, orchestral strings, eerie pads, deep sub bass",
        drum_style: "UK drill with heavy 808s, hard claps, fast hi-hats, aggressive snare rolls",
        language: "Anglais",
        prompt_audio_preset: "UK Drill, 140 BPM, dark London atmosphere, dark piano, heavy 808 sub bass, orchestral strings, hard claps, fast hi-hats, confident male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "UK drill flow, confident delivery, melodic hooks, hard-hitting verses, London swagger"
    },
    {
        name: "Lil Baby",
        genre: "Trap / Rap",
        bpm_range: "124-132",
        instruments: "Melodic 808s, piano, soft synths, warm pads, subtle strings",
        drum_style: "Trap with melodic 808s, soft claps, crisp hi-hats, smooth groove",
        language: "Anglais",
        prompt_audio_preset: "Melodic Trap, 128 BPM, emotional atmosphere, melodic 808 sub bass, piano, soft synths, autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic trap flow, autotuned delivery, catchy hooks, emotional verses, Atlanta swagger"
    },
    {
        name: "Young Thug",
        genre: "Trap / Experimental",
        bpm_range: "124-136",
        instruments: "Experimental synths, 808s, melodic pads, vocal chops, distorted bass",
        drum_style: "Trap with 808s, hard claps, fast hi-hats, experimental percussion",
        language: "Anglais",
        prompt_audio_preset: "Experimental Trap, 130 BPM, colorful atmosphere, experimental synths, 808 sub bass, melodic pads, unique autotuned male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Experimental melodic flow, unique vocal style, autotuned delivery, unpredictable phrasing, ad-libs"
    },
    {
        name: "Don Toliver",
        genre: "Trap / R&B",
        bpm_range: "104-120",
        instruments: "Atmospheric synths, 808s, melodic pads, soft piano, dreamy textures",
        drum_style: "Trap-R&B with 808s, soft claps, dreamy hi-hats, floating groove",
        language: "Anglais",
        prompt_audio_preset: "Trap R&B, 112 BPM, dreamy atmosphere, atmospheric synths, 808 sub bass, melodic pads, autotuned melodic male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic R&B flow, autotuned delivery, dreamy vocals, emotional hooks, atmospheric verses"
    },

    // ============================================================
    // LATINO / REGGAETON / TRAP (10 Artistes)
    // ============================================================
    {
        name: "Bad Bunny",
        genre: "Reggaeton / Latin Trap",
        bpm_range: "92-98",
        instruments: "Dem bow riddim, latin percussion, reggaeton bass, bright synths, guitar, vocal chops",
        drum_style: "Reggaeton with dem bow, latin percussion, groovy claps, danceable rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Reggaeton, 95 BPM, vibrant tropical atmosphere, dem bow rhythm, latin percussion, reggaeton bass, bright synths, catchy autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic reggaeton flow, catchy hooks, rhythmic Spanish delivery, playful energy, autotuned vocals"
    },
    {
        name: "Karol G",
        genre: "Reggaeton / Latin Pop",
        bpm_range: "92-100",
        instruments: "Dem bow, latin percussion, bright synths, reggaeton bass, guitar, vocal chops",
        drum_style: "Reggaeton with dem bow, latin percussion, groovy claps, danceable rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Reggaeton, 95 BPM, vibrant empowering atmosphere, dem bow rhythm, latin percussion, bright synths, reggaeton bass, powerful female vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Powerful female reggaeton flow, catchy hooks, confident delivery, rhythmic Spanish phrasing"
    },
    {
        name: "Rauw Alejandro",
        genre: "Reggaeton / R&B",
        bpm_range: "94-102",
        instruments: "R&B synths, reggaeton bass, latin guitar, soft pads, sensual textures",
        drum_style: "Reggaeton-R&B with dem bow, soft claps, groovy hi-hats, sensual groove",
        language: "Espagnol",
        prompt_audio_preset: "Reggaeton R&B, 98 BPM, sensual romantic atmosphere, R&B synths, reggaeton bass, latin guitar, smooth male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Sensual R&B flow, smooth delivery, romantic hooks, rhythmic Spanish phrasing, autotuned vocals"
    },
    {
        name: "Feid",
        genre: "Reggaeton / Latin Trap",
        bpm_range: "92-100",
        instruments: "Dem bow, bright synths, reggaeton bass, melodic pads, vocal chops",
        drum_style: "Reggaeton with dem bow, groovy claps, crisp hi-hats, danceable rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Reggaeton, 95 BPM, vibrant playful atmosphere, dem bow rhythm, bright synths, reggaeton bass, catchy autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic reggaeton flow, catchy hooks, playful delivery, rhythmic Spanish phrasing, autotuned vocals"
    },
    {
        name: "Anuel AA",
        genre: "Latin Trap / Reggaeton",
        bpm_range: "92-104",
        instruments: "Dark synths, 808s, latin percussion, reggaeton bass, eerie pads",
        drum_style: "Latin trap with 808s, hard claps, fast hi-hats, aggressive percussion",
        language: "Espagnol",
        prompt_audio_preset: "Latin Trap, 98 BPM, dark aggressive atmosphere, dark synths, 808 sub bass, latin percussion, deep male vocal, radio-ready punchy mix, wide stereo image",
        flow_signature: "Aggressive latin trap flow, deep voice, hard-hitting delivery, autotuned melodic chorus"
    },
    {
        name: "J Balvin",
        genre: "Reggaeton / Latin Pop",
        bpm_range: "92-100",
        instruments: "Dem bow, bright synths, reggaeton bass, latin percussion, guitar, vocal chops",
        drum_style: "Reggaeton with dem bow, groovy claps, danceable rhythm, latin percussion",
        language: "Espagnol",
        prompt_audio_preset: "Latin Reggaeton, 95 BPM, vibrant energetic atmosphere, dem bow rhythm, bright synths, reggaeton bass, latin percussion, catchy autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Catchy reggaeton flow, melodic hooks, playful delivery, rhythmic Spanish phrasing, autotuned vocals"
    },
    {
        name: "Myke Towers",
        genre: "Reggaeton / Latin Trap",
        bpm_range: "92-102",
        instruments: "Dem bow, 808s, bright synths, reggaeton bass, melodic pads",
        drum_style: "Reggaeton-trap with dem bow, 808s, groovy claps, crisp hi-hats",
        language: "Espagnol",
        prompt_audio_preset: "Reggaeton Trap, 96 BPM, modern atmosphere, dem bow rhythm, 808 sub bass, bright synths, melodic autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic reggaeton-trap flow, smooth delivery, catchy hooks, rhythmic Spanish phrasing, autotuned vocals"
    },
    {
        name: "Ozuna",
        genre: "Reggaeton / Latin Pop",
        bpm_range: "92-100",
        instruments: "Dem bow, bright synths, reggaeton bass, latin percussion, soft pads",
        drum_style: "Reggaeton with dem bow, groovy claps, danceable rhythm, latin percussion",
        language: "Espagnol",
        prompt_audio_preset: "Latin Reggaeton, 95 BPM, romantic atmosphere, dem bow rhythm, bright synths, reggaeton bass, latin percussion, smooth autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Melodic reggaeton flow, romantic hooks, smooth delivery, rhythmic Spanish phrasing, autotuned vocals"
    },
    {
        name: "Maluma",
        genre: "Reggaeton / Latin Pop",
        bpm_range: "92-100",
        instruments: "Dem bow, bright synths, reggaeton bass, latin guitar, soft pads",
        drum_style: "Reggaeton with dem bow, groovy claps, danceable rhythm, latin percussion",
        language: "Espagnol",
        prompt_audio_preset: "Latin Reggaeton, 95 BPM, sensual romantic atmosphere, dem bow rhythm, bright synths, reggaeton bass, latin guitar, smooth autotuned male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Sensual reggaeton flow, smooth delivery, romantic hooks, rhythmic Spanish phrasing, autotuned vocals"
    },
    {
        name: "Peso Pluma",
        genre: "Corridos Tumbados / Regional",
        bpm_range: "104-116",
        instruments: "Acoustic guitars, tuba, accordion, latin percussion, bass, vocal harmonies",
        drum_style: "Corridos with acoustic guitars, tuba, percussion, regional groove",
        language: "Espagnol",
        prompt_audio_preset: "Corridos Tumbados, 110 BPM, regional Mexican atmosphere, acoustic guitars, tuba, accordion, latin percussion, nasal male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Regional Mexican flow, nasal vocal style, storytelling delivery, corridos phrasing, emotional hooks"
    }
];

// Export CommonJS pour utilisation côté serveur (Node.js)
// (le fichier reste utilisable tel quel dans le navigateur via la variable globale ARTISTS_DATABASE)
if (typeof module !== "undefined" && module.exports) {
    module.exports = { ARTISTS_DATABASE };
}
