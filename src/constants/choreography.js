// src/constants/choreography.js
// Procedural fight-choreography vocabulary + a branching sequence grammar.
//
// The gameplay engine stays the source of truth. This module describes how to
// DRAMATIZE its events as multi-beat scripted sequences that branch on who is
// winning and by how much — so a dominant fighter lands a punishing combo while
// a cornered one scraps for a single desperate counter.

export const LANE_MAX = 3; // 7 discrete lane positions: -3..+3

export const CLIPS = {
  IDLE: 'IDLE',
  LUNGE: 'LUNGE',
  STRIKE: 'STRIKE',
  STUMBLE: 'STUMBLE',
  STUN: 'STUN',
  BLOCK: 'BLOCK',
  PRESS: 'PRESS',
  GUARD: 'GUARD',     // brace behind a raised shield (CHARGE success)
  RECOVER: 'RECOVER', // step back and breathe (PAUSE heal)
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
};

export const CLIP_ANIM = {
  IDLE:    'fighter-idle 2.6s ease-in-out infinite',
  LUNGE:   'fighter-lunge 520ms ease-out',
  STRIKE:  'fighter-strike 420ms ease-out',
  STUMBLE: 'fighter-stumble 520ms ease-out',
  STUN:    'fighter-stun 700ms ease-in-out',
  BLOCK:   'fighter-block 420ms ease-out',
  PRESS:   'fighter-press 520ms ease-out',
  GUARD:   'fighter-guard 520ms ease-out',
  RECOVER: 'fighter-recover 600ms ease-out',
  VICTORY: 'fighter-victory 900ms ease-in-out',
  DEFEAT:  'fighter-defeat 900ms ease-in forwards',
};

// Lane-as-visualization: position derived from the HP gap, from the player's
// perspective. >0 ⇒ player ahead ⇒ pressure on the opponent (token drifts to
// THEM side); <0 ⇒ player cornered. Same sign convention as the comeback engine.
export function healthToMomentum(playerHealth, opponentHealth) {
  return Math.max(-1, Math.min(1, (playerHealth - opponentHealth) / 100));
}
export const momentumToLane = (m) => Math.round(m * LANE_MAX);

// Tonal mix: tense in the centre, escalating to chaos at the lane edges.
export function laneToTone(lane) {
  const d = Math.abs(lane);
  if (d >= 3) return 'chaos';
  if (d >= 2) return 'heated';
  return 'tense';
}

// Where the player sits in the fight — drives which sequence branch plays.
export function laneTier(momentum) {
  if (momentum >= 0.45) return 'dominant';
  if (momentum <= -0.45) return 'cornered';
  return 'even';
}

const TONE_SHAKE = { tense: 1, heated: 1.35, chaos: 1.75 };
const SHAKE_PX = { S: 4, M: 8, L: 14 };
export const shakePixels = (size, tone) => (SHAKE_PX[size] || 0) * (TONE_SHAKE[tone] || 1);

// A perfect check upgrades the impact of a sequence's beats.
const SHAKE_UP = { S: 'M', M: 'L', L: 'L' };
export function scaleFx(fx, power) {
  if (!fx) return null;
  if (power !== 'perfect') return fx;
  return { ...fx, rgb: Math.min(1.2, fx.rgb * 1.3), shake: SHAKE_UP[fx.shake] || fx.shake };
}

// step = { player, opponent, dur(ms), contact(ms into step the FX lands), fx }
const step = (player, opponent, dur, contact, fx) => ({ player, opponent, dur, contact, fx });

// The branching grammar: a gameplay outcome + the lane state → a sequence.
export function selectSequence(kind, momentum) {
  const tier = laneTier(momentum);
  switch (kind) {
    case 'attack':
      if (tier === 'dominant')
        return [
          step(CLIPS.LUNGE, CLIPS.STUMBLE, 300, 120, { shake: 'M', rgb: 0.5 }),
          step(CLIPS.STRIKE, CLIPS.STUMBLE, 280, 90, { shake: 'M', rgb: 0.6 }),
          step(CLIPS.LUNGE, CLIPS.STUMBLE, 460, 150, { shake: 'L', rgb: 0.9 }),
        ];
      if (tier === 'cornered')
        return [step(CLIPS.STRIKE, CLIPS.STUMBLE, 460, 120, { shake: 'S', rgb: 0.45 })];
      return [step(CLIPS.LUNGE, CLIPS.STUMBLE, 520, 130, { shake: 'M', rgb: 0.55 })];

    case 'shield':
      return [step(CLIPS.GUARD, CLIPS.STRIKE, 520, 160, { shake: 'S', rgb: 0.3 })];

    case 'heal':
      return [step(CLIPS.RECOVER, CLIPS.PRESS, 600, 0, { shake: 'S', rgb: 0.22 })];

    case 'fail':
      if (tier === 'cornered')
        return [step(CLIPS.STUN, CLIPS.PRESS, 760, 120, { shake: 'M', rgb: 0.5 })];
      return [step(CLIPS.STUN, CLIPS.PRESS, 680, 100, { shake: 'S', rgb: 0.4 })];

    case 'block':
      return [step(CLIPS.BLOCK, CLIPS.STRIKE, 440, 120, { shake: 'S', rgb: 0.3 })];

    case 'ko-win':
      return [
        step(CLIPS.LUNGE, CLIPS.STUMBLE, 260, 90, { shake: 'M', rgb: 0.7 }),
        step(CLIPS.VICTORY, CLIPS.DEFEAT, 900, 60, { shake: 'L', rgb: 1, finisher: true }),
      ];

    case 'ko-lose':
      return [step(CLIPS.DEFEAT, CLIPS.VICTORY, 900, 60, { shake: 'L', rgb: 1, finisher: true })];

    default:
      return [step(CLIPS.IDLE, CLIPS.IDLE, 400, 0, null)];
  }
}

// The fighter-pack contract — a real character ships an atlas satisfying CLIPS.
export const FIGHTER_PACKS = {
  player: { id: 'player', name: 'YOU',  accent: '#ef4444', trim: '#fca5a5', atlas: null },
  rival:  { id: 'rival',  name: 'THEM', accent: '#38bdf8', trim: '#bae6fd', atlas: null },
};
