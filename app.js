const programs = [
  { id: "deep-sleep", name: "Tiefer Schlaf", category: "SCHLAF", description: "Delta · 2 Hz", beat: 2, carrier: 180, wave: "Delta", icon: "☾", color: "81, 113, 214" },
  { id: "regeneration", name: "Regeneration", category: "ERHOLUNG", description: "Delta · 3 Hz", beat: 3, carrier: 190, wave: "Delta", icon: "✦", color: "86, 142, 221" },
  { id: "meditation", name: "Meditation", category: "ACHTSAMKEIT", description: "Theta · 6 Hz", beat: 6, carrier: 210, wave: "Theta", icon: "◌", color: "133, 103, 225" },
  { id: "dream", name: "Traumreise", category: "KREATIVITÄT", description: "Theta · 7 Hz", beat: 7, carrier: 216, wave: "Theta", icon: "◐", color: "119, 92, 214" },
  { id: "calm", name: "Sanfte Ruhe", category: "ENTSPANNUNG", description: "Alpha · 10 Hz", beat: 10, carrier: 225, wave: "Alpha", icon: "≈", color: "84, 156, 230" },
  { id: "stress", name: "Stress lösen", category: "BALANCE", description: "Alpha · 8 Hz", beat: 8, carrier: 220, wave: "Alpha", icon: "∿", color: "69, 173, 197" },
  { id: "focus", name: "Klarer Fokus", category: "KONZENTRATION", description: "Beta · 18 Hz", beat: 18, carrier: 250, wave: "Beta", icon: "◎", color: "76, 164, 238" },
  { id: "energy", name: "Neue Energie", category: "AKTIVITÄT", description: "Beta · 24 Hz", beat: 24, carrier: 280, wave: "Beta", icon: "ϟ", color: "90, 187, 235" },
  { id: "learning", name: "Lernen", category: "GEDÄCHTNIS", description: "Gamma · 40 Hz", beat: 40, carrier: 320, wave: "Gamma", icon: "◇", color: "116, 146, 247" },
  { id: "insight", name: "Geistesblitz", category: "EINSICHT", description: "Gamma · 45 Hz", beat: 45, carrier: 340, wave: "Gamma", icon: "✧", color: "155, 115, 235" }
];

const solfeggio = [
  { hz: 174, label: "Erdung" },
  { hz: 285, label: "Ruhe" },
  { hz: 396, label: "Loslassen" },
  { hz: 417, label: "Wandel" },
  { hz: 432, label: "Harmonie" },
  { hz: 528, label: "Balance" },
  { hz: 639, label: "Verbindung" },
  { hz: 741, label: "Klarheit" },
  { hz: 852, label: "Intuition" },
  { hz: 963, label: "Stille" }
];

const soundscapes = [
  { id: "rain", name: "Regen", icon: '<path d="M7 16a4 4 0 0 1 .7-7.9A5.5 5.5 0 0 1 18 10h.5a3.5 3.5 0 0 1 0 7H7Z"/><path d="m9 19-1 2m5-2-1 2m5-2-1 2"/>' },
  { id: "ocean", name: "Ozean", icon: '<path d="M3 8c3-2 5-2 8 0s5 2 10 0M3 13c3-2 5-2 8 0s5 2 10 0M3 18c3-2 5-2 8 0s5 2 10 0"/>' },
  { id: "forest", name: "Wald", icon: '<path d="m12 3-5 7h3l-4 6h5v5h2v-5h5l-4-6h3l-5-7Z"/>' },
  { id: "fire", name: "Feuer", icon: '<path d="M13 3s1 4-2 6c-2-3-5 1-5 5a6 6 0 0 0 12 0c0-3-2-6-5-11Z"/><path d="M12 13c-2 1-2 3-1 5h2c1-2 1-4-1-5Z"/>' },
  { id: "brown", name: "Braunes Rauschen", icon: '<path d="M4 13h2l2-6 3 11 3-12 2 7h4"/>' },
  { id: "space", name: "Kosmos", icon: '<circle cx="12" cy="12" r="3"/><path d="M3 12c3-4 15-4 18 0-3 4-15 4-18 0ZM8 3c4 3 7 15 4 18-4-2-7-14-4-18Z"/>' }
];

