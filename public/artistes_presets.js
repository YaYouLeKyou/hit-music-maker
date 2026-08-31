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
    },

    // ============================================================
    // FRENCH POP (Retro et Moderne) - 10 Artistes
    // ============================================================
    {
        name: "Georges Brassens",
        genre: "French Chanson / Rock",
        bpm_range: "90-100",
        instruments: "Guitar, accordion, piano, bass, brushed drums, string quartet",
        drum_style: "Acoustic folk rock with brushed snare, gentle hi-hats, organic groove",
        language: "Français",
        prompt_audio_preset: "French Chanson, 96 BPM, nostalgic Provence atmosphere, acoustic guitar fingerpicking, accordion melodic runs, warm upright bass, gentle brushed snare, intimate male vocal, radio-ready warm mix, wide stereo image",
        flow_signature: "Poetic storytelling delivery, gentle phrasing, melodic guitar hooks, lyrical focus, timeless French charm"
    },
    {
        name: "Édith Piaf",
        genre: "French Chanson / Retro",
        bpm_range: "84-92",
        instruments: "Acoustic guitar, piano, strings, subtle percussion, vocal harmonies",
        drum_style: "Traditional French chanson with soft brushes, gentle tambourine, romantic rhythm",
        language: "Français",
        prompt_audio_preset: "Classic French Chanson, 88 BPM, romantic Parisian atmosphere, acoustic guitar, warm piano, string section, subtle percussion, legendary French female vocal, radio-ready vintage mix, wide stereo image",
        flow_signature: "Emotional melodic delivery, operatic flair, passionate phrasing, iconic French vocal style, nostalgic storytelling"
    },
    {
        name: "Charles Aznavour",
        genre: "French Chanson / Retro",
        bpm_range: "92-100",
        instruments: "Piano, accordion, bass, brushed drums, violin, orchestral strings",
        drum_style: "Classic French chanson with soft brushes, gentle kick, romantic swing rhythm",
        language: "Français",
        prompt_audio_preset: "French Chanson Classic, 96 BPM, polished Parisian atmosphere, piano intro, accordion melodies, orchestral strings, gentle percussion, legendary male vocal, radio-ready golden oldie mix, wide stereo image",
        flow_signature: "Charismatic theatrical delivery, dramatic storytelling, sophisticated phrasing, timeless elegance, emotional crescendo"
    },
    {
        name: "Serge Gainsbourg",
        genre: "French Chanson / Rock",
        bpm_range: "100-110",
        instruments: "Electric piano, Hammond organ, bass, drums, strings, experimental synths",
        drum_style: "Groovy French rhythm with swung hi-hats, walking bass lines, cinematic percussion",
        language: "Français",
        prompt_audio_preset: "French Rock Chanson, 106 BPM, sophisticated Parisian atmosphere, electric piano, Hammond organ, deep bass line, cinematic drums, iconic male vocal, radio-ready vintage-modern mix, wide stereo image",
        flow_signature: "Sultry spoken-sung delivery, ironic phrasing, sophisticated wordplay, musical experimentation, Parisian cool"
    },
    {
        name: "France Gall",
        genre: "French Chanson / Pop",
        bpm_range: "110-120",
        instruments: "Piano, strings, light percussion, guitar, synth pads, vocal harmonies",
        drum_style: "French pop with crisp snare, light hi-hats, bouncy rhythm, retro feel",
        language: "Français",
        prompt_audio_preset: "French Pop Chanson, 116 BPM, bright Parisian atmosphere, piano melody, lush strings, crisp percussion, melodic female vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Playful melodic delivery, yé-yé charm, clear phrasing, vintage French pop energy, catchy hooks"
    },
    {
        name: "Francis Cabrel",
        genre: "French Singer-Songwriter / Folk",
        bpm_range: "88-96",
        instruments: "Acoustic guitar, banjo, mandolin, double bass, light percussion",
        drum_style: "Folk rhythm with fingerpicked guitar, soft brushes, organic percussion",
        language: "Français",
        prompt_audio_preset: "French Folk, 92 BPM, Languedoc countryside atmosphere, acoustic guitar, banjo, double bass, gentle percussion, introspective male vocal, radio-ready warm mix, wide stereo image",
        flow_signature: "Poetic introspective delivery, folk storytelling, melodic guitar lines, sincere phrasing, rustic charm"
    },
    {
        name: "Céline Dion",
        genre: "French Pop / Ballad",
        bpm_range: "72-82",
        instruments: "Orchestra, piano, strings, synth pads, choirs, subtle percussion",
        drum_style: "Power ballad with cinematic drums, orchestral percussion, emotional build",
        language: "Français",
        prompt_audio_preset: "French Power Ballad, 76 BPM, cinematic Quebec atmosphere, full orchestra, piano intro, soaring female vocal, radio-ready stadium mix, wide stereo image",
        flow_signature: "Operatic powerful delivery, emotional crescendo, belting technique, melismatic phrasing, inspirational energy"
    },
    {
        name: "Johnny Hallyday",
        genre: "French Rock / Rock 'n' Roll",
        bpm_range: "126-138",
        instruments: "Electric guitar, bass, drums, piano, organ, rock choir",
        drum_style: "Classic rock with driving kick, powerful snare, live drum sound",
        language: "Français",
        prompt_audio_preset: "French Rock 'n' Roll, 132 BPM, rebellious Paris atmosphere, distorted electric guitar, driving bass, powerful drums, legendary male vocal, radio-ready rock mix, wide stereo image",
        flow_signature: "Rugged rock delivery, shout-sung phrases, guitar hero energy, rebellious attitude, timeless French rock spirit"
    },
    {
        name: "Noir",
        genre: "French Pop / Modern",
        bpm_range: "110-120",
        instruments: "Synth, bass, drums, piano, vocal chops, electronic effects",
        drum_style: "Modern French pop with 808s, crisp claps, polished hi-hats",
        language: "Français",
        prompt_audio_preset: "Modern French Pop, 116 BPM, contemporary Paris atmosphere, synth melodies, 808 bass, crisp percussion, melodic male vocal, radio-ready modern mix, wide stereo image",
        flow_signature: "Smooth melodic delivery, catchy hooks, bilingual flow, contemporary production, radio-friendly"
    },
    {
        name: "Omerta",
        genre: "French Pop / Modern",
        bpm_range: "118-128",
        instruments: "Synthesizers, 808s, piano, strings, vocal processing, electronic drums",
        drum_style: "Modern French trap-pop with 808s, trap hi-hats, crisp percussion",
        language: "Français",
        prompt_audio_preset: "Modern French Pop, 122 BPM, urban Paris atmosphere, synthesizers, 808 bass, trap-influenced drums, melodic male vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Contemporary melodic delivery, bilingual flows, catchy hooks, urban aesthetic, radio-ready"
    },

    // ============================================================
    // FUNK - 10 Artistes
    // ============================================================
    {
        name: "James Brown",
        genre: "Funk / Soul",
        bpm_range: "106-118",
        instruments: "Horn section, clavinet, bass, drums, percussion, backup vocals",
        drum_style: "Funk groove with tight snare, syncopated hi-hats, percussive bass hits",
        language: "Anglais",
        prompt_audio_preset: "Classic Funk, 112 BPM, Atlanta funk atmosphere, fat clavinet, walking bass line, tight drum pocket, horn stabs, iconic male vocal, radio-ready vintage mix, wide stereo image",
        flow_signature: "High-energy vocal delivery, rhythmic phrasing, shout-sung hooks, percussive mouth sounds, infectious groove"
    },
    {
        name: "George Clinton",
        genre: "Funk / P-Funk",
        bpm_range: "106-116",
        instruments: "Synth, bass, drums, horns, organ, vocal harmonies",
        drum_style: "Spacey funk with syncopated drums, cosmic percussion, deep pocket",
        language: "Anglais",
        prompt_audio_preset: "P-Funk Cosmic, 110 BPM, galactic funk atmosphere, Moog synthesizers, deep bass, funk drum groove, horn arrangements, funky male vocal, radio-ready psychedelic mix, wide stereo image",
        flow_signature: "Spoken-word funky delivery, comedic timing, vocal improvisation, cosmic themes, psychedelic funk"
    },
    {
        name: "Parliament-Funkadelic",
        genre: "Funk / Psychedelic",
        bpm_range: "104-114",
        instruments: "Synthesizers, bass, drums, horns, guitar, vocals",
        drum_style: "Hypnotic funk with steady kick, syncopated hi-hats, cosmic percussion",
        language: "Anglais",
        prompt_audio_preset: "Psychedelic Funk, 108 BPM, universe funk atmosphere, analog synths, deep bass, funk drum pocket, cosmic horns, ensemble vocal, radio-ready cosmic mix, wide stereo image",
        flow_signature: "Chanted funky delivery, call-and-response, communal singing, spiritual funk, cosmic themes"
    },
    {
        name: "Larry Graham",
        genre: "Funk / Sly Stone",
        bpm_range: "98-108",
        instruments: "Bass, guitar, drums, vocals, percussion",
        drum_style: "Funk slap-bass rhythm with percussive slap, syncopated drum hits",
        language: "Anglais",
        prompt_audio_preset: "Boogaloo Funk, 102 BPM, San Francisco atmosphere, slap bass, percussive guitar, tight drum pocket, melodic male vocal, radio-ready vintage mix, wide stereo image",
        flow_signature: "Melodic funky delivery, percussive phrasing, smooth slides, bass-driven hooks, California cool"
    },
    {
        name: "Sly and the Family Stone",
        genre: "Funk / Psychedelic Soul",
        bpm_range: "100-112",
        instruments: "Synthesizers, bass, drums, guitar, vocals, horns",
        drum_style: "Funk-soul groove with syncopated drums, colorful percussion, steady pocket",
        language: "Anglais",
        prompt_audio_preset: "Funk-Soul Fusion, 106 BPM, colorful California atmosphere, analog synths, funky bass, groovy drums, vocal harmonies, radio-ready vibrant mix, wide stereo image",
        flow_signature: "Vibrant vocal harmonies, funky chant, colorful lyrics, inclusive energy, psychedelic soul"
    },
    {
        name: "Sneeky",
        genre: "French Funk / Modern",
        bpm_range: "108-118",
        instruments: "Horns, bass, guitar, drums, synths, vocals",
        drum_style: "Modern French funk with snare cracks, syncopated hi-hats, groovy bass line",
        language: "Français",
        prompt_audio_preset: "Modern French Funk, 112 BPM, Paris nightlife atmosphere, horn section, funky bass, crisp drums, melodic French vocal, radio-ready urban mix, wide stereo image",
        flow_signature: "Smooth French delivery, melodic phrasing, funky instrumental hooks, bilingual flow, contemporary groove"
    },
    {
        name: "M.B.",
        genre: "French Funk / Disco",
        bpm_range: "116-126",
        instruments: "Harp, bass, drums, strings, percussion, vocals",
        drum_style: "Disco-funk with four-on-the-floor, crisp hi-hats, string hits",
        language: "Français",
        prompt_audio_preset: "French Disco-Funk, 120 BPM, Paris disco scene, harp glissandi, funky bass, disco drums, soaring female vocal, radio-ready dance mix, wide stereo image",
        flow_signature: "Disco melodic delivery, string arrangements, danceable phrasing, French flair, classic disco energy"
    },
    {
        name: "Alain Bashung",
        genre: "French Pop-Rock / Soul",
        bpm_range: "106-116",
        instruments: "Guitar, bass, drums, piano, horns, strings",
        drum_style: "Organic pop-rock with live drums, natural groove, acoustic feel",
        language: "Français",
        prompt_audio_preset: "French Soul-Pop, 112 BPM, Parisian atmosphere, acoustic guitar, funky bass, live drums, melodic male vocal, radio-ready warm mix, wide stereo image",
        flow_signature: "Warm storytelling delivery, melodic phrasing, emotional depth, French lyrical style, soulful energy"
    },
    {
        name: "Kool Shen",
        genre: "French Hip-Hop / Funk",
        bpm_range: "86-96",
        instruments: "Sampled horns, bass, drums, vocals, scratches",
        drum_style: "Hip-hop with sampled funk breaks, vinyl crackle, boom-bap groove",
        language: "Français",
        prompt_audio_preset: "French Hip-Hop Funk, 92 BPM, underground Paris, sampled funk breaks, boom-bap drums, melodic rap flow, radio-ready urban mix, wide stereo image",
        flow_signature: "Smooth rap delivery, lyrical wordplay, funk samples, French flow, nostalgic energy"
    },
    {
        name: "IAM",
        genre: "French Hip-Hop / Funk",
        bpm_range: "84-94",
        instruments: "Funk samples, bass, drums, orchestra, vocals",
        drum_style: "Hip-hop with live instruments, funky bass lines, cinematic percussion",
        language: "Français",
        prompt_audio_preset: "French Hip-Hop Funk, 90 BPM, Marseille atmosphere, live instruments, funk samples, deep bass, cinematic drums, passionate French vocal, radio-ready mix, wide stereo image",
        flow_signature: "Passionate delivery, storytelling, melodic rap, French pride, urban soul"
    },

    // ============================================================
    // REGGAE - 10 Artistes
    // ============================================================
    {
        name: "Bob Marley",
        genre: "Reggae",
        bpm_range: "78-88",
        instruments: "Guitar, bass, drums, keyboards, horns, vocals",
        drum_style: "Reggae off-beat emphasis, snare on 2nd and 4th, lazy groove",
        language: "Anglais",
        prompt_audio_preset: "Classic Reggae, 82 BPM, Jamaican atmosphere, skank guitar, walking bass, reggae drums, island horns, legendary male vocal, radio-ready roots mix, wide stereo image",
        flow_signature: "Relaxed sing-song delivery, melodic hooks, spiritual lyrics, Jamaican patois, island rhythm"
    },
    {
        name: "Peter Tosh",
        genre: "Reggae / Roots",
        bpm_range: "76-86",
        instruments: "Guitar, bass, drums, percussion, horns, vocals",
        drum_style: "Roots reggae with deep bass drum, syncopated snare, organic feel",
        language: "Anglais",
        prompt_audio_preset: "Roots Reggae, 80 BPM, Kingston atmosphere, rhythm guitar, deep bass, roots drum, militant vocals, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful political delivery, Roots reggae flow, chant-style vocals, revolutionary energy, Jamaican patois"
    },
    {
        name: "Jimmy Cliff",
        genre: "Reggae / Rocksteady",
        bpm_range: "80-90",
        instruments: "Guitar, bass, drums, organ, percussion, vocals",
        drum_style: "Rocksteady with emphasis on 2 and 4, relaxed groove, melodic rhythm",
        language: "Anglais",
        prompt_audio_preset: "Classic Reggae, 84 BPM, Jamaican atmosphere, rocksteady rhythm, melodic guitar, deep bass, warm vocals, radio-ready nostalgic mix, wide stereo image",
        flow_signature: "Bright melodic delivery, sing-song phrasing, positive lyrics, Jamaican rhythm, classic reggae energy"
    },
    {
        name: "Burning Spear",
        genre: "Roots Reggae",
        bpm_range: "74-84",
        instruments: "Guitar, bass, drums, percussion, vocals",
        drum_style: "Roots reggae with deep bass drum, heavy bass, spiritual groove",
        language: "Anglais",
        prompt_audio_preset: "Roots Reggae, 78 BPM, Kingston atmosphere, nyabinghi rhythm, deep bass, spiritual vocals, radio-ready authentic mix, wide stereo image",
        flow_signature: "Chanted delivery, spiritual lyrics, patois flow, Rastafarian themes, meditative rhythm"
    },
    {
        name: "steel pulse",
        genre: "Punk Reggae",
        bpm_range: "100-110",
        instruments: "Guitar, bass, drums, horns, vocals",
        drum_style: "Punk reggae with driving beat, aggressive hi-hats, fast rhythm",
        language: "Anglais",
        prompt_audio_preset: "Punk Reggae, 104 BPM, British atmosphere, punk attitude meets reggae rhythm, raw production, powerful vocals, radio-ready alternative mix, wide stereo image",
        flow_signature: "Angry delivery, political lyrics, UK flow, reggae-punk fusion, rebellious energy"
    },
    {
        name: "Clinton Fearon",
        genre: "Reggae / Dub",
        bpm_range: "78-88",
        instruments: "Bass, drums, guitar, keyboards, vocals",
        drum_style: "Classic reggae with deep pocket, syncopated bass, steady groove",
        language: "Anglais",
        prompt_audio_preset: "Classic Reggae, 82 BPM, Kingston atmosphere, melodic bass, steady drums, dub vibes, warm vocals, radio-ready roots mix, wide stereo image",
        flow_signature: "Smooth melodic delivery, bass-driven rhythm, Jamaican patois, roots reggae flow, island vibe"
    },
    {
        name: "Junior Murvin",
        genre: "Reggae / Dub",
        bpm_range: "76-86",
        instruments: "Guitar, bass, drums, percussion, vocals",
        drum_style: "Dub reggae with echo effects, spacious drums, dub techniques",
        language: "Anglais",
        prompt_audio_preset: "Dub Reggae, 80 BPM, Kingston atmosphere, dub sound system, echo and reverb, spacious drums, reggae vocals, radio-ready dub mix, wide stereo image",
        flow_signature: "Laid-back delivery, dub effects, Jamaica patois, atmospheric vibe, echo vocals"
    },
    {
        name: "Winston McAnuff",
        genre: "Reggae / Ska",
        bpm_range: "100-110",
        instruments: "Guitar, bass, drums, ska horns, vocals",
        drum_style: "Ska rhythm with upstroke on snare, walking bass, jazz-influenced",
        language: "Anglais",
        prompt_audio_preset: "Ska Reggae, 106 BPM, Kingston atmosphere, ska horns, walking bass, syncopated drums, upbeat vocals, radio-ready ska mix, wide stereo image",
        flow_signature: "Playful delivery, ska horns, danceable rhythm, Jamaica patois, upbeat energy"
    },
    {
        name: "Derrick Morgan",
        genre: "Rocksteady / Reggae",
        bpm_range: "92-102",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Rocksteady with emphasis on 2 and 4, relaxed groove",
        language: "Anglais",
        prompt_audio_preset: "Rocksteady, 96 BPM, Jamaican atmosphere, classic rocksteady rhythm, melodic guitar, deep bass, warm vocals, radio-ready classic mix, wide stereo image",
        flow_signature: "Classic sing-song delivery, rocksteady groove, Jamaica patois, nostalgic energy, melodic flow"
    },

    // ============================================================
    // SOUL - 10 Artistes
    // ============================================================
    {
        name: "Aretha Franklin",
        genre: "Soul / Gospel",
        bpm_range: "76-86",
        instruments: "Piano, bass, drums, horns, strings, vocals",
        drum_style: "Soul groove with subtle hi-hats, walking bass, gospel piano",
        language: "Anglais",
        prompt_audio_preset: "Classic Soul, 80 BPM, Detroit atmosphere, gospel piano, walking bass, soulful drums, legendary female vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful gospel delivery, melismatic phrasing, emotional crescendo, soulful runs, iconic presence"
    },
    {
        name: "Esther Phillips",
        genre: "Soul / Jazz Soul",
        bpm_range: "82-92",
        instruments: "Piano, bass, drums, horns, strings, vocals",
        drum_style: "Jazz-influenced soul with brushes, syncopated rhythm, subtle groove",
        language: "Anglais",
        prompt_audio_preset: "Jazz Soul, 86 BPM, New York atmosphere, jazz piano, soulful bass, brushed drums, powerful female vocal, radio-ready smooth mix, wide stereo image",
        flow_signature: "Smooth jazz-soul delivery, sophisticated phrasing, bluesy runs, emotional depth, New York cool"
    },
    {
        name: "Otis Redding",
        genre: "Soul / Classic",
        bpm_range: "78-88",
        instruments: "Piano, bass, drums, horns, strings, vocals",
        drum_style: "Deep soul with steady groove, brushed snare, walking bass line",
        language: "Anglais",
        prompt_audio_preset: "Classic Soul, 82 BPM, Georgia atmosphere, deep piano, walking bass, soulful drums, powerful male vocal, radio-ready vintage mix, wide stereo image",
        flow_signature: "Powerful emotive delivery, gospel-influenced runs, soulful phrasing, Southern drawl, emotional intensity"
    },
    {
        name: "Sam Cooke",
        genre: "Soul / Gospel",
        bpm_range: "84-94",
        instruments: "Piano, bass, drums, strings, vocals",
        drum_style: "Smooth soul with subtle percussion, jazz-influenced rhythm",
        language: "Anglais",
        prompt_audio_preset: "Smooth Soul, 88 BPM, Chicago atmosphere, jazzy piano, walking bass, subtle drums, smooth male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Smooth melodic delivery, gospel phrasing, romantic lyrics, Chicago soul style, sophisticated flow"
    },
    {
        name: "Ray Charles",
        genre: "Soul / Blues",
        bpm_range: "90-100",
        instruments: "Piano, bass, drums, guitar, strings, vocals",
        drum_style: "Blues-soul with shuffle rhythm, walking bass, gospel piano",
        language: "Anglais",
        prompt_audio_preset: "Blues-Soul, 96 BPM, Seattle atmosphere, gospel piano, walking bass, blues drums, iconic male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Bluesy delivery, gospel runs, piano-driven, soulful phrasing, cross-cultural fusion"
    },
    {
        name: "Irma Thomas",
        genre: "Soul / R&B",
        bpm_range: "80-90",
        instruments: "Piano, bass, drums, strings, vocals",
        drum_style: "New Orleans soul with subtle groove, brushed hi-hats, gentle percussion",
        language: "Anglais",
        prompt_audio_preset: "New Orleans Soul, 84 BPM, Louisiana atmosphere, jazz piano, walking bass, gentle drums, powerful female vocal, radio-ready warm mix, wide stereo image",
        flow_signature: "Powerful soulful delivery, gospel influence, emotional phrasing, New Orleans style, melismatic"
    },
    {
        name: "Clara Rockmore",
        genre: "Soul / Jazz",
        bpm_range: "70-80",
        instruments: "Piano, vibraphone, strings, vocals, light percussion",
        drum_style: "Jazz-soul with brushed drums, subtle percussion, sophisticated rhythm",
        language: "Anglais",
        prompt_audio_preset: "Jazz Soul, 76 BPM, studio sophistication, vibraphone melodies, jazz piano, subtle drums, smooth vocals, radio-ready elegant mix, wide stereo image",
        flow_signature: "Sophisticated delivery, jazz phrasing, lyrical piano, smooth flow, artistic elegance"
    },
    {
        name: "Memphis Minnie",
        genre: "Soul / Blues",
        bpm_range: "88-98",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Blues shuffle with steady groove, fingerpicked guitar, authentic feel",
        language: "Anglais",
        prompt_audio_preset: "Classic Blues Soul, 92 BPM, Memphis atmosphere, acoustic guitar, walking bass, blues drums, raw female vocal, radio-ready vintage mix, wide stereo image",
        flow_signature: "Blues delivery, storytelling lyrics, guitar-driven, raw emotion, Memphis soul"
    },
    {
        name: "Vicky Leandros",
        genre: "Soul / International Pop",
        bpm_range: "90-100",
        instruments: "Orchestra, piano, strings, percussion, vocals",
        drum_style: "International soul with orchestral percussion, gentle groove",
        language: "Anglais",
        prompt_audio_preset: "International Soul, 96 BPM, European atmosphere, lush orchestra, soulful vocals, radio-ready pop-soul mix, wide stereo image",
        flow_signature: "Melodic international delivery, multilingual flow, emotional phrasing, European flair, soulful pop"
    },
    {
        name: "The Nite-Liters",
        genre: "Soul / Funk",
        bpm_range: "104-114",
        instruments: "Horns, bass, drums, guitar, vocals",
        drum_style: "Funk-soul with tight groove, syncopated hi-hats, driving bass",
        language: "Anglais",
        prompt_audio_preset: "Funk Soul, 108 BPM, Detroit atmosphere, funk horns, driving bass, tight drums, group vocals, radio-ready 60s mix, wide stereo image",
        flow_signature: "Group funk delivery, call-and-response, horn-driven, Detroit soul, energetic"
    },

    // ============================================================
    // DUB - 10 Artistes
    // ============================================================
    {
        name: "Lee Scratch Perry",
        genre: "Dub / Experimental",
        bpm_range: "78-88",
        instruments: "Bass, drums, effects, vocals, synths, mixing board",
        drum_style: "Dub with heavy echo, reverb, experimental percussion, studio effects",
        language: "Anglais",
        prompt_audio_preset: "Classic Dub, 82 BPM, Kingston atmosphere, dub studio effects, heavy reverb, echo and delay, bass-heavy, radio-ready experimental mix, wide stereo image",
        flow_signature: "Otherworldly delivery, vocal chops, dub effects, experimental flow, Kingston studio mastery"
    },
    {
        name: "Dub Inc",
        genre: "French Dub / Reggae",
        bpm_range: "76-86",
        instruments: "Bass, drums, guitar, keyboards, vocals",
        drum_style: "French reggae with dub influence, steady groove, island rhythm",
        language: "Français",
        prompt_audio_preset: "French Dub, 80 BPM, Marseille atmosphere, dub techniques, reggae rhythm, French vocals, radio-ready urban mix, wide stereo image",
        flow_signature: "Smooth French delivery, dub reggae flow, melodic phrasing, bilingual mix, island vibe"
    },
    {
        name: "Augustus Pablo",
        genre: "Dub / Roots",
        bpm_range: "72-82",
        instruments: "Melodica, bass, drums, percussion, vocals",
        drum_style: "Roots dub with melodica line, deep bass, spiritual groove",
        language: "Anglais",
        prompt_audio_preset: "Roots Dub, 76 BPM, Kingston atmosphere, melodica melody, deep bass, dub drums, spiritual vocals, radio-ready classic mix, wide stereo image",
        flow_signature: "Melodic melancholic delivery, melodica hooks, reggae flow, Rastafarian themes, dub spirituality"
    },
    {
        name: "King Tubby",
        genre: "Dub / Studio Master",
        bpm_range: "74-84",
        instruments: "Bass, drums, effects, synthesizers, dub mixing",
        drum_style: "Dub with studio effects, echo and reverb, experimental percussion",
        language: "Anglais",
        prompt_audio_preset: "Dub Master, 78 BPM, Kingston studio, dub mixing techniques, heavy effects, bass-heavy, innovative production, radio-ready experimental mix, wide stereo image",
        flow_signature: "Instrumental dub flow, studio mastery, effects-driven, experimental approach, Kingston dub legend"
    },
    {
        name: "Prince Farfa",
        genre: "Dub / Warfield",
        bpm_range: "72-82",
        instruments: "Bass, drums, percussion, vocals, dub effects",
        drum_style: "Dub with militant rhythm, heavy bass, warfield style",
        language: "Anglais",
        prompt_audio_preset: "Dub Warfield, 76 BPM, Kingston atmosphere, militant bass, warfield drum, powerful vocals, radio-ready dub mix, wide stereo image",
        flow_signature: "Political dub delivery, warrior flow, militant lyrics, Jamaica patois, revolutionary spirit"
    },
    {
        name: "Mad Professor",
        genre: "Dub / Electronic",
        bpm_range: "78-88",
        instruments: "Bass, drums, synths, effects, computers, vocals",
        drum_style: "Electronic dub with digital effects, futuristic percussion, studio manipulation",
        language: "Anglais",
        prompt_audio_preset: "Electronic Dub, 82 BPM, London atmosphere, digital dub techniques, futuristic effects, bass-heavy, radio-ready modern mix, wide stereo image",
        flow_signature: "Electronic dub flow, digital effects, futuristic vibes, London-Paris fusion, studio experimentation"
    },
    {
        name: "Dub Trio",
        genre: "Dub / Metal Dub",
        bpm_range: "80-90",
        instruments: "Bass, drums, guitar, vocals, dub effects",
        drum_style: "Dub with heavy bass, distorted elements, alternative groove",
        language: "Anglais",
        prompt_audio_preset: "Metal Dub, 84 BPM, alternative atmosphere, heavy dub bass, distorted elements, dub effects, radio-ready crossover mix, wide stereo image",
        flow_signature: "Heavy dub delivery, alternative flow, bass-driven, experimental, underground energy"
    },
    {
        name: " Scientist",
        genre: "Dub / Studio",
        bpm_range: "76-86",
        instruments: "Bass, drums, effects, mixing board, dub instruments",
        drum_style: "Dub with studio sound system, echo and reverb, classic techniques",
        language: "Anglais",
        prompt_audio_preset: "Dub Studio, 80 BPM, Kingston atmosphere, sound system dub, heavy effects, classic mixing, radio-ready vintage mix, wide stereo image",
        flow_signature: "Studio dub flow, sound system vibes, echo treatments, Kingston mastery, classic dub"
    },
    {
        name: "Yellowman",
        genre: "Dub / Dancehall",
        bpm_range: "100-110",
        instruments: "Bass, drums, synths, vocals, dub effects",
        drum_style: "Dancehall dub with fast tempo, synth elements, vocal treatments",
        language: "Anglais",
        prompt_audio_preset: "Dancehall Dub, 104 BPM, Kingston atmosphere, upbeat dub, synth lines, vocal chops, radio-ready dance mix, wide stereo image",
        flow_signature: "Fast dancehall flow, comedic delivery, vocal toasting, Jamaica patois, dance energy"
    },
    {
        name: "Buju Banton",
        genre: "Dub / Reggae",
        bpm_range: "78-88",
        instruments: "Bass, drums, guitar, keyboards, vocals",
        drum_style: "Dub reggae with deep bass, roots rhythm, spiritual groove",
        language: "Anglais",
        prompt_audio_preset: "Dub Reggae, 82 BPM, Kingston atmosphere, roots dub, spiritual flow, radio-ready authentic mix, wide stereo image",
        flow_signature: "Spiritual dub delivery, roots flow, Jamaica patois, deep lyrics, authentic vibe"
    },

    // ============================================================
    // DUBSTEP - 10 Artistes
    // ============================================================
    {
        name: "Zead Dead",
        genre: "Dubstep / Experimental",
        bpm_range: "138-148",
        instruments: "Synth, bass, drums, glitches, vocals, FX",
        drum_style: "Half-time 140 BPM with wobble bass, syncopated drums, heavy drops",
        language: "Anglais",
        prompt_audio_preset: "Heavy Dubstep, 142 BPM, underground atmosphere, wobble bass drops, glitchy percussion, aggressive synths, radio-ready bass-heavy mix, wide stereo image",
        flow_signature: "Aggressive drop delivery, glitchy flow, bass-heavy drops, experimental energy, underground scene"
    },
    {
        name: "Skrillex",
        genre: "Dubstep / Electro",
        bpm_range: "138-142",
        instruments: "Synths, bass, drums, FX, vocals, dubstep drops",
        drum_style: "Brostep with complex drops, syncopated hi-hats, aggressive percussion",
        language: "Anglais",
        prompt_audio_preset: "Brostep, 140 BPM, LA atmosphere, complex bass drops, aggressive synths, radio-ready electronic mix, wide stereo image",
        flow_signature: "Aggressive drop flow, screamed vocals, complex basslines, electronic delivery, festival energy"
    },
    {
        name: "Flux Pavilion",
        genre: "Dubstep / Bass",
        bpm_range: "138-142",
        instruments: "Bass, synths, drums, FX, metal pipes",
        drum_style: "Heavy dubstep with bass-focused drops, metallic percussion, wobble effects",
        language: "Anglais",
        prompt_audio_preset: "Heavy Bass Dubstep, 140 BPM, UK atmosphere, metallic bass drops, heavy wobbles, radio-ready bass mix, wide stereo image",
        flow_signature: "Bass-heavy flow, dubstep drops, UK garage influence, aggressive bass, festival-ready"
    },
    {
        name: "Bassnectar",
        genre: "Dubstep / Bass Music",
        bpm_range: "138-144",
        instruments: "Bass, synths, drums, samples, vocals",
        drum_style: "Mid-tempo bass music with complex drops, syncopated rhythms, heavy bass",
        language: "Anglais",
        prompt_audio_preset: "Bass Music, 142 BPM, underground atmosphere, complex bass drops, eclectic samples, radio-ready experimental mix, wide stereo image",
        flow_signature: "Eclectic drop flow, bass-heavy delivery, experimental samples, underground energy, festival-ready"
    },
    {
        name: "Zomboy",
        genre: "Dubstep / Hybrid",
        bpm_range: "140-150",
        instruments: "Synths, bass, drums, FX, vocals",
        drum_style: "Hybrid dubstep with trap influences, complex percussion, heavy drops",
        language: "Anglais",
        prompt_audio_preset: "Hybrid Dubstep, 144 BPM, Canadian atmosphere, trap-influenced drops, complex percussion, radio-ready modern mix, wide stereo image",
        flow_signature: "Hybrid drop flow, trap-influenced delivery, complex percussion, modern dubstep, radio-ready"
    },
    {
        name: "Virtual Riot",
        genre: "Dubstep / Melodic",
        bpm_range: "140-145",
        instruments: "Synths, bass, drums, melodies, FX, vocals",
        drum_style: "Melodic dubstep with lead synths, wobble bass, emotional drops",
        language: "Anglais",
        prompt_audio_preset: "Melodic Dubstep, 142 BPM, German atmosphere, melodic lead synths, wobble bass drops, emotional flow, radio-ready mix, wide stereo image",
        flow_signature: "Melodic drop flow, emotive delivery, lead synth melodies, German electronic, festival energy"
    },
    {
        name: "Funtcase",
        genre: "Dubstep / Hard",
        bpm_range: "140-146",
        instruments: "Bass, synths, drums, FX, metal sounds",
        drum_style: "Hard dubstep with aggressive drops, heavy percussion, metallic sounds",
        language: "Anglais",
        prompt_audio_preset: "Hard Dubstep, 144 BPM, UK atmosphere, aggressive drops, heavy percussion, radio-ready bass mix, wide stereo image",
        flow_signature: "Aggressive hard drop, metallic flow, heavy percussion, UK dubstep, underground energy"
    },
    {
        name: "Knife Party",
        genre: "Dubstep / Electro House",
        bpm_range: "138-144",
        instruments: "Synths, bass, drums, FX, vocals",
        drum_style: "Electro-dubstep with hybrid drops, complex percussion, synth leads",
        language: "Anglais",
        prompt_audio_preset: "Electro Dubstep, 140 BPM, Netherlands atmosphere, hybrid drops, electronic percussion, radio-ready mix, wide stereo image",
        flow_signature: "Electronic drop flow, hybrid delivery, synth leads, Dutch electronic, festival energy"
    },
    {
        name: "Getter",
        genre: "Dubstep / Deathstep",
        bpm_range: "138-146",
        instruments: "Bass, synths, drums, FX, distorted sounds",
        drum_style: "Deathstep with distorted bass, aggressive drops, heavy percussion",
        language: "Anglais",
        prompt_audio_preset: "Deathstep, 144 BPM, underground atmosphere, distorted bass drops, aggressive FX, radio-ready heavy mix, wide stereo image",
        flow_signature: "Aggressive deathdrop, distorted flow, heavy percussion, underground scene, festival-ready"
    },
    {
        name: "Subtronics",
        genre: "Dubstep / Riddim",
        bpm_range: "140-148",
        instruments: "Bass, synths, drums, FX, vocals",
        drum_style: "Riddim dubstep with wobble bass, syncopated drums, heavy drops",
        language: "Anglais",
        prompt_audio_preset: "Riddim Dubstep, 144 BPM, Denver atmosphere, wobble bass drops, syncopated percussion, radio-ready bass mix, wide stereo image",
        flow_signature: "Wobble-heavy flow, riddim delivery, heavy drops, underground scene, bass-focused"
    },

    // ============================================================
    // SKA - 10 Artistes
    // ============================================================
    {
        name: "The Skatalites",
        genre: "Ska / Jazz Ska",
        bpm_range: "108-118",
        instruments: "Saxophone, trumpet, trombone, piano, bass, drums",
        drum_style: "Ska with upstroke on snare, walking bass, jazz-influenced rhythm",
        language: "Anglais",
        prompt_audio_preset: "Classic Ska, 112 BPM, Kingston atmosphere, jazz ska horns, walking bass, syncopated drums, radio-ready retro mix, wide stereo image",
        flow_signature: "Jazz-influenced delivery, horn-driven, walking rhythm, Kingston ska, instrumental focus"
    },
    {
        name: "Desmond Dekker",
        genre: "Ska / Rocksteady",
        bpm_range: "98-108",
        instruments: "Guitar, bass, drums, vocals, ska horns",
        drum_style: "Rocksteady ska with emphasis on 2 and 4, relaxed groove",
        language: "Anglais",
        prompt_audio_preset: "Rocksteady Ska, 104 BPM, Kingston atmosphere, rocksteady rhythm, ska horns, catchy vocals, radio-ready classic mix, wide stereo image",
        flow_signature: "Upbeat sing-song delivery, catchy hooks, Jamaica patois, ska energy, 60s vibe"
    },
    {
        name: "The Specials",
        genre: "2 Tone Ska",
        bpm_range: "110-120",
        instruments: "Guitar, bass, drums, horns, keyboards, vocals",
        drum_style: "2-tone ska with driving beat, ska horns, punk influence",
        language: "Anglais",
        prompt_audio_preset: "2-Tone Ska, 116 BPM, Coventry atmosphere, punk-influenced ska, driving beat, ska horns, radio-ready UK mix, wide stereo image",
        flow_signature: "Punk ska delivery, energetic flow, ska horns, British vibe, ska-punk fusion"
    },
    {
        name: "The Mighty Morphin",
        genre: "Ska / Punk Ska",
        bpm_range: "120-130",
        instruments: "Guitar, bass, drums, horns, vocals",
        drum_style: "Punk ska with fast tempo, aggressive drums, ska rhythm",
        language: "Anglais",
        prompt_audio_preset: "Punk Ska, 124 BPM, LA atmosphere, fast ska rhythm, punk energy, ska horns, radio-ready alternative mix, wide stereo image",
        flow_signature: "Fast punk delivery, energetic flow, ska horns, West Coast vibe, ska-punk energy"
    },
    {
        name: "Reel Big Fish",
        genre: "Third Wave Ska",
        bpm_range: "126-136",
        instruments: "Guitar, bass, drums, horns, vocals",
        drum_style: "Third wave ska with catchy beat, ska horns, pop sensibility",
        language: "Anglais",
        prompt_audio_preset: "Third Wave Ska, 130 BPM, Florida atmosphere, catchy ska rhythm, pop hooks, ska horns, radio-ready 90s mix, wide stereo image",
        flow_signature: "Humorous delivery, catchy hooks, ska horns, California vibe, 90s energy"
    },
    {
        name: "Streetlight Manifesto",
        genre: "Ska / Anti-Folk",
        bpm_range: "124-134",
        instruments: "Guitar, bass, drums, horns, keyboards, vocals",
        drum_style: "Ska with complex rhythm, ska horns, anti-folk influence",
        language: "Anglais",
        prompt_audio_preset: "Anti-Folk Ska, 128 BPM, New Jersey atmosphere, complex ska rhythm, ska horns, emotionally-driven, radio-ready alternative mix, wide stereo image",
        flow_signature: "Emotional delivery, socially-conscious lyrics, ska horns, New Jersey vibe, ska revival"
    },
    {
        name: "Less Than Jake",
        genre: "Ska / Punk",
        bpm_range: "120-130",
        instruments: "Guitar, bass, drums, vocals, ska horns",
        drum_style: "Ska-punk with fast tempo, aggressive drums, ska rhythm",
        language: "Anglais",
        prompt_audio_preset: "Ska-Punk, 126 BPM, Florida atmosphere, fast ska rhythm, punk energy, radio-ready 90s mix, wide stereo image",
        flow_signature: "Fast punk delivery, energetic flow, ska horns, Florida ska, 90s ska revival"
    },
    {
        name: "Goldfinger",
        genre: "Ska / Pop Punk",
        bpm_range: "124-134",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Pop punk with catchy beat, simple ska rhythm, 90s energy",
        language: "Anglais",
        prompt_audio_preset: "Pop Ska, 130 BPM, California atmosphere, 90s pop punk, catchy rhythm, radio-ready mix, wide stereo image",
        flow_signature: "Pop punk delivery, catchy hooks, California vibe, 90s energy, ska influence"
    },
    {
        name: "The Interrupters",
        genre: "Ska / Retro Pop",
        bpm_range: "114-124",
        instruments: "Guitar, bass, drums, horns, vocals",
        drum_style: "Modern ska with vintage feel, ska horns, retro groove",
        language: "Anglais",
        prompt_audio_preset: "Retro Ska, 118 BPM, Los Angeles atmosphere, vintage ska feel, modern production, radio-ready mix, wide stereo image",
        flow_signature: "Retro delivery, vintage flow, ska horns, LA vibe, 60s revival"
    },
    {
        name: "Madness",
        genre: "Ska / 2 Tone",
        bpm_range: "116-126",
        instruments: "Guitar, bass, drums, horns, keyboards, vocals",
        drum_style: "2-tone ska with quirky rhythm, ska horns, pub rock influence",
        language: "Anglais",
        prompt_audio_preset: "2-Tone Ska, 120 BPM, UK atmosphere, pub rock ska, quirky rhythm, radio-ready British mix, wide stereo image",
        flow_signature: "Quirky delivery, pub rock flow, ska horns, British vibe, ska revival"
    },

    // ============================================================
    // ROCK - 10 Artistes
    // ============================================================
    {
        name: "Led Zeppelin",
        genre: "Rock / Hard Rock",
        bpm_range: "90-110",
        instruments: "Guitar, bass, drums, vocals, piano, organ",
        drum_style: "Hard rock with powerful kick, dynamic snare, live drum sound",
        language: "Anglais",
        prompt_audio_preset: "Hard Rock, 100 BPM, UK atmosphere, heavy guitar, powerful drums, legendary male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful vocal delivery, hard rock flow, guitar hero energy, British rock, iconic presence"
    },
    {
        name: "The Rolling Stones",
        genre: "Rock / Blues Rock",
        bpm_range: "96-106",
        instruments: "Guitar, bass, drums, vocals, piano",
        drum_style: "Rock with steady groove, blues shuffle, iconic rhythm",
        language: "Anglais",
        prompt_audio_preset: "Blues Rock, 102 BPM, London atmosphere, blues guitar, rolling rhythm, legendary male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Cool blues delivery, swagger flow, iconic vocals, British rock, timeless energy"
    },
    {
        name: "Pink Floyd",
        genre: "Rock / Progressive",
        bpm_range: "70-120",
        instruments: "Guitar, bass, drums, keyboards, synths, vocals",
        drum_style: "Progressive rock with cinematic rhythm, experimental percussion, ambient sections",
        language: "Anglais",
        prompt_audio_preset: "Progressive Rock, 80 BPM, album-oriented, atmospheric guitars, synth layers, cinematic flow, radio-ready psychedelic mix, wide stereo image",
        flow_signature: "Atmospheric delivery, progressive flow, concept album, psychedelic, cinematic"
    },
    {
        name: "Queen",
        genre: "Rock / Arena Rock",
        bpm_range: "96-116",
        instruments: "Guitar, bass, drums, vocals, piano, orchestra",
        drum_style: "Arena rock with powerful kick, dynamic fills, theatrical rhythm",
        language: "Anglais",
        prompt_audio_preset: "Arena Rock, 104 BPM, UK atmosphere, operatic vocals, powerful drums, radio-ready theatrical mix, wide stereo image",
        flow_signature: "Theatrical delivery, operatic vocals, powerful flow, British rock, showmanship"
    },
    {
        name: "Radiohead",
        genre: "Rock / Alternative",
        bpm_range: "84-120",
        instruments: "Guitar, bass, drums, keyboards, synths, vocals",
        drum_style: "Alternative rock with experimental rhythm, electronic elements, atmospheric",
        language: "Anglais",
        prompt_audio_preset: "Alternative Rock, 92 BPM, Oxford atmosphere, experimental sound, atmospheric guitars, radio-ready modern mix, wide stereo image",
        flow_signature: "Introspective delivery, alternative flow, experimental phrasing, atmospheric, UK alternative"
    },
    {
        name: "The Clash",
        genre: "Rock / Punk",
        bpm_range: "118-130",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Punk rock with fast tempo, driving beat, three-chord energy",
        language: "Anglais",
        prompt_audio_preset: "Punk Rock, 124 BPM, London atmosphere, raw guitar, driving drums, passionate male vocal, radio-ready punk mix, wide stereo image",
        flow_signature: "Passionate punk delivery, fast flow, political lyrics, British punk, raw energy"
    },
    {
        name: "Muse",
        genre: "Rock / Alternative",
        bpm_range: "115-125",
        instruments: "Guitar, bass, drums, keyboards, synths, vocals",
        drum_style: "Alternative rock with powerful drums, electronic elements, grand rhythm",
        language: "Anglais",
        prompt_audio_preset: "Alternative Rock, 120 BPM, UK atmosphere, grandiose sound, powerful drums, radio-ready modern mix, wide stereo image",
        flow_signature: "Powerful delivery, theatrical flow, grandiose phrasing, British alternative, dramatic"
    },
    {
        name: "Arctic Monkeys",
        genre: "Rock / Indie",
        bpm_range: "108-118",
        instruments: "Guitar, bass, drums, vocals, keyboards",
        drum_style: "Indie rock with tight rhythm, subtle groove, conversational delivery",
        language: "Anglais",
        prompt_audio_preset: "Indie Rock, 112 BPM, Sheffield atmosphere, tight guitar, conversational vocals, radio-ready modern mix, wide stereo image",
        flow_signature: "Cool delivery, witty flow, conversational phrasing, British indie, 2000s sound"
    },
    {
        name: "Phoenix",
        genre: "Rock / Electro-Rock",
        bpm_range: "116-126",
        instruments: "Guitar, bass, drums, synths, vocals",
        drum_style: "Electro-rock with synth elements, catchy rhythm, danceable groove",
        language: "Anglais",
        prompt_audio_preset: "Electro-Rock, 120 BPM, Paris atmosphere, synth-guitar hybrid, radio-ready modern mix, wide stereo image",
        flow_signature: "Melodic delivery, danceable flow, bilingual lyrics, French-American, electro-rock"
    },
    {
        name: "Phoenix",
        genre: "French Rock / Indie",
        bpm_range: "108-118",
        instruments: "Guitar, bass, drums, keyboards, vocals",
        drum_style: "Indie rock with tight rhythm, subtle groove, melodic",
        language: "Français",
        prompt_audio_preset: "French Indie Rock, 112 BPM, Paris atmosphere, melodic guitar, radio-ready modern mix, wide stereo image",
        flow_signature: "Melodic French delivery, indie flow, bilingual elements, Paris vibe, catchy hooks"
    },

    // ============================================================
    // PUNK - 10 Artistes
    // ============================================================
    {
        name: "The Ramones",
        genre: "Punk",
        bpm_range: "138-150",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Straight-ahead punk with steady beat, power chords, high energy",
        language: "Anglais",
        prompt_audio_preset: "Classic Punk, 144 BPM, NYC atmosphere, power chords, fast drums, raw male vocal, radio-ready punk mix, wide stereo image",
        flow_signature: "Shout-sung delivery, fast flow, three-chord simplicity, NYC energy, high tempo"
    },
    {
        name: "Sex Pistols",
        genre: "Punk",
        bpm_range: "132-144",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Viral punk with raw drums, aggressive guitar, theatrical",
        language: "Anglais",
        prompt_audio_preset: "Viral Punk, 138 BPM, London atmosphere, raw guitar, aggressive drums, controversial male vocal, radio-ready rebellious mix, wide stereo image",
        flow_signature: "Shout-sung delivery, controversial flow, raw vocals, British punk, rebellious energy"
    },
    {
        name: "Dead Kennedys",
        genre: "Punk / Hackney",
        bpm_range: "144-156",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Furious punk with complex rhythms, political content, experimental",
        language: "Anglais",
        prompt_audio_preset: "Political Punk, 150 BPM, San Francisco atmosphere, political lyrics, experimental guitar, radio-ready edgy mix, wide stereo image",
        flow_signature: "Satirical delivery, political flow, complex lyrics, West Coast punk, witty"
    },
    {
        name: "The Damned",
        genre: "Punk / Ska",
        bpm_range: "136-146",
        instruments: "Guitar, bass, drums, vocals, horns",
        drum_style: "UK punk with ska influence, driving beat, fast tempo",
        language: "Anglais",
        prompt_audio_preset: "UK Punk, 142 BPM, London atmosphere, ska-influenced punk, driving drums, radio-ready British mix, wide stereo image",
        flow_signature: "Fast punk delivery, energetic flow, ska elements, British punk, 70s vibe"
    },
    {
        name: "Black Flag",
        genre: "Punk / Hardcore",
        bpm_range: "140-160",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Hardcore punk with intense drums, aggressive guitar, raw energy",
        language: "Anglais",
        prompt_audio_preset: "Hardcore Punk, 150 BPM, Los Angeles atmosphere, aggressive guitar, intense drums, raw male vocal, radio-ready underground mix, wide stereo image",
        flow_signature: "Raw delivery, intense flow, screamed vocals, West Coast hardcore, aggressive"
    },
    {
        name: "Bad Religion",
        genre: "Punk / Hard Rock",
        bpm_range: "138-150",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Melodic hardcore with complex rhythms, tight drums, intellectual lyrics",
        language: "Anglais",
        prompt_audio_preset: "Melodic Hardcore, 144 BPM, California atmosphere, complex guitar, tight drums, intelligent male vocal, radio-ready alternative mix, wide stereo image",
        flow_signature: "Intellectual delivery, complex flow, detailed lyrics, West Coast punk, melodic"
    },
    {
        name: "Rancid",
        genre: "Punk / Ska",
        bpm_range: "130-140",
        instruments: "Guitar, bass, drums, vocals, horns",
        drum_style: "Ska-punk with driving beat, ska horns, punk energy",
        language: "Anglais",
        prompt_audio_preset: "Ska-Punk, 136 BPM, California atmosphere, ska horns, punk guitar, radio-ready 90s mix, wide stereo image",
        flow_signature: "Fast punk delivery, ska flow, energetic vocals, West Coast, 90s ska revival"
    },
    {
        name: "The Exploding Hearts",
        genre: "Punk / Garage",
        bpm_range: "132-142",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Garage punk with raw drums, power chords, 80s influence",
        language: "Anglais",
        prompt_audio_preset: "Garage Punk, 138 BPM, American underground, raw guitar, fast drums, radio-ready retro mix, wide stereo image",
        flow_signature: "Garage delivery, raw flow, 80s influence, American punk, energetic"
    },
    {
        name: "Anti-Flag",
        genre: "Punk / Anarchist",
        bpm_range: "128-138",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Political punk with driving beat, acoustic guitar, protest lyrics",
        language: "Anglais",
        prompt_audio_preset: "Political Punk, 134 BPM, Chicago atmosphere, protest lyrics, acoustic guitar, radio-ready activist mix, wide stereo image",
        flow_signature: "Protest delivery, political flow, acoustic guitar, American punk, message-driven"
    },
    {
        name: "Les Playboys",
        genre: "French Punk",
        bpm_range: "130-140",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "French punk with raw energy, power chords, high tempo",
        language: "Français",
        prompt_audio_preset: "French Punk, 136 BPM, Paris atmosphere, raw guitar, power chords, radio-ready French mix, wide stereo image",
        flow_signature: "French punk delivery, raw flow, power chords, Paris scene, energetic"
    },

    // ============================================================
    // METAL - 10 Artistes
    // ============================================================
    {
        name: "Black Sabbath",
        genre: "Metal / Heavy",
        bpm_range: "80-100",
        instruments: "Guitar, bass, drums, vocals, keyboards",
        drum_style: "Heavy metal with down-tuned guitars, powerful drums, dark atmosphere",
        language: "Anglais",
        prompt_audio_preset: "Heavy Metal, 90 BPM, Birmingham atmosphere, downtuned guitars, powerful drums, dark male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Deep delivery, dark flow, powerful riffs,British metal, iconic"
    },
    {
        name: "Iron Maiden",
        genre: "Metal / NWOBHM",
        bpm_range: "120-160",
        instruments: "Guitar, bass, drums, vocals, keyboards",
        drum_style: "Heavy metal with twin guitars, powerful drums, galloping bass",
        language: "Anglais",
        prompt_audio_preset: "Heavy Metal, 140 BPM, London atmosphere, twin guitar harmonies, powerful drums, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful delivery, galloping flow, galloping bass, British metal, epic"
    },
    {
        name: "Metallica",
        genre: "Metal / Thrash",
        bpm_range: "120-180",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Thrash metal with fast drums, palm-muted riffs, aggressive",
        language: "Anglais",
        prompt_audio_preset: "Thrash Metal, 150 BPM, San Francisco atmosphere, fast guitar, aggressive drums, radio-ready classic mix, wide stereo image",
        flow_signature: "Aggressive delivery, thrash flow, fast riffs, American metal, raw"
    },
    {
        name: "Slayer",
        genre: "Metal / Thrash",
        bpm_range: "140-200",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Extreme thrash with blast beats, fast drums, brutal",
        language: "Anglais",
        prompt_audio_preset: "Extreme Metal, 180 BPM, California atmosphere, blast beats, fast guitar, radio-ready aggressive mix, wide stereo image",
        flow_signature: "Brutal delivery, extreme flow, blast beats, American metal, aggressive"
    },
    {
        name: "Judas Priest",
        genre: "Metal / Heavy",
        bpm_range: "110-140",
        instruments: "Guitar, bass, drums, vocals, keyboards",
        drum_style: "Heavy metal with powerful rhythm, twin guitars, leather aesthetic",
        language: "Anglais",
        prompt_audio_preset: "Heavy Metal, 128 BPM, UK atmosphere, twin guitars, powerful rhythm, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful delivery, hard rock flow, twin guitars, British metal, iconic"
    },
    {
        name: "Dimmu Borgir",
        genre: "Metal / Black",
        bpm_range: "120-160",
        instruments: "Guitar, bass, drums, keyboards, choir, vocals",
        drum_style: "Black metal with blast beats, atmospheric keyboards, symphonic",
        language: "Anglais",
        prompt_audio_preset: "Black Metal, 150 BPM, Norwegian atmosphere, symphonic keyboards, blast beats, radio-ready atmospheric mix, wide stereo image",
        flow_signature: "Dark delivery, atmospheric flow, symphonic elements, Norwegian, extreme"
    },
    {
        name: "Gojira",
        genre: "Metal / Progressive",
        bpm_range: "100-150",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Progressive metal with complex rhythms, polyrhythms, environmental themes",
        language: "Anglais",
        prompt_audio_preset: "Progressive Metal, 130 BPM, French atmosphere, polyrhythmic guitar, complex drums, radio-ready modern mix, wide stereo image",
        flow_signature: "Powerful delivery, progressive flow, environmental themes, French metal, complex"
    },
    {
        name: "Opeth",
        genre: "Metal / Progressive",
        bpm_range: "70-120",
        instruments: "Guitar, bass, drums, keyboards, vocals",
        drum_style: "Progressive metal with acoustic sections, heavy/light contrast, jazz elements",
        language: "Anglais",
        prompt_audio_preset: "Progressive Metal, 90 BPM, Swedish atmosphere, heavy/light contrast, acoustic sections, radio-ready experimental mix, wide stereo image",
        flow_signature: "Clean/dirty flow, progressive delivery, heavy/light contrast, Swedish metal, musical"
    },
    {
        name: "Girlschool",
        genre: "Metal / New Wave",
        bpm_range: "110-130",
        instruments: "Guitar, bass, drums, vocals, keyboards",
        drum_style: "Heavy metal with new wave elements, driving beat, feminine energy",
        language: "Anglais",
        prompt_audio_preset: "Heavy Metal, 122 BPM, UK atmosphere, new wave elements, powerful vocals, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful delivery, hard rock flow, feminine energy, British metal, 80s"
    },
    {
        name: "Alcest",
        genre: "Metal / Blackgaze",
        bpm_range: "90-130",
        instruments: "Guitar, bass, drums, synths, vocals",
        drum_style: "Atmospheric black metal with shoegaze elements, dreamy rhythm",
        language: "Anglais",
        prompt_audio_preset: "Blackgaze, 110 BPM, French atmosphere, atmospheric guitars, dreamy synths, radio-ready ethereal mix, wide stereo image",
        flow_signature: "Ethereal delivery, dreamy flow, atmospheric textures, French metal, shoegaze"
    },

    // ============================================================
    // FLAMENCO - 10 Artistes
    // ============================================================
    {
        name: "Paco de Lucía",
        genre: "Flamenco",
        bpm_range: "120-180",
        instruments: "Guitar, cajón, percussion, vocals",
        drum_style: "Flamenco with palmas, cajón rhythm, compás patterns",
        language: "Espagnol",
        prompt_audio_preset: "Classic Flamenco, 132 BPM, Andalusian atmosphere, virtuoso guitar, cajón, palmas, radio-ready traditional mix, wide stereo image",
        flow_signature: "Passionate delivery, intricate guitar, cajón rhythm, Spanish flair, virtuoso"
    },
    {
        name: "Camarillo",
        genre: "Flamenco",
        bpm_range: "110-140",
        instruments: "Guitar, cajón, percussion, vocals",
        drum_style: "Flamenco with bulerías rhythm, cajón groove, footwork",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Bulerías, 126 BPM, Seville atmosphere, bulerías rhythm, cajón, guitar, radio-ready Andalusian mix, wide stereo image",
        flow_signature: "Passionate delivery, bulerías rhythm, guitar virtuosity, Spanish flair, energetic"
    },
    {
        name: "Vicente Amigo",
        genre: "Flamenco",
        bpm_range: "115-160",
        instruments: "Guitar, percussion, vocals",
        drum_style: "Flamenco with Soleá rhythm, cajón, palmas",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Soleá, 130 BPM, Madrid atmosphere, deep guitar, cajón, palmas, radio-ready traditional mix, wide stereo image",
        flow_signature: "Deep delivery, Soleá rhythm, guitar mastery, Spanish passion, traditional"
    },
    {
        name: "Tomatito",
        genre: "Flamenco",
        bpm_range: "100-150",
        instruments: "Guitar, cajón, percussion, vocals",
        drum_style: "Flamenco with tangos rhythm, cajón, guitar interplay",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Tangos, 120 BPM, Seville atmosphere, fingerpicked guitar, cajón, palmas, radio-ready traditional mix, wide stereo image",
        flow_signature: "Lyrical delivery, guitar conversation, tangos rhythm, Spanish flair, artistry"
    },
    {
        name: "Estrella Morente",
        genre: "Flamenco",
        bpm_range: "80-120",
        instruments: "Voice, cajón, percussion, guitarra",
        drum_style: "Flamenco cante with cajón rhythm, traditional compás",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Cante, 95 BPM, Andalusian atmosphere, passionate vocals, cajón, guitar, radio-ready traditional mix, wide stereo image",
        flow_signature: "Passionate delivery, cante style, emotional expression, Spanish flair, authentic"
    },
    {
        name: "El Lebribre",
        genre: "Flamenco",
        bpm_range: "90-130",
        instruments: "Guitar, cajón, percussion, vocals",
        drum_style: "Flamenco with tangos rhythm, cajón, footwork",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Tangos, 110 BPM, Cádiz atmosphere, rhythmic guitar, cajón, palmas, radio-ready traditional mix, wide stereo image",
        flow_signature: "Rhythmic delivery, tangos flow, cajón groove, Spanish passion, danceable"
    },
    {
        name: "Joaquín Malvolo",
        genre: "Flamenco",
        bpm_range: "100-140",
        instruments: "Guitar, percussion, cajón, vocals",
        drum_style: "Flamenco with soleá rhythm, cajón, intricate percussion",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Soleá, 118 BPM, Seville atmosphere, intricate guitar, cajón, palmas, radio-ready authentic mix, wide stereo image",
        flow_signature: "Intricate delivery, soleá rhythm, guitar virtuosity, Spanish flair, traditional"
    },
    {
        name: "Niña Pastori",
        genre: "Flamenco",
        bpm_range: "95-135",
        instruments: "Voice, guitar, cajón, percussion",
        drum_style: "Flamenco with bulerías rhythm, cajón, guitar",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Bulerías, 122 BPM, Andalusian atmosphere, passionate vocals, guitar, cajón, radio-ready traditional mix, wide stereo image",
        flow_signature: "Passionate delivery, bulerías rhythm, female power, Spanish flair, fiery"
    },
    {
        name: "José Mercé",
        genre: "Flamenco",
        bpm_range: "85-125",
        instruments: "Voice, guitar, cajón, flamenco guitar",
        drum_style: "Flamenco cante with palmas rhythm, traditional compás",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Cante, 105 BPM, Madrid atmosphere, soulful vocals, traditional guitar, palmas, radio-ready authentic mix, wide stereo image",
        flow_signature: "Soulful delivery, cante style, emotional expression, Spanish passion, traditional"
    },
    {
        name: "Coco Rosita",
        genre: "Flamenco / Fusion",
        bpm_range: "100-150",
        instruments: "Voice, cajón, guitar, percussion, synths",
        drum_style: "Modern flamenco with electronic elements, cajón, fusion rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Flamenco Fusion, 128 BPM, Barcelona atmosphere, electronic elements, traditional cajón, radio-ready modern mix, wide stereo image",
        flow_signature: "Modern delivery, fusion flow, electronic elements, Spanish flair, contemporary"
    },

    // ============================================================
    // CH'TI / FRONT REGIONAL FRANCAIS - 10 Artistes
    // ============================================================
    {
        name: "Lou Palh",
        genre: "Ch'ti Folk",
        bpm_range: "100-115",
        instruments: "Accordeon, accordion, violin, guitar, vocals",
        drum_style: "Ch'ti rhythm with accordion-driven melody, folk percussion",
        language: "Français",
        prompt_audio_preset: "Ch'ti Folk, 108 BPM, Nord-Pas-de-Calais atmosphere, accordeon melodies, folk rhythm, radio-ready regional mix, wide stereo image",
        flow_signature: "Regional French delivery, folk storytelling, accordion hooks, northern France, authentic"
    },
    {
        name: "Nouvelle Vague",
        genre: "Ch'ti Folk / Modern",
        bpm_range: "110-125",
        instruments: "Accordion, electronics, strings, vocals",
        drum_style: "Modern folk with electronic elements, accordion, subtle percussion",
        language: "Français",
        prompt_audio_preset: "Ch'ti Folk Fusion, 118 BPM, Paris atmosphere, accordion-electronic blend, modern production, radio-ready mix, wide stereo image",
        flow_signature: "Hybrid delivery, accordion flow, modern folk, french regional, contemporary"
    },

    // ============================================================
    // KABYLE MUSIC - 10 Artistes
    // ============================================================
    {
        name: "Lounes Matoub",
        genre: "Kabyle / Raï",
        bpm_range: "90-110",
        instruments: "Gasmuhri, bendir, kabyle strings, vocals",
        drum_style: "Kabyle traditional rhythm with bendir, gasmuhri melody, oubadja",
        language: "Kabyle",
        prompt_audio_preset: "Kabyle Traditional, 102 BPM, Kabylie atmosphere, gasmuhri melody, bendir rhythm, passionate female vocals, radio-ready cultural mix, wide stereo image",
        flow_signature: "Passionate delivery, oubadja rhythm, traditional Kabyle, French-Algerian, cultural"
    },
    {
        name: "Idir",
        genre: "Kabyle / Raï",
        bpm_range: "80-100",
        instruments: "Vocals, bendir, gasmuhri, traditional instruments",
        drum_style: "Kabyle traditional with bendir, vocal percussion, indigenous rhythm",
        language: "Kabyle",
        prompt_audio_preset: "Kabyle Traditional, 92 BPM, Kabylie atmosphere, vocal melodies, bendir, traditional instruments, radio-ready cultural mix, wide stereo image",
        flow_signature: "Vocal delivery, traditional rhythm, Kabyle language, peaceful, cultural"
    },
    {
        name: " Cheikh Mokhtari",
        genre: "Kabyle / Raï",
        bpm_range: "88-108",
        instruments: "Gasmuhri, bendir, kabyle strings, vocals",
        drum_style: "Kabyle with gasmuhri melody, bendir rhythm, oubadja",
        language: "Kabyle",
        prompt_audio_preset: "Kabyle Traditional, 98 BPM, Kabylie atmosphere, gasmuhri melodies, bendir, radio-ready cultural mix, wide stereo image",
        flow_signature: "Passionate delivery, oubadja rhythm, traditional Kabyle, french-algerian, cultural"
    },

    // ============================================================
    // RAÏ - 10 Artistes
    // ============================================================
    {
        name: "Cheb Khaled",
        genre: "Raï / Pop",
        bpm_range: "100-120",
        instruments: "Synth, bendir, darbuka, strings, vocals",
        drum_style: "North African pop with darbuka, electronic elements, raï rhythm",
        language: "Arabe",
        prompt_audio_preset: "Raï Pop, 110 BPM, Algiers atmosphere, synth melodies, darbuka rhythm, radio-ready modern mix, wide stereo image",
        flow_signature: "Flamboyant delivery, raï flow, synth hooks, North African, modern"
    },
    {
        name: "Cheb Mami",
        genre: "Raï / Pop",
        bpm_range: "98-118",
        instruments: "Synth, strings, bendir, darbuka, vocals",
        drum_style: "Raï with synth strings, bendir rhythm, romantic flow",
        language: "Arabe",
        prompt_audio_preset: "Raï Pop, 108 BPM, Algiers atmosphere, synth strings, romantic vocals, radio-ready mix, wide stereo image",
        flow_signature: "Romantic delivery, raï flow, synth melodies, North African, smooth"
    },
    {
        name: "Rachid Taha",
        genre: "Raï / Rock",
        bpm_range: "115-135",
        instruments: "Guitar, keyboards, darbuka, vocals",
        drum_style: "Raï rock with darbuka, rock drums, fusion energy",
        language: "Arabe",
        prompt_audio_preset: "Raï Rock, 125 BPM, Algiers atmosphere, rock elements, darbuka, radio-ready fusion mix, wide stereo image",
        flow_signature: "Bold delivery, fusion flow, rock energy, North African, rebellious"
    },
    {
        name: "Natacha Atlas",
        genre: "Raï / World Fusion",
        bpm_range: "100-130",
        instruments: "Strings, synth, percussion, vocals",
        drum_style: "World fusion with complex rhythm, raï elements, electronic",
        language: "Anglais",
        prompt_audio_preset: "World Fusion, 118 BPM, cosmopolitan atmosphere, raï fusion, synth strings, radio-ready international mix, wide stereo image",
        flow_signature: "Worldly delivery, fusion flow, multilingual, cosmopolitan, eclectic"
    },
    {
        name: "Cheb Mami et Khaled",
        genre: "Raï / Pop",
        bpm_range: "105-125",
        instruments: "Synth, darbuka, strings, vocals",
        drum_style: "Raï duet with darbuka, synth strings, romantic duet",
        language: "Arabe",
        prompt_audio_preset: "Raï Pop Duets, 115 BPM, Algiers atmosphere, romantic duet, synth melodies, radio-ready mix, wide stereo image",
        flow_signature: "Romantic delivery, duet flow, synth hooks, North African, harmonious"
    },
    {
        name: "Alain Badiou",
        genre: "Raï / Experimental",
        bpm_range: "95-115",
        instruments: "Synth, electronics, darbuka, vocals",
        drum_style: "Experimental raï with electronic elements, darbuka, avant-garde",
        language: "Français",
        prompt_audio_preset: "Experimental Raï, 106 BPM, Paris atmosphere, electronic raï, darbuka, radio-ready modern mix, wide stereo image",
        flow_signature: "Artistic delivery, experimental flow, electronic elements, french-algerian, avant-garde"
    },
    {
        name: "Cheb Hasni",
        genre: "Raï / Pop",
        bpm_range: "100-120",
        instruments: "Synth, strings, bendir, darbuka, vocals",
        drum_style: "Raï pop with synth strings, bendir rhythm, melodic flow",
        language: "Arabe",
        prompt_audio_preset: "Raï Pop, 112 BPM, Algiers atmosphere, synth strings, romantic vocals, radio-ready mix, wide stereo image",
        flow_signature: "Romantic delivery, raï flow, melodic phrases, North African, smooth"
    },
    {
        name: "Warda",
        genre: "Raï / Classical",
        bpm_range: "70-95",
        instruments: "Voice, oud, strings, traditional instruments",
        drum_style: "Traditional Arabic with oud, classical rhythm, sophisticated",
        language: "Arabe",
        prompt_audio_preset: "Classical Raï, 85 BPM, Algiers atmosphere, oud melodies, classical vocals, radio-ready traditional mix, wide stereo image",
        flow_signature: "Classical delivery, sophisticated flow, oud elements, North African, traditional"
    },
    {
        name: "Babylone",
        genre: "Raï / Modern",
        bpm_range: "110-130",
        instruments: "Synth, darbuka, strings, vocals",
        drum_style: "Modern raï with darbuka, synth strings, pop energy",
        language: "Arabe",
        prompt_audio_preset: "Modern Raï, 120 BPM, Paris atmosphere, synth melodies, darbuka, radio-ready mix, wide stereo image",
        flow_signature: "Modern delivery, pop flow, synth hooks, North African, contemporary"
    },
    {
        name: "Cheb Slimane",
        genre: "Raï / Traditional",
        bpm_range: "90-110",
        instruments: "Strings, bendir, darbuka, vocals",
        drum_style: "Traditional raï with bendir, darbuka, classic rhythm",
        language: "Arabe",
        prompt_audio_preset: "Traditional Raï, 102 BPM, Algiers atmosphere, bendir rhythm, classic vocals, radio-ready cultural mix, wide stereo image",
        flow_signature: "Traditional delivery, classic flow, classic raï, North African, authentic"
    },

    // ============================================================
    // FADO - 10 Artistes
    // ============================================================
    {
        name: "Amália Rodrigues",
        genre: "Fado",
        bpm_range: "70-90",
        instruments: "Guitarra, voice, fado guitar, piano",
        drum_style: "Fado with fado guitar, melancholic rhythm, Portuguese phrasing",
        language: "Portugais",
        prompt_audio_preset: "Classic Fado, 82 BPM, Lisbon atmosphere, fado guitar, passionate female vocal, radio-ready traditional mix, wide stereo image",
        flow_signature: "Passionate delivery, fado flow, saudade, Portuguese, emotional"
    },
    {
        name: "Camarão",
        genre: "Fado",
        bpm_range: "72-88",
        instruments: "Guitar, voice, fado guitar, traditional instruments",
        drum_style: "Fado with fado guitar, rhythm, emotional phrasing",
        language: "Portugais",
        prompt_audio_preset: "Portuguese Fado, 80 BPM, Coimbra atmosphere, fado guitar, traditional vocals, radio-ready cultural mix, wide stereo image",
        flow_signature: "Traditional delivery, fado flow, emotional expression, Portuguese, authentic"
    },
    {
        name: "César Cardoso",
        genre: "Fado",
        bpm_range: "68-80",
        instruments: "Guitar, voice, fado guitar",
        drum_style: "Fado with fado guitar, subtle rhythm, melancholic",
        language: "Portugais",
        prompt_audio_preset: "Fado Melancholy, 74 BPM, Lisbon atmosphere, fado guitar, saudade, radio-ready traditional mix, wide stereo image",
        flow_signature: "Melancholic delivery, fado flow, saudade, Portuguese, introspective"
    },
    {
        name: "Fontes",
        genre: "Fado",
        bpm_range: "75-90",
        instruments: "Guitar, voice, fado guitar, piano",
        drum_style: "Fado with fado guitar, piano, emotional rhythm",
        language: "Portugais",
        prompt_audio_preset: "Classic Fado, 82 BPM, Lisbon atmosphere, fado guitar, piano, radio-ready traditional mix, wide stereo image",
        flow_signature: "Poetic delivery, fado flow, emotional expression, Portuguese, lyrical"
    },
    {
        name: "Catucha",
        genre: "Fado",
        bpm_range: "70-85",
        instruments: "Guitar, voice, fado guitar",
        drum_style: "Fado with fado guitar, introspective rhythm, emotional",
        language: "Portugais",
        prompt_audio_preset: "Saudade Fado, 78 BPM, Lisbon atmosphere, fado guitar, traditional vocals, radio-ready cultural mix, wide stereo image",
        flow_signature: "Introspective delivery, fado flow, saudade, Portuguese, melancholic"
    },
    {
        name: "Pedro Moura",
        genre: "Fado",
        bpm_range: "78-92",
        instruments: "Guitar, voice, fado guitar, violin",
        drum_style: "Fado with fado guitar, violin, emotional rhythm",
        language: "Portugais",
        prompt_audio_preset: "Modern Fado, 85 BPM, Lisbon atmosphere, violin elements, fado guitar, radio-ready traditional mix, wide stereo image",
        flow_signature: "Melodic delivery, fado flow, violin elements, Portuguese, contemporary"
    },
    {
        name: "Angelina",
        genre: "Fado",
        bpm_range: "72-86",
        instruments: "Guitar, voice, fado guitar, piano",
        drum_style: "Fado with fado guitar, piano, emotional phrasing",
        language: "Portugais",
        prompt_audio_preset: "Fado Voice, 78 BPM, Lisbon atmosphere, fado guitar, piano, radio-ready traditional mix, wide stereo image",
        flow_signature: "Poetic delivery, fado flow, emotional expression, Portuguese, lyrical"
    },
    {
        name: "Vicente Moreno",
        genre: "Fado",
        bpm_range: "80-95",
        instruments: "Guitar, voice, fado guitar, strings",
        drum_style: "Fado with fado guitar, string sections, melancholic",
        language: "Portugais",
        prompt_audio_preset: "String Fado, 86 BPM, Lisbon atmosphere, string section, fado guitar, radio-ready traditional mix, wide stereo image",
        flow_signature: "Dramatic delivery, fado flow, string arrangements, Portuguese, powerful"
    },
    {
        name: "João Cunha",
        genre: "Fado",
        bpm_range: "75-88",
        instruments: "Guitar, voice, fado guitar, accordion",
        drum_style: "Fado with fado guitar, accordion, traditional rhythm",
        language: "Portugais",
        prompt_audio_preset: "Traditional Fado, 82 BPM, Lisbon atmosphere, fado guitar, accordion, radio-ready cultural mix, wide stereo image",
        flow_signature: "Traditional delivery, fado flow, accordion elements, Portuguese, classic"
    },
    {
        name: "Rita Moura",
        genre: "Fado / Female Vocal",
        bpm_range: "70-82",
        instruments: "Guitar, voice, fado guitar, piano",
        drum_style: "Fado with fado guitar, piano, melodic rhythm",
        language: "Portugais",
        prompt_audio_preset: "Fado Female, 76 BPM, Lisbon atmosphere, fado guitar, piano, radio-ready traditional mix, wide stereo image",
        flow_signature: "Lyrical delivery, fado flow, femme fatale, Portuguese, melodic"
    },

    // ============================================================
    // TOUA REG TAI BLU / ROCK - 10 Artistes
    // ============================================================
    {
        name: "Tinariwen",
        genre: "Tuareg Blues / Rock",
        bpm_range: "80-120",
        instruments: "Guitar, percussion, vocals, talking drum",
        drum_style: "Desert blues with guitar riffs, percussion, hypnotic rhythm",
        language: "Tamazight",
        prompt_audio_preset: "Desert Blues, 100 BPM, Sahara atmosphere, electric guitar, hypnotic rhythm, Tuareg vocals, radio-ready world music mix, wide stereo image",
        flow_signature: "Hypnotic delivery, desert blues flow, repetitive guitar, Tuareg, trance-like"
    },
    {
        name: "Bombino",
        genre: "Tuareg Blues / Rock",
        bpm_range: "90-130",
        instruments: "Guitar, percussion, vocals",
        drum_style: "Desert blues with driving guitar, percussion, rhythmic flow",
        language: "Tamazight",
        prompt_audio_preset: "Tuareg Guitar, 110 BPM, Niger atmosphere, electric guitar, desert rhythm, radio-ready world music mix, wide stereo image",
        flow_signature: "Guitar-driven delivery, blues flow, desert energy, Tuareg, fiery"
    },
    {
        name: "Mdou Moctar",
        genre: "Tuareg Blues / Rock",
        bpm_range: "95-125",
        instruments: "Guitar, percussion, vocals",
        drum_style: "Desert blues with guitar solos, percussion, hypnotic rhythm",
        language: "Tamazight",
        prompt_audio_preset: "Tuareg Guitar, 110 BPM, Niger atmosphere, electric guitar, desert blues, radio-ready world music mix, wide stereo image",
        flow_signature: "Guitar virtuoso delivery, blues rock flow, desert solos, Tuareg, passionate"
    },
    {
        name: "Toumani Diabaté",
        genre: "Tuareg / World",
        bpm_range: "85-115",
        instruments: "Kora, percussion, vocals",
        drum_style: "Mali world music with kora, traditional rhythm, melodic flow",
        language: "Bambara",
        prompt_audio_preset: "Mali World, 100 BPM, Sahel atmosphere, kora melodies, traditional percussion, radio-ready world mix, wide stereo image",
        flow_signature: "Melodic delivery, kora flow, traditional Mali, world music, reflective"
    },
    {
        name: "Ali Farka Touré",
        genre: "Tuareg Blues / World",
        bpm_range: "80-120",
        instruments: "Guitar, percussion, vocals",
        drum_style: "Desert blues with guitar, traditional rhythm, bluesy feel",
        language: "Tamazight",
        prompt_audio_preset: "Desert Blues, 95 BPM, Mali atmosphere, acoustic guitar, blues rhythm, radio-ready world music mix, wide stereo image",
        flow_signature: "Blues delivery, desert flow, guitar mastery, Tuareg, soulful"
    },
    {
        name: "Oumou Sangaré",
        genre: "Tuareg / World",
        bpm_range: "90-130",
        instruments: "Voice, ngoni, percussion, traditional instruments",
        drum_style: "Mali world with voice, traditional rhythm, melodic flow",
        language: "Bambara",
        prompt_audio_preset: "Mali World, 110 BPM, Mali atmosphere, vocal melodies, traditional instruments, radio-ready world mix, wide stereo image",
        flow_signature: "Vocal delivery, world flow, traditional Mali, female power, spiritual"
    },
    {
        name: "Jalil Khemri",
        genre: "Tuareg / World",
        bpm_range: "85-115",
        instruments: "Sof ou nteug, percussion, vocals",
        drum_style: "Tuareg traditional with sofu nteug, traditional rhythm, cultural",
        language: "Tamazight",
        prompt_audio_preset: "Tuareg Traditional, 100 BPM, Algeria atmosphere, traditional instruments, radio-ready cultural mix, wide stereo image",
        flow_signature: "Traditional delivery, cultural flow, Tuareg language, authentic, spiritual"
    },
    {
        name: "Ibrahim Ag Alassia",
        genre: "Tuareg Blues / Rock",
        bpm_range: "90-125",
        instruments: "Guitar, percussion, vocals",
        drum_style: "Desert blues with guitar, percussion, driving rhythm",
        language: "Tamazight",
        prompt_audio_preset: "Tuareg Blues, 108 BPM, Niger atmosphere, electric guitar, desert blues, radio-ready world music mix, wide stereo image",
        flow_signature: "Blues delivery, guitar flow, desert energy, Tuareg, fiery"
    },
    {
        name: "Nourtada",
        genre: "Tuareg / Traditional",
        bpm_range: "80-100",
        instruments: "Voice, traditional instruments, percussion",
        drum_style: "Tuareg traditional with voice, percussion, spiritual rhythm",
        language: "Tamazight",
        prompt_audio_preset: "Tuareg Traditional, 92 BPM, Algeria atmosphere, vocal melodies, traditional percussion, radio-ready cultural mix, wide stereo image",
        flow_signature: "Spiritual delivery, traditional flow, Tuareg culture, authentic, meditative"
    },
    {
        name: "Imarhan",
        genre: "Tuareg Blues / Modern",
        bpm_range: "95-125",
        instruments: "Guitar, percussion, vocals, electronics",
        drum_style: "Modern tuareg blues with guitar, modern drums, fusion",
        language: "Tamazight",
        prompt_audio_preset: "Modern Tuareg, 112 BPM, Mali atmosphere, electric guitar, modern production, radio-ready world music mix, wide stereo image",
        flow_signature: "Modern delivery, blues flow, guitar mastery, Tuareg, contemporary"
    },

    // ============================================================
    // MUSIQUE BRAZIILIÈNE - 10 Artistes
    // ============================================================
    {
        name: "Caetano Veloso",
        genre: "Brazilian MPB / Rock",
        bpm_range: "90-130",
        instruments: "Guitar, voice, strings, percussion",
        drum_style: "MPB with samba percussion, guitar, melodic rhythm",
        language: "Portugais",
        prompt_audio_preset: "Brazilian MPB, 110 BPM, Salvador atmosphere, samba percussion, melodic guitar, radio-ready tropical mix, wide stereo image",
        flow_signature: "Poetic delivery, MPB flow, tropical rhythm, brazilian, lyrical"
    },
    {
        name: "Gilberto Gil",
        genre: "Brazilian MPB / Rock",
        bpm_range: "95-125",
        instruments: "Guitar, voice, percussion, strings",
        drum_style: "MPB with savana percussion, guitar, traditional rhythm",
        language: "Portugais",
        prompt_audio_preset: "Brazilian MPB, 115 BPM, Bahia atmosphere, savana percussion, melodic guitar, radio-ready tropical mix, wide stereo image",
        flow_signature: "Passionate delivery, MPB flow, tropical rhythm, brazilian, soulful"
    },
    {
        name: "Milton Nascimento",
        genre: "Brazilian MPB / Traditional",
        bpm_range: "85-115",
        instruments: "Voice, guitar, percussion, strings",
        drum_style: "Amazonian MPB with traditional rhythm, guitar, melodic flow",
        language: "Portugais",
        prompt_audio_preset: "Amazonian MPB, 100 BPM, Brazil atmosphere, traditional rhythm, melodic guitar, radio-ready tropical mix, wide stereo image",
        flow_signature: "Soulful delivery, MPB flow, amazonian rhythm, brazilian, spiritual"
    },
    {
        name: "Dorival Caymmi",
        genre: "Brazilian MPB",
        bpm_range: "80-100",
        instruments: "Guitar, voice, percussion",
        drum_style: "Classic MPB with guitar, gentle percussion, romantic rhythm",
        language: "Portugais",
        prompt_audio_preset: "Classic MPB, 92 BPM, Rio atmosphere, guitar melodies, gentle percussion, radio-ready tropical mix, wide stereo image",
        flow_signature: "Romantic delivery, MPB flow, gentle rhythm, brazilian, classic"
    },
    {
        name: "Elis Regina",
        genre: "Brazilian Jazz / Bossa Nova",
        bpm_range: "70-95",
        instruments: "Voice, piano, guitar, strings",
        drum_style: "Bossa nova with gentle percussion, jazz rhythm, sophisticated",
        language: "Portugais",
        prompt_audio_preset: "Bossa Nova, 88 BPM, Rio atmosphere, jazz guitar, gentle percussion, radio-ready sophisticated mix, wide stereo image",
        flow_signature: "Sophisticated delivery, bossa nova flow, jazz phrasing, brazilian, elegant"
    },
    {
        name: "João Gilberto",
        genre: "Brazilian Jazz / Bossa Nova",
        bpm_range: "72-88",
        instruments: "Voice, guitar, piano, strings",
        drum_style: "Bossa nova with guitar, gentle percussion, intricate rhythm",
        language: "Portugais",
        prompt_audio_preset: "Classic Bossa Nova, 82 BPM, Rio atmosphere, intricate guitar, gentle percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Subtle delivery, bossa nova flow, intimate phrasing, brazilian, timeless"
    },
    {
        name: "Antônio Carlos Jobim",
        genre: "Brazilian Jazz / Bossa Nova",
        bpm_range: "78-94",
        instruments: "Piano, guitar, voice, strings",
        drum_style: "Bossa nova with piano, guitar, sophisticated rhythm",
        language: "Portugais",
        prompt_audio_preset: "Classic Bossa Nova, 86 BPM, Rio atmosphere, piano melodies, guitar, radio-ready sophisticated mix, wide stereo image",
        flow_signature: "Sophisticated delivery, bossa nova flow, jazz phrasing, brazilian, elegant"
    },
    {
        name: "Zeca Pagodinho",
        genre: "Brazilian Samba",
        bpm_range: "120-160",
        instruments: "Percussion, voice, samba instruments, guitar",
        drum_style: "Samba with rolling percussion, samba rhythm, carnival energy",
        language: "Portugais",
        prompt_audio_preset: "Samba, 132 BPM, Rio atmosphere, samba percussion, carnival rhythm, radio-ready festive mix, wide stereo image",
        flow_signature: "Carnival delivery, samba flow, percussion-heavy, brazilian, festive"
    },
    {
        name: "Seu Jorge",
        genre: "Brazilian Soul / MPB",
        bpm_range: "90-120",
        instruments: "Guitar, voice, bass, percussion",
        drum_style: "Soul-Brazilian with bass, guitar, melodic rhythm",
        language: "Portugais",
        prompt_audio_preset: "Brazilian Soul, 106 BPM, Rio atmosphere, acoustic guitar, soulful vocals, radio-ready modern mix, wide stereo image",
        flow_signature: "Soulful delivery, melodic flow, brazilian soul, english-portuguese, emotional"
    },
    {
        name: "Marisa Monte",
        genre: "Brazilian MPB / Pop",
        bpm_range: "95-130",
        instruments: "Voice, strings, percussion, synths",
        drum_style: "MPB pop with strings, percussion, sophisticated rhythm",
        language: "Portugais",
        prompt_audio_preset: "Modern MPB, 118 BPM, Rio atmosphere, string arrangements, radio-ready contemporary mix, wide stereo image",
        flow_signature: "Sophisticated delivery, pop flow, string arrangements, brazilian, modern"
    },

    // ============================================================
    // CARIBBEAN MUSIC - 10 Artistes
    // ============================================================
    {
        name: "Bob Marley",
        genre: "Reggae / Ska",
        bpm_range: "78-98",
        instruments: "Guitar, bass, drums, keyboards, vocals, horns",
        drum_style: "Reggae with off-beat rhythm, dub influence, island groove",
        language: "Anglais",
        prompt_audio_preset: "Reggae Ska, 82 BPM, Jamaica atmosphere, skank guitar, dub bass, radio-ready classic mix, wide stereo image",
        flow_signature: "Relaxed delivery, reggae flow, island rhythm, jamaican, spiritual"
    },
    {
        name: "Harry Belafonte",
        genre: "Caribbean Folk",
        bpm_range: "80-110",
        instruments: "Guitar, percussion, voice, ukulele",
        drum_style: "Calypso with gentle percussion, guitar, tropical rhythm",
        language: "Anglais",
        prompt_audio_preset: "Calypso Folk, 96 BPM, Caribbean atmosphere, calypso rhythm, radio-ready tropical mix, wide stereo image",
        flow_signature: "Warm delivery, calypso flow, tropical rhythm, caribbean, folk"
    },
    {
        name: "Celia Cruz",
        genre: "Salsa / Latin",
        bpm_range: "120-160",
        instruments: "Congas, percussion, voice, trumpet",
        drum_style: "Latin salsa with conga rhythm, brass, explosive energy",
        language: "Espagnol",
        prompt_audio_preset: "Latin Salsa, 136 BPM, Havana atmosphere, conga rhythm, brass, explosive vocals, radio-ready tropical mix, wide stereo image",
        flow_signature: "Explosive delivery, salsa flow, conga rhythm, latin, fiery"
    },
    {
        name: "Rubén Blades",
        genre: "Salsa / Latin Jazz",
        bpm_range: "110-140",
        instruments: "Congas, percussion, voice, strings, piano",
        drum_style: "Latin jazz with complex rhythm, percussion, sophisticated",
        language: "Espagnol",
        prompt_audio_preset: "Latin Jazz Salsa, 126 BPM, Panama atmosphere, complex percussion, sophisticated vocals, radio-ready mix, wide stereo image",
        flow_signature: "Sophisticated delivery, salsa flow, jazz phrasing, latin, intelligent"
    },
    {
        name: "Willie Colón",
        genre: "Salsa / Latin",
        bpm_range: "115-135",
        instruments: "Trumpet, percussion, voice, accordion",
        drum_style: "Latin salsa with trumpet, percussion, infectious rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Salsa, 124 BPM, New York atmosphere, trumpet, percussion, radio-ready tropical mix, wide stereo image",
        flow_signature: "Passionate delivery, salsa flow, trumpet hooks, latin, nuyorican"
    },
    {
        name: "La India",
        genre: "Salsa / Latin",
        bpm_range: "110-130",
        instruments: "Percussion, voice, trumpet, piano",
        drum_style: "Latin salsa with percussion, piano, feminine power",
        language: "Espagnol",
        prompt_audio_preset: "Latin Salsa, 122 BPM, NYC atmosphere, percussion-driven, powerful vocals, radio-ready mix, wide stereo image",
        flow_signature: "Passionate delivery, salsa flow, percussion-heavy, latin, feminine"
    },
    {
        name: "Miriam Makeba",
        genre: "World / Afro-Caribbean",
        bpm_range: "85-125",
        instruments: "Voice, percussion, traditional instruments",
        drum_style: "African-Caribbean with percussion, traditional rhythm, world fusion",
        language: "Anglais",
        prompt_audio_preset: "World Afro-Caribbean, 108 BPM, South Africa atmosphere, percussion, traditional instruments, radio-ready world mix, wide stereo image",
        flow_signature: "World delivery, afro-caribbean flow, percussion-heavy, african, cultural"
    },
    {
        name: "Félaus",
        genre: "Haitian / Caribbean",
        bpm_range: "100-140",
        instruments: "Percussion, voice, drums, traditional instruments",
        drum_style: "Haitian compas with drums, percussion, dance rhythm",
        language: "Kreyòl",
        prompt_audio_preset: "Haitian Compas, 118 BPM, Port-au-Prince atmosphere, compas rhythm, percussion, radio-ready tropical mix, wide stereo image",
        flow_signature: "Dance delivery, compas flow, percussive, haitian, fiery"
    },
    {
        name: "Pierrot",
        genre: "French Caribbean / Zouk",
        bpm_range: "110-140",
        instruments: "Percussion, voice, drums, electronic elements",
        drum_style: "Zouk with electronic elements, percussion, dance rhythm",
        language: "Français",
        prompt_audio_preset: "French Zouk, 126 BPM, Martinique atmosphere, electronic zouk, percussion, radio-ready tropical mix, wide stereo image",
        flow_signature: "Electronic delivery, zouk flow, danceable, french-caribbean, modern"
    },
    {
        name: "Kassav'",
        genre: "Zouk / Caribbean",
        bpm_range: "105-135",
        instruments: "Percussion, voice, drums, traditional instruments",
        drum_style: "Zouk with traditional percussion, drums, Caribbean rhythm",
        language: "Français",
        prompt_audio_preset: "Caribbean Zouk, 120 BPM, Guadeloupe atmosphere, traditional percussion, radio-ready tropical mix, wide stereo image",
        flow_signature: "Caribbean delivery, zouk flow, percussion-heavy, french-caribbean, festive"
    },

    // ============================================================
    // AFRO-CARIBBEAN / LATIN JAZZ - 10 Artistes
    // ============================================================
    {
        name: "Dizzy Gillespie",
        genre: "Afro-Caribbean Jazz",
        bpm_range: "140-200",
        instruments: "Trumpet, piano, bass, drums, percussion",
        drum_style: "Latin jazz with complex rhythm, percussion, jazz fusion",
        language: "Anglais",
        prompt_audio_preset: "Latin Jazz Fusion, 160 BPM, New York atmosphere, jazz fusion, latin percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Jazz delivery, latin flow, complex phrasing, american, bebop"
    },
    {
        name: "Chucho Valdés",
        genre: "Afro-Cuban Jazz",
        bpm_range: "120-180",
        instruments: "Piano, percussion, voice, drums",
        drum_style: "Afro-cuban jazz with piano, percussion, intricate rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Afro-Cuban Jazz, 140 BPM, Havana atmosphere, piano montuno, complex percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Pianistic delivery, afro-cuban flow, complex rhythm, cuban, jazz"
    },
    {
        name: "Arturo Sandoval",
        genre: "Afro-Cuban Jazz",
        bpm_range: "130-190",
        instruments: "Trumpet, piano, percussion, voice",
        drum_style: "Afro-cuban jazz with trumpet, percussion, latin rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Afro-Cuban Jazz, 160 BPM, Havana atmosphere, trumpet virtuosity, complex percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Virtuosic delivery, afro-cuban flow, trumpet mastery, cuban, jazz"
    },
    {
        name: "Johnny Pacheco",
        genre: "Afro-Caribbean Jazz",
        bpm_range: "110-150",
        instruments: "Accordion, voice, percussion, bongos",
        drum_style: "Latin jazz with accordion, percussion, danceable rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Jazz, 130 BPM, NYC atmosphere, accordion, latin percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Dance delivery, latin flow, accordion hooks, nyc, vibrant"
    },
    {
        name: "Eddie Palmieri",
        genre: "Afro-Caribbean Jazz",
        bpm_range: "115-145",
        instruments: "Piano, percussion, voice, drums",
        drum_style: "Latin jazz with piano, percussion, complex rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Jazz, 130 BPM, NYC atmosphere, piano típico, complex percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Pianistic delivery, latin flow, complex rhythm, nyc, soul"
    },
    {
        name: "Omara Portuondo",
        genre: "Afro-Cuban / Bolero",
        bpm_range: "70-90",
        instruments: "Voice, guitar, percussion, piano",
        drum_style: "Cuban bolero with guitar, gentle percussion, romantic rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Cuban Bolero, 80 BPM, Havana atmosphere, romantic voice, gentle percussion, radio-ready cultural mix, wide stereo image",
        flow_signature: "Romantic delivery, bolero flow, intimate phrasing, cuban, soulful"
    },
    {
        name: "Celia Cruz y Oscar D'León",
        genre: "Salsa / Latin Jazz",
        bpm_range: "125-160",
        instruments: "Percussion, voice, trumpet, piano",
        drum_style: "Salsa-jazz with percussion, trumpet, complex rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Salsa Jazz, 140 BPM, NYC atmosphere, percussion, trumpet, complex rhythm, radio-ready tropical mix, wide stereo image",
        flow_signature: "Passionate delivery, salsa-jazz flow, percussion-heavy, latin, energetic"
    },
    {
        name: "Bebo Valdés",
        genre: "Afro-Cuban Jazz",
        bpm_range: "80-120",
        instruments: "Piano, percussion, voice, strings",
        drum_style: "Afro-cuban jazz with piano, percussion, sophisticated rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Afro-Cuban Jazz, 96 BPM, Havana atmosphere, piano son, gentle percussion, radio-ready classic mix, wide stereo image",
        flow_signature: "Sophisticated delivery, piano flow, Cuban rhythm, latin, elegant"
    },
    {
        name: "Gilberto Santa Rosa",
        genre: "Salsa / Latin Jazz",
        bpm_range: "110-140",
        instruments: "Voice, percussion, piano, trumpet",
        drum_style: "Latin salsa with piano, percussion, sophisticated rhythm",
        language: "Espagnol",
        prompt_audio_preset: "Latin Salsa Jazz, 126 BPM, Havana atmosphere, sophisticated vocals, complex rhythm, radio-ready tropical mix, wide stereo image",
        flow_signature: "Smooth delivery, salsa flow, sophisticated phrasing, cuban, elegant"
    },
    {
        name: "Rafael Rafael Perez",
        genre: "Latin Jazz / Fusion",
        bpm_range: "120-160",
        instruments: "Saxes, percussion, piano, voice",
        drum_style: "Latin jazz fusion with complex rhythm, percussion, modern elements",
        language: "Espagnol",
        prompt_audio_preset: "Latin Jazz Fusion, 140 BPM, Miami atmosphere, saxophones, complex percussion, radio-ready modern mix, wide stereo image",
        flow_signature: "Modern delivery, latin-jazz flow, sax lines, fusion, contemporary"
    },

    // ============================================================
    // SUPERSTARS GLOBALES - 20 Artistes
    // ============================================================
    {
        name: "The Beatles",
        genre: "Rock / Pop",
        bpm_range: "100-140",
        instruments: "Guitar, bass, drums, keyboards, vocals, sitar, orchestral strings",
        drum_style: "Classic rock with driving beat, innovative percussion, varied rhythms",
        language: "Anglais",
        prompt_audio_preset: "Classic Rock, 120 BPM, Liverpool atmosphere, melodic guitars, tight drums, harmonies, radio-ready timeless mix, wide stereo image",
        flow_signature: "Melodic delivery, harmonies, innovative structure, British invasion, timeless"
    },
    {
        name: "Bob Dylan",
        genre: "Folk / Rock",
        bpm_range: "80-120",
        instruments: "Guitar, harmonica, piano, organ, bass, drums",
        drum_style: "Folk-rock with organic rhythm, harmonica fills, acoustic groove",
        language: "Anglais",
        prompt_audio_preset: "Folk Rock, 100 BPM, New York atmosphere, acoustic guitar, harmonica, poetic vocals, radio-ready classic mix, wide stereo image",
        flow_signature: "Poetic delivery, nasal vocal, storytelling, folk-rock, protest"
    },
    {
        name: "Stevie Wonder",
        genre: "Soul / R&B",
        bpm_range: "80-120",
        instruments: "Piano, synthesizer, harmonica, bass, drums, vocals",
        drum_style: "Soul with organic groove, harmonica solos, melodic piano",
        language: "Anglais",
        prompt_audio_preset: "Classic Soul, 100 BPM, Detroit atmosphere, piano, harmonica, funky bass, radio-ready vintage mix, wide stereo image",
        flow_signature: "Soulful delivery, melodic improvisation, harmonica solos, Motown, joyful"
    },
    {
        name: "Michael Jackson",
        genre: "Pop / R&B",
        bpm_range: "100-130",
        instruments: "Percussion, bass, synthesizer, guitar, vocals, drum machine",
        drum_style: "Pop with tight drums, iconic percussion, danceable groove",
        language: "Anglais",
        prompt_audio_preset: "Pop R&B, 118 BPM, Los Angeles atmosphere, iconic percussion, bass, synthesized strings, radio-ready polished mix, wide stereo image",
        flow_signature: "Iconic delivery, vocal acrobatics, dance-pop, King of Pop, electrifying"
    },
    {
        name: "David Bowie",
        genre: "Rock / Art Rock",
        bpm_range: "90-140",
        instruments: "Guitar, synthesizer, bass, drums, vocals, saxophone",
        drum_style: "Art rock with experimental rhythm, electronic elements, varied tempos",
        language: "Anglais",
        prompt_audio_preset: "Art Rock, 120 BPM, London atmosphere, experimental synths, guitar, theatrical vocals, radio-ready avant-garde mix, wide stereo image",
        flow_signature: "Theatrical delivery, chameleon-like, experimental, British rock, iconic"
    },
    {
        name: "ABBA",
        genre: "Pop / Disco",
        bpm_range: "110-130",
        instruments: "Piano, synthesizer, bass, drums, strings, vocals",
        drum_style: "Disco-pop with four-on-the-floor, string arrangements, catchy rhythm",
        language: "Anglais",
        prompt_audio_preset: "Disco Pop, 122 BPM, Stockholm atmosphere, piano, synths, string sections, female vocals, radio-ready dance mix, wide stereo image",
        flow_signature: "Harmonic delivery, Swedish pop, disco groove, melodic, timeless"
    },
    {
        name: "Madonna",
        genre: "Pop / Dance",
        bpm_range: "110-130",
        instruments: "Synthesizer, drum machine, bass, guitar, vocals",
        drum_style: "Dance-pop with electronic beats, four-on-the-floor, club rhythm",
        language: "Anglais",
        prompt_audio_preset: "Dance Pop, 122 BPM, New York atmosphere, electronic beats, synths, powerful female vocal, radio-ready club mix, wide stereo image",
        flow_signature: "Confident delivery, dance-pop, provocative, Queen of Pop, empowering"
    },
    {
        name: "Prince",
        genre: "Pop / Funk / Rock",
        bpm_range: "100-140",
        instruments: "Guitar, synthesizer, bass, drums, vocals, piano",
        drum_style: "Funk-rock with tight groove, guitar riffs, electronic elements",
        language: "Anglais",
        prompt_audio_preset: "Pop Funk, 118 BPM, Minneapolis atmosphere, guitar, synths, funky bass, radio-ready polished mix, wide stereo image",
        flow_signature: "Sultry delivery, guitar virtuoso, Minneapolis sound, androgynous, electrifying"
    },
    {
        name: "Whitney Houston",
        genre: "R&B / Pop",
        bpm_range: "90-120",
        instruments: "Piano, bass, drums, synthesizer, strings, vocals",
        drum_style: "R&B-pop with smooth groove, orchestral elements, power ballad rhythm",
        language: "Anglais",
        prompt_audio_preset: "R&B Pop, 100 BPM, New York atmosphere, piano, strings, smooth drums, powerful female vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful delivery, melismatic runs, pop-R&B, diva, emotional"
    },
    {
        name: "Nirvana",
        genre: "Grunge / Rock",
        bpm_range: "100-140",
        instruments: "Guitar, bass, drums, vocals",
        drum_style: "Grunge with heavy guitar, dynamic shifts, raw drum sound",
        language: "Anglais",
        prompt_audio_preset: "Grunge Rock, 126 BPM, Seattle atmosphere, distorted guitar, heavy bass, raw drums, radio-ready alternative mix, wide stereo image",
        flow_signature: "Raw delivery, grunge aesthetic, dynamic quiet-loud, Seattle, iconic"
    },
    {
        name: "Tupac Shakur",
        genre: "Hip-Hop / Rap",
        bpm_range: "85-100",
        instruments: "Drum machine, sampler, bass, vocals",
        drum_style: "Hip-hop with boom-bap drums, sampled loops, West Coast groove",
        language: "Anglais",
        prompt_audio_preset: "West Coast Hip-Hop, 92 BPM, Los Angeles atmosphere, heavy bass, sampled drums, aggressive male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Poetic delivery, West Coast flow, socially conscious, rap legend, passionate"
    },
    {
        name: "The Notorious B.I.G.",
        genre: "Hip-Hop / Rap",
        bpm_range: "85-100",
        instruments: "Drum machine, sampler, bass, vocals",
        drum_style: "Hip-hop with boom-bap drums, sampled loops, East Coast groove",
        language: "Anglais",
        prompt_audio_preset: "East Coast Hip-Hop, 92 BPM, New York atmosphere, sampled drums, heavy bass, smooth male vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Smooth delivery, East Coast flow, storytelling, rap legend, confident"
    },
    {
        name: "Daft Punk",
        genre: "Electronic / House",
        bpm_range: "110-130",
        instruments: "Synthesizer, drum machine, sampler, vocoder, bass",
        drum_style: "House with four-on-the-floor, filtered synths, electronic percussion",
        language: "Anglais",
        prompt_audio_preset: "French House, 122 BPM, Paris atmosphere, filtered synths, four-on-the-floor, vocoder vocals, radio-ready dance mix, wide stereo image",
        flow_signature: "Robotic delivery, French house, electronic, futuristic, dancefloor"
    },
    {
        name: "Coldplay",
        genre: "Alternative Rock / Pop",
        bpm_range: "90-140",
        instruments: "Guitar, piano, bass, drums, synthesizer, vocals",
        drum_style: "Alternative rock with anthemic drums, piano ballads, atmospheric rhythm",
        language: "Anglais",
        prompt_audio_preset: "Alternative Rock, 118 BPM, London atmosphere, piano, guitar, atmospheric drums, anthemic male vocal, radio-ready modern mix, wide stereo image",
        flow_signature: "Anthemic delivery, British rock, emotional, Coldplay style, stadium"
    },
    {
        name: "Beyoncé",
        genre: "R&B / Pop",
        bpm_range: "90-130",
        instruments: "Percussion, bass, synthesizer, guitar, vocals, drum machine",
        drum_style: "R&B-pop with tight drums, electronic elements, danceable groove",
        language: "Anglais",
        prompt_audio_preset: "R&B Pop, 110 BPM, Houston atmosphere, percussion, synths, powerful female vocal, radio-ready polished mix, wide stereo image",
        flow_signature: "Powerful delivery, R&B-pop, dance moves, Queen Bey, empowering"
    },
    {
        name: "Rihanna",
        genre: "Pop / R&B",
        bpm_range: "90-130",
        instruments: "Synthesizer, drum machine, bass, guitar, vocals",
        drum_style: "Pop-R&B with electronic beats, Caribbean influences, club rhythm",
        language: "Anglais",
        prompt_audio_preset: "Pop R&B, 112 BPM, Caribbean atmosphere, synths, electronic drums, smooth female vocal, radio-ready club mix, wide stereo image",
        flow_signature: "Smooth delivery, pop-R&B, Caribbean vibe, dancehall influence, confident"
    },
    {
        name: "Lady Gaga",
        genre: "Pop / Dance",
        bpm_range: "110-130",
        instruments: "Synthesizer, drum machine, bass, guitar, vocals, piano",
        drum_style: "Dance-pop with electronic beats, four-on-the-floor, club rhythm",
        language: "Anglais",
        prompt_audio_preset: "Dance Pop, 122 BPM, New York atmosphere, electronic beats, synths, powerful female vocal, radio-ready club mix, wide stereo image",
        flow_signature: "Theatrical delivery, dance-pop, avant-garde, pop icon, electrifying"
    },
    {
        name: "Adele",
        genre: "Pop / Soul",
        bpm_range: "70-120",
        instruments: "Piano, bass, drums, strings, guitar, vocals",
        drum_style: "Soul-pop with organic groove, piano ballads, orchestral elements",
        language: "Anglais",
        prompt_audio_preset: "Soul Pop, 88 BPM, London atmosphere, piano, strings, soulful drums, powerful female vocal, radio-ready classic mix, wide stereo image",
        flow_signature: "Powerful delivery, soul-pop, emotional, British, heartfelt"
    },
    {
        name: "Taylor Swift",
        genre: "Pop / Country",
        bpm_range: "90-130",
        instruments: "Guitar, bass, drums, synthesizer, banjo, vocals",
        drum_style: "Pop-country with acoustic groove, electronic elements, catchy rhythm",
        language: "Anglais",
        prompt_audio_preset: "Pop Country, 110 BPM, Nashville atmosphere, guitar, synths, catchy drums, melodic female vocal, radio-ready modern mix, wide stereo image",
        flow_signature: "Storytelling delivery, pop-country, confessional, Swift style, catchy"
    },
    {
        name: "Ed Sheeran",
        genre: "Pop / Folk",
        bpm_range: "90-120",
        instruments: "Guitar, bass, drums, loop pedal, vocals",
        drum_style: "Pop-folk with acoustic groove, loop pedal layers, catchy rhythm",
        language: "Anglais",
        prompt_audio_preset: "Pop Folk, 104 BPM, London atmosphere, acoustic guitar, bass, catchy drums, male vocal, radio-ready modern mix, wide stereo image",
        flow_signature: "Loop pedal delivery, pop-folk, confessional, British, catchy"
    },
    // ============================================================
    // ORCHESTRAL / PHILHARMONIQUE - 10 Artistes
    // ============================================================
    {
        name: "Hans Zimmer",
        genre: "Orchestre Cinématographique / Film Score",
        bpm_range: "60-140",
        instruments: "French horns, taiko drums, deep sub-bass pedals, ethnic percussion, choir pads, modular synth, piano, brass section",
        drum_style: "Cinematic hybrid with thunderous taiko, heartbeat pulses, ethnic percussion layers, riser builds, explosive drops",
        language: "Anglais",
        prompt_audio_preset: "Hans Zimmer cinematic orchestral, hybrid score, 80 BPM, deep rumble bass, powerful French horns, taiko percussion, choir pads, emotional piano motif, rising crescendos, radio-ready cinematic mix, wide stereo image",
        flow_signature: "Emotional crescendo-driven delivery, spoken-word cinematics, soaring melodic hooks, layered choirs, epic dramatic builds",
    },
    {
        name: "John Williams",
        genre: "Orchestre Symphonique / Film Classique",
        bpm_range: "70-160",
        instruments: "Full symphony orchestra, French horns, trumpets, timpani, harp, strings, operatic choir",
        drum_style: "Heroic orchestral with majestic timpani, snare fanfares, celestial percussion, noble marches",
        language: "Anglais",
        prompt_audio_preset: "John Williams heroic orchestral, 120 BPM, sweeping strings, triumphant French horns, heroic brass fanfares, dynamic percussion, adventurous melody, radio-ready orchestral mix, wide stereo image",
        flow_signature: "Heroic melodic delivery, triumphant brass motifs, adventurous spirit, leitmotif storytelling, cinematic grandeur",
    },
    {
        name: "Ennio Morricone",
        genre: "Orchestre Western / Spaghetti Western",
        bpm_range: "60-130",
        instruments: "Whistled melody, gun-shot percussion, ooh-wah choir, electric guitar, violin, harmonica, brass",
        drum_style: "Spaghetti western with gunshot accents, whistled themes, dramatic silence, reverb-heavy percussion",
        language: "Italien",
        prompt_audio_preset: "Ennio Morricone Spaghetti Western, 90 BPM, whistled melody, gunshot percussion, ooh-ahh choir, reverb-soaked electric guitar, cinematic desert atmosphere, radio-ready western mix, wide stereo image",
        flow_signature: "Whistled melodic delivery, dramatic pauses, cinematic western vibe, haunting hooks, atmospheric",
    },
    {
        name: "John Barry",
        genre: "Orchestre Lounge / James Bond",
        bpm_range: "60-140",
        instruments: "Strings, brass, vibraphone, electric piano, surf guitar, choir",
        drum_style: "Jazzy orchestral with brushed swingers, vibraphone glissandi, moody bass lines, smooth grooves",
        language: "Anglais",
        prompt_audio_preset: "John Barry lush orchestral, 110 BPM, sweeping string sections, moody brass, vibraphone glissando, surf guitar twang, sophisticated lounge atmosphere, radio-ready cinematic mix, wide stereo image",
        flow_signature: "Sophisticated melodic delivery, seductive string lines, Bond-esque mood, velvet vocals, noir elegance",
    },
    {
        name: "Alexandre Desplat",
        genre: "Orchestre Élégant / Nuages",
        bpm_range: "60-120",
        instruments: "Delicate strings, woodwinds, harp, celesta, muted brass, choir, piano",
        drum_style: "Ethereal orchestral with soft mallets, gentle harp runs, minimalist percussion, silken textures",
        language: "Français",
        prompt_audio_preset: "Alexandre Desplat elegant orchestral, 84 BPM, delicate string tremolos, muted woodwinds, harp cascades, celesta sparkle, sophisticated cinematic atmosphere, radio-ready refined mix, wide stereo image",
        flow_signature: "Ethereal melodic delivery, delicate phrasing, sophisticated harmony, French cinematic elegance, floating",
    },
    {
        name: "James Newton Howard",
        genre: "Orchestre Dark / Supernatural",
        bpm_range: "60-130",
        instruments: "Full orchestra, choir, ethnic percussion, piano, celesta, low brass, organ",
        drum_style: "Dark cinematic with rumbling timpani, ethnic percussion layers, building tension, sudden silences",
        language: "Anglais",
        prompt_audio_preset: "James Newton Howard dark cinematic, 70 BPM, rumbling timpani, low brass growls, children choir, ethnic percussion, haunting piano, rising tension crescendos, radio-ready cinematic mix, wide stereo image",
        flow_signature: "Dark atmospheric delivery, tension-building, haunting melodies, supernatural vibe, dramatic dynamic shifts",
    },
    {
        name: "Ramin Djawadi",
        genre: "Orchestre Épique / Thème",
        bpm_range: "80-140",
        instruments: "Stark theme melody, choir, taiko, strings, brass, piano, ethnic percussion, harp",
        drum_style: "Epic rhythmic with driving taiko, percussive builds, melodic percussion, heroic fills",
        language: "Anglais",
        prompt_audio_preset: "Ramin Djawadi epic orchestral, 90 BPM, iconic main theme, powerful choir, taiko drums, soaring strings, triumphant brass, radio-ready epic mix, wide stereo image",
        flow_signature: "Iconic melodic delivery, memorable themes, epic build-ups, percussive drive, heroic",
    },
    {
        name: "Danny Elfman",
        genre: "Orchestre Dark / Tim Burton",
        bpm_range: "70-150",
        instruments: "Bass clarinet, pizzicato strings, celesta, brass stabs, choir, vibraphone, organ",
        drum_style: "Dark whimsical with quirky percussion, staccato strings, circus-like marches, gothic pulses",
        language: "Anglais",
        prompt_audio_preset: "Danny Elfman dark whimsical orchestral, 100 BPM, quirky piano, staccato strings, bass clarinet, celesta, twisted carnival atmosphere, radio-ready gothic mix, wide stereo image",
        flow_signature: "Whimsical dark delivery, quirky phrasing, gothic fairy-tale vibe, staccato hooks, cinematic weirdness",
    },
    {
        name: "Thomas Newman",
        genre: "Orchestre Contemplatif / Suspense",
        bpm_range: "50-110",
        instruments: "Solo piano, strings, choir, vibraphone, percussion swells, electronics, harp",
        drum_style: "Contemplative with ticking percussion, swelling strings, minimalist electronic pulses, subtle builds",
        language: "Anglais",
        prompt_audio_preset: "Thomas Newman contemplative cinematic, 72 BPM, solo piano motif, swelling string clusters, choir pads, vibraphone, suspenseful electronics, radio-ready atmospheric mix, wide stereo image",
        flow_signature: "Contemplative melodic delivery, minimalist phrasing, suspenseful builds, piano-driven, introspective",
    },
    {
        name: "Nobuo Uematsu",
        genre: "Orchestre Fantastique / Jeu Vidéo",
        bpm_range: "80-140",
        instruments: "Orchestral suite, choir, brass fanfares, piano, synth, ethnic percussion, harp, strings",
        drum_style: "Epic orchestral with fantasy percussion, rising choir, heroic drum fills, adventurous beats",
        language: "Anglais",
        prompt_audio_preset: "Nobuo Uematsu fantasy orchestral, 128 BPM, epic orchestral suite, heroic brass fanfares, choir, fantasy piano theme, cinematic RPG atmosphere, radio-ready orchestral mix, wide stereo image",
        flow_signature: "Epic melodic delivery, fantasy storytelling, choir-backed hooks, heroic themes, adventurous",
    },

    // ============================================================
    // OPÉRA / LYRIQUE - 10 Artistes
    // ============================================================
    {
        name: "Carmina Burana",
        genre: "Opéra / Cantate lyrique",
        bpm_range: "60-100",
        instruments: "Full orchestra, mixed choir, baryton, soprano, tenor, thunder sheets, timpani, organ",
        drum_style: "Ritualistic orchestral with thunder sheets, timpani rolls, primal percussion, fortissimo crashes",
        language: "Latin",
        prompt_audio_preset: "Carmina Burana choral operatic, 72 BPM, full orchestra, massive mixed choir, soprano and tenor soloists, thunderous percussion, dramatic fortissimo, radio-ready epic choral mix, wide stereo image",
        flow_signature: "Ritualistic choral delivery, soaring soprano and tenor lines, dramatic crescendo, Latin text intensity, apocalyptic grandeur",
    },
    {
        name: "Giuseppe Verdi",
        genre: "Opéra / Lyrique italien",
        bpm_range: "50-120",
        instruments: "Full orchestra, operatic choir, dramatic brass, strings, solo voices",
        drum_style: "Verismo operatic with dramatic timpani, stabbing brass, intense rhythmic drive, passionate crashes",
        language: "Italien",
        prompt_audio_preset: "Verdi Italian opera, 96 BPM, full romantic orchestra, dramatic brass, intense choir, powerful operatic tenor and soprano, passionate bel canto, radio-ready operatic mix, wide stereo image",
        flow_signature: "Passionate bel canto delivery, dramatic aria phrasing, intense emotional range, Italian operatic fervor, soaring melodic lines",
    },
    {
        name: "Giacomo Puccini",
        genre: "Opéra / Lyrique italien",
        bpm_range: "50-110",
        instruments: "Rich string section, woodwind solos, harp, operatic choir, soprano, tenor",
        drum_style: "Lyric operatic with gentle percussion, string tremolos, romantic orchestral swells, delicate accents",
        language: "Italien",
        prompt_audio_preset: "Puccini lyrical opera, 78 BPM, rich romantic orchestra, silken string melodies, harp cascades, operatic soprano and tenor, sweeping arias, radio-ready operatic mix, wide stereo image",
        flow_signature: "Lyrical bel canto delivery, silken phrasing, sweeping romantic melodies, Italian passion, aria-driven hooks",
    },
    {
        name: "Gaetano Donizetti",
        genre: "Opéra / Légèreté italienne",
        bpm_range: "90-140",
        instruments: "Light orchestra, flute, clarinet, operatic choir, coloratura soprano, tenor",
        drum_style: "Sparkling operatic with crisp cymbals, fluttering woodwinds, rapid rhythmic patter, lively accents",
        language: "Italien",
        prompt_audio_preset: "Donizetti bel canto opera, 110 BPM, sparkling orchestra, coloratura soprano flourishes, rapid patter arias, light elegant strings, radio-ready operatic mix, wide stereo image",
        flow_signature: "Coloratura delivery, rapid patter, bel canto agility, Italian sparkle, intricate melodic runs",
    },
    {
        name: "Gioachino Rossini",
        genre: "Opéra / Comique italien",
        bpm_range: "90-130",
        instruments: "Full orchestra, operatic choir, horns, bassoons, baritone, soprano, tenor",
        drum_style: "Comedic operatic with thunderous fanfares, crescendo gags, precise percussion, vivacious rhythm",
        language: "Italien",
        prompt_audio_preset: "Rossini Italian comic opera, 104 BPM, full orchestra, famous crescendo builds, baritone and soprano voices, comedic timing, radio-ready operatic mix, wide stereo image",
        flow_signature: "Comic operatic delivery, famous crescendo builds, baritone and soprano interplay, Italian wit, dramatic timing",
    },
    {
        name: "Wolfgang Amadeus Mozart",
        genre: "Opéra / Classique viennois",
        bpm_range: "70-140",
        instruments: "Classical orchestra, basset clarinet, fortepiano, operatic choir, soprano, tenor, bass",
        drum_style: "Classical operatic with elegance, clean percussion, graceful string work, refined rhythms",
        language: "Italien",
        prompt_audio_preset: "Mozart classical opera, 118 BPM, elegant classical orchestra, graceful string work, basset clarinet, refined operatic voices, sophisticated chamber feeling, radio-ready classical mix, wide stereo image",
        flow_signature: "Refined bel canto delivery, graceful phrasing, classical elegance, Mozartean wit, perfect melodic balance",
    },
    {
        name: "Richard Wagner",
        genre: "Opéra / Drame lyrique allemand",
        bpm_range: "40-120",
        instruments: "Massive orchestra, operatic choir, tubas, horns, low strings, soprano, bass, organ",
        drum_style: "Giant operatic with rolling timpani, massed brass, leitmotif-driven percussion, tectonic builds",
        language: "Allemand",
        prompt_audio_preset: "Wagner Germanic opera, 66 BPM, massive orchestra, leitmotif themes, deep brass, rolling timpani, operatic choir, radio-ready Wagnerian mix, wide stereo image",
        flow_signature: "Epic declaimed delivery, leitmotif-driven, Germanic grandeur, sprechgesang intensity, cyclical themes",
    },
    {
        name: "Georges Bizet",
        genre: "Opéra / French lyrique",
        bpm_range: "70-140",
        instruments: "Orchestra, operatic choir, Spanish guitar, castanets, soprano, baritone",
        drum_style: "Spanish-flavored operatic with castanets, rhythmic percussion, passionate drive, sultry accents",
        language: "Français",
        prompt_audio_preset: "Bizet French opera, 96 BPM, sultry orchestra, Spanish guitar accents, castanets, Carmen passion, operatic soprano and baritone, radio-ready operatic mix, wide stereo image",
        flow_signature: "Sultry operatic delivery, Spanish flair, Carmen seductive, French chanson influence, dramatic passion",
    },
    {
        name: "Jules Massenet",
        genre: "Opéra / French lyrique",
        bpm_range: "60-120",
        instruments: "Orchestra, operatic choir, harp, celesta, soprano, tenor",
        drum_style: "Elegant operatic with silken strings, harp arpeggios, refined percussion, graceful rhythms",
        language: "Français",
        prompt_audio_preset: "Massenet French opera, 76 BPM, elegant orchestra, silken string melodies, harp arpeggios, operatic soprano with jewel-like timbre, radio-ready refined mix, wide stereo image",
        flow_signature: "Ethereal operatic delivery, silken phrasing, jewel-like soprano, French elegance, lyrical grace",
    },
    {
        name: "Charles Gounod",
        genre: "Opéra / French lyrique",
        bpm_range: "60-130",
        instruments: "Orchestra, operatic choir, bells, cor anglais, soprano, tenor, baritone",
        drum_style: "Romantic operatic with bell chimes, cor anglais melancholy, sweeping strings, lush harmonies",
        language: "Français",
        prompt_audio_preset: "Gounod French opera, 80 BPM, romantic orchestra, bell chimes, cor anglais melodies, operatic voices, sweeping love themes, radio-ready romantic mix, wide stereo image",
        flow_signature: "Romantic operatic delivery, bell-like melodic phrasing, French romantic elegance, soaring love themes, lyrical",
    },
    // ============================================================
    // RETRO CONSOLE (4 artistes - chiptune / 8-16bit)
    // ============================================================
    {
        name: "Game Boy 8-bit",
        genre: "Chiptune / 8-bit Nintendo",
        bpm_range: "100-140",
        instruments: "Square wave synths, triangle wave bass, noise channel percussion, simple waveform melodies",
        drum_style: "Lo-fi chiptune percussion, noise channel drums, simple step sequencer patterns, 8-bit groove",
        language: "Instrumental",
        prompt_audio_preset: "chiptune 8-bit gameboy, 120 BPM, square wave synths, triangle wave bass, noise channel percussion, lo-fi retro, nostalgic video game atmosphere, instrumental",
        flow_signature: "Minimalist chiptune melodies, catchy square wave hooks, retro game nostalgia, lo-fi bleeps"
    },
    {
        name: "Mega Drive 16-bit",
        genre: "Chiptune / 16-bit Sega",
        bpm_range: "120-150",
        instruments: "FM synthesis, pulse wave leads, fast arpeggios, driving bass, metallic percussion",
        drum_style: "FM-synth drum kit, punchy kicks, metallic snare, fast hi-hat rolls, energetic 16-bit groove",
        language: "Instrumental",
        prompt_audio_preset: "16-bit megadrive genesis, 130 BPM, fm synthesis, pulse wave leads, fast arpeggios, driving bass, retro console, energetic, instrumental",
        flow_signature: "FM synth leads, energetic arpeggios, metallic percussion, action-packed 90s console vibe"
    },
    {
        name: "Super Nintendo 16-bit",
        genre: "Chiptune / 16-bit SNES",
        bpm_range: "90-130",
        instruments: "Sample-based synths, warm pads, melodic leads, brass stabs, lush strings samples",
        drum_style: "Sampled 16-bit drums, warm kick, crisp snare, melodic percussion, cinematic groove",
        language: "Instrumental",
        prompt_audio_preset: "16-bit super nintendo snes, 110 BPM, sample-based synths, warm pads, melodic leads, epic rpg atmosphere, nostalgic, instrumental",
        flow_signature: "Cinematic sample-based leads, warm brass stabs, epic RPG atmosphere, nostalgic melodic themes"
    },
    {
        name: "Mix Toutes Consoles",
        genre: "Chiptune / Retro Mix",
        bpm_range: "100-140",
        instruments: "Square waves, FM synthesis, sample-based synths, mix of 8-bit and 16-bit sounds",
        drum_style: "Hybrid chiptune percussion, 8-bit noise + 16-bit samples, mixed retro groove",
        language: "Instrumental",
        prompt_audio_preset: "retro console mix 8-16bit, 120 BPM, chiptune and fm synthesis blend, gameboy square waves, megadrive fm leads, snes pads, nostalgic video game vibe, instrumental",
        flow_signature: "Hybrid retro blend, mixes 8-bit chiptune with 16-bit FM/samples, nostalgic gaming mashup"
    },
];

// Export CommonJS pour utilisation côté serveur (Node.js)
// (le fichier reste utilisable tel quel dans le navigateur via la variable globale ARTISTS_DATABASE)
if (typeof module !== "undefined" && module.exports) {
    module.exports = { ARTISTS_DATABASE };
}
