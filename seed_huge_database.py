"""
seed_huge_database.py - Enrichissement des profils artistes avec des données
de production studio ultra-poussées.

Met à jour chaque artiste de la BDD avec :
- bpm_range exact
- instruments précis
- drum_style précis
- flow_signature (métrique et placement vocal)
- visual_aesthetic (ambiance visuelle)
- prompt_audio_preset (ingénierie sonore en anglais)
- prompt_image_preset (visuel 9:16 en anglais)

Utilise INSERT OR REPLACE sur le nom de l'artiste.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "music_bot.db")


def get_connection():
    """Retourne une connexion à la base SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================
# PROFILS STUDIO - France / Francophonie (14)
# ============================================================
# Ordre des champs :
# (name, genre, bpm_range, instruments, drum_style, language,
#  prompt_audio_preset, prompt_image_preset, flow_signature, visual_aesthetic)
FRENCH_ARTISTS = [
    (
        "Jul",
        "Drill Marseille",
        "138-142",
        "Minor key piano, detuned dark pads, plucked acoustic guitar, heavy brass stabs, reversed vocal chops",
        "Marseille drill sliding 808s, ghost snares, fast triplet hi-hats with pitch slides, heavy acoustic kick",
        "Français",
        "French Drill Marseille, 140 BPM, dark melancholic night atmosphere, minor key piano loop, sliding distorted 808 sub bass, crisp rapid hi-hats, heavy acoustic kick, auto-tuned melodic male vocal hook, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark urban Marseille night scene, neon blue and purple lighting, cinematic 35mm photography, grainy film texture, high fashion streetwear aesthetic, high contrast, ultra-detailed, no text, no watermark",
        "Melodic auto-tuned delivery, syncopated triplets, aggressive staccato verses transitioning into an anthemic, reverberated chorus",
        "Cinematic dark moody lighting, neon contrast, raw urban aesthetic, grainy 35mm film texture, high fashion streetwear",
    ),
    (
        "Ninho",
        "Rap / Trap FR",
        "125-130",
        "Melodic 808s, emotional piano, airy pads, soft plucks, subtle strings, warm bass",
        "French trap with melodic 808s, soft claps, crisp hi-hats, minimal percussion, smooth groove",
        "Français",
        "Modern French Melodic Trap, 128 BPM, moody melancholic night vibe, minor acoustic guitar loop, sliding distorted 808 sub bass, crisp rapid hi-hats, catchy auto-tuned melodic male vocal hook, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, Parisian luxury night aesthetic, moody dark blue and gold lighting, cinematic photography, high fashion urban style, high contrast, ultra-detailed, no text, no watermark",
        "Smooth melodic delivery, laid-back flow, emotional phrasing, catchy melodic hooks with autotune, intimate verses",
        "Moody Parisian night, luxury aesthetic, dark blue and gold tones, cinematic lighting, high-end fashion",
    ),
    (
        "Gazo",
        "Drill Paris",
        "142-148",
        "Sliding 808s, dark synth stabs, eerie pads, distorted bass, aggressive brass",
        "Parisian drill with sliding 808s, hard-hitting claps, fast triplet hi-hats, aggressive snare rolls",
        "Français",
        "Parisian Drill, 145 BPM, dark aggressive street atmosphere, sliding distorted 808 sub bass, eerie synth stabs, hard-hitting claps, fast triplet hi-hats, aggressive auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark Parisian street scene, graffiti and neon red lighting, cinematic gritty photography, raw urban aesthetic, high contrast, ultra-detailed, no text, no watermark",
        "Aggressive drill flow, rapid-fire delivery, hard-hitting punchlines, autotuned melodic chorus, confident swagger",
        "Dark Parisian streets, graffiti walls, neon red and black lighting, raw urban energy, cinematic grit",
    ),
    (
        "SDM",
        "Drill / Rap FR",
        "138-144",
        "Heavy 808s, dark piano, orchestral strings, cinematic brass, deep sub bass",
        "French drill with heavy 808s, orchestral snare rolls, fast hi-hats, dramatic percussion",
        "Français",
        "French Drill, 140 BPM, cinematic dark atmosphere, orchestral strings, heavy 808 sub bass, dramatic snare rolls, fast hi-hats, powerful auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, cinematic Parisian suburbs, dramatic dark lighting, film noir atmosphere, luxury urban aesthetic, high contrast, ultra-detailed, no text, no watermark",
        "Confident drill flow, powerful delivery, cinematic storytelling, anthemic choruses, commanding presence",
        "Cinematic Parisian suburbs, dramatic lighting, dark luxury aesthetic, film noir atmosphere",
    ),
    (
        "Tiakola",
        "Afro-trap / R&B",
        "105-112",
        "African percussion, melodic 808s, warm pads, plucked strings, soft brass, vocal chops",
        "Afro-trap with djembe percussion, soft claps, groovy hi-hats, melodic drum patterns",
        "Français",
        "Afro-Trap Fusion, 108 BPM, warm vibrant atmosphere, African percussion, melodic 808 sub bass, plucked strings, catchy auto-tuned melodic male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, vibrant African-inspired colors, warm golden lighting, modern urban aesthetic, cultural patterns, cinematic photography, high contrast, ultra-detailed, no text, no watermark",
        "Melodic afro-flow, smooth R&B delivery, catchy hooks, rhythmic phrasing, emotional verses",
        "Vibrant African-inspired colors, warm golden lighting, modern urban aesthetic, cultural patterns",
    ),
    (
        "Aya Nakamura",
        "Afro-pop / R&B",
        "98-104",
        "Afro percussion, bright synths, light bass, airy pads, soft guitar, vocal chops",
        "Afro-pop with light percussion, soft claps, groovy hi-hats, danceable rhythm",
        "Français",
        "Afro-Pop, 100 BPM, bright vibrant atmosphere, afro percussion, light bass, bright synths, catchy melodic female vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, colorful Parisian chic, elegant high fashion, bright vibrant lighting, cinematic photography, high contrast, ultra-detailed, no text, no watermark",
        "Playful melodic delivery, catchy hooks, rhythmic French-African flow, confident feminine energy",
        "Colorful Parisian chic, elegant fashion, bright lighting, vibrant colors, high fashion aesthetic",
    ),
    (
        "PLK",
        "Rap / Trap FR",
        "122-128",
        "Dark piano, 808s, moody pads, subtle strings, deep bass, vinyl crackle",
        "French trap with 808s, soft claps, laid-back hi-hats, minimal groove",
        "Français",
        "French Trap, 125 BPM, dark introspective atmosphere, minor piano loop, 808 sub bass, soft claps, laid-back hi-hats, melancholic auto-tuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark moody French urban scene, muted colors, cinematic shadows, introspective atmosphere, high contrast, ultra-detailed, no text, no watermark",
        "Laid-back flow, introspective lyrics, smooth delivery, melancholic melodies, authentic storytelling",
        "Dark moody atmosphere, French urban style, muted colors, cinematic shadows, introspective vibe",
    ),
    (
        "Theodora",
        "Rap / Drill FR",
        "135-142",
        "Heavy 808s, dark piano, orchestral strings, powerful brass, deep sub bass",
        "French drill with heavy 808s, powerful snare rolls, fast hi-hats, dramatic percussion",
        "Français",
        "French Drill, 138 BPM, dark powerful atmosphere, heavy 808 sub bass, dark piano, orchestral strings, powerful auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark powerful French urban scene, dramatic lighting, cinematic intensity, high contrast, ultra-detailed, no text, no watermark",
        "Powerful drill flow, commanding delivery, aggressive verses, anthemic choruses, strong presence",
        "Dark powerful aesthetic, dramatic lighting, French urban energy, cinematic intensity",
    ),
    (
        "SCH",
        "Rap / Trap FR",
        "122-128",
        "Cinematic synths, 808s, dark piano, orchestral elements, deep bass, atmospheric pads",
        "French trap with 808s, cinematic percussion, dramatic claps, atmospheric hi-hats",
        "Français",
        "French Trap, 125 BPM, cinematic dark atmosphere, orchestral synths, 808 sub bass, dramatic percussion, deep commanding male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, cinematic dark luxury, French rap aesthetic, dramatic film noir lighting, high contrast, ultra-detailed, no text, no watermark",
        "Cinematic flow, deep commanding voice, storytelling verses, dramatic delivery, powerful presence",
        "Cinematic dark luxury, French rap aesthetic, dramatic lighting, film noir atmosphere",
    ),
    (
        "Damso",
        "Rap / R&B",
        "92-98",
        "Dark piano, 808s, moody pads, deep bass, subtle strings, atmospheric textures",
        "Rap with 808s, soft claps, minimal hi-hats, dark groove",
        "Français",
        "Belgian Rap, 95 BPM, dark introspective atmosphere, minor piano, 808 sub bass, moody pads, deep emotional male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark artistic Belgian aesthetic, moody atmosphere, muted colors, cinematic shadows, high contrast, ultra-detailed, no text, no watermark",
        "Dark introspective flow, deep voice, philosophical lyrics, emotional delivery, unique phrasing",
        "Dark artistic aesthetic, moody Belgian atmosphere, muted colors, cinematic shadows",
    ),
    (
        "PNL",
        "Cloud Rap / Trap",
        "112-118",
        "Atmospheric synths, 808s, dreamy pads, ethereal textures, soft piano, vocal chops",
        "Cloud trap with 808s, soft claps, dreamy hi-hats, floating groove",
        "Français",
        "French Cloud Rap, 115 BPM, ethereal dreamy atmosphere, atmospheric synths, 808 sub bass, dreamy pads, autotuned melodic male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, ethereal dreamy cloud aesthetic, soft pastel colors, cinematic haze, high contrast, ultra-detailed, no text, no watermark",
        "Dreamy cloud flow, autotuned melodic delivery, ethereal harmonies, floating verses, atmospheric choruses",
        "Ethereal dreamy atmosphere, cloud aesthetic, soft pastel colors, cinematic haze",
    ),
    (
        "Werenoi",
        "Rap / Drill FR",
        "136-142",
        "Heavy 808s, dark piano, orchestral strings, deep sub bass, cinematic brass",
        "French drill with heavy 808s, powerful claps, fast hi-hats, dramatic percussion",
        "Français",
        "French Drill, 138 BPM, dark powerful atmosphere, heavy 808 sub bass, dark piano, orchestral strings, powerful auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark French urban scene, dramatic lighting, cinematic intensity, high contrast, ultra-detailed, no text, no watermark",
        "Confident drill flow, powerful delivery, anthemic choruses, commanding presence, hard-hitting verses",
        "Dark French urban aesthetic, dramatic lighting, cinematic intensity, raw energy",
    ),
    (
        "Zola",
        "Drill / Trap FR",
        "140-146",
        "Sliding 808s, dark synths, eerie pads, distorted bass, aggressive brass",
        "French drill with sliding 808s, hard claps, fast triplet hi-hats, aggressive snare rolls",
        "Français",
        "French Drill, 143 BPM, dark aggressive atmosphere, sliding 808 sub bass, eerie synths, hard claps, fast triplet hi-hats, aggressive auto-tuned male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark neon French urban scene, red and black lighting, cinematic gritty photography, high contrast, ultra-detailed, no text, no watermark",
        "Aggressive drill flow, rapid-fire delivery, autotuned melodic chorus, hard-hitting punchlines",
        "Dark neon aesthetic, French urban energy, red and black lighting, cinematic grit",
    ),
    (
        "Booba",
        "Rap / Trap FR",
        "122-128",
        "Heavy 808s, dark piano, cinematic synths, deep bass, orchestral elements",
        "French trap with heavy 808s, powerful claps, dramatic hi-hats, hard-hitting percussion",
        "Français",
        "French Rap, 125 BPM, dark powerful atmosphere, heavy 808 sub bass, dark piano, cinematic synths, deep commanding male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark luxury French rap aesthetic, dramatic lighting, high fashion urban style, high contrast, ultra-detailed, no text, no watermark",
        "Legendary flow, deep commanding voice, aggressive delivery, iconic punchlines, powerful presence",
        "Dark luxury aesthetic, French rap legend, dramatic lighting, high fashion urban style",
    ),
]