const timerValues = [0, 10, 20, 30, 45, 60, 90];

const state = {
  current: programs.find((item) => item.id === "calm"),
  mode: "binaural",
  beat: 10,
  carrier: 225,
  playing: false,
  timerMinutes: 0,
  timerRemaining: 0,
  timerInterval: null,
  timerStartedAt: null,
  activeAmbiences: new Set(),
  favorites: new Set(JSON.parse(localStorage.getItem("frequenz-favorites") || "[]")),
  favoritesOnly: false,
  headphoneConfirmed: localStorage.getItem("frequenz-headphones") === "yes",
  wakeLock: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const els = {
  programList: $("#programList"),
  nowCard: $(".now-card"),
  nowCategory: $("#nowCategory"),
  nowTitle: $("#nowTitle"),
  nowDescription: $("#nowDescription"),
  liveFrequency: $("#liveFrequency"),
  favoriteButton: $("#favoriteButton"),
  favoritesFilter: $("#favoritesFilter"),
  beatRange: $("#beatRange"),
  beatValue: $("#beatValue"),
  carrierRange: $("#carrierRange"),
  carrierValue: $("#carrierValue"),
  solfeggioList: $("#solfeggioList"),
  soundscapeGrid: $("#soundscapeGrid"),
  ambientVolume: $("#ambientVolume"),
  ambientVolumeValue: $("#ambientVolumeValue"),
  clearAmbience: $("#clearAmbience"),
  timerOptions: $("#timerOptions"),
  timerStatus: $("#timerStatus"),
  playButton: $("#playButton"),
  playerTitle: $("#playerTitle"),
  playerMeta: $("#playerMeta"),
  progressBar: $("#progressBar"),
  volumeButton: $("#volumeButton"),
  masterVolumePanel: $("#masterVolumePanel"),
  masterVolume: $("#masterVolume"),
  masterVolumeValue: $("#masterVolumeValue"),
  infoDialog: $("#infoDialog"),
  headphoneDialog: $("#headphoneDialog"),
  confirmPlayback: $("#confirmPlayback"),
  toast: $("#toast")
};

function formatHz(value) {
  return Number(value).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Hz";
}

function waveName(beat) {
  if (beat < 4) return "Delta";
  if (beat < 8) return "Theta";
  if (beat < 14) return "Alpha";
  if (beat <= 30) return "Beta";
  return "Gamma";
}

function timerLabel(minutes) {
  return minutes === 0 ? "Ohne Ende" : `${minutes} Min.`;
}

function formatTime(seconds) {
  const value = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function setRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value);
  input.style.setProperty("--fill", `${((value - min) / (max - min)) * 100}%`);
}

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.toneBus = null;
    this.ambientBus = null;
    this.compressor = null;
    this.toneNodes = [];
    this.ambientNodes = new Map();
    this.masterVolume = Number(els.masterVolume.value);
    this.ambientVolume = Number(els.ambientVolume.value);
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state !== "running") await this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error("Web Audio wird nicht unterstützt");
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.toneBus = this.ctx.createGain();
    this.ambientBus = this.ctx.createGain();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 22;
    this.compressor.ratio.value = 5;
    this.compressor.attack.value = 0.025;
    this.compressor.release.value = 0.32;
    this.master.gain.value = this.masterVolume;
    this.toneBus.gain.value = 0.58;
    this.ambientBus.gain.value = this.ambientVolume;
    this.toneBus.connect(this.master);
    this.ambientBus.connect(this.master);
    this.master.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // Older and current iOS Safari versions may keep a new AudioContext
    // suspended until a source is started directly inside the tap event.
    const unlockSource = this.ctx.createBufferSource();
    unlockSource.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
    unlockSource.connect(this.ctx.destination);
    unlockSource.start(0);
    await this.ctx.resume();
  }

  async start() {
    // Do not wait before creating the oscillators. On iOS the complete audio
    // graph must be started during the user's original tap gesture.
    const ready = this.init();
    this.restoreMaster();
    this.buildTone();
    state.activeAmbiences.forEach((id) => this.startAmbience(id));
    await ready;
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  pause() {
    this.stopTone();
    [...this.ambientNodes.keys()].forEach((id) => this.stopAmbience(id));
  }

  stopTone() {
    this.toneNodes.forEach((node) => {
      try { node.stop?.(); } catch (_) { /* already stopped */ }
      try { node.disconnect?.(); } catch (_) { /* disconnected */ }
    });
    this.toneNodes = [];
  }

  buildTone() {
    if (!this.ctx) return;
    this.stopTone();
    const now = this.ctx.currentTime;
    const beat = Math.max(0.5, Number(state.beat));
    const carrier = Number(state.carrier);

    if (state.mode === "binaural") {
      const frequencies = [Math.max(30, carrier - beat / 2), carrier + beat / 2];
      frequencies.forEach((frequency, index) => {
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.42, now + 1.8);
        pan.pan.value = index === 0 ? -1 : 1;
        oscillator.connect(gain).connect(pan).connect(this.toneBus);
        oscillator.start();
        this.toneNodes.push(oscillator, gain, pan);
      });
    } else if (state.mode === "isochronic") {
      const oscillator = this.ctx.createOscillator();
      const pulseGain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoDepth = this.ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = carrier;
      lfo.type = "sine";
      lfo.frequency.value = beat;
      pulseGain.gain.value = 0.48;
      lfoDepth.gain.value = 0.45;
      lfo.connect(lfoDepth).connect(pulseGain.gain);
      oscillator.connect(pulseGain).connect(this.toneBus);
      oscillator.start();
      lfo.start();
      this.toneNodes.push(oscillator, pulseGain, lfo, lfoDepth);
    } else {
      [1, 2].forEach((multiple, index) => {
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.value = carrier * multiple;
        gain.gain.value = index === 0 ? 0.62 : 0.06;
        oscillator.connect(gain).connect(this.toneBus);
        oscillator.start();
        this.toneNodes.push(oscillator, gain);
      });
    }
  }

  createNoise(kind = "white", seconds = 8) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let brown = 0;
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        if (kind === "brown") {
          brown = (brown + 0.02 * white) / 1.02;
          data[i] = brown * 3.4;
        } else if (kind === "pink") {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
          b6 = white * 0.115926;
        } else {
          data[i] = white;
        }
      }
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  startAmbience(id) {
    if (!this.ctx || this.ambientNodes.has(id)) return;
    const nodes = [];
    const intervals = [];
    const connectNoise = (kind, high, low, gainValue) => {
      const source = this.createNoise(kind);
      const gain = this.ctx.createGain();
      let tail = source;
      if (high) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = high;
        tail.connect(filter);
        tail = filter;
        nodes.push(filter);
      }
      if (low) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = low;
        tail.connect(filter);
        tail = filter;
        nodes.push(filter);
      }
      gain.gain.value = gainValue;
      tail.connect(gain).connect(this.ambientBus);
      source.start();
      nodes.push(source, gain);
      return { source, gain };
    };

    if (id === "rain") {
      connectNoise("white", 700, 9200, 0.34);
      connectNoise("pink", 150, 1800, 0.09);
    }

    if (id === "ocean") {
      const { gain } = connectNoise("brown", 30, 780, 0.28);
      const lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = 0.1;
      depth.gain.value = 0.2;
      lfo.connect(depth).connect(gain.gain);
      lfo.start();
      nodes.push(lfo, depth);
    }

    if (id === "forest") {
      connectNoise("pink", 60, 1700, 0.18);
      const bird = () => {
        if (!this.ambientNodes.has(id) || !state.playing) return;
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner();
        const now = this.ctx.currentTime;
        const base = 1400 + Math.random() * 900;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(base, now);
        oscillator.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.18);
        oscillator.frequency.exponentialRampToValueAtTime(base * 1.08, now + 0.42);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.055, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        pan.pan.value = Math.random() * 1.6 - 0.8;
        oscillator.connect(gain).connect(pan).connect(this.ambientBus);
        oscillator.start(now);
        oscillator.stop(now + 0.55);
      };
      const interval = setInterval(bird, 2800 + Math.random() * 1700);
      intervals.push(interval);
      setTimeout(bird, 800);
    }

    if (id === "fire") {
      connectNoise("brown", 80, 1250, 0.22);
      const crackle = () => {
        if (!this.ambientNodes.has(id) || !state.playing) return;
        const source = this.createNoise("white", 0.12);
        source.loop = false;
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        filter.type = "bandpass";
        filter.frequency.value = 900 + Math.random() * 2600;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12 + Math.random() * 0.1, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        source.connect(filter).connect(gain).connect(this.ambientBus);
        source.start();
      };
      const interval = setInterval(crackle, 220 + Math.random() * 260);
      intervals.push(interval);
    }

    if (id === "brown") connectNoise("brown", 25, 1300, 0.38);

    if (id === "space") {
      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner();
        oscillator.type = index === 1 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.07 : 0.035;
        pan.pan.value = (index - 1) * 0.55;
        oscillator.connect(gain).connect(pan).connect(this.ambientBus);
        oscillator.start();
        nodes.push(oscillator, gain, pan);
      });
    }

    this.ambientNodes.set(id, { nodes, intervals });
  }

  stopAmbience(id) {
    const entry = this.ambientNodes.get(id);
    if (!entry) return;
    entry.intervals.forEach(clearInterval);
    entry.nodes.forEach((node) => {
      try { node.stop?.(); } catch (_) { /* already stopped */ }
      try { node.disconnect?.(); } catch (_) { /* disconnected */ }
    });
    this.ambientNodes.delete(id);
  }

  setMasterVolume(value) {
    this.masterVolume = Number(value);
    this.restoreMaster();
  }

  setAmbientVolume(value) {
    this.ambientVolume = Number(value);
    if (this.ambientBus && this.ctx) this.ambientBus.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.05);
  }

  restoreMaster() {
    if (!this.master || !this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(Math.max(0.0001, this.masterVolume), this.ctx.currentTime, 0.03);
  }

  fadeOut(seconds = 5) {
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  }
}

