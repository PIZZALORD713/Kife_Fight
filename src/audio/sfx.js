// src/audio/sfx.js
//
// Zero-asset game audio: every sound is synthesized with the Web Audio API at
// call time, so there are no files to ship and nothing to load. Plus a thin
// haptics wrapper (navigator.vibrate) for mobile/Telegram. One mute flag gates
// both, persisted to localStorage.
//
// Browsers block audio until a user gesture, so call `unlockAudio()` on the
// first interaction (ENTER ARENA / first tap) to create + resume the context.

let ctx = null;
let muted = (() => {
  try { return localStorage.getItem('kf_muted') === '1'; } catch { return false; }
})();

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('kf_muted', m ? '1' : '0'); } catch { /* ignore */ }
  if (!m) unlockAudio();
}

export function haptic(pattern) {
  if (muted) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
}

// A single oscillator with an attack/decay gain envelope; optional pitch glide.
function tone({ freq, type = 'triangle', dur = 0.12, peak = 0.22, glideTo = null, delay = 0 }) {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// A burst of filtered white noise — the "impact" texture under hits/blocks.
function noise({ dur = 0.1, peak = 0.2, type = 'highpass', freq = 1500, delay = 0 }) {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filt = c.createBiquadFilter();
  filt.type = type;
  filt.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(peak, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur);
}

export const sfx = {
  // light, slightly randomized so a rapid flurry doesn't comb-filter into a buzz
  hit() {
    const j = (Math.random() - 0.5) * 40;
    tone({ freq: 190 + j, type: 'square', dur: 0.05, peak: 0.1 });
    noise({ dur: 0.035, peak: 0.05, freq: 2600 });
  },
  crit() {
    tone({ freq: 520, type: 'triangle', dur: 0.13, peak: 0.22 });
    tone({ freq: 790, type: 'triangle', dur: 0.12, peak: 0.12, delay: 0.02 });
    noise({ dur: 0.06, peak: 0.12, freq: 3200 });
  },
  perfect() {
    [660, 880, 1180].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.1, peak: 0.2, delay: i * 0.05 }));
  },
  hurt() {
    tone({ freq: 150, type: 'sawtooth', dur: 0.12, peak: 0.16, glideTo: 70 });
    noise({ dur: 0.07, peak: 0.07, freq: 900 });
  },
  block() {
    tone({ freq: 340, type: 'square', dur: 0.05, peak: 0.1 });
    noise({ dur: 0.05, peak: 0.12, freq: 4200, type: 'bandpass' });
  },
  stun() {
    tone({ freq: 300, type: 'sine', dur: 0.28, peak: 0.16, glideTo: 110 });
  },
  ko() {
    noise({ dur: 0.32, peak: 0.34, freq: 700, type: 'lowpass' });
    tone({ freq: 220, type: 'sawtooth', dur: 0.5, peak: 0.3, glideTo: 45 });
  },
  countdownTick() {
    tone({ freq: 440, type: 'square', dur: 0.08, peak: 0.14 });
  },
  go() {
    tone({ freq: 680, type: 'square', dur: 0.18, peak: 0.2 });
    tone({ freq: 1020, type: 'square', dur: 0.18, peak: 0.1, delay: 0.05 });
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.16, peak: 0.2, delay: i * 0.09 }));
  },
  lose() {
    [392, 330, 262].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.22, peak: 0.18, delay: i * 0.11 }));
  },
};