# ============================================================
# PROFILS STUDIO - US / UK (12)
# ============================================================
US_UK_ARTISTS = [
    (
        "Drake",
        "Hip-Hop / R&B",
        "88-96",
        "Emotional piano, warm strings, smooth 808s, soft pads, subtle guitar, vocal chops",
        "Hip-hop with smooth 808s, soft claps, laid-back hi-hats, R&B groove",
        "Anglais",
        "Melodic Hip-Hop R&B, 92 BPM, emotional night atmosphere, minor piano, warm strings, smooth 808 sub bass, soft claps, laid-back hi-hats, melodic auto-tuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, luxury moody Toronto night, dark blue and gold lighting, cinematic photography, high fashion urban style, high contrast, ultra-detailed, no text, no watermark",
        "Melodic R&B delivery, smooth flow, emotional phrasing, catchy hooks, intimate verses",
        "Luxury moody aesthetic, Toronto night, dark blue and gold tones, cinematic lighting",
    ),
    (
        "Kendrick Lamar",
        "Hip-Hop / Conscious Rap",
        "88-96",
        "Jazz samples, live drums, deep bass, piano, strings, brass, vinyl crackle",
        "Hip-hop with live drums, jazz percussion, soft claps, organic groove",
        "Anglais",
        "Conscious Hip-Hop, 92 BPM, jazz-influenced atmosphere, live drums, deep bass, piano, strings, storytelling male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, artistic Compton aesthetic, powerful imagery, cinematic lighting, raw urban energy, high contrast, ultra-detailed, no text, no watermark",
        "Conscious flow, storytelling delivery, complex rhyme schemes, powerful verses, dynamic delivery",
        "Artistic Compton aesthetic, powerful imagery, cinematic lighting, raw urban energy",
    ),
    (
        "Future",
        "Trap / Mumble Rap",
        "132-140",
        "Heavy 808s, dark synths, eerie pads, distorted bass, vocal chops",
        "Trap with heavy 808s, hard claps, fast hi-hats, aggressive snare rolls",
        "Anglais",
        "Heavy Trap, 136 BPM, dark futuristic atmosphere, heavy 808 sub bass, dark synths, hard claps, fast hi-hats, autotuned melodic male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark futuristic Atlanta night, neon purple lighting, cinematic haze, high contrast, ultra-detailed, no text, no watermark",
        "Melodic mumble flow, autotuned delivery, hypnotic melodies, ad-libs, atmospheric verses",
        "Dark futuristic aesthetic, Atlanta night, neon purple lighting, cinematic haze",
    ),
    (
        "Playboi Carti",
        "Trap / Experimental",
        "138-148",
        "Experimental synths, heavy 808s, distorted bass, eerie pads, vocal chops",
        "Experimental trap with heavy 808s, fast hi-hats, aggressive percussion, punk energy",
        "Anglais",
        "Experimental Trap, 142 BPM, avant-garde atmosphere, experimental synths, heavy 808 sub bass, distorted vocals, fast hi-hats, aggressive male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, avant-garde punk aesthetic, experimental fashion, dark neon lighting, high contrast, ultra-detailed, no text, no watermark",
        "Experimental flow, distorted vocals, punk energy, ad-libs, hypnotic repetition, aggressive delivery",
        "Avant-garde punk aesthetic, experimental fashion, dark neon lighting, raw energy",
    ),
    (
        "21 Savage",
        "Trap / Drill",
        "132-140",
        "Heavy 808s, dark piano, moody synths, deep bass, eerie pads",
        "Trap with heavy 808s, hard claps, fast hi-hats, dark groove",
        "Anglais",
        "Dark Trap, 136 BPM, dark moody atmosphere, heavy 808 sub bass, dark piano, moody synths, deep monotone male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark Atlanta aesthetic, moody lighting, raw urban energy, cinematic shadows, high contrast, ultra-detailed, no text, no watermark",
        "Deep monotone flow, aggressive delivery, dark storytelling, hard-hitting punchlines, cold delivery",
        "Dark Atlanta aesthetic, moody lighting, raw urban energy, cinematic shadows",
    ),
    (
        "Travis Scott",
        "Trap / Psychedelic",
        "132-140",
        "Psychedelic synths, heavy 808s, spacey pads, distorted bass, ad-libs, vocal chops",
        "Trap with heavy 808s, hard claps, fast hi-hats, psychedelic percussion",
        "Anglais",
        "Psychedelic Trap, 136 BPM, spacey atmosphere, psychedelic synths, heavy 808 sub bass, spacey pads, autotuned male vocal with ad-libs, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, psychedelic space aesthetic, dark clouds, neon purple, cosmic imagery, cinematic haze, high contrast, ultra-detailed, no text, no watermark",
        "Psychedelic flow, autotuned delivery, ad-libs, atmospheric verses, anthemic choruses, mumble melodies",
        "Psychedelic space aesthetic, dark clouds, neon purple, cosmic imagery, cinematic haze",
    ),
    (
        "Kanye West",
        "Hip-Hop / Experimental",
        "88-120",
        "Soul samples, piano, strings, live drums, experimental synths, choir vocals",
        "Hip-hop with soul samples, live drums, experimental percussion, gospel elements",
        "Anglais",
        "Experimental Hip-Hop, 100 BPM, soulful atmosphere, soul samples, piano, strings, live drums, innovative male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, avant-garde Chicago aesthetic, artistic vision, dramatic lighting, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Experimental flow, soulful delivery, gospel influences, innovative phrasing, powerful verses",
        "Avant-garde Chicago aesthetic, artistic vision, dramatic lighting, high fashion",
    ),
    (
        "Eminem",
        "Hip-Hop / Rap",
        "88-104",
        "Piano, bass, live drums, samples, strings, aggressive synths",
        "Hip-hop with live drums, hard claps, aggressive percussion, fast groove",
        "Anglais",
        "Rap, 96 BPM, aggressive atmosphere, piano, bass, live drums, rapid-fire male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, Detroit raw aesthetic, powerful imagery, cinematic lighting, urban intensity, high contrast, ultra-detailed, no text, no watermark",
        "Rapid-fire flow, complex rhyme schemes, aggressive delivery, technical precision, storytelling",
        "Detroit raw aesthetic, powerful imagery, cinematic lighting, urban intensity",
    ),
    (
        "Central Cee",
        "UK Drill / Rap",
        "138-144",
        "Dark piano, heavy 808s, orchestral strings, eerie pads, deep sub bass",
        "UK drill with heavy 808s, hard claps, fast hi-hats, aggressive snare rolls",
        "Anglais",
        "UK Drill, 140 BPM, dark London atmosphere, dark piano, heavy 808 sub bass, orchestral strings, hard claps, fast hi-hats, confident male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, London urban aesthetic, dark moody lighting, cinematic grit, street style, high contrast, ultra-detailed, no text, no watermark",
        "UK drill flow, confident delivery, melodic hooks, hard-hitting verses, London swagger",
        "London urban aesthetic, dark moody lighting, cinematic grit, street style",
    ),
    (
        "Lil Baby",
        "Trap / Rap",
        "124-132",
        "Melodic 808s, piano, soft synths, warm pads, subtle strings",
        "Trap with melodic 808s, soft claps, crisp hi-hats, smooth groove",
        "Anglais",
        "Melodic Trap, 128 BPM, emotional atmosphere, melodic 808 sub bass, piano, soft synths, autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, Atlanta luxury aesthetic, dark blue tones, cinematic lighting, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Melodic trap flow, autotuned delivery, catchy hooks, emotional verses, Atlanta swagger",
        "Atlanta luxury aesthetic, dark blue tones, cinematic lighting, high fashion",
    ),
    (
        "Young Thug",
        "Trap / Experimental",
        "124-136",
        "Experimental synths, 808s, melodic pads, vocal chops, distorted bass",
        "Trap with 808s, hard claps, fast hi-hats, experimental percussion",
        "Anglais",
        "Experimental Trap, 130 BPM, colorful atmosphere, experimental synths, 808 sub bass, melodic pads, unique autotuned male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, colorful experimental aesthetic, Atlanta fashion, vibrant lighting, avant-garde style, high contrast, ultra-detailed, no text, no watermark",
        "Experimental melodic flow, unique vocal style, autotuned delivery, unpredictable phrasing, ad-libs",
        "Colorful experimental aesthetic, Atlanta fashion, vibrant lighting, avant-garde style",
    ),
    (
        "Don Toliver",
        "Trap / R&B",
        "104-120",
        "Atmospheric synths, 808s, melodic pads, soft piano, dreamy textures",
        "Trap-R&B with 808s, soft claps, dreamy hi-hats, floating groove",
        "Anglais",
        "Trap R&B, 112 BPM, dreamy atmosphere, atmospheric synths, 808 sub bass, melodic pads, autotuned melodic male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dreamy Houston aesthetic, atmospheric lighting, soft colors, cinematic haze, high contrast, ultra-detailed, no text, no watermark",
        "Melodic R&B flow, autotuned delivery, dreamy vocals, emotional hooks, atmospheric verses",
        "Dreamy Houston aesthetic, atmospheric lighting, soft colors, cinematic haze",
    ),
]

