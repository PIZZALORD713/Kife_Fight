// src/constants/game.js
export const PROMPT_TYPES = ['HOLD', 'DOUBLE', 'PAUSE', 'MASH', 'TIMING'];

export const TELEGRAPH_MIN = 600;
export const TELEGRAPH_MAX = 900;
export const HOLD_DURATION = 1400;
export const PAUSE_DURATION = 1600;
export const DOUBLE_MIN_GAP = 80;
export const DOUBLE_MAX_GAP = 320;
export const DOUBLE_TIMEOUT = 2000;
export const STUN_DURATION = 1500;
export const STAGGER_DURATION = 700;
export const PROMPT_SPAWN_MIN = 4000;
export const PROMPT_SPAWN_MAX = 8000;
export const COMBO_MAX = 4;
export const PROMPT_SUCCESS_DAMAGE = 6;
export const PROMPT_PERFECT_DAMAGE = 10;
export const BATTLE_DURATION = 45;
export const RESULT_COOLDOWN = 5;
export const OPPONENT_INTERVAL = 170;
// How long the finisher choreography holds before cutting to the result screen.
export const KO_HOLD = 1300;

// Match format
export const MAX_ROUNDS = 3;
export const ROUNDS_TO_WIN = 2;

// MASH: rapid-tap meter
export const MASH_TARGET_TAPS = 6;
export const MASH_WINDOW = 2200;
export const MASH_PERFECT_RATIO = 0.5;

// TIMING: precision sweep bar
export const TIMING_PERIOD = 1100;
export const TIMING_TIMEOUT = 4500;
export const TIMING_UPDATE_INTERVAL = 30;

// Rewards
export const REWARD_BONUS_CHANCE = 0.35;
export const HEAL_AMOUNT = 12;
export const MAX_SHIELD = 2;
