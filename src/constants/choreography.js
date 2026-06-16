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

// Tonal mix: tense in the centre, escalating to chaos at the lane edges.
export function laneToTone(lane) {
  const d = Math.abs(lane);
  if (d >= 3) return 'chaos';
  if (d >= 2) return 'heated';
  return 'tense';
}
const TONE_SHAKE = { tense: 1, heated: 1.35, chaos: 1.75 };
const SHAKE_PX = { S: 4, M: 8, L: 14 };
export const shakePixels = (size, tone) =>
  (SHAKE_PX[size] || 0) * (TONE_SHAKE[tone] || 1);

// The beat grammar: a gameplay event → a paired beat (aggressor + defender
// clips, FX, and the contact frame when the hit lands). This is the table the
// choreography director reads.
export const BEATS = {
  PLAYER_WIN:     { player: CLIPS.LUNGE,   opponent: CLIPS.STUMBLE, fx: { shake: 'M', rgb: 0.55 }, contact: 130, duration: 540 },
  PLAYER_PERFECT: { player: CLIPS.LUNGE,   opponent: CLIPS.STUMBLE, fx: { shake: 'L', rgb: 0.95 }, contact: 130, duration: 620 },
  PLAYER_FAIL:    { player: CLIPS.STUN,    opponent: CLIPS.PRESS,   fx: { shake: 'S', rgb: 0.40 }, contact: 110, duration: 720 },
  PLAYER_BLOCK:   { player: CLIPS.BLOCK,   opponent: CLIPS.STRIKE,  fx: { shake: 'S', rgb: 0.30 }, contact: 120, duration: 440 },
  KO_WIN:         { player: CLIPS.VICTORY, opponent: CLIPS.DEFEAT,  fx: { shake: 'L', rgb: 1.0, finisher: true }, contact: 90, duration: 920 },
  KO_LOSE:        { player: CLIPS.DEFEAT,  opponent: CLIPS.VICTORY, fx: { shake: 'L', rgb: 1.0, finisher: true }, contact: 90, duration: 920 },
};

// The fighter-pack contract. A real character ships an atlas + clip frame data
// that satisfies CLIPS; the engine and stage never change. Roster (Pepe, Mog,
// NFT skins) all plug in here.
export const FIGHTER_PACKS = {
  player: { id: 'player', name: 'YOU',  accent: '#ef4444', trim: '#fca5a5', atlas: null },
  rival:  { id: 'rival',  name: 'THEM', accent: '#38bdf8', trim: '#bae6fd', atlas: null },
};