# ============================================================
# PROFILS STUDIO - Latino / Reggaeton / Trap (10)
# ============================================================
LATINO_ARTISTS = [
    (
        "Bad Bunny",
        "Reggaeton / Latin Trap",
        "92-98",
        "Dem bow riddim, latin percussion, reggaeton bass, bright synths, guitar, vocal chops",
        "Reggaeton with dem bow, latin percussion, groovy claps, danceable rhythm",
        "Espagnol",
        "Latin Reggaeton, 95 BPM, vibrant tropical atmosphere, dem bow rhythm, latin percussion, reggaeton bass, bright synths, catchy autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, vibrant Puerto Rico aesthetic, tropical colors, neon lighting, high fashion urban, high contrast, ultra-detailed, no text, no watermark",
        "Melodic reggaeton flow, catchy hooks, rhythmic Spanish delivery, playful energy, autotuned vocals",
        "Vibrant Puerto Rico aesthetic, tropical colors, neon lighting, high fashion urban",
    ),
    (
        "Karol G",
        "Reggaeton / Latin Pop",
        "92-100",
        "Dem bow, latin percussion, bright synths, reggaeton bass, guitar, vocal chops",
        "Reggaeton with dem bow, latin percussion, groovy claps, danceable rhythm",
        "Espagnol",
        "Latin Reggaeton, 95 BPM, vibrant empowering atmosphere, dem bow rhythm, latin percussion, bright synths, reggaeton bass, powerful female vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, vibrant Colombian aesthetic, bold colors, high fashion, empowering imagery, high contrast, ultra-detailed, no text, no watermark",
        "Powerful female reggaeton flow, catchy hooks, confident delivery, rhythmic Spanish phrasing",
        "Vibrant Colombian aesthetic, bold colors, high fashion, empowering imagery",
    ),
    (
        "Rauw Alejandro",
        "Reggaeton / R&B",
        "94-102",
        "R&B synths, reggaeton bass, latin guitar, soft pads, sensual textures",
        "Reggaeton-R&B with dem bow, soft claps, groovy hi-hats, sensual groove",
        "Espagnol",
        "Reggaeton R&B, 98 BPM, sensual romantic atmosphere, R&B synths, reggaeton bass, latin guitar, smooth male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, romantic sunset aesthetic, warm colors, sensual lighting, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Sensual R&B flow, smooth delivery, romantic hooks, rhythmic Spanish phrasing, autotuned vocals",
        "Romantic sunset aesthetic, warm colors, sensual lighting, high fashion",
    ),
    (
        "Feid",
        "Reggaeton / Latin Trap",
        "92-100",
        "Dem bow, bright synths, reggaeton bass, melodic pads, vocal chops",
        "Reggaeton with dem bow, groovy claps, crisp hi-hats, danceable rhythm",
        "Espagnol",
        "Latin Reggaeton, 95 BPM, vibrant playful atmosphere, dem bow rhythm, bright synths, reggaeton bass, catchy autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, colorful Medellin aesthetic, vibrant colors, playful imagery, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Melodic reggaeton flow, catchy hooks, playful delivery, rhythmic Spanish phrasing, autotuned vocals",
        "Colorful Medellin aesthetic, vibrant colors, playful imagery, high fashion",
    ),
    (
        "Anuel AA",
        "Latin Trap / Reggaeton",
        "92-104",
        "Dark synths, 808s, latin percussion, reggaeton bass, eerie pads",
        "Latin trap with 808s, hard claps, fast hi-hats, aggressive percussion",
        "Espagnol",
        "Latin Trap, 98 BPM, dark aggressive atmosphere, dark synths, 808 sub bass, latin percussion, deep male vocal, radio-ready punchy mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, dark Puerto Rico aesthetic, moody lighting, raw urban energy, cinematic shadows, high contrast, ultra-detailed, no text, no watermark",
        "Aggressive latin trap flow, deep voice, hard-hitting delivery, autotuned melodic chorus",
        "Dark Puerto Rico aesthetic, moody lighting, raw urban energy, cinematic shadows",
    ),
    (
        "J Balvin",
        "Reggaeton / Latin Pop",
        "92-100",
        "Dem bow, bright synths, reggaeton bass, latin percussion, guitar, vocal chops",
        "Reggaeton with dem bow, groovy claps, danceable rhythm, latin percussion",
        "Espagnol",
        "Latin Reggaeton, 95 BPM, vibrant energetic atmosphere, dem bow rhythm, bright synths, reggaeton bass, latin percussion, catchy autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, vibrant Colombian aesthetic, bold colors, high fashion, energetic imagery, high contrast, ultra-detailed, no text, no watermark",
        "Catchy reggaeton flow, melodic hooks, playful delivery, rhythmic Spanish phrasing, autotuned vocals",
        "Vibrant Colombian aesthetic, bold colors, high fashion, energetic imagery",
    ),
    (
        "Myke Towers",
        "Reggaeton / Latin Trap",
        "92-102",
        "Dem bow, 808s, bright synths, reggaeton bass, melodic pads",
        "Reggaeton-trap with dem bow, 808s, groovy claps, crisp hi-hats",
        "Espagnol",
        "Reggaeton Trap, 96 BPM, modern atmosphere, dem bow rhythm, 808 sub bass, bright synths, melodic autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, modern Puerto Rico aesthetic, sleek design, vibrant colors, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Melodic reggaeton-trap flow, smooth delivery, catchy hooks, rhythmic Spanish phrasing, autotuned vocals",
        "Modern Puerto Rico aesthetic, sleek design, vibrant colors, high fashion",
    ),
    (
        "Ozuna",
        "Reggaeton / Latin Pop",
        "92-100",
        "Dem bow, bright synths, reggaeton bass, latin percussion, soft pads",
        "Reggaeton with dem bow, groovy claps, danceable rhythm, latin percussion",
        "Espagnol",
        "Latin Reggaeton, 95 BPM, romantic atmosphere, dem bow rhythm, bright synths, reggaeton bass, latin percussion, smooth autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, romantic Caribbean aesthetic, warm colors, sensual lighting, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Melodic reggaeton flow, romantic hooks, smooth delivery, rhythmic Spanish phrasing, autotuned vocals",
        "Romantic Caribbean aesthetic, warm colors, sensual lighting, high fashion",
    ),
    (
        "Maluma",
        "Reggaeton / Latin Pop",
        "92-100",
        "Dem bow, bright synths, reggaeton bass, latin guitar, soft pads",
        "Reggaeton with dem bow, groovy claps, danceable rhythm, latin percussion",
        "Espagnol",
        "Latin Reggaeton, 95 BPM, sensual romantic atmosphere, dem bow rhythm, bright synths, reggaeton bass, latin guitar, smooth autotuned male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, sensual Colombian aesthetic, warm colors, romantic lighting, high fashion, high contrast, ultra-detailed, no text, no watermark",
        "Sensual reggaeton flow, smooth delivery, romantic hooks, rhythmic Spanish phrasing, autotuned vocals",
        "Sensual Colombian aesthetic, warm colors, romantic lighting, high fashion",
    ),
    (
        "Peso Pluma",
        "Corridos Tumbados / Regional",
        "104-116",
        "Acoustic guitars, tuba, accordion, latin percussion, bass, vocal harmonies",
        "Corridos with acoustic guitars, tuba, percussion, regional groove",
        "Espagnol",
        "Corridos Tumbados, 110 BPM, regional Mexican atmosphere, acoustic guitars, tuba, accordion, latin percussion, nasal male vocal, radio-ready polished mix, wide stereo image",
        "Cover art design, 9:16 aspect ratio, regional Mexican aesthetic, desert tones, cinematic lighting, traditional-modern fusion, high contrast, ultra-detailed, no text, no watermark",
        "Regional Mexican flow, nasal vocal style, storytelling delivery, corridos phrasing, emotional hooks",
        "Regional Mexican aesthetic, desert tones, cinematic lighting, traditional-modern fusion",
    ),
]


def upsert_artists(conn, artists):
    """
    Insère ou remplace les artistes dans la table artists.

    Args:
        conn: Connexion SQLite.
        artists (list): Liste des tuples artistes.

    Returns:
        int: Nombre d'artistes mis à jour.
    """
    cursor = conn.cursor()
    updated = 0
    for artist in artists:
        result = cursor.execute("""
            INSERT OR REPLACE INTO artists
            (name, genre, bpm_range, instruments, drum_style, language,
             prompt_audio_preset, prompt_image_preset, flow_signature, visual_aesthetic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, artist)
        if result.rowcount > 0:
            updated += 1
    conn.commit()
    return updated


def main():
    """Exécute le script d'enrichissement des profils artistes."""
    print("=" * 60)
    print("🎨 ENRICHISSEMENT DES PROFILS ARTISTES (STUDIO)")
    print("=" * 60)

    conn = get_connection()

    # Vérification que les colonnes existent
    columns = [r[1] for r in conn.execute("PRAGMA table_info(artists)").fetchall()]
    if "flow_signature" not in columns or "visual_aesthetic" not in columns:
        print("❌ Colonnes flow_signature/visual_aesthetic manquantes.")
        print("   Exécutez d'abord : python migrate_artists.py")
        conn.close()
        return

    # Mise à jour des artistes
    print("\n🎤 Mise à jour des profils artistes...")
    fr_count = upsert_artists(conn, FRENCH_ARTISTS)
    us_count = upsert_artists(conn, US_UK_ARTISTS)
    latino_count = upsert_artists(conn, LATINO_ARTISTS)
    total = fr_count + us_count + latino_count
    print(f"   ✅ {fr_count} artistes FR/Francophonie mis à jour")
    print(f"   ✅ {us_count} artistes US/UK mis à jour")
    print(f"   ✅ {latino_count} artistes Latino mis à jour")

    # Vérification finale
    artist_total = conn.execute("SELECT COUNT(*) FROM artists").fetchone()[0]
    with_flow = conn.execute(
        "SELECT COUNT(*) FROM artists WHERE flow_signature IS NOT NULL AND flow_signature != ''"
    ).fetchone()[0]
    with_visual = conn.execute(
        "SELECT COUNT(*) FROM artists WHERE visual_aesthetic IS NOT NULL AND visual_aesthetic != ''"
    ).fetchone()[0]

    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ FINAL")
    print("=" * 60)
    print(f"   Total artistes dans la BDD : {artist_total}")
    print(f"   Artistes avec flow_signature : {with_flow}")
    print(f"   Artistes avec visual_aesthetic : {with_visual}")
    print(f"   Profils mis à jour : {total}")

    conn.close()
    print("\n✅ Profils artistes enrichis avec succès !")


if __name__ == "__main__":
    main()