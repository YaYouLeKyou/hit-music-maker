/* ============================================================
   DJ Pro - Music Hit Maker
   Logique : decks, play/stop, auto-mix, jingles, scraping.
   ============================================================ */

"use strict";

const $ = id => document.getElementById(id);

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function toast(message, type = "success") {
    const colors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-purple-600", warning: "bg-amber-500 text-black" };
    const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info", warning: "fa-triangle-exclamation" };
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
        toast(successMsg || "Copié !");
    } catch (_) {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        toast(successMsg || "Copié !");
    }
}

// ------------------------------------------------------------
// État DJ
// ------------------------------------------------------------

let state = {
    djStyle: "",
    vibe: "groove",
    duration: 60,
    autoMode: true,
    deckA: null,
    deckB: null,
    set: [],
    playing: false,
    currentDeck: "A",
    crossfade: 50,
    volA: 80,
    volB: 80
};

// ------------------------------------------------------------
// Helpers UI
// ------------------------------------------------------------

function populateDjStyles() {
    const select = $("dj-style");
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">-- Choisir un style DJ --</option>' +
        getAllDjStyles().map(s => `<option value="${s.id}">${escapeHtml(s.label)} (${s.vibe})</option>`).join("");
    if (current) select.value = current;
}

function populateDeckSelect(selectId) {
    const select = $(selectId);
    if (!select) return;
    const current = select.value;
    let options = '<option value="">-- Choisir une piste --</option>';

    if (state.djStyle) {
        const artists = getArtistsForDjStyle(state.djStyle);
        artists.forEach(a => {
            const minBpm = parseInt(a.bpm_range.split("-")[0]) || 120;
            options += `<option value="${escapeHtml(a.name)}" data-bpm="${minBpm}" data-energy="6" data-key="Am" data-artist="${escapeHtml(a.name)}" data-source="database">${escapeHtml(a.name)} (${escapeHtml(a.genre)})</option>`;
        });
    }

    const scraped = getScrapedTracks(state.djStyle);
    scraped.forEach(t => {
        options += `<option value="${escapeHtml(t.title)}" data-bpm="${t.bpm}" data-energy="${t.energy}" data-key="${t.key}" data-artist="${escapeHtml(t.artist)}" data-source="scrape">${escapeHtml(t.title)} - ${escapeHtml(t.artist)} (${t.bpm} BPM)</option>`;
    });

    select.innerHTML = options;
    if (current) select.value = current;
}

function getTrackFromSelect(selectId) {
    const select = $(selectId);
    if (!select || !select.value) return null;
    const option = select.selectedOptions[0];
    const isScrape = option && option.dataset.source === "scrape";
    return {
        title: select.value,
        artist: option ? (option.dataset.artist || select.value) : select.value,
        bpm: option ? (parseInt(option.dataset.bpm) || 120) : 120,
        energy: option ? (parseInt(option.dataset.energy) || 5) : 5,
        key: option ? (option.dataset.key || "Am") : "Am",
        source: isScrape ? "scrape" : "database"
    };
}

function updateDeckUI(deck, track) {
    const prefix = deck === "A" ? "deck-a" : "deck-b";
    const led = $(`led-${deck.toLowerCase()}`);
    const waveform = document.querySelector(`#deck-${deck.toLowerCase()} .waveform`);

    if (!track) {
        $(`${prefix}-bpm`).textContent = "--";
        $(`${prefix}-key`).textContent = "--";
        $(`${prefix}-energy`).textContent = "--";
        if (led) led.classList.remove("on");
        if (waveform) waveform.classList.remove("playing");
        return;
    }

    $(`${prefix}-bpm`).textContent = track.bpm;
    $(`${prefix}-key`).textContent = track.key;
    $(`${prefix}-energy`).textContent = `${track.energy}/10`;
    if (led) led.classList.add("on");
    if (state.playing && state.currentDeck === deck && waveform) waveform.classList.add("playing");
}

function updateMasterInfo() {
    const active = state.currentDeck === "A" ? state.deckA : state.deckB;
    if (!active) {
        $("master-bpm").textContent = "--";
        $("master-key").textContent = "--";
        $("master-energy").textContent = "--";
        return;
    }
    $("master-bpm").textContent = active.bpm;
    $("master-key").textContent = active.key;
    $("master-energy").textContent = `${active.energy}/10`;
}

function refreshSetList() {
    const container = $("set-list");
    const empty = $("set-empty");
    if (!container) return;
    if (!state.set.length) {
        container.innerHTML = "";
        if (empty) empty.classList.remove("hidden");
        return;
    }
    if (empty) empty.classList.add("hidden");
    container.innerHTML = state.set.map((t, i) => `
        <div class="flex items-center justify-between bg-[#0f0f1a] rounded-lg p-3 border border-purple-900/60">
            <div>
                <div class="font-semibold text-slate-200">${i + 1}. ${escapeHtml(t.title)}</div>
                <div class="text-[11px] text-slate-400">${escapeHtml(t.artist || "")} · ${t.bpm} BPM · ${t.key} · ${t.energy}/10</div>
            </div>
            <button data-remove="${i}" class="text-xs text-red-300 hover:text-red-200 transition"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join("");
    container.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.remove);
            state.set.splice(idx, 1);
            refreshSetList();
        });
    });
}

// ------------------------------------------------------------
// Jingles
// ------------------------------------------------------------

function generateJingles() {
    const style = getDjStyleById(state.djStyle);
    const base = style ? style.label : "DJ";
    const types = [
        { label: "Intro", icon: "fa-play", prompt: `Intro ${base}, 30s, énétique, voix énergique, prêt à mixer.` },
        { label: "Transition", icon: "fa-shuffle", prompt: `Transition ${base}, 15s, filtre, bouclage, prépare le changement de piste.` },
        { label: "Drop", icon: "fa-bolt", prompt: `Drop ${base}, 10s, impact, kick lourd, annonce le beat.` },
        { label: "Outro", icon: "fa-flag-checkered", prompt: `Outro ${base}, 30s, fade out, ambiance, fin de set.` },
        { label: "Scratch", icon: "fa-hand-sparkles", prompt: `Scratch ${base}, 8s, scratch rapide, effet vinyl, transition hip-hop.` },
        { label: "Build-up", icon: "fa-arrow-trend-up", prompt: `Build-up ${base}, 20s, montée en tension, filter sweep, prépare le drop.` }
    ];

    const container = $("jingles-list");
    if (!container) return;
    container.innerHTML = types.map((j, i) => `
        <div class="jingle-card rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                    <i class="fa-solid ${j.icon} text-amber-300"></i>
                    <span class="text-sm font-semibold text-slate-200">${j.label}</span>
                </div>
                <button data-jingle="${i}" class="copy-jingle text-xs px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-white transition"><i class="fa-regular fa-copy mr-1"></i>Copier</button>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">${escapeHtml(j.prompt)}</p>
        </div>
    `).join("");

    container.querySelectorAll(".copy-jingle").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.jingle);
            copyToClipboard(types[idx].prompt, `Prompt jingle "${types[idx].label}" copié !`);
        });
    });
}

// ------------------------------------------------------------
// Scraping simulé
// ------------------------------------------------------------

function runScrape() {
    const status = $("scrape-status");
    const results = $("scrape-results");
    if (status) status.textContent = "Scraping en cours...";
    if (results) results.innerHTML = "";

    setTimeout(() => {
        const tracks = getScrapedTracks(state.djStyle);
        if (results) {
            results.innerHTML = tracks.slice(0, 6).map(t => `
                <div class="flex items-center justify-between bg-[#0f0f1a] rounded-lg p-2 border border-purple-900/60">
                    <div>
                        <div class="text-slate-200">${escapeHtml(t.title)}</div>
                        <div class="text-[11px] text-slate-400">${escapeHtml(t.artist)} · ${t.bpm} BPM · ${t.energy}/10</div>
                    </div>
                    <button data-scrape-id="${t.id}" class="text-[11px] px-2 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white transition add-scrape">Ajouter</button>
                </div>
            `).join("");

            results.querySelectorAll(".add-scrape").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.dataset.scrapeId;
                    const track = getScrapedTrackById(id);
                    if (track) {
                        state.set.push({ ...track });
                        refreshSetList();
                        toast("Piste ajoutée au set.", "success");
                    }
                });
            });
        }
        if (status) status.textContent = `Scraping terminé : ${tracks.length} titres trouvés.`;
        toast("Scraping terminé.", "success");
    }, 800);
}

// ------------------------------------------------------------
// Auto-Mix
// ------------------------------------------------------------

function generateAutoMix() {
    const style = getDjStyleById(state.djStyle);
    if (!style) { toast("Choisissez un style DJ.", "warning"); return; }

    const candidates = getArtistsForDjStyle(state.djStyle);
    const scraped = getScrapedTracks(state.djStyle);
    const pool = [
        ...candidates.map(a => ({
            title: a.name,
            artist: a.name,
            bpm: parseInt(a.bpm_range.split("-")[0]) || 120,
            energy: 6,
            key: "Am",
            source: "database"
        })),
        ...scraped
    ];

    if (!pool.length) { toast("Aucune piste disponible pour ce style.", "error"); return; }

    const count = Math.max(4, Math.min(12, Math.floor(state.duration / 5)));
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const set = shuffled.slice(0, count);
    state.set = set;
    if (set[0]) state.deckA = set[0];
    if (set[1]) state.deckB = set[1];

    refreshSetList();
    updateDeckUI("A", state.deckA);
    updateDeckUI("B", state.deckB);
    updateMasterInfo();
    toast(`Set généré : ${count} pistes.`, "success");
}

// ------------------------------------------------------------
// Play / Stop
// ------------------------------------------------------------

function togglePlay() {
    state.playing = !state.playing;
    const btn = $("btn-master-play");
    const deckAWaveform = document.querySelector("#deck-a .waveform");
    const deckBWaveform = document.querySelector("#deck-b .waveform");

    if (state.playing) {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-stop mr-1"></i>Stop';
        if (state.currentDeck === "A" && deckAWaveform) deckAWaveform.classList.add("playing");
        if (state.currentDeck === "B" && deckBWaveform) deckBWaveform.classList.add("playing");
        toast("Lecture en cours...", "info");
    } else {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1"></i>Play / Stop';
        if (deckAWaveform) deckAWaveform.classList.remove("playing");
        if (deckBWaveform) deckBWaveform.classList.remove("playing");
        toast("Lecture arrêtée.", "info");
    }
}

function playDeck(deck) {
    state.currentDeck = deck;
    const deckAWaveform = document.querySelector("#deck-a .waveform");
    const deckBWaveform = document.querySelector("#deck-b .waveform");
    if (deckAWaveform) deckAWaveform.classList.remove("playing");
    if (deckBWaveform) deckBWaveform.classList.remove("playing");

    if (state.playing) {
        if (deck === "A" && deckAWaveform) deckAWaveform.classList.add("playing");
        if (deck === "B" && deckBWaveform) deckBWaveform.classList.add("playing");
    }
    updateMasterInfo();
}

// ------------------------------------------------------------
// Crossfader & volumes
// ------------------------------------------------------------

function updateCrossfader(value) {
    state.crossfade = parseInt(value);
    const volA = 100 - state.crossfade;
    const volB = state.crossfade;
    $("vol-a").value = volA;
    $("vol-b").value = volB;
    state.volA = volA;
    state.volB = volB;
    $("vol-a-val").textContent = `${volA}%`;
    $("vol-b-val").textContent = `${volB}%`;
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------

function init() {
    populateDjStyles();

    const deckASelect = $("deck-a-select");
    const deckBSelect = $("deck-b-select");
    if (deckASelect) {
        deckASelect.addEventListener("change", () => {
            state.deckA = getTrackFromSelect("deck-a-select");
            updateDeckUI("A", state.deckA);
            updateMasterInfo();
        });
    }
    if (deckBSelect) {
        deckBSelect.addEventListener("change", () => {
            state.deckB = getTrackFromSelect("deck-b-select");
            updateDeckUI("B", state.deckB);
            updateMasterInfo();
        });
    }

    $("dj-style")?.addEventListener("change", e => {
        state.djStyle = e.target.value;
        populateDeckSelect("deck-a-select");
        populateDeckSelect("deck-b-select");
        generateJingles();
    });

    $("dj-vibe")?.addEventListener("change", e => { state.vibe = e.target.value; });
    $("dj-duration")?.addEventListener("change", e => { state.duration = parseInt(e.target.value) || 60; });

    $("btn-toggle-mode")?.addEventListener("click", () => {
        state.autoMode = !state.autoMode;
        toast(state.autoMode ? "Mode Auto" : "Mode Manuel", "info");
    });

    $("btn-auto-mix")?.addEventListener("click", generateAutoMix);

    $("btn-deck-a-play")?.addEventListener("click", () => {
        playDeck("A");
        if (!state.playing) togglePlay();
    });
    $("btn-deck-b-play")?.addEventListener("click", () => {
        playDeck("B");
        if (!state.playing) togglePlay();
    });

    $("btn-master-play")?.addEventListener("click", togglePlay);

    $("btn-deck-a-scrape")?.addEventListener("click", () => {
        populateDeckSelect("deck-a-select");
        toast("Suggestions scraping chargées.", "success");
    });

    $("btn-deck-b-suggest")?.addEventListener("click", () => {
        const suggestions = getLocalSuggestions(state.deckA, state.djStyle, 5);
        const select = $("deck-b-select");
        if (!select || !suggestions.length) { toast("Aucune suggestion.", "warning"); return; }
        const first = suggestions[0];
        select.value = first.title;
        state.deckB = first;
        updateDeckUI("B", state.deckB);
        updateMasterInfo();
        toast("Suggestion IA appliquée dans le Deck B.", "success");
    });

    $("btn-clear-set")?.addEventListener("click", () => {
        state.set = [];
        state.deckA = null;
        state.deckB = null;
        refreshSetList();
        updateDeckUI("A", null);
        updateDeckUI("B", null);
        updateMasterInfo();
    });

    $("btn-regen-jingles")?.addEventListener("click", () => {
        if (!state.djStyle) { toast("Choisissez un style DJ.", "warning"); return; }
        generateJingles();
        toast("Jingles régénérés.", "success");
    });

    $("btn-scrape-enrich")?.addEventListener("click", runScrape);

    $("crossfader")?.addEventListener("input", e => updateCrossfader(e.target.value));
    $("vol-a")?.addEventListener("input", e => { state.volA = parseInt(e.target.value); $("vol-a-val").textContent = `${state.volA}%`; });
    $("vol-b")?.addEventListener("input", e => { state.volB = parseInt(e.target.value); $("vol-b-val").textContent = `${state.volB}%`; });

    generateJingles();
    updateCrossfader(50);

    initSampler();
}

// ------------------------------------------------------------
// Sampler / Beatmaker
// ------------------------------------------------------------

function initSampler() {
    const padDefs = [
        { type: "kick", label: "Kick", key: "Q" },
        { type: "snare", label: "Snare", key: "W" },
        { type: "hihat", label: "Hi-Hat", key: "E" },
        { type: "openhat", label: "Open HH", key: "R" },
        { type: "clap", label: "Clap", key: "A" },
        { type: "tom", label: "Tom", key: "S" },
        { type: "rim", label: "Rim", key: "D" },
        { type: "cowbell", label: "Cowbell", key: "F" },
        { type: "fx", label: "FX", key: "Z" },
        { type: "vocal", label: "Vocal", key: "X" },
        { type: "kick", label: "Kick 2", key: "C" },
        { type: "snare", label: "Snare 2", key: "V" },
        { type: "hihat", label: "HH 2", key: "1" },
        { type: "openhat", label: "Open HH2", key: "2" },
        { type: "clap", label: "Clap 2", key: "3" },
        { type: "fx", label: "FX 2", key: "4" }
    ];

    sampler.pads = padDefs.map((def, i) => ({ id: i, ...def, volume: 0.8 }));

    const padsContainer = $("sampler-pads");
    const gridContainer = $("sampler-grid");
    if (!padsContainer || !gridContainer) return;

    padsContainer.innerHTML = "";
    gridContainer.innerHTML = "";

    sampler.pads.forEach((pad, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sampler-pad";
        btn.dataset.pad = i;
        btn.innerHTML = `<span>${escapeHtml(pad.label)}</span><span class="pad-key">${pad.key}</span>`;
        btn.addEventListener("click", () => onPadHit(i));
        btn.addEventListener("pointerdown", (e) => { e.preventDefault(); onPadHit(i); });
        padsContainer.appendChild(btn);
    });

    for (let step = 0; step < 16; step++) {
        const stepEl = document.createElement("div");
        stepEl.className = "sampler-step";
        stepEl.dataset.step = step;
        stepEl.addEventListener("click", () => {
            const padId = sampler.pads.length > 0 ? sampler.pads[0].id : null;
            if (padId === null) return;
            const active = sampler.toggleStep(step, padId);
            updateStepUI(step);
        });
        gridContainer.appendChild(stepEl);
    }

    sampler.onStepChange = (step) => {
        document.querySelectorAll(".sampler-step").forEach((el, i) => {
            el.classList.toggle("current", i === step);
        });
    };

    const bpmInput = $("sampler-bpm");
    if (bpmInput) {
        bpmInput.addEventListener("input", () => {
            sampler.setBPM(bpmInput.value);
        });
    }

    $("btn-sampler-play")?.addEventListener("click", () => {
        if (sampler.isPlaying) {
            sampler.stopSequencer();
            setSamplerStatus("Arrêté");
        } else {
            sampler.init();
            sampler.startSequencer();
            setSamplerStatus("Lecture…");
        }
    });

    $("btn-sampler-record")?.addEventListener("click", () => {
        if (sampler.isRecording) {
            const notes = sampler.stopRecording();
            sampler.playRecording(notes);
            setSamplerStatus(`Loop enregistrée : ${notes.length} notes`);
        } else {
            sampler.init();
            sampler.startRecording();
            setSamplerStatus("Enregistrement…");
        }
    });

    $("btn-sampler-export")?.addEventListener("click", async () => {
        setSamplerStatus("Export en cours…");
        try {
            const buffer = await sampler.exportLoop();
            if (!buffer) {
                setSamplerStatus("Rien à exporter.");
                return;
            }
            const wav = bufferToWav(buffer);
            const blob = new Blob([wav], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `loop-${Date.now()}.wav`;
            a.click();
            URL.revokeObjectURL(url);
            setSamplerStatus("Export WAV OK");
        } catch (err) {
            console.error(err);
            setSamplerStatus("Export impossible");
        }
    });

    $("btn-sampler-clear")?.addEventListener("click", () => {
        sampler.clearGrid();
        sampler.stopSequencer();
        sampler.stopRecording();
        document.querySelectorAll(".sampler-step").forEach(el => el.classList.remove("active", "current"));
        setSamplerStatus("Grille vidée");
    });

    $("btn-tap-tempo")?.addEventListener("click", () => {
        const now = performance.now();
        if (!window._tapTimes) window._tapTimes = [];
        window._tapTimes.push(now);
        if (window._tapTimes.length > 4) window._tapTimes.shift();
        if (window._tapTimes.length >= 2) {
            let sum = 0;
            for (let i = 1; i < window._tapTimes.length; i++) sum += window._tapTimes[i] - window._tapTimes[i - 1];
            const avg = sum / (window._tapTimes.length - 1);
            const bpm = Math.round(60000 / avg);
            sampler.setBPM(bpm);
            if (bpmInput) bpmInput.value = bpm;
        }
    });

    $("btn-sampler-ai-pack")?.addEventListener("click", async () => {
        const style = state.djStyle || "électro / urbain";
        const bpm = sampler.bpm;
        const provider = ($("provider-select") && $("provider-select").value) || "groq";
        setSamplerStatus("Génération du pack IA…");
        try {
            const res = await fetch("/api/samples/generate-pack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ style, bpm, count: 8, provider })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            if (data.samples && data.samples.length) {
                sampler.pads = data.samples.map((s, i) => ({ id: i, type: s.type || "fx", label: s.label || `Sample ${i + 1}`, volume: 0.8 }));
                sampler.packName = data.packName || "Pack IA";
                refreshPadUI();
                setSamplerStatus(`Pack IA chargé : ${data.samples.length} samples`);
                toast(`Pack IA généré : ${data.samples.length} samples`, "success");
            } else {
                setSamplerStatus("Pack vide");
            }
        } catch (err) {
            console.error(err);
            setSamplerStatus("Échec génération pack");
            toast("Échec de la génération du pack IA.", "error");
        }
    });

    const keyMap = {};
    sampler.pads.forEach((pad, i) => { keyMap[pad.key.toLowerCase()] = i; });

    window.addEventListener("keydown", (e) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();
        const index = keyMap[key];
        if (index !== undefined) {
            e.preventDefault();
            onPadHit(index);
        }
        if (e.code === "Space") {
            e.preventDefault();
            $("btn-sampler-play")?.click();
        }
    });
}

function onPadHit(index) {
    sampler.togglePad(index);
    if (sampler.isRecording) sampler.recordNote(index);
}

function updateStepUI(step) {
    const el = document.querySelector(`.sampler-step[data-step="${step}"]`);
    if (!el) return;
    const active = sampler.grid[step] && sampler.grid[step].includes(sampler.pads[0]?.id);
    el.classList.toggle("active", !!active);
}

function setSamplerStatus(text) {
    const el = $("sampler-status");
    if (el) el.textContent = text;
}

function refreshPadUI() {
    const padsContainer = $("sampler-pads");
    if (!padsContainer) return;
    padsContainer.innerHTML = "";
    sampler.pads.forEach((pad, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sampler-pad";
        btn.dataset.pad = i;
        btn.innerHTML = `<span>${escapeHtml(pad.label)}</span><span class="pad-key">${pad.key}</span>`;
        btn.addEventListener("click", () => onPadHit(i));
        btn.addEventListener("pointerdown", (e) => { e.preventDefault(); onPadHit(i); });
        padsContainer.appendChild(btn);
    });
}

function bufferToWav(buffer) {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const data = buffer.getChannelData(0);
    const dataLength = data.length * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;
    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    function writeString(offset, str) {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeString(0, "RIFF");
    view.setUint32(4, totalLength - 8, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < data.length; i++) {
        const sample = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    return arrayBuffer;
}

document.addEventListener("DOMContentLoaded", init);
