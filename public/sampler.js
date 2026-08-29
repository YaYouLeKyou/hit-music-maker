/* ============================================================
   Sampler / Beatmaker - Music Hit Maker
   - Grille de pads 4x4 déclenchable au clavier/toucher
   - Sons synthétisés via Web Audio API (pas de fichiers externes)
   - Enregistrement de loop, export WAV
   ============================================================ */

class Sampler {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.bpm = 120;
        this.isPlaying = false;
        this.currentStep = 0;
        this.schedulerInterval = null;
        this.pads = [];
        this.grid = Array(16).fill(null);
        this.loopBuffer = [];
        this.isRecording = false;
        this.recordStartTime = 0;
        this.recordedNotes = [];
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;
        this.lookahead = 25;
        this.packName = "Kit Défaut";
        this.onStepChange = null;
        this.onRecordUpdate = null;
    }

    init() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.audioCtx.destination);
    }

    setBPM(bpm) {
        this.bpm = Math.max(40, Math.min(240, Number(bpm) || 120));
    }

    getStepDuration() {
        return 60.0 / this.bpm / 4;
    }

    playSound(type, time = 0, volume = 1) {
        this.init();
        if (this.audioCtx.state === "suspended") this.audioCtx.resume();
        const t = time || this.audioCtx.currentTime;
        const gain = this.audioCtx.createGain();
        gain.connect(this.masterGain);
        gain.gain.value = volume;

        switch (type) {
            case "kick": {
                const osc = this.audioCtx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
                gain.gain.setValueAtTime(1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain);
                osc.start(t);
                osc.stop(t + 0.3);
                break;
            }
            case "snare": {
                const noise = this.audioCtx.createBufferSource();
                const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.2, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                const noiseGain = this.audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.8, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                noise.connect(noiseGain);
                noiseGain.connect(this.masterGain);
                noise.start(t);
                noise.stop(t + 0.2);
                const osc = this.audioCtx.createOscillator();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(180, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
                const oscGain = this.audioCtx.createGain();
                oscGain.gain.setValueAtTime(0.7, t);
                oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.connect(oscGain);
                oscGain.connect(this.masterGain);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
            }
            case "hihat": {
                const noise = this.audioCtx.createBufferSource();
                const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.1, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                const bandpass = this.audioCtx.createBiquadFilter();
                bandpass.type = "bandpass";
                bandpass.frequency.value = 8000;
                const noiseGain = this.audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.4, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                noise.connect(bandpass);
                bandpass.connect(noiseGain);
                noiseGain.connect(this.masterGain);
                noise.start(t);
                noise.stop(t + 0.1);
                break;
            }
            case "openhat": {
                const noise = this.audioCtx.createBufferSource();
                const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.3, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                const bandpass = this.audioCtx.createBiquadFilter();
                bandpass.type = "bandpass";
                bandpass.frequency.value = 6000;
                const noiseGain = this.audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.4, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                noise.connect(bandpass);
                bandpass.connect(noiseGain);
                noiseGain.connect(this.masterGain);
                noise.start(t);
                noise.stop(t + 0.3);
                break;
            }
            case "clap": {
                const noise = this.audioCtx.createBufferSource();
                const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.2, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                const noiseGain = this.audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.6, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                noise.connect(noiseGain);
                noiseGain.connect(this.masterGain);
                noise.start(t);
                noise.stop(t + 0.2);
                break;
            }
            case "tom": {
                const osc = this.audioCtx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
                gain.gain.setValueAtTime(0.8, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain);
                osc.start(t);
                osc.stop(t + 0.3);
                break;
            }
            case "rim": {
                const osc = this.audioCtx.createOscillator();
                osc.type = "square";
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.connect(gain);
                osc.start(t);
                osc.stop(t + 0.05);
                break;
            }
            case "cowbell": {
                const osc = this.audioCtx.createOscillator();
                osc.type = "square";
                osc.frequency.value = 560;
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain);
                osc.start(t);
                osc.stop(t + 0.3);
                break;
            }
            case "fx": {
                const osc = this.audioCtx.createOscillator();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.5);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                osc.connect(gain);
                osc.start(t);
                osc.stop(t + 0.5);
                break;
            }
            case "vocal": {
                const osc = this.audioCtx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain);
                osc.start(t);
                osc.stop(t + 0.3);
                break;
            }
        }
    }

    togglePad(padIndex) {
        if (padIndex < 0 || padIndex >= this.pads.length) return;
        const pad = this.pads[padIndex];
        this.playSound(pad.type, 0, pad.volume);
        this.triggerPadVisual(padIndex);
    }

    triggerPadVisual(padIndex) {
        const el = document.querySelector(`[data-pad="${padIndex}"]`);
        if (!el) return;
        el.classList.add("pad-active");
        setTimeout(() => el.classList.remove("pad-active"), 100);
    }

    startSequencer() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audioCtx.currentTime;
        this.scheduler();
    }

    stopSequencer() {
        this.isPlaying = false;
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        this.currentStep = 0;
        if (this.onStepChange) this.onStepChange(-1);
    }

    scheduler() {
        this.schedulerInterval = setInterval(() => {
            while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
                this.scheduleNote(this.currentStep, this.nextNoteTime);
                this.nextNoteTime += this.getStepDuration();
                this.currentStep = (this.currentStep + 1) % 16;
            }
        }, this.lookahead);
    }

    scheduleNote(step, time) {
        if (this.onStepChange) this.onStepChange(step);
        const activePads = this.pads.filter(p => this.grid[step] && this.grid[step].includes(p.id));
        activePads.forEach(pad => {
            this.playSound(pad.type, time, pad.volume);
        });
    }

    toggleStep(step, padId) {
        if (!this.grid[step]) this.grid[step] = [];
        const idx = this.grid[step].indexOf(padId);
        if (idx === -1) this.grid[step].push(padId);
        else this.grid[step].splice(idx, 1);
        if (this.grid[step].length === 0) this.grid[step] = null;
        return this.grid[step] !== null;
    }

    clearGrid() {
        this.grid = Array(16).fill(null);
    }

    startRecording() {
        this.isRecording = true;
        this.recordStartTime = this.audioCtx.currentTime;
        this.recordedNotes = [];
    }

    stopRecording() {
        this.isRecording = false;
        return this.recordedNotes;
    }

    recordNote(padIndex) {
        if (!this.isRecording) return;
        const time = this.audioCtx.currentTime - this.recordStartTime;
        this.recordedNotes.push({ padIndex, time });
    }

    playRecording(notes) {
        if (!notes || !notes.length) return;
        this.init();
        if (this.audioCtx.state === "suspended") this.audioCtx.resume();
        const duration = notes[notes.length - 1].time + 0.5;
        notes.forEach(note => {
            this.playSound(this.pads[note.padIndex].type, this.audioCtx.currentTime + note.time, this.pads[note.padIndex].volume);
        });
    }

    exportLoop() {
        if (!this.recordedNotes.length) return null;
        const sampleRate = this.audioCtx.sampleRate;
        const duration = this.recordedNotes[this.recordedNotes.length - 1].time + 0.5;
        const numSamples = Math.floor(sampleRate * duration);
        const offline = new OfflineAudioContext(1, numSamples, sampleRate);
        const master = offline.createGain();
        master.gain.value = 0.8;
        master.connect(offline.destination);
        this.recordedNotes.forEach(note => {
            const t = note.time;
            const gain = offline.createGain();
            gain.connect(master);
            const pad = this.pads[note.padIndex];
            if (!pad) return;
            switch (pad.type) {
                case "kick": {
                    const osc = offline.createOscillator();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(150, t);
                    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
                    gain.gain.setValueAtTime(1, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                    osc.connect(gain);
                    osc.start(t);
                    osc.stop(t + 0.3);
                    break;
                }
                case "snare": {
                    const osc = offline.createOscillator();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(180, t);
                    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
                    gain.gain.setValueAtTime(0.7, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                    osc.connect(gain);
                    osc.start(t);
                    osc.stop(t + 0.1);
                    break;
                }
                case "hihat": {
                    const buffer = offline.createBuffer(1, Math.floor(sampleRate * 0.1), sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                    const noise = offline.createBufferSource();
                    noise.buffer = buffer;
                    const bp = offline.createBiquadFilter();
                    bp.type = "bandpass";
                    bp.frequency.value = 8000;
                    noise.connect(bp);
                    bp.connect(gain);
                    gain.gain.setValueAtTime(0.4, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                    noise.start(t);
                    noise.stop(t + 0.1);
                    break;
                }
                default: {
                    const osc = offline.createOscillator();
                    osc.type = "sine";
                    osc.frequency.value = 440;
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                    osc.connect(gain);
                    osc.start(t);
                    osc.stop(t + 0.2);
                }
            }
        });
        return offline.startRendering();
    }
}

const sampler = new Sampler();