const audio = new AudioEngine();

function renderPrograms() {
  const visible = state.favoritesOnly ? programs.filter((item) => state.favorites.has(item.id)) : programs;
  if (!visible.length) {
    els.programList.innerHTML = '<div class="empty-favorites">Noch keine Favoriten gespeichert. Tippe bei einem Programm auf das Herz.</div>';
    return;
  }
  els.programList.innerHTML = visible.map((item) => `
    <button class="program-card ${state.current.id === item.id ? "active" : ""}" style="--card-color:${item.color}" data-program="${item.id}" type="button" role="listitem">
      <span class="program-icon" aria-hidden="true">${item.icon}</span>
      <strong>${item.name}</strong>
      <small>${item.description}</small>
    </button>`).join("");
}

function renderSolfeggio() {
  els.solfeggioList.innerHTML = solfeggio.map((item) => `
    <button class="frequency-chip ${state.current.id === `sol-${item.hz}` ? "active" : ""}" data-solfeggio="${item.hz}" type="button" role="listitem">
      <strong>${item.hz} Hz</strong><small>${item.label}</small>
    </button>`).join("");
}

function renderSoundscapes() {
  els.soundscapeGrid.innerHTML = soundscapes.map((item) => `
    <button class="soundscape-button ${state.activeAmbiences.has(item.id) ? "active" : ""}" data-soundscape="${item.id}" type="button" aria-pressed="${state.activeAmbiences.has(item.id)}">
      <i aria-hidden="true"></i><svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg><span>${item.name}</span>
    </button>`).join("");
}

function renderTimers() {
  els.timerOptions.innerHTML = timerValues.map((minutes) => `
    <button class="timer-option ${state.timerMinutes === minutes ? "active" : ""}" data-timer="${minutes}" type="button">${minutes === 0 ? "∞" : `${minutes} Min.`}</button>`).join("");
}

function updateNowPlaying() {
  const current = state.current;
  els.nowCategory.textContent = current.category;
  els.nowTitle.textContent = current.name;
  els.nowDescription.textContent = current.description;
  els.playerTitle.textContent = current.name;
  const left = state.mode === "binaural" ? Math.max(30, state.carrier - state.beat / 2) : state.carrier;
  const right = state.mode === "binaural" ? state.carrier + state.beat / 2 : state.carrier;
  els.liveFrequency.textContent = state.mode === "binaural" ? `${formatHz(left).replace(" Hz", "")} / ${formatHz(right)}` : formatHz(state.carrier);
  els.favoriteButton.setAttribute("aria-pressed", String(state.favorites.has(current.id)));
  els.favoriteButton.setAttribute("aria-label", state.favorites.has(current.id) ? "Aus Favoriten entfernen" : "Als Favorit speichern");
  renderPrograms();
  renderSolfeggio();
  updatePlayerMeta();
  updateMediaSession();
}

function updateControls() {
  els.beatRange.value = String(state.beat);
  els.carrierRange.value = String(Math.min(500, state.carrier));
  els.beatValue.textContent = formatHz(state.beat);
  els.carrierValue.textContent = formatHz(state.carrier);
  setRangeFill(els.beatRange);
  setRangeFill(els.carrierRange);
  $$(".mode-tab").forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  els.beatRange.disabled = state.mode === "pure";
  els.beatRange.style.opacity = state.mode === "pure" ? ".42" : "1";
}

function selectProgram(id) {
  const selected = programs.find((item) => item.id === id);
  if (!selected) return;
  state.current = selected;
  state.beat = selected.beat;
  state.carrier = selected.carrier;
  if (state.mode === "pure") state.mode = "binaural";
  updateControls();
  updateNowPlaying();
  if (state.playing) audio.buildTone();
}

function selectSolfeggio(hz) {
  const tone = solfeggio.find((item) => item.hz === hz);
  if (!tone) return;
  state.current = { id: `sol-${hz}`, name: `${hz} Hz`, category: "SOLFEGGIO", description: `${tone.label} · Reiner Ton`, beat: state.beat, carrier: hz, wave: "Solfeggio" };
  state.carrier = hz;
  state.mode = "pure";
  updateControls();
  updateNowPlaying();
  if (state.playing) audio.buildTone();
}

function setCustomTone() {
  const wave = waveName(state.beat);
  state.current = {
    id: "custom",
    name: "Eigene Frequenz",
    category: "FREQUENZ-STUDIO",
    description: state.mode === "pure" ? `${formatHz(state.carrier)} · Reiner Ton` : `${wave} · ${formatHz(state.beat)}`,
    beat: state.beat,
    carrier: state.carrier,
    wave
  };
  updateNowPlaying();
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || state.wakeLock) return;
  try { state.wakeLock = await navigator.wakeLock.request("screen"); } catch (_) { /* optional */ }
}

async function releaseWakeLock() {
  if (!state.wakeLock) return;
  try { await state.wakeLock.release(); } catch (_) { /* already released */ }
  state.wakeLock = null;
}

async function startPlayback() {
  try {
    await audio.start();
    state.playing = true;
    document.body.classList.add("is-playing");
    els.playButton.setAttribute("aria-label", "Wiedergabe pausieren");
    startTimer();
    updatePlayerMeta();
    updateMediaSession();
    requestWakeLock();
  } catch (error) {
    showToast(error.message || "Audio konnte nicht gestartet werden");
  }
}

function pausePlayback() {
  audio.pause();
  state.playing = false;
  document.body.classList.remove("is-playing");
  els.playButton.setAttribute("aria-label", "Wiedergabe starten");
  pauseTimer();
  audio.restoreMaster();
  updatePlayerMeta();
  updateMediaSession();
  releaseWakeLock();
}

function stopPlayback(completed = false) {
  pausePlayback();
  state.timerRemaining = state.timerMinutes * 60;
  els.progressBar.style.width = "0%";
  updateTimerStatus();
  if (completed) showToast("Deine Sitzung ist beendet");
}

function togglePlayback() {
  if (state.playing) {
    pausePlayback();
    return;
  }
  startPlayback();
}

function startTimer() {
  clearInterval(state.timerInterval);
  if (!state.timerMinutes) {
    state.timerRemaining = 0;
    state.timerStartedAt = null;
    updateTimerStatus();
    return;
  }
  if (!state.timerRemaining || state.timerRemaining > state.timerMinutes * 60) state.timerRemaining = state.timerMinutes * 60;
  state.timerStartedAt = Date.now();
  state.timerInterval = setInterval(tickTimer, 250);
  tickTimer();
}

function pauseTimer() {
  if (state.timerMinutes && state.timerStartedAt) {
    const elapsed = (Date.now() - state.timerStartedAt) / 1000;
    state.timerRemaining = Math.max(0, state.timerRemaining - elapsed);
  }
  state.timerStartedAt = null;
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  updateTimerStatus();
}

function tickTimer() {
  if (!state.playing || !state.timerStartedAt) return;
  const elapsed = (Date.now() - state.timerStartedAt) / 1000;
  const remaining = Math.max(0, state.timerRemaining - elapsed);
  const total = state.timerMinutes * 60;
  els.timerStatus.textContent = formatTime(remaining);
  els.playerMeta.textContent = `${state.mode === "binaural" ? "Binaural" : state.mode === "isochronic" ? "Lautsprecher" : "Reiner Ton"} · ${formatTime(remaining)}`;
  els.progressBar.style.width = `${Math.min(100, ((total - remaining) / total) * 100)}%`;
  if (remaining <= 5 && remaining > 4.7) audio.fadeOut(5);
  if (remaining <= 0) {
    state.timerRemaining = 0;
    stopPlayback(true);
  }
}

function updateTimerStatus() {
  els.timerStatus.textContent = state.timerMinutes ? formatTime(state.timerRemaining || state.timerMinutes * 60) : "Ohne Ende";
  updatePlayerMeta();
}

function updatePlayerMeta() {
  const modeLabel = state.mode === "binaural" ? "Binaural" : state.mode === "isochronic" ? "Lautsprecher" : "Reiner Ton";
  const timerText = state.timerMinutes ? formatTime(state.timerRemaining || state.timerMinutes * 60) : "Ohne Ende";
  els.playerMeta.textContent = `${state.playing ? modeLabel : "Bereit"} · ${timerText}`;
}

function updateMediaSession() {
  if (!("mediaSession" in navigator) || !("MediaMetadata" in window)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: state.current.name,
    artist: "Frequenz",
    album: state.current.description,
    artwork: [
      { src: "assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "assets/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  });
  navigator.mediaSession.playbackState = state.playing ? "playing" : "paused";
}

function attachEvents() {
  els.programList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-program]");
    if (button) selectProgram(button.dataset.program);
  });

  els.solfeggioList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-solfeggio]");
    if (button) selectSolfeggio(Number(button.dataset.solfeggio));
  });

  els.soundscapeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-soundscape]");
    if (!button) return;
    const id = button.dataset.soundscape;
    if (state.activeAmbiences.has(id)) {
      state.activeAmbiences.delete(id);
      audio.stopAmbience(id);
    } else {
      state.activeAmbiences.add(id);
      if (state.playing) audio.startAmbience(id);
    }
    renderSoundscapes();
  });

  els.clearAmbience.addEventListener("click", () => {
    [...state.activeAmbiences].forEach((id) => audio.stopAmbience(id));
    state.activeAmbiences.clear();
    renderSoundscapes();
  });

  els.timerOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-timer]");
    if (!button) return;
    state.timerMinutes = Number(button.dataset.timer);
    state.timerRemaining = state.timerMinutes * 60;
    state.timerStartedAt = state.playing && state.timerMinutes ? Date.now() : null;
    if (state.playing) startTimer();
    else updateTimerStatus();
    renderTimers();
  });

  $$(".mode-tab").forEach((button) => button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    updateControls();
    setCustomTone();
    if (state.playing) audio.buildTone();
  }));

  els.beatRange.addEventListener("input", () => {
    state.beat = Number(els.beatRange.value);
    els.beatValue.textContent = formatHz(state.beat);
    setRangeFill(els.beatRange);
    setCustomTone();
    if (state.playing) audio.buildTone();
  });

  els.carrierRange.addEventListener("input", () => {
    state.carrier = Number(els.carrierRange.value);
    els.carrierValue.textContent = formatHz(state.carrier);
    setRangeFill(els.carrierRange);
    setCustomTone();
    if (state.playing) audio.buildTone();
  });

  els.favoriteButton.addEventListener("click", () => {
    if (!programs.some((item) => item.id === state.current.id)) return showToast("Favoriten sind für Programme verfügbar");
    if (state.favorites.has(state.current.id)) {
      state.favorites.delete(state.current.id);
      showToast("Aus Favoriten entfernt");
    } else {
      state.favorites.add(state.current.id);
      showToast("Als Favorit gespeichert");
    }
    localStorage.setItem("frequenz-favorites", JSON.stringify([...state.favorites]));
    updateNowPlaying();
  });

  els.favoritesFilter.addEventListener("click", () => {
    state.favoritesOnly = !state.favoritesOnly;
    els.favoritesFilter.setAttribute("aria-pressed", String(state.favoritesOnly));
    renderPrograms();
  });

  els.playButton.addEventListener("click", togglePlayback);
  els.confirmPlayback.addEventListener("click", () => {
    state.headphoneConfirmed = true;
    localStorage.setItem("frequenz-headphones", "yes");
    els.headphoneDialog.close();
    startPlayback();
  });

  els.volumeButton.addEventListener("click", () => {
    const isOpen = els.masterVolumePanel.classList.toggle("open");
    els.volumeButton.setAttribute("aria-expanded", String(isOpen));
  });

  els.masterVolume.addEventListener("input", () => {
    audio.setMasterVolume(els.masterVolume.value);
    els.masterVolumeValue.textContent = `${Math.round(Number(els.masterVolume.value) * 100)} %`;
    setRangeFill(els.masterVolume);
  });

  els.ambientVolume.addEventListener("input", () => {
    audio.setAmbientVolume(els.ambientVolume.value);
    els.ambientVolumeValue.textContent = `${Math.round(Number(els.ambientVolume.value) * 100)} %`;
    setRangeFill(els.ambientVolume);
  });

  $("#infoButton").addEventListener("click", () => els.infoDialog.showModal());
  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
  [els.infoDialog, els.headphoneDialog].forEach((dialog) => dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  }));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.playing) requestWakeLock();
  });

  window.addEventListener("beforeunload", () => {
    if (state.playing) audio.pause();
  });

  if ("mediaSession" in navigator) {
    [["play", startPlayback], ["pause", pausePlayback], ["stop", () => stopPlayback(false)]].forEach(([action, handler]) => {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch (_) { /* action not supported */ }
    });
  }
}

function init() {
  renderPrograms();
  renderSolfeggio();
  renderSoundscapes();
  renderTimers();
  updateControls();
  updateNowPlaying();
  [els.beatRange, els.carrierRange, els.masterVolume, els.ambientVolume].forEach(setRangeFill);
  attachEvents();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
  }
}

init();