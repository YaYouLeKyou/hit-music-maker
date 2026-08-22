/**
 * Music Hit Maker Studio - Logique frontend
 * Gestion des blocs réordonnables, appels API Groq, historique et localStorage.
 */

"use strict";

// ============================================================
// Constantes & état
// ============================================================

const LS_API_KEY = "mhms_groq_api_key";
const LS_HISTORY = "mhms_history";
const LS_STUDIO = "mhms_studio_state";

const BLOCK_TYPES = ["Intro", "Couplet 1", "Couplet 2", "Pré-refrain", "Refrain", "Pont", "Outro"];

const BLOCK_ICONS = {
    "Intro": "fa-play",
    "Couplet 1": "fa-microphone-lines",
    "Couplet 2": "fa-microphone-lines",
    "Pré-refrain": "fa-arrow-trend-up",
    "Refrain": "fa-star",
    "Pont": "fa-bridge",
    "Outro": "fa-flag-checkered"
};

const BLOCK_COLORS = {
    "Intro": "border-sky-500/60",
    "Couplet 1": "border-purple-500/60",
    "Couplet 2": "border-purple-500/60",
    "Pré-refrain": "border-amber-500/60",
    "Refrain": "border-fuchsia-500/70",
    "Pont": "border-teal-500/60",
    "Outro": "border-rose-500/60"
};

const STYLE_PRESETS = [
    {
        label: "Afro-Pop / Aya Nakamura Style",
        value: "afro-pop, 102 BPM, female french vocals, catchy melodic hooks, log drum, afrobeat percussion, modern pop production, radio-ready mix"
    },
    {
        label: "Cyberpunk Synthwave",
        value: "synthwave, 110 BPM, dark analog synths, retro 80s drums, neon atmosphere, male vocals with reverb, cyberpunk aesthetic, cinematic"
    },
    {
        label: "Acoustic Pop-Rock",
        value: "acoustic pop-rock, 124 BPM, strummed acoustic guitar, live drums, warm male vocals, anthemic chorus, organic production, stadium energy"
    },
    {
        label: "Rap / Trap FR",
        value: "french trap, 140 BPM, 808 bass, hi-hat rolls, dark piano melody, autotuned male rap vocals, drill influence, hard-hitting"
    },
    {
        label: "Ballade Piano",
        value: "emotional piano ballad, 68 BPM, grand piano, strings, soft female vocals, intimate, cinematic build-up, heartfelt"
    },
    {
        label: "EDM Festival",
        value: "progressive house EDM, 128 BPM, big drop, supersaw synths, festival energy, female topline vocals, euphoric, club mix"
    }
];

/** État du studio */
let state = {
    stylePrompt: "",
    blocks: [] // [{ type, text }]
};

/** Historique des morceaux */
let history = [];

// ============================================================
// Utilitaires
// ============================================================

const $ = (id) => document.getElementById(id);

const NL = String.fromCharCode(10); // saut de ligne fiable

function escapeHtml(str) {
    const map = {
        "&": "\x26amp;",
        "<": "\x26lt;",
        ">": "\x26gt;",
        '"': "\x26quot;",
        "'": "\x26#39;"
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
    $("toast-container").appendChild(el);
    setTimeout(() => {
        el.style.transition = "opacity .3s, transform .3s";
        el.style.opacity = "0";
        el.style.transform = "translateX(20px)";
        setTimeout(() => el.remove(), 320);
    }, 3200);
}

async function copyToClipboard(text, successMsg) {
    try {
        await navigator.clipboard.writeText(text);
        toast(successMsg || "Copié dans le presse-papiers !");
    } catch (_) {
        // Fallback pour contextes non sécurisés (http://localhost est OK, mais par prudence)
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        toast(successMsg || "Copié dans le presse-papiers !");
    }
}

function getApiKey() {
    return localStorage.getItem(LS_API_KEY) || "";
}

// ============================================================
// Persistance (localStorage)
// ============================================================

function saveStudioState() {
    localStorage.setItem(LS_STUDIO, JSON.stringify({
        stylePrompt: state.stylePrompt,
        blocks: state.blocks
    }));
}

function loadStudioState() {
    try {
        const raw = localStorage.getItem(LS_STUDIO);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.stylePrompt = typeof parsed.stylePrompt === "string" ? parsed.stylePrompt : "";
            state.blocks = Array.isArray(parsed.blocks)
                ? parsed.blocks.filter(b => b && typeof b.type === "string").map(b => ({ type: b.type, text: typeof b.text === "string" ? b.text : "" }))
                : [];
        }
    } catch (_) { /* état corrompu : on repart à zéro */ }
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(LS_HISTORY);
        history = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(history)) history = [];
    } catch (_) {
        history = [];
    }
}

function persistHistory() {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
}

// ============================================================
// Rendu des blocs (Studio)
// ============================================================

function renderBlocks() {
    const container = $("blocks-container");
    container.innerHTML = "";

    $("blocks-empty").classList.toggle("hidden", state.blocks.length > 0);

    state.blocks.forEach((block, index) => {
        const icon = BLOCK_ICONS[block.type] || "fa-music";
        const color = BLOCK_COLORS[block.type] || "border-purple-500/60";

        const card = document.createElement("div");
        card.className = `block-card rounded-xl bg-[#221d42] border-l-4 ${color} border border-purple-900/50 p-4 shadow-md`;
        card.draggable = true;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-grip-vertical text-gray-600 cursor-grab" title="Glisser pour réordonner"></i>
                    <i class="fa-solid ${icon} text-fuchsia-400"></i>
                    <select data-action="type" class="rounded-md bg-[#12101f] border border-purple-800/70 px-2 py-1 text-sm font-semibold outline-none focus:border-fuchsia-500">
                        ${BLOCK_TYPES.map(t => `<option value="${escapeHtml(t)}" ${t === block.type ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}
                    </select>
                </div>
                <div class="flex items-center gap-1">
                    <button data-action="up" title="Monter" class="w-8 h-8 rounded-md bg-purple-900/50 hover:bg-purple-700 text-sm transition" ${index === 0 ? "disabled" : ""}>
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                    <button data-action="down" title="Descendre" class="w-8 h-8 rounded-md bg-purple-900/50 hover:bg-purple-700 text-sm transition" ${index === state.blocks.length - 1 ? "disabled" : ""}>
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                    <button data-action="delete" title="Supprimer" class="w-8 h-8 rounded-md bg-red-900/50 hover:bg-red-600 text-sm transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <textarea data-action="text" rows="4" placeholder="Paroles de cette section…"
                class="w-full rounded-lg bg-[#12101f] border border-purple-900/60 focus:border-fuchsia-500 outline-none p-3 text-sm leading-relaxed placeholder-gray-600">${escapeHtml(block.text)}</textarea>
        `;

        // --- Événements du bloc ---
        card.querySelector('[data-action="type"]').addEventListener("change", (e) => {
            state.blocks[index].type = e.target.value;
            saveStudioState();
            updatePreview();
        });

        card.querySelector('[data-action="text"]').addEventListener("input", (e) => {
            state.blocks[index].text = e.target.value;
            saveStudioState();
            updatePreview();
        });

        card.querySelector('[data-action="up"]').addEventListener("click", () => moveBlock(index, -1));
        card.querySelector('[data-action="down"]').addEventListener("click", () => moveBlock(index, 1));
        card.querySelector('[data-action="delete"]').addEventListener("click", () => {
            state.blocks.splice(index, 1);
            saveStudioState();
            renderBlocks();
            updatePreview();
            toast("Bloc supprimé.", "info");
        });

        // --- Drag & drop ---
        card.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", String(index));
            e.dataTransfer.effectAllowed = "move";
            card.style.opacity = "0.4";
        });
        card.addEventListener("dragend", () => { card.style.opacity = "1"; });
        card.addEventListener("dragover", (e) => {
            e.preventDefault();
            card.classList.add("drag-over");
        });
        card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
        card.addEventListener("drop", (e) => {
            e.preventDefault();
            card.classList.remove("drag-over");
            const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
            const to = index;
            if (!isNaN(from) && from !== to) {
                const [moved] = state.blocks.splice(from, 1);
                state.blocks.splice(to, 0, moved);
                saveStudioState();
                renderBlocks();
                updatePreview();
            }
        });

        container.appendChild(card);
    });
}

function moveBlock(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= state.blocks.length) return;
    const [moved] = state.blocks.splice(index, 1);
    state.blocks.splice(target, 0, moved);
    saveStudioState();
    renderBlocks();
    updatePreview();
}

// ============================================================
// Aperçu Lyrics Prompt
// ============================================================

function buildLyricsPrompt() {
    return state.blocks
        .map(b => "[" + b.type + "]\n" + b.text.trim())
        .join("\n\n");
}

function updatePreview() {
    $("lyrics-preview").textContent = buildLyricsPrompt() || "— L'aperçu de vos paroles apparaîtra ici —";
}

// ============================================================
// [FONCTIONNALITÉ COMMENTÉE] Clé API Groq côté client
// ------------------------------------------------------------
// La clé est actuellement fournie via le fichier .env du serveur
// (GROQ_API_KEY). Pour réactiver la saisie de clé dans l'interface
// (usage multi-utilisateurs), décommentez cette section ainsi que :
//   - le bouton/bandeau/modale dans public/index.html
//   - les écouteurs dans init() ci-dessous
//   - l'appel à refreshApiKeyUi() dans init()
// ============================================================

/*
function refreshApiKeyUi() {
    const key = getApiKey();
    const hasKey = key.length > 0;
    const label = $("api-key-label");
    const btn = $("btn-api-key");

    label.textContent = hasKey ? `Clé : ${key.slice(0, 6)}…${key.slice(-4)}` : "Clé API manquante";
    btn.className = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition " +
        (hasKey
            ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : "border-red-500/60 bg-red-500/10 text-red-300 hover:bg-red-500/20");

    $("api-warning-banner").classList.toggle("hidden", hasKey);
}

function openApiKeyModal() {
    $("api-key-input").value = getApiKey();
    $("modal-api-key").classList.remove("hidden");
    $("api-key-input").focus();
}

function closeApiKeyModal() {
    $("modal-api-key").classList.add("hidden");
}
*/

// ============================================================
// Génération IA via Groq (relai serveur local)
// ============================================================

/**
 * Génère la chanson via Groq.
 * @param {boolean} isAutoMode - Mode Création Auto : thème profond inventé par l'IA
 * et artiste choisi aléatoirement dans la BDD studio.
 */
async function generateWithGroq(isAutoMode = false) {
    // [FONCTIONNALITÉ COMMENTÉE] Saisie de clé côté client.
    // La clé est chargée automatiquement depuis .env par le serveur.

    let theme = $("gen-theme").value.trim();
    const targetArtist = $("artist-style") ? $("artist-style").value : "";
    const styleLibre = $("gen-style").value.trim();

    // Le style libre est fusionné dans le thème s'il est renseigné
    if (!isAutoMode && styleLibre) {
        theme = (theme ? theme + ". " : "") + "Style cible libre : " + styleLibre;
    }

    const btn = isAutoMode ? $("btn-auto") : $("btn-generate");
    const originalHtml = btn.innerHTML;

    hideGenError();
    hideGenInfo();
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Composition…';
    btn.classList.add("generating");

    try {
        // Réactivation future de la clé client : ajouter "apiKey" au payload
        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                theme: isAutoMode ? "" : theme,
                targetArtist: isAutoMode ? "" : targetArtist,
                isAutoMode: Boolean(isAutoMode)
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `Erreur serveur (${res.status})`);
        }

        // Mise à jour dynamique de l'interface
        if (data.stylePrompt) {
            state.stylePrompt = data.stylePrompt;
            $("style-prompt").value = data.stylePrompt;
        }
        if (Array.isArray(data.blocks) && data.blocks.length > 0) {
            state.blocks = data.blocks;
        }

        saveStudioState();
        renderBlocks();
        updatePreview();

        // Affiche le thème généré et l'artiste utilisé
        showGenInfo(data.generatedTheme, data.artistUsed, isAutoMode);
        toast("Composition générée avec succès ! 🎵");
    } catch (err) {
        showGenError(err.message || "Échec de la génération.");
        toast("Échec de la génération IA.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        btn.classList.remove("generating");
    }
}

function showGenInfo(generatedTheme, artistUsed, isAutoMode) {
    const el = $("gen-info");
    if (!generatedTheme && !artistUsed) {
        el.classList.add("hidden");
        return;
    }
    el.innerHTML =
        '<i class="fa-solid fa-' + (isAutoMode ? "wand-sparkles" : "circle-info") + ' mr-1"></i>' +
        "<strong>" + escapeHtml(artistUsed || "Artiste Polyvalent") + "</strong>" +
        (generatedTheme ? " — Thème : " + escapeHtml(generatedTheme) : "");
    el.classList.remove("hidden");
}

function hideGenInfo() {
    $("gen-info").classList.add("hidden");
}

function showGenError(msg) {
    const el = $("gen-error");
    el.textContent = msg;
    el.classList.remove("hidden");
}

function hideGenError() {
    $("gen-error").classList.add("hidden");
}

// ============================================================
// Génération musicale automatique via Suno
// ============================================================

let sunoPollTimer = null;

/** Étapes affichées dans le loader pendant la génération Suno */
const SUNO_STEPS = [
    "Envoi du morceau à Suno",
    "Écriture et composition de la chanson",
    "Enregistrement des voix et des instruments",
    "Mixage et mastering de votre hit",
    "Préparation du lecteur audio"
];

/** Affiche/masque le loader et met à jour texte + barre de progression */
function setMusicStatus(text, percent) {
    const el = $("music-status");
    if (!text) {
        el.classList.add("hidden");
        return;
    }
    $("music-status-text").textContent = text;
    const bar = $("music-progress-bar");
    const p = Math.max(0, Math.min(100, percent || 0));
    bar.style.width = p + "%";
    el.classList.remove("hidden");
}

/** Met à jour la liste des étapes (terminées / en cours / à venir) */
function renderSunoSteps(currentIndex) {
    const ul = $("music-steps");
    ul.innerHTML = SUNO_STEPS.map((label, i) => {
        let icon, cls;
        if (i < currentIndex) {
            icon = "fa-circle-check";
            cls = "text-emerald-400";
        } else if (i === currentIndex) {
            icon = "fa-spinner fa-spin";
            cls = "text-fuchsia-400";
        } else {
            icon = "fa-circle";
            cls = "text-gray-600";
        }
        return `<li class="flex items-center gap-2 ${i === currentIndex ? "text-gray-100 font-semibold" : i < currentIndex ? "text-gray-400" : "text-gray-500"}">
            <i class="fa-solid ${icon} ${cls} w-4"></i><span>${escapeHtml(label)}</span>
        </li>`;
    }).join("");
}

/** Dérive un titre de morceau depuis le thème ou la première ligne des paroles */
function deriveSongTitle() {
    const theme = $("gen-theme").value.trim();
    if (theme) return theme.split(/[.!?]/)[0].slice(0, 60);
    const firstLine = state.blocks.map(b => b.text.trim()).find(t => t && !t.startsWith("["));
    return firstLine ? firstLine.slice(0, 60) : "Sans titre";
}

/** Soumet le morceau à Suno puis, en cas d'échec, bascule automatiquement sur Udio */
async function generateMusicOnSuno() {
    const lyrics = buildLyricsPrompt();
    const style = state.stylePrompt.trim();

    if (!lyrics && !style) {
        toast("Ajoutez d'abord un style ou des paroles dans le Studio.", "warning");
        return;
    }

    const btn = $("btn-generate-music");
    btn.disabled = true;
    $("music-result").innerHTML = "";
    renderSunoSteps(0);
    setMusicStatus("Étape 1/5 — Envoi du morceau à Suno…", 5);

    const payload = { title: deriveSongTitle(), stylePrompt: style, lyrics };
    let provider = "suno";
    let taskId = null;
    let sunoError = null;

    // --- Tentative 1 : Suno ---
    try {
        const res = await fetch("/api/suno/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi à Suno.");
        taskId = data.taskId;
    } catch (err) {
        sunoError = err.message || "Erreur Suno inconnue";
    }

    // --- Fallback : Udio (si Suno a échoué) ---
    if (!taskId) {
        provider = "udio";
        renderSunoSteps(0);
        setMusicStatus("Suno indisponible — bascule automatique vers Udio…", 8);
        try {
            const res2 = await fetch("/api/udio/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data2 = await res2.json();
            if (!res2.ok) throw new Error(data2.error || "Erreur lors de l'envoi à Udio.");
            taskId = data2.taskId;
        } catch (err2) {
            setMusicStatus(null);
            btn.disabled = false;
            const msg = "Échec sur les deux fournisseurs." + NL + "• Suno : " + (sunoError || "?") + NL + "• Udio : " + (err2.message || "?");
            showMusicError(msg);
            toast("Échec de la génération sur Suno et Udio.", "error");
            return;
        }
    }

    renderSunoSteps(1);
    setMusicStatus("Musique en cours de génération par " + (provider === "udio" ? "Udio" : "Suno") + " (1 à 3 minutes)…", 15);
    pollMusicStatus(taskId, 0, provider);
}

/** Interroge périodiquement le statut de la tâche (Suno ou Udio) jusqu'à obtention de l'audio */
function pollMusicStatus(taskId, attempt, provider) {
    const MAX_ATTEMPTS = 50; // ~5 minutes à 6 s d'intervalle

    if (attempt >= MAX_ATTEMPTS) {
        finishSunoPolling(false, "Délai dépassé : la génération prend trop de temps.", null, provider);
        return;
    }

    fetch(`/api/${provider}/status/` + encodeURIComponent(taskId))
        .then(r => r.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            if (data.status === "SUCCESS") {
                if (data.tracks && data.tracks.length > 0) {
                    finishSunoPolling(true, null, data.tracks, provider);
                } else {
                    finishSunoPolling(false, "Génération terminée mais aucune piste audio retournée.", null, provider);
                }
                return;
            }

            if (/FAILED|ERROR/i.test(data.status)) {
                const detail = data.detail ? " — " + data.detail : "";
                finishSunoPolling(false, "La génération a échoué côté " + (provider === "udio" ? "Udio" : "Suno") + " (" + data.status + ")" + detail + ".", provider);
                return;
            }

            // Progression estimée : 15% -> 95% sur ~5 minutes
            const percent = Math.min(95, 15 + attempt * 2);
            const stepIndex = percent >= 75 ? 3 : percent >= 45 ? 2 : 1;
            renderSunoSteps(stepIndex);

            const elapsed = attempt * 6;
            const mm = Math.floor(elapsed / 60);
            const ss = String(elapsed % 60).padStart(2, "0");
            setMusicStatus("Génération en cours via " + (provider === "udio" ? "Udio" : "Suno") + "… (" + mm + ":" + ss + ") — vos pistes arrivent bientôt !", percent);
            sunoPollTimer = setTimeout(() => pollMusicStatus(taskId, attempt + 1, provider), 6000);
        })
        .catch(err => finishSunoPolling(false, err.message || "Erreur pendant le suivi de la génération.", provider));
}

/** Affiche une erreur de génération dans la zone de résultat */
function showMusicError(message) {
    $("music-result").innerHTML =
        '<div class="rounded-xl bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-300">' +
        '<i class="fa-solid fa-triangle-exclamation mr-2"></i>' + escapeHtml(message) + "</div>";
}

function finishSunoPolling(success, errorMsg, tracks, provider) {
    clearTimeout(sunoPollTimer);
    $("btn-generate-music").disabled = false;

    if (!success) {
        setMusicStatus(null);
        showMusicError(errorMsg || "Échec de la génération.");
        toast(errorMsg || "Échec de la génération.", "error");
        return;
    }

    renderSunoSteps(SUNO_STEPS.length);
    setMusicStatus("Votre musique est prête ! 🎉", 100);
    setTimeout(() => setMusicStatus(null), 1500);
    renderMusicTracks(tracks, provider);
    saveSongWithTracks(tracks, provider);
    toast("Musique générée via " + (provider === "udio" ? "Udio" : "Suno") + " et sauvegardée ! 🎧");
}

/** Affiche les pistes générées avec bouton play / pause */
function renderMusicTracks(tracks, provider) {
    const container = $("music-result");
    container.innerHTML = "";

    tracks.forEach((track, i) => {
        const url = track.audioUrl || track.streamAudioUrl;
        if (!url) return;

        const card = document.createElement("div");
        card.className = "rounded-xl bg-[#221d42] border border-fuchsia-700/50 p-4 flex items-center gap-4 shadow-lg";

        card.innerHTML = `
            <button data-action="play" title="Écouter"
                class="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white text-lg transition shadow-lg">
                <i class="fa-solid fa-play"></i>
            </button>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-sm truncate">${escapeHtml(track.title || "Piste " + (i + 1))}</p>
                <p class="text-xs text-gray-400">${track.duration ? Math.round(track.duration) + " s · " : ""}Généré par ${provider === "udio" ? "Udio" : "Suno"}</p>
            </div>
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener" download title="Télécharger"
               class="w-9 h-9 rounded-lg bg-purple-900/60 hover:bg-purple-700 flex items-center justify-center text-sm transition">
                <i class="fa-solid fa-download"></i>
            </a>
            <audio preload="none" src="${escapeHtml(url)}"></audio>
        `;

        const playBtn = card.querySelector('[data-action="play"]');
        const audio = card.querySelector("audio");

        playBtn.addEventListener("click", () => {
            // Stoppe les autres lecteurs de la page
            document.querySelectorAll("audio").forEach(a => { if (a !== audio) a.pause(); });
            if (audio.paused) { audio.play(); } else { audio.pause(); }
        });
        audio.addEventListener("play", () => { playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; });
        audio.addEventListener("pause", () => { playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; });

        container.appendChild(card);
    });
}

/** Sauvegarde automatiquement le morceau généré (avec pistes audio) dans l'historique */
function saveSongWithTracks(tracks, provider) {
    const song = {
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        date: new Date().toISOString(),
        provider: provider === "udio" ? "udio" : "suno",
        stylePrompt: state.stylePrompt.trim(),
        blocks: state.blocks.map(b => ({ type: b.type, text: b.text })),
        tracks: tracks.map(t => ({
            id: t.id,
            title: t.title,
            audioUrl: t.audioUrl || t.streamAudioUrl,
            duration: t.duration
        }))
    };

    history.unshift(song);
    persistHistory();
    renderHistory();
}

// ============================================================
// Historique
// ============================================================

function saveCurrentSong() {
    if (state.blocks.length === 0 && !state.stylePrompt.trim()) {
        toast("Rien à sauvegarder : ajoutez des blocs ou un style.", "warning");
        return;
    }

    const song = {
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        date: new Date().toISOString(),
        stylePrompt: state.stylePrompt.trim(),
        blocks: state.blocks.map(b => ({ type: b.type, text: b.text }))
    };

    history.unshift(song);
    persistHistory();
    renderHistory();
    toast("Morceau sauvegardé dans l'historique !");
}

function deleteSong(id) {
    history = history.filter(s => s.id !== id);
    persistHistory();
    renderHistory();
    toast("Morceau supprimé de l'historique.", "info");
}

function loadSongIntoStudio(id) {
    const song = history.find(s => s.id === id);
    if (!song) return;

    state.stylePrompt = song.stylePrompt || "";
    state.blocks = (song.blocks || []).map(b => ({ type: b.type, text: b.text }));

    $("style-prompt").value = state.stylePrompt;
    saveStudioState();
    renderBlocks();
    updatePreview();
    switchTab("studio");
    toast("Morceau rechargé dans le Studio !");
}

function renderHistory() {
    const container = $("history-container");
    container.innerHTML = "";

    $("history-count").textContent = String(history.length);
    $("history-empty").classList.toggle("hidden", history.length > 0);

    history.forEach(song => {
        const dateStr = new Date(song.date).toLocaleString("fr-FR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        const lyrics = (song.blocks || [])
            .map(b => "[" + b.type + "]\n" + b.text.trim())
            .join("\n\n");
        const refArtist = extractRefArtist(song.stylePrompt);

        const card = document.createElement("div");
        card.className = "rounded-2xl bg-[#1c1836] border border-purple-800/60 p-5 shadow-lg flex flex-col gap-3";

        card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div>
                    <p class="text-xs text-gray-500"><i class="fa-regular fa-calendar mr-1"></i>${escapeHtml(dateStr)}</p>
                    <p class="text-sm font-semibold text-fuchsia-300 mt-1">
                        <i class="fa-solid fa-user-music mr-1"></i>${escapeHtml(refArtist || "Style libre")}
                    </p>
                </div>
                <button data-action="delete" title="Supprimer" class="w-8 h-8 rounded-md bg-red-900/50 hover:bg-red-600 text-sm transition shrink-0">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>

            <div>
                <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-bold text-cyan-400 uppercase tracking-wide">Style Prompt</p>
                    <button data-action="copy-style" class="text-xs px-2 py-1 rounded bg-cyan-700/70 hover:bg-cyan-600 text-white transition">
                        <i class="fa-regular fa-copy mr-1"></i>Copier
                    </button>
                </div>
                <p class="text-xs bg-[#12101f] rounded-lg border border-purple-900/60 p-3 text-gray-300 max-h-24 overflow-y-auto">${escapeHtml(song.stylePrompt || "—")}</p>
            </div>

            <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-bold text-emerald-400 uppercase tracking-wide">Paroles</p>
                    <button data-action="copy-lyrics" class="text-xs px-2 py-1 rounded bg-emerald-700/70 hover:bg-emerald-600 text-white transition">
                        <i class="fa-regular fa-copy mr-1"></i>Copier
                    </button>
                </div>
                <pre class="text-xs bg-[#12101f] rounded-lg border border-purple-900/60 p-3 text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">${escapeHtml(lyrics || "—")}</pre>
            </div>

            ${(song.tracks && song.tracks.length) ? `
            <div class="space-y-2">
                <p class="text-xs font-bold text-fuchsia-400 uppercase tracking-wide"><i class="fa-solid fa-headphones mr-1"></i>Audio généré</p>
                ${song.tracks.map(t => `
                <div class="rounded-lg bg-[#12101f] border border-fuchsia-900/50 p-2">
                    <p class="text-xs font-semibold text-gray-200 mb-1 truncate"><i class="fa-solid fa-music text-fuchsia-400 mr-1"></i>${escapeHtml(t.title || "Piste")}</p>
                    <audio controls preload="none" src="${escapeHtml(t.audioUrl)}" class="w-full h-8"></audio>
                </div>`).join("")}
            </div>` : ""}

            <button data-action="load" class="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition">
                <i class="fa-solid fa-folder-open mr-1"></i>Recharger dans le Studio
            </button>
        `;

        card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteSong(song.id));
        card.querySelector('[data-action="copy-style"]').addEventListener("click", () => copyToClipboard(song.stylePrompt, "Style Prompt copié !"));
        card.querySelector('[data-action="copy-lyrics"]').addEventListener("click", () => copyToClipboard(lyrics, "Paroles copiées !"));
        card.querySelector('[data-action="load"]').addEventListener("click", () => loadSongIntoStudio(song.id));

        container.appendChild(card);
    });
}

/** Tente d'extraire un artiste / style de référence lisible du Style Prompt */
function extractRefArtist(stylePrompt) {
    if (!stylePrompt) return "";
    const firstPart = stylePrompt.split(/[,;]/)[0].trim();
    return firstPart.length > 60 ? firstPart.slice(0, 57) + "…" : firstPart;
}

// ============================================================
// Navigation par onglets
// ============================================================

function switchTab(tab) {
    const isStudio = tab === "studio";

    $("view-studio").classList.toggle("hidden", !isStudio);
    $("view-history").classList.toggle("hidden", isStudio);

    const activeCls = "tab-btn px-4 py-2 rounded-lg text-sm font-semibold transition bg-purple-600 text-white shadow";
    const idleCls = "tab-btn px-4 py-2 rounded-lg text-sm font-semibold transition bg-transparent text-gray-300 hover:bg-purple-900/40";

    $("tab-studio").className = isStudio ? activeCls : idleCls;
    $("tab-history").className = isStudio ? idleCls : activeCls;

    if (!isStudio) renderHistory();
}

// ============================================================
// Initialisation & écouteurs globaux
// ============================================================

function initPresets() {
    const container = $("preset-buttons");
    STYLE_PRESETS.forEach(preset => {
        const btn = document.createElement("button");
        btn.className = "px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-900/60 hover:bg-fuchsia-600 border border-purple-700/60 transition";
        btn.textContent = preset.label;
        btn.addEventListener("click", () => {
            $("style-prompt").value = preset.value;
            state.stylePrompt = preset.value;
            saveStudioState();
            toast(`Style « ${preset.label} » appliqué.`, "info");
        });
        container.appendChild(btn);
    });
}

/** Remplit le select des artistes groupés par région/langue depuis la BDD studio */
function populateArtistSelect() {
    const select = $("artist-style");
    if (!select || typeof ARTISTS_DATABASE === "undefined") return;

    // Conserve l'option par défaut
    select.innerHTML = '<option value="">— Choisissez un artiste (ou aléatoire) —</option>';

    const groups = {
        "Français / Francophonie": ARTISTS_DATABASE.filter(a => a.language === "Français"),
        "US / UK": ARTISTS_DATABASE.filter(a => a.language === "Anglais"),
        "Latino": ARTISTS_DATABASE.filter(a => a.language === "Espagnol")
    };

    for (const [groupLabel, artists] of Object.entries(groups)) {
        if (artists.length === 0) continue;
        const optgroup = document.createElement("optgroup");
        optgroup.label = groupLabel;

        artists.forEach(artist => {
            const option = document.createElement("option");
            option.value = artist.name;
            option.textContent = artist.name + " (" + artist.genre + ")";
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    }
}

function init() {
    loadStudioState();
    loadHistory();

    // Restauration de l'état
    $("style-prompt").value = state.stylePrompt;
    renderBlocks();
    updatePreview();
    renderHistory();
    // refreshApiKeyUi(); // [COMMENTÉ] réactiver avec la fonctionnalité clé API client
    initPresets();
    populateArtistSelect();

    // --- Onglets ---
    $("tab-studio").addEventListener("click", () => switchTab("studio"));
    $("tab-history").addEventListener("click", () => switchTab("history"));

    // --- [FONCTIONNALITÉ COMMENTÉE] Clé API côté client ---
    // Décommentez ce bloc pour réactiver la gestion de la clé via l'interface.
    /*
    $("btn-api-key").addEventListener("click", openApiKeyModal);
    $("btn-save-key").addEventListener("click", () => {
        const key = $("api-key-input").value.trim();
        if (!key) {
            toast("Veuillez saisir une clé API.", "warning");
            return;
        }
        localStorage.setItem(LS_API_KEY, key);
        refreshApiKeyUi();
        closeApiKeyModal();
        toast("Clé API Groq enregistrée !");
    });
    $("btn-remove-key").addEventListener("click", () => {
        localStorage.removeItem(LS_API_KEY);
        $("api-key-input").value = "";
        refreshApiKeyUi();
        toast("Clé API supprimée.", "info");
    });
    $("api-key-show").addEventListener("change", (e) => {
        $("api-key-input").type = e.target.checked ? "text" : "password";
    });
    $("modal-api-key").addEventListener("click", (e) => {
        if (e.target === $("modal-api-key")) closeApiKeyModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeApiKeyModal();
    });
    */

    // --- Génération IA (classique + Création Auto) ---
    $("btn-generate").addEventListener("click", () => generateWithGroq(false));
    $("btn-auto").addEventListener("click", () => generateWithGroq(true));

    // --- Style prompt ---
    $("style-prompt").addEventListener("input", (e) => {
        state.stylePrompt = e.target.value;
        saveStudioState();
    });

    // --- Blocs ---
    $("btn-add-block").addEventListener("click", () => {
        const type = $("new-block-type").value;
        state.blocks.push({ type, text: "" });
        saveStudioState();
        renderBlocks();
        updatePreview();
    });

    // --- Aperçu ---
    $("btn-copy-preview").addEventListener("click", () => {
        const lyrics = buildLyricsPrompt();
        if (!lyrics) {
            toast("Aucune parole à copier.", "warning");
            return;
        }
        copyToClipboard(lyrics, "Lyrics Prompt copié !");
    });

    // --- CTA final : Générer ma musique (injection automatique dans Suno) ---
    $("btn-generate-music").addEventListener("click", generateMusicOnSuno);

    // --- Sauvegarde / nettoyage ---
    $("btn-save-song").addEventListener("click", saveCurrentSong);
    $("btn-clear-studio").addEventListener("click", () => {
        if (state.blocks.length === 0 && !state.stylePrompt) {
            toast("Le studio est déjà vide.", "info");
            return;
        }
        state.blocks = [];
        state.stylePrompt = "";
        $("style-prompt").value = "";
        saveStudioState();
        renderBlocks();
        updatePreview();
        toast("Studio réinitialisé.", "info");
    });

    // --- Historique ---
    $("btn-clear-history").addEventListener("click", () => {
        if (history.length === 0) return;
        if (confirm("Supprimer TOUS les morceaux de l'historique ? Cette action est irréversible.")) {
            history = [];
            persistHistory();
            renderHistory();
            toast("Historique vidé.", "info");
        }
    });
}

document.addEventListener("DOMContentLoaded", init);