// src/constants/choreography.js
// Procedural fight-choreography vocabulary + beat grammar.
//
// The gameplay engine (useGameState) stays the single source of truth: it
// decides WHAT happened. This module only describes how to DRAMATIZE those
// events — the "animation grammar" sitting on top of a deterministic game.

// 7 discrete lane positions: -3..+3 (the tug-of-war "emotional scoreboard").
export const LANE_MAX = 3;

// The reusable action clips every fighter pack must provide.
export const CLIPS = {
  IDLE: 'IDLE',
  LUNGE: 'LUNGE',
  STRIKE: 'STRIKE',
  JAB: 'JAB',
  FLINCH: 'FLINCH',
  STUMBLE: 'STUMBLE',
  STUN: 'STUN',
  BLOCK: 'BLOCK',
  PRESS: 'PRESS',
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
};

// Placeholder playback: each clip maps to a CSS keyframe (see index.css).
// A real sprite-sheet pack swaps this for atlas frame ranges; nothing else moves.
export const CLIP_ANIM = {
  IDLE:    'fighter-idle 2.6s ease-in-out infinite',
  LUNGE:   'fighter-lunge 520ms ease-out',
  STRIKE:  'fighter-strike 420ms ease-out',
  JAB:     'fighter-jab 240ms ease-out',
  FLINCH:  'fighter-flinch 280ms ease-out',
  STUMBLE: 'fighter-stumble 520ms ease-out',
  STUN:    'fighter-stun 700ms ease-in-out',
  BLOCK:   'fighter-block 420ms ease-out',
  PRESS:   'fighter-press 520ms ease-out',
  VICTORY: 'fighter-victory 900ms ease-in-out',
  DEFEAT:  'fighter-defeat 900ms ease-in forwards',
};

// Lane → momentum. Lane-as-visualization: position is derived from the HP gap,
// so the fighters slide as the existing fight plays out (no gameplay rework).
// >0 ⇒ player ahead ⇒ pressure on the opponent (token drifts to THEM side).
export function healthToMomentum(playerHealth, opponentHealth) {
  return Math.max(-1, Math.min(1, (opponentHealth - playerHealth) / 100));
}
export const momentumToLane = (m) => Math.round(m * LANE_MAX);

// Tension — the REAL dramatic driver. NOT the HP gap (a blowout is boring); a
// nail-biter is when someone is nearly dead, the match is close, and the clock
// is running out. Drives the glitch/RGB intensity, shake and "FINISH HIM" tone
// so the screen screams loudest exactly when the moment is biggest.
export function computeTension({ playerHealth = 100, opponentHealth = 100, timeLeft = 99 }) {
  const minH = Math.min(playerHealth, opponentHealth);
  const danger = 1 - minH / 100;                                       // someone near death
  const closeness = 1 - Math.abs(playerHealth - opponentHealth) / 100; // an even match
  const timePressure = timeLeft <= 12 ? (12 - Math.max(0, timeLeft)) / 12 : 0;
  const core = danger * (0.55 + 0.45 * closeness); // low HP, weighted by how close it is
  return Math.max(0, Math.min(1, core + 0.45 * timePressure));
}
export function tensionToTone(t) {
  if (t >= 0.66) return 'chaos';
  if (t >= 0.33) return 'heated';
  return 'tense';
}

// Kept for the lane token's reference; tone now comes from tension above.
export function laneToTone(lane) {
  const d = Math.abs(lane);
  if (d >= 3) return 'chaos';
  if (d >= 2) return 'heated';
  return 'tense';
}
const TONE_SHAKE = { tense: 1, heated: 1.35, chaos: 1.75 };
const SHAKE_PX = { XS: 2, S: 4, M: 8, L: 14 };
export const shakePixels = (size, tone) =>
  (SHAKE_PX[size] || 0) * (TONE_SHAKE[tone] || 1);

// Clips where the fighter is actively delivering a strike — used to derive
// attacker/defender so the stage can dash the attacker into range and knock
// the defender back, instead of two isolated local wobbles.
export const ATTACK_CLIPS = new Set([CLIPS.JAB, CLIPS.STRIKE, CLIPS.LUNGE, CLIPS.PRESS]);

// How far/long each attack clip's contact-dash runs, matched to that clip's own
// CLIP_ANIM duration and the frame where its pose reaches full extension —
// keeps the body-position dash and the local pose flourish arriving together.
export const DASH_TIMING = {
  [CLIPS.JAB]:    { duration: 240, contact: 0.42 },
  [CLIPS.STRIKE]: { duration: 420, contact: 0.42 },
  [CLIPS.LUNGE]:  { duration: 520, contact: 0.50 },
  [CLIPS.PRESS]:  { duration: 520, contact: 0.48 },
};
export const DEFAULT_DASH_TIMING = { duration: 320, contact: 0.4 };

// A defender who's BLOCKing absorbs most of the shove — everyone else (a real
// flinch/stumble) takes the full knockback.
export const KNOCKBACK_MULT = { [CLIPS.BLOCK]: 0.35 };

// The beat grammar: a gameplay event → a paired beat (aggressor + defender
// clips, FX, and the contact frame when the hit lands). This is the table the
// choreography director reads.
// `priority` lets a big beat survive a flurry of small ones: a low-priority jab
// never interrupts a still-playing crit/KO. `hitstop` freezes the stage for N ms
// on the contact frame. Priorities: 0 jab/hurt · 1 prompt/block · 2 KO.
export const BEATS = {
  PLAYER_JAB:     { player: CLIPS.JAB,     opponent: CLIPS.FLINCH,  fx: { shake: 'XS', rgb: 0.12 }, contact: 70,  duration: 240, priority: 0 },
  PLAYER_HURT:    { player: CLIPS.FLINCH,  opponent: CLIPS.STRIKE,  fx: { shake: 'XS', rgb: 0.12 }, contact: 60,  duration: 300, priority: 0 },
  PLAYER_WIN:     { player: CLIPS.LUNGE,   opponent: CLIPS.STUMBLE, fx: { shake: 'M', rgb: 0.55 }, contact: 130, duration: 540, priority: 1 },
  PLAYER_PERFECT: { player: CLIPS.LUNGE,   opponent: CLIPS.STUMBLE, fx: { shake: 'L', rgb: 0.95, hitstop: 70 }, contact: 130, duration: 620, priority: 1 },
  PLAYER_FAIL:    { player: CLIPS.STUN,    opponent: CLIPS.PRESS,   fx: { shake: 'S', rgb: 0.40 }, contact: 110, duration: 720, priority: 1 },
  PLAYER_BLOCK:   { player: CLIPS.BLOCK,   opponent: CLIPS.STRIKE,  fx: { shake: 'S', rgb: 0.30 }, contact: 120, duration: 440, priority: 1 },
  KO_WIN:         { player: CLIPS.VICTORY, opponent: CLIPS.DEFEAT,  fx: { shake: 'L', rgb: 1.0, finisher: true, hitstop: 130 }, contact: 90, duration: 920, priority: 2 },
  KO_LOSE:        { player: CLIPS.DEFEAT,  opponent: CLIPS.VICTORY, fx: { shake: 'L', rgb: 1.0, finisher: true, hitstop: 130 }, contact: 90, duration: 920, priority: 2 },
};

// The fighter-pack contract. A real character ships an atlas + clip frame data
// that satisfies CLIPS; the engine and stage never change. Roster (Pepe, Mog,
// NFT skins) all plug in here.
export const FIGHTER_PACKS = {
  player: { id: 'player', name: 'YOU',  accent: '#ef4444', trim: '#fca5a5', atlas: null },
  rival:  { id: 'rival',  name: 'THEM', accent: '#38bdf8', trim: '#bae6fd', atlas: null },
};
