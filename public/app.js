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
    coverPrompt: "",
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
        coverPrompt: state.coverPrompt,
        blocks: state.blocks
    }));
}

function loadStudioState() {
    try {
        const raw = localStorage.getItem(LS_STUDIO);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.stylePrompt = typeof parsed.stylePrompt === "string" ? parsed.stylePrompt : "";
            state.coverPrompt = typeof parsed.coverPrompt === "string" ? parsed.coverPrompt : "";
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
                    <button data-action="up" title="Monter" class="touch-target w-8 h-8 rounded-md bg-purple-900/50 hover:bg-purple-700 transition-all duration-200 text-sm active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed" ${index === 0 ? "disabled" : ""}>
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                    <button data-action="down" title="Descendre" class="touch-target w-8 h-8 rounded-md bg-purple-900/50 hover:bg-purple-700 transition-all duration-200 text-sm active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed" ${index === state.blocks.length - 1 ? "disabled" : ""}>
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                    <button data-action="delete" title="Supprimer" class="touch-target w-8 h-8 rounded-md bg-red-900/50 hover:bg-red-600 transition-all duration-200 text-sm active:scale-90">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <textarea data-action="text" rows="4" placeholder="Paroles de cette section…"
                class="w-full rounded-lg bg-night border border-purple-900/60 p-3 text-sm leading-relaxed outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30">${escapeHtml(block.text)}</textarea>
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
    const customArtist = $("artist-custom") ? $("artist-custom").value.trim() : "";
    const targetArtist = customArtist || ($("artist-style") ? $("artist-style").value : "");
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
        if (data.coverPrompt) {
            state.coverPrompt = data.coverPrompt;
            const coverField = $("cover-prompt");
            if (coverField) coverField.value = data.coverPrompt;
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

/** Dérive un titre de morceau : champ « Titre » manuel en priorité, sinon auto */
function deriveSongTitle() {
    const manualTitle = $("gen-title") ? $("gen-title").value.trim() : "";
    if (manualTitle) return manualTitle.slice(0, 80);
    const theme = $("gen-theme").value.trim();
    if (theme) return theme.split(/[.!?]/)[0].slice(0, 60);
    const firstLine = state.blocks.map(b => b.text.trim()).find(t => t && !t.startsWith("["));
    return firstLine ? firstLine.slice(0, 60) : "Sans titre";
}

/**
 * Clic « Publier en direct » : redirige vers le paiement Stripe Checkout.
 * Après paiement, l'utilisateur revient sur la page avec ?order=xxx
 * et pollPaidOrder() prend le relais (génération + publication auto).
 */
async function startDirectPublishFlow() {
    const lyrics = buildLyricsPrompt();
    const style = state.stylePrompt.trim();
    if (!lyrics && !style) {
        showMusicError("Ajoutez des paroles ou un style prompt avant de publier.");
        return;
    }

    const btn = $("btn-generate-music");
    btn.disabled = true;
    setMusicStatus("Préparation du paiement sécurisé Stripe…", 5);

    try {
        const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: deriveSongTitle(),
                stylePrompt: style,
                lyrics,
                theme: $("gen-theme") ? $("gen-theme").value.trim() : "",
                artistUsed: getSelectedArtistName()
            })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.url) throw new Error(data?.error || `HTTP ${res.status}`);
        console.log("[Publier en direct] Redirection vers Stripe Checkout :", data.orderId);
        window.location.href = data.url;
    } catch (err) {
        console.error("[Publier en direct] Erreur :", err.message);
        showMusicError("Service de paiement indisponible : " + err.message);
        setMusicStatus(null);
        btn.disabled = false;
    }
}

/**
 * Suit une commande payée (?order=xxx dans l'URL) : polling du statut,
 * puis publication automatique sur FB/IG quand la musique est prête.
 */
async function pollPaidOrder(orderId) {
    let attempts = 0;
    const MAX_ATTEMPTS = 60;

    async function tick() {
        attempts++;
        try {
            const res = await fetch(`/api/order/${encodeURIComponent(orderId)}/status`);
            const o = await res.json().catch(() => null);
            if (!res.ok || !o) throw new Error(o?.error || `HTTP ${res.status}`);

            if (o.status === "pending_payment") {
                if (attempts >= MAX_ATTEMPTS) { showMusicError("Délai dépassé en attente du paiement."); return; }
                setMusicStatus("En attente de confirmation du paiement…", 10);
                setTimeout(tick, 5000);
                return;
            }

            if (o.status === "generating") {
                if (attempts >= MAX_ATTEMPTS) {
                    showMusicError("La génération prend plus de temps que prévu. Votre chanson reste liée à cette commande — rechargez la page plus tard avec ce même lien.");
                    return;
                }
                const pct = Math.min(90, 20 + attempts * 3);
                renderSunoSteps(pct >= 75 ? 3 : pct >= 45 ? 2 : 1);
                setMusicStatus("Paiement confirmé ✅ — génération de votre chanson via Suno…", pct);
                setTimeout(tick, 6000);
                return;
            }

            if (o.status === "done" && Array.isArray(o.tracks)) {
                finishSunoPolling(true, null, o.tracks, "suno");
                return;
            }

            if (o.status === "refunded") {
                showMusicError("Votre paiement a été remboursé automatiquement : la génération n'a pas pu être lancée (aucun frais n'a été retenu).");
                setMusicStatus(null);
                $("btn-generate-music").disabled = false;
                return;
            }

            if (o.status === "failed") {
                showMusicError("Échec de la génération côté Suno après engagement des crédits. Contactez-nous pour un remboursement manuel.");
                setMusicStatus(null);
                $("btn-generate-music").disabled = false;
                return;
            }

            setTimeout(tick, 6000);
        } catch (err) {
            if (attempts >= MAX_ATTEMPTS) { showMusicError("Suivi de commande impossible : " + err.message); return; }
            setTimeout(tick, 8000);
        }
    }
    tick();
}

/**
 * Suit le traitement du Reel par Meta puis déclenche sa publication
 * dès que le conteneur est prêt (FINISHED). Chaque appel serveur est
 * court : aucun risque de timeout serverless.
 */
async function finalizeInstagramReelPoll(creationId) {
    let attempts = 0;
    const MAX = 40; // ~5 min à 8 s

    async function tick() {
        attempts++;
        try {
            const res = await fetch("/api/instagram/finalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ creationId })
            });
            const o = await res.json().catch(() => null);
            if (!res.ok || !o) throw new Error(`HTTP ${res.status}`);

            if (o.status === "published") {
                const el = document.getElementById("ig-reel-status");
                if (el) {
                    el.innerHTML = `<a href="https://instagram.com/p/${escapeHtml(o.postId)}" target="_blank" rel="noopener" class="underline">Reel publié ✅ — voir sur Instagram</a>`;
                    el.classList.remove("opacity-90");
                }
                toast("📸 Reel Instagram publié avec succès !", "success");
                return;
            }
            if (o.status === "error") {
                const el = document.getElementById("ig-reel-status");
                if (el) el.textContent = "❌ Reel en échec : " + (o.error || "raison inconnue");
                toast("Publication Instagram échouée : " + (o.error || "erreur"), "error");
                return;
            }
            // processing -> on continue
            const el = document.getElementById("ig-reel-status");
            if (el) el.textContent = `Reel en traitement sur Instagram… (${attempts * 8}s)`;
            if (attempts < MAX) setTimeout(tick, 8000);
            else if (el) el.textContent = "⏳ Toujours en traitement — le Reel apparaîtra bientôt sur votre profil.";
        } catch (err) {
            console.warn("[IG-FINALIZE] Erreur polling :", err.message);
            if (attempts < MAX) setTimeout(tick, 10000);
        }
    }
    tick();
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
    setMusicStatus("Votre musique est prête ! Publication sur Facebook & Instagram…", 100);

    // --- Publication automatique sur Facebook & Instagram ---
    publishToSocialMedia(tracks[0].audioUrl);

    renderMusicTracks(tracks, provider);
    saveSongWithTracks(tracks, provider);
    toast("Musique générée et publiée ! 🎵");
}

/** Publie la musique sur Facebook et Instagram */
async function publishToSocialMedia(audioUrl) {
    try {
        const payload = {
            stylePrompt: state.stylePrompt.trim(),
            blocks: state.blocks,
            generatedTheme: $("gen-theme").value.trim(),
            songTitle: getManualSongTitle(),
            artistUsed: getSelectedArtistName(),
            audioUrl: audioUrl
        };

        // Barre de progression : initialisation puis consommation du flux
        // NDJSON du serveur (/api/publish?progress=1) qui décrit chaque étape
        // (recherche cover, vidéo complète FB, clip Reel 60s IG, uploads…).
        publishProgressBar(0, "Préparation de la publication Facebook & Instagram…");

        const res = await fetch("/api/publish?progress=1", {
            method: "POST",
            headers: {
                "X-Publish-Stream": "1",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await consumePublishProgressStream(res);

        const facebook = data.facebook ? "✅ Facebook" : "⚠️ Facebook";
        const instagram = data.instagram ? "✅ Instagram" : "⚠️ Instagram";
        toast(`Publication : ${facebook} | ${instagram}`, "success");
    } catch (err) {
        console.error("Publication échouée :", err);
        resetPublishProgress();
        toast("⚠️ Publication partielle : " + err.message, "warning");
    }
}

// ============================================================
// BARRE DE PROGRESSION DE PUBLICATION (étape par étape)
// ============================================================

/** Dernier pourcentage connu : garde la barre affichée entre deux messages d'état. */
let _activePublishPercent = null;

/** Libellés lisibles par étape envoyée par le back-end (champ `step`/`platform`). */
const PUBLISH_STEP_LABELS = {
    audio: "🎵 Audio",
    cover: "🎨 Pochette",
    video: "🎬 Vidéo",
    social: "📲 Publication",
    facebook: "📘 Facebook",
    instagram: "📸 Instagram"
};

/**
 * Affiche et met à jour la barre de progression détaillée (#publish-progress)
 * dans la modale, étape par étape. Appelée par consumePublishProgressStream()
 * à chaque événement du serveur ; le pourcentage persiste tant qu'un nouveau
 * n'arrive pas (les messages intermédiaires sans pourcentage gardent la valeur
 * précédente).
 * @param {number|string} percent 0..100
 * @param {string} [message] description de l'étape en cours
 * @param {object} [info] { step?, platform?, state? } détail de l'étape (active/done/warning)
 */
function publishProgressBar(percent, message, info) {
    const pct = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
    _activePublishPercent = pct;

    const wrap = $("publish-progress");
    const bar = $("publish-progress-bar");
    const pctEl = $("publish-progress-pct");
    const stepEl = $("publish-progress-step");
    const detailEl = $("publish-progress-detail");

    if (!wrap || !bar) {
        // Sécurité : éléments absents (ancien markup) -> repli sur la zone texte.
        setPublishStatus({ type: "info", html: message || "Publication en cours…" });
        return;
    }

    wrap.classList.remove("hidden");
    bar.style.width = pct + "%";
    if (pctEl) pctEl.textContent = pct + " %";
    if (stepEl && message) stepEl.textContent = message;

    if (detailEl) {
        const key = (info && (info.platform || info.step)) || "";
        const label = PUBLISH_STEP_LABELS[key] || "";
        const state = (info && info.state) || "";
        const stateSuffix =
            state === "done" ? " — terminé ✓" :
            state === "warning" ? " — avec avertissement ⚠️" :
            state === "active" ? " — en cours…" : "";
        detailEl.textContent = label ? label + stateSuffix : "";
    }

    setPublishStatus({ type: "info", html: message || "Publication en cours…" });
}

/** Masque et réinitialise la barre de progression de publication. */
function resetPublishProgress() {
    _activePublishPercent = null;
    const wrap = $("publish-progress");
    if (wrap) wrap.classList.add("hidden");
    const bar = $("publish-progress-bar");
    if (bar) bar.style.width = "0%";
    const pctEl = $("publish-progress-pct");
    if (pctEl) pctEl.textContent = "0 %";
    const stepEl = $("publish-progress-step");
    if (stepEl) stepEl.textContent = "Préparation…";
    const detailEl = $("publish-progress-detail");
    if (detailEl) detailEl.textContent = "";
}

/**
 * Consomme le flux NDJSON renvoyé par POST /api/publish?progress=1.
 * Format d'une ligne = un événement JSON :
 *   { type:"start"|"step"|"info"|"heartbeat"|"done"|"error",
 *     percent: number, message: string, ...payloadFinal }
 * - Chaque événement met à jour la barre + le libellé en direct.
 * - "heartbeat" (ligne vide/commentaire) est ignoré silencieusement.
 * - "error" → lève une exception (gérée par le try/catch appelant).
 * - Renvoie le payload final (identique à l'ancienne réponse JSON unique).
 * Fallbacks conservés : si le serveur répond en JSON simple (ancien
 * comportement / erreurs plateforme comme 413/504), on reproduit les
 * messages historiques pour l'utilisateur.
 * @param {Response} res réponse fetch de /api/publish?progress=1
 * @returns {Promise<object>} payload final de publication
 */
async function consumePublishProgressStream(res) {
    const contentType = res.headers.get("content-type") || "";

    // --- Erreurs renvoyées hors du flux (limite plateforme, proxy…) ---
    if (!res.ok && !contentType.includes("x-ndjson")) {
        if (res.status === 413) {
            throw new Error("Fichier trop volumineux : la limite d'envoi direct est de 4,5 Mo sur Vercel. " +
                "Utilisez un fichier MP3 plus léger ou le mode « Lien » avec une URL MP3 directe.");
        }
        if (res.status === 504) {
            throw new Error("Le serveur a mis trop de temps à répondre (timeout). " +
                "Sur Vercel gratuit, la limite est de 60 s. " +
                "Essayez un fichier MP3 plus court, désactivez la génération vidéo, " +
                "ou passez sur un plan Vercel avec maxDuration >= 300 s. " +
                "Votre MP3 reste intact — vous pouvez relancer.");
        }
        let msg = "";
        try { msg = (await res.json()).error || ""; } catch { /* corps non JSON */ }
        if (!msg) { try { msg = (await res.text()).slice(0, 300); } catch { /* ignore */ } }
        throw new Error(msg || `Réponse serveur illisible (HTTP ${res.status})`);
    }

    // --- Fallback : réponse JSON simple (mode non-stream) ---
    if (!contentType.includes("x-ndjson")) {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Échec de la publication (HTTP ${res.status})`);
        return json;
    }

    // --- Lecture ligne à ligne du flux NDJSON ---
    publishProgressBar(1, "Connexion au serveur… Publication lancée…");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let last = null;

    while (true) {
        let chunk;
        try {
            chunk = await reader.read();
        } catch (err) {
            throw new Error("Flux interrompu pendant la publication : " + (err.message || err));
        }
        if (chunk.done) break;

        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split(String.fromCharCode(10));
        buffer = lines.pop(); // dernière ligne possiblement incomplète -> retenue

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue; // heartbeat SSE-style
            let evt = null;
            try { evt = JSON.parse(trimmed); } catch { continue; }
            last = evt;
            if (evt.message) {
                publishProgressBar(evt.percent, evt.message, {
                    step: evt.step,
                    platform: evt.platform,
                    state: evt.state
                });
            }
        }
    }

    if (!last) {
        resetPublishProgress();
        throw new Error("Aucune réponse du serveur pendant la publication.");
    }

    if (last.type === "error") {
        resetPublishProgress();
        throw new Error(last.error || last.message || "Publication échouée.");
    }
    return last;
}

function extractArtistFromStyle(style) {
    if (!style) return "Artiste Polyvalent";
    const match = style.match(/^([^,]+)/);
    return match ? match[1].trim() : "Artiste Polyvalent";
}

/**
 * Nom d'artiste sélectionné dans le Studio :
 * 1. Saisie manuelle « artist-custom » (prioritaire),
 * 2. Artiste choisi dans la liste déroulante BDD Studio,
 * 3. Sinon dérivé du style prompt.
 */
function getSelectedArtistName() {
    const custom = $("artist-custom") ? $("artist-custom").value.trim() : "";
    if (custom) return custom;
    const select = $("artist-style");
    if (select && select.value && select.selectedIndex > 0) {
        const opt = select.options[select.selectedIndex];
        const label = opt && opt.textContent ? opt.textContent.trim() : select.value;
        return label || select.value;
    }
    return extractArtistFromStyle(state.stylePrompt);
}

/** Titre saisi manuellement dans la box « Titre de la chanson », sinon "" */
function getManualSongTitle() {
    return $("gen-title") ? $("gen-title").value.trim() : "";
}

// ============================================================
// Modale « Upload & Publier »
// Permet de publier une chanson sur Facebook & Instagram soit via
// un lien Suno/Udio, soit via un fichier MP3 téléversé.
// ============================================================

const PUBLISH_MODE = { LINK: "link", FILE: "file" };
let currentPublishMode = PUBLISH_MODE.LINK;
let isPublishing = false;

/** Ouvre la fenêtre de publication */
function openPublishModal() {
    console.log("[Upload & Publier] Ouverture de la fenêtre de publication");
    $("modal-publish").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setPublishMode(currentPublishMode);
    setPublishStatus(null);
    generateCaptionAI();
    if ($("publish-cover-prompt") && state.coverPrompt) {
        $("publish-cover-prompt").value = state.coverPrompt;
    }
}

/** Ferme la fenêtre (bloquée pendant une publication) */
function closePublishModal() {
    if (isPublishing) {
        toast("Publication en cours, veuillez patienter…", "warning");
        return;
    }
    console.log("[Upload & Publier] Fermeture de la fenêtre");
    $("modal-publish").classList.add("hidden");
    document.body.style.overflow = "";
    resetPublishForm();
}

/** Réinitialise le formulaire de la modale */
function resetPublishForm() {
    $("publish-link-input").value = "";
    $("publish-file-input").value = "";
    $("publish-file-name").classList.add("hidden");
    if ($("publish-caption")) $("publish-caption").value = "";
    setPublishMode(PUBLISH_MODE.LINK);
    setPublishStatus(null);
    resetPublishProgress();
    setPublishButtonState(false);
}

/** Bascule entre le mode « lien » et le mode « fichier MP3 » */
function setPublishMode(mode) {
    currentPublishMode = mode;
    const isLink = mode === PUBLISH_MODE.LINK;

    $("publish-link-section").classList.toggle("hidden", !isLink);
    $("publish-file-section").classList.toggle("hidden", isLink);

    const activeCls = "px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-600/25";
    const idleCls = "px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 bg-white/5 text-slate-300 hover:bg-white/10";

    $("publish-mode-link").className = isLink ? activeCls : idleCls;
    $("publish-mode-file").className = isLink ? idleCls : activeCls;
}

/** Active/désactive le bouton Publier (+ spinner pendant l'envoi) */
function setPublishButtonState(publishing) {
    const btn = $("btn-publish-confirm");
    btn.disabled = publishing;
    btn.innerHTML = publishing
        ? '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Publication…'
        : '<i class="fa-solid fa-paper-plane mr-1"></i>Publier';
}

/**
 * Affiche la zone de statut dans la modale.
 * @param {null|{type:"info"|"success"|"warning"|"error", html:string}} status
 */
function setPublishStatus(status) {
    const box = $("publish-status");
    if (!status) {
        box.classList.add("hidden");
        box.innerHTML = "";
        return;
    }
    const styles = {
        info: "border-fuchsia-600/50 bg-fuchsia-500/10 text-purple-200",
        success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
        warning: "border-amber-500/60 bg-amber-500/10 text-amber-100",
        error: "border-red-500/60 bg-red-500/10 text-red-200"
    };
    const icons = {
        info: "fa-compact-disc fa-spin",
        success: "fa-circle-check",
        warning: "fa-triangle-exclamation",
        error: "fa-circle-xmark"
    };
    box.className = "mt-4 rounded-xl border p-4 text-sm animate-fadeIn " + styles[status.type];
    box.innerHTML = `<p><i class="fa-solid ${icons[status.type]} mr-2"></i>${status.html}</p>`;
}

/** Ajoute les métadonnées communes (titre, style, thème, artiste) au FormData */
function appendCommonMetadata(formData) {
    formData.append("stylePrompt", state.stylePrompt.trim());
    formData.append("theme", $("gen-theme") ? $("gen-theme").value.trim() : "");
    formData.append("songTitle", getManualSongTitle());
    formData.append("artistUsed", getSelectedArtistName() || "Artiste Polyvalent");
    // Texte du post édité dans la modale (vide -> légende standard du serveur)
    formData.append("caption", $("publish-caption") ? $("publish-caption").value.trim() : "");
    // Couvert prompt (optionnel, servant à générer la pochette IA)
    formData.append("coverPrompt", $("publish-cover-prompt") ? $("publish-cover-prompt").value.trim() : "");
}

let isCaptionLoading = false;

/**
 * Compresse un fichier audio côté navigateur : décodage via Web Audio API
 * puis réencodage MP3 (lamejs) à un débit calculé pour passer sous 4 Mo.
 * Utilisé en repli quand l'upload direct dépasse la limite Vercel (4,5 Mo)
 * et que le stockage Blob n'est pas configuré.
 * @param {File} file fichier audio source
 * @returns {Promise<{blob: Blob, kbps: number}>}
 */
async function compressAudioFile(file) {
    if (typeof lamejs === "undefined") {
        throw new Error("Encodeur MP3 (lamejs) non chargé.");
    }

    // 1. Décodage du fichier source
    const arrayBuf = await file.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let decoded;
    try {
        decoded = await ctx.decodeAudioData(arrayBuf);
    } finally {
        ctx.close().catch(() => {});
    }

    // 2. Normalisation en 44,1 kHz stéréo (fréquences supportées par lame)
    const targetRate = 44100;
    let buffer = decoded;
    if (decoded.sampleRate !== targetRate || decoded.numberOfChannels > 2) {
        const frames = Math.max(1, Math.ceil(decoded.duration * targetRate));
        const offline = new OfflineAudioContext(2, frames, targetRate);
        const src = offline.createBufferSource();
        src.buffer = decoded;
        src.connect(offline.destination);
        src.start();
        buffer = await offline.startRendering();
    }
    const channels = 2;

    // 3. Débit adaptatif : vise ~3,4 Mo max selon la durée du morceau
    const budgetBytes = 3.4 * 1024 * 1024;
    const duration = Math.max(buffer.duration, 1);
    let kbps = Math.floor((budgetBytes * 8) / duration / 1000);
    kbps = Math.max(64, Math.min(kbps, 128));

    // 4. Conversion Float32 -> Int16 par canal
    function floatTo16(input) {
        const out = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return out;
    }
    const left = floatTo16(buffer.getChannelData(0));
    const right = floatTo16(buffer.getChannelData(Math.min(1, buffer.numberOfChannels - 1)));

    // 5. Encodage MP3
    const encoder = new lamejs.Mp3Encoder(channels, targetRate, kbps);
    const blockSize = 1152;
    const parts = [];
    for (let i = 0; i < left.length; i += blockSize) {
        const l = left.subarray(i, i + blockSize);
        const r = right.subarray(i, i + blockSize);
        const buf = encoder.encodeBuffer(l, r);
        if (buf.length > 0) parts.push(new Uint8Array(buf));
    }
    const end = encoder.flush();
    if (end.length > 0) parts.push(new Uint8Array(end));

    return { blob: new Blob(parts, { type: "audio/mpeg" }), kbps };
}

/**
 * Téléverse un fichier audio vers Vercel Blob (upload direct navigateur).
 * Nécessite que le déploiement ait un store Blob connecté
 * (BLOB_READ_WRITE_TOKEN). Lève une exception sinon.
 * @returns {Promise<string>} URL publique permanente du fichier
 */
async function uploadFileViaBlob(file) {
    const mod = await import("https://esm.sh/@vercel/blob/client");
    const blob = await mod.upload(`uploads/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload-url",
        contentType: file.type || "audio/mpeg",
    });
    return blob.url;
}

/**
 * Préremplit la zone « Texte du post » de la modale via l'IA (Groq).
 * Le texte reste librement modifiable ; en cas d'échec, la légende
 * standard du serveur sera utilisée.
 */
async function generateCaptionAI() {
    const box = $("publish-caption");
    const btn = $("btn-caption-regen");
    if (!box || isCaptionLoading) return;

    isCaptionLoading = true;
    const oldBtnHtml = btn ? btn.innerHTML : null;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Génération…';
    }
    box.value = "";
    box.placeholder = "L'IA rédige le texte du post…";

    try {
        const res = await fetch("/api/caption", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                theme: $("gen-theme") ? $("gen-theme").value.trim() : "",
                stylePrompt: state.stylePrompt.trim(),
                songTitle: getManualSongTitle(),
                artistUsed: getSelectedArtistName()
            })
        });
        const data = await res.json();
        if (!res.ok || !data.caption) throw new Error(data.error || "Génération impossible");
        box.value = data.caption;
    } catch (err) {
        console.warn("[Upload & Publier] Texte IA indisponible :", err.message);
        box.placeholder = "Texte IA indisponible — la légende standard sera utilisée.";
        toast("Texte IA indisponible : la légende standard sera utilisée.", "warning");
    } finally {
        isCaptionLoading = false;
        if (btn && oldBtnHtml) {
            btn.disabled = false;
            btn.innerHTML = oldBtnHtml;
        }
    }
}

/** Valide la source choisie et renvoie FormData prêt pour /api/publish */
function buildPublishPayload() {
    if (currentPublishMode === PUBLISH_MODE.LINK) {
        const link = $("publish-link-input").value.trim();
        if (!link) {
            return { error: "Veuillez renseigner le lien de votre chanson Suno ou Udio." };
        }
        let url;
        try {
            url = new URL(link);
        } catch {
            return { error: "Lien invalide : il doit commencer par https:// (ex : https://suno.com/song/…)." };
        }
        const host = url.hostname.toLowerCase().replace(/^www\./, "");
        const isSunoOrUdio = /(^|\.)suno\.(com|ai)$/.test(host) || /(^|\.)udio\.com$/.test(host);
        if (url.protocol !== "https:" || !isSunoOrUdio) {
            return { error: "Le lien doit pointer vers suno.com, suno.ai ou udio.com." };
        }

        const fd = new FormData();
        fd.append("audioUrl", link);
        appendCommonMetadata(fd);
        return { formData: fd, label: "Lien : " + link };
    }

    // Mode fichier MP3
    const file = $("publish-file-input").files[0];
    if (!file) {
        return { error: "Veuillez choisir un fichier MP3 à téléverser." };
    }
    if (!/^audio\//i.test(file.type) && !/\.mp3$/i.test(file.name)) {
        return { error: `« ${file.name} » n'est pas un fichier audio valide.` };
    }
    if (file.size > 25 * 1024 * 1024) {
        return { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum autorisé : 25 Mo.` };
    }

    const fd = new FormData();
    fd.append("file", file);
    appendCommonMetadata(fd);
    return { formData: fd, label: `Fichier : ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} Mo)` };
}

/** Gère le changement de fichier MP3 sélectionné */
function onPublishFileChange(e) {
    const file = e.target.files[0];
    const nameSpan = $("publish-file-name");
    if (!file) {
        nameSpan.classList.add("hidden");
        return;
    }
    console.log("[Upload & Publier] Fichier sélectionné :", file.name, `(${(file.size / 1024 / 1024).toFixed(1)} Mo)`);
    nameSpan.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} Mo`;
    nameSpan.classList.remove("hidden");
}

/** Clic sur « Publier » : validation puis envoi au serveur */
async function performPublish() {
    if (isPublishing) return;

    const payload = buildPublishPayload();
    if (payload.error) {
        console.warn("[Upload & Publier] Validation refusée :", payload.error);
        setPublishStatus({ type: "warning", html: escapeHtml(payload.error) });
        toast(payload.error, "warning");
        return;
    }

    isPublishing = true;
    setPublishButtonState(true);
    let sendBody = payload.formData;

    try {
        // --- Mode fichier : tentative d'upload direct vers Vercel Blob ---
        // (contourne la limite de 4,5 Mo des requêtes serverless)
        if (currentPublishMode === PUBLISH_MODE.FILE) {
            const file = $("publish-file-input").files[0];
            let blobUrl = null;

            if (file) {
                try {
                    setPublishStatus({ type: "info", html: `Envoi du fichier vers le stockage cloud…` });
                    blobUrl = await uploadFileViaBlob(file);
                    console.log("[Upload & Publier] Fichier stocké sur Blob :", blobUrl);

                    const fd = new FormData();
                    fd.append("blobAudioUrl", blobUrl);
                    appendCommonMetadata(fd);
                    sendBody = fd;
                } catch (blobErr) {
                    console.warn("[Upload & Publier] Upload Blob indisponible :", blobErr.message);
                    // Repli : envoi direct, mais refusé au-delà de ~4 Mo sur Vercel
                    if (file.size > 4 * 1024 * 1024) {
                        // Dernière chance avant d'échouer : compression intégrée
                        try {
                            setPublishStatus({ type: "info", html: "Fichier volumineux : compression intégrée en cours… (quelques secondes)" });
                            const { blob: compressed, kbps } = await compressAudioFile(file);

                            if (compressed.size > 4 * 1024 * 1024) {
                                throw new Error("la compression n'a pas suffi à passer sous la limite");
                            }

                            console.log(`[Upload & Publier] Fichier compressé : ${(file.size / 1048576).toFixed(1)} Mo -> ${(compressed.size / 1048576).toFixed(1)} Mo (${kbps} kbps)`);
                            const fd = new FormData();
                            fd.append("file", compressed, "chanson-compressee.mp3");
                            appendCommonMetadata(fd);
                            sendBody = fd;
                        } catch (cmpErr) {
                            console.warn("[Upload & Publier] Compression impossible :", cmpErr.message);
                            const msg = `<span class="font-semibold">Fichier de ${(file.size / 1024 / 1024).toFixed(1)} Mo : dépasse la limite de 4,5 Mo de Vercel.</span><br>` +
                                `Pour publier des fichiers de cette taille, activez gratuitement le stockage intégré :<br>` +
                                `<span class="block mt-1">📊 Tableau de bord Vercel → votre projet → onglet « Storage » → « Create Database » → <b>Blob</b>. ` +
                                `Le token est ajouté automatiquement, et les fichiers jusqu'à 100 Mo passeront.</span><br>` +
                                `En attendant : utilisez un MP3 plus léger, ou le mode « Lien » avec une URL MP3 directe.`;
                            setPublishStatus({ type: "error", html: msg });
                            toast("Compression impossible : stockage cloud requis.", "error");
                            return;
                        }
                    }
                }
            }
        }

        setPublishStatus({ type: "info", html: "Traitement en cours sur le serveur : génération pochette, encodage vidéo, publication Facebook & Instagram…<br><span class='text-xs opacity-75'>Cela peut prendre 1 à 3 minutes selon la taille du fichier. Ne fermez pas cette fenêtre.</span>" });

        const res = await fetch("/api/publish?progress=1", { method: "POST", headers: { "X-Publish-Stream": "1" }, body: sendBody });

        // Barre de progression « étape par étape » : le serveur répond en flux
        // NDJSON ; chaque événement met à jour la barre + le texte d'état en
        // temps réel et le payload final remplace l'ancienne réponse JSON.
        publishProgressBar(0, "Envoi des données au serveur…");
        const data = await consumePublishProgressStream(res);

        console.log("[Upload & Publier] Publication terminée :", data);

        if (!res.ok) {
            const detailLines = [];
            if (data.error) detailLines.push(escapeHtml(data.error));
            if (data.details) {
                for (const [platform, msg] of Object.entries(data.details)) {
                    if (msg) {
                        detailLines.push(`<span class="font-semibold">${platform === "facebook" ? "📘 Facebook" : "📸 Instagram"} :</span> ${escapeHtml(msg)}`);
                    }
                }
            }
            const html = detailLines.join("<br>") || `Erreur serveur (HTTP ${res.status})`;
            console.error("[Upload & Publier] Échec de la publication :", JSON.stringify(data, null, 2));
            resetPublishProgress();
            setPublishStatus({ type: "error", html });
            toast(data.error || "Échec de la publication.", "error");
            return;
        }

        // --- Succès (au moins une plateforme publiée) ---
        const fbLine = data.facebook
            ? `✅ <a href="${escapeHtml(data.facebook.url)}" target="_blank" rel="noopener" class="underline hover:text-emerald-100">Voir sur Facebook</a>`
            : `⚠️ <span class="opacity-80">Facebook non publié${data.details?.facebook ? " — " + escapeHtml(data.details.facebook) : ""}</span>`;
        let igLine;
        if (data.instagram) {
            igLine = `✅ <a href="${escapeHtml(data.instagram.url)}" target="_blank" rel="noopener" class="underline hover:text-emerald-100">Voir sur Instagram</a>`;
        } else if (data.instagramPendingCreationId) {
            // Le conteneur Reel est créé : Meta le traite encore (jusqu'à ~2 min)
            const creationId = data.instagramPendingCreationId;
            igLine = `⏳ <span id="ig-reel-status" class="opacity-90">Reel en traitement sur Instagram…</span>`;
            finalizeInstagramReelPoll(creationId);
        } else {
            igLine = `⚠️ <span class="opacity-80">Instagram non publié${data.details?.instagram ? " — " + escapeHtml(data.details.instagram) : ""}</span>`;
        }

        const allOk = !!(data.facebook && data.instagram);
        console.log(`[Upload & Publier] Publication terminée — Facebook: ${data.facebook ? "OK" : "KO"}, Instagram: ${data.instagram ? "OK" : "KO"}`);

        setPublishStatus({
            type: allOk ? "success" : "warning",
            html: `<span class="font-bold">${allOk ? "Chanson publiée avec succès !" : "Publication partielle."}</span><br>` +
                  `<span class="block mt-1">Facebook : ${fbLine}</span><br><span class="block">Instagram : ${igLine}</span>`
        });
        toast(allOk ? "🎉 Chanson publiée sur Facebook & Instagram !" : "⚠️ Publication partielle — voir la fenêtre.", allOk ? "success" : "warning");

        // Sauvegarde pour la page « Published Tracks »
        // audioUrl : version locale téléchargée par le serveur si possible
        savePublishedTrack({
            title: getManualSongTitle() || ($("gen-theme") ? $("gen-theme").value.trim() : "") || "Track publié",
            audioUrl: data.audioUrl || (currentPublishMode === PUBLISH_MODE.LINK ? $("publish-link-input").value.trim() : ""),
            coverUrl: data.coverUrl || "/covers/cover_of_the_day.png",
            videoUrl: data.videoUrl || null,
            stylePrompt: state.stylePrompt.trim(),
            artistUsed: getSelectedArtistName(),
            blocks: state.blocks
        });
    } catch (err) {
        console.error("[Upload & Publier] Erreur réseau/inattendue :", err);
        resetPublishProgress();
        setPublishStatus({
            type: "error",
            html: `<span class="font-bold">Échec de la publication.</span><br>${escapeHtml(err.message || "Erreur inconnue")}<br>
                   <span class="text-xs opacity-75">Vérifiez que le serveur est démarré et consultez les logs du terminal.</span>`
        });
        toast("Échec de la publication : " + (err.message || "erreur inconnue"), "error");
    } finally {
        isPublishing = false;
        setPublishButtonState(false);
    }
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
                class="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 transition-all duration-200 text-white text-lg shadow-lg shadow-fuchsia-600/30 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                <i class="fa-solid fa-play"></i>
            </button>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-sm truncate">${escapeHtml(track.title || "Piste " + (i + 1))}</p>
                <p class="text-xs text-gray-400">${track.duration ? Math.round(track.duration) + " s · " : ""}Généré par ${provider === "udio" ? "Udio" : "Suno"}</p>
            </div>
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener" download title="Télécharger"
               class="touch-target w-9 h-9 rounded-lg bg-purple-900/60 hover:bg-purple-700 flex items-center justify-center text-sm transition">
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

/** Sauvegarde un track publié dans localStorage (fallback pour page Published Tracks) */
function savePublishedTrack(track) {
    try {
        const stored = localStorage.getItem('publishedTracks');
        const tracks = stored ? JSON.parse(stored) : [];
        tracks.unshift(track);
        // Garder max 200
        localStorage.setItem('publishedTracks', JSON.stringify(tracks.slice(0, 200)));
        console.log("[Published] Track sauvegardé dans localStorage");
    } catch (e) {
        console.warn("[Published] Échec sauvegarde localStorage :", e.message);
    }
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
        card.className = "rounded-2xl bg-panel border border-purple-800/50 p-6 shadow-lg shadow-black/20 flex flex-col gap-4 transition-all duration-200 hover:shadow-xl hover:border-fuchsia-500/40";

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

    const activeCls = "tab-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md shadow-fuchsia-600/25 hover:from-fuchsia-500 hover:to-purple-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night";
    const idleCls = "tab-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70";

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
        btn.className = "px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-900/60 hover:bg-fuchsia-600 border border-purple-700/60 transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400";
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
    const tabPublished = $("tab-published");
    if (tabPublished) {
        tabPublished.addEventListener("click", () => {
            window.location.href = "published.html";
        });
    }

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

    $("btn-copy-style").addEventListener("click", () => {
        const style = $("style-prompt").value.trim();
        if (!style) {
            toast("Aucun style prompt à copier.", "warning");
            return;
        }
        copyToClipboard(style, "Style Prompt copié !");
    });

    // --- Cover Prompt ---
    $("btn-copy-cover").addEventListener("click", () => {
        const cover = $("cover-prompt").value.trim();
        if (!cover) {
            toast("Aucun cover prompt à copier.", "warning");
            return;
        }
        copyToClipboard(cover, "Cover Prompt copié !");
    });

    $("btn-paste-cover").addEventListener("click", async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                toast("Le presse-papiers est vide.", "warning");
                return;
            }
            $("cover-prompt").value = text;
            saveStudioState();
            updatePreview();
            toast("Cover Prompt collé depuis le presse-papiers !", "success");
        } catch (err) {
            toast("Impossible d'accéder au presse-papiers.", "error");
        }
    });

    // --- CTA final : Publier en direct (paiement Stripe puis génération auto) ---
    $("btn-generate-music").addEventListener("click", startDirectPublishFlow);

    // --- Retour de Stripe Checkout (?order=xxx) ou paiement annulé ---
    const urlParams = new URLSearchParams(window.location.search);
    const paidOrder = urlParams.get("order");
    if (paidOrder) {
        history.replaceState(null, "", window.location.pathname);
        pollPaidOrder(paidOrder);
    } else if (urlParams.get("canceled")) {
        toast("Paiement annulé — aucun montant n'a été débité.", "warning");
    }

    // --- Bouton Upload & Publier (ouvre la modale) ---
    if ($("btn-upload-publish")) {
        $("btn-upload-publish").addEventListener("click", openPublishModal);
    }

    // --- Modale Upload & Publier ---
    $("publish-mode-link").addEventListener("click", () => setPublishMode(PUBLISH_MODE.LINK));
    $("publish-mode-file").addEventListener("click", () => setPublishMode(PUBLISH_MODE.FILE));
    $("publish-file-input").addEventListener("change", onPublishFileChange);

    const fileDropZone = $("publish-file-section");
    if (fileDropZone) {
        const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
        ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
            fileDropZone.addEventListener(evt, preventDefaults, false);
        });
        fileDropZone.addEventListener("dragenter", () => fileDropZone.classList.add("drag-over"));
        fileDropZone.addEventListener("dragleave", () => fileDropZone.classList.remove("drag-over"));
        fileDropZone.addEventListener("drop", (e) => {
            fileDropZone.classList.remove("drag-over");
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const input = $("publish-file-input");
                if (input) {
                    if (typeof DataTransfer !== "undefined") {
                        const dt = new DataTransfer();
                        for (const f of files) dt.items.add(f);
                        input.files = dt.files;
                    }
                    onPublishFileChange({ target: input });
                }
            }
        });
    }

    $("btn-publish-cancel").addEventListener("click", closePublishModal);
    $("btn-publish-close").addEventListener("click", closePublishModal);
    $("btn-publish-confirm").addEventListener("click", performPublish);
    const regenBtn = $("btn-caption-regen");
    if (regenBtn) regenBtn.addEventListener("click", generateCaptionAI);
    $("btn-publish-cover-paste").addEventListener("click", async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                toast("Le presse-papiers est vide.", "warning");
                return;
            }
            $("publish-cover-prompt").value = text;
            toast("Cover Prompt collé depuis le presse-papiers !", "success");
        } catch (err) {
            toast("Impossible d'accéder au presse-papiers.", "error");
        }
    });
    $("modal-publish").addEventListener("click", (e) => {
        if (e.target === $("modal-publish")) closePublishModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !$("modal-publish").classList.contains("hidden")) {
            closePublishModal();
        }
    });

    // --- Sauvegarde / nettoyage ---
    $("btn-save-song").addEventListener("click", saveCurrentSong);
    $("btn-clear-studio").addEventListener("click", () => {
        if (state.blocks.length === 0 && !state.stylePrompt) {
            toast("Le studio est déjà vide.", "info");
            return;
        }
        state.blocks = [];
        state.stylePrompt = "";
        state.coverPrompt = "";
        $("style-prompt").value = "";
        if ($("cover-prompt")) $("cover-prompt").value = "";
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