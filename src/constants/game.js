// src/constants/game.js
// Five skill checks. Each has a ROLE: offensive checks deal damage + build
// combo; defensive checks grant shield or heal (your comeback tools).
export const PROMPT_TYPES = ['HOLD', 'PAUSE', 'MASH', 'TIMING', 'CHARGE'];

export const PROMPT_ROLE = {
  MASH: 'attack',    // flurry → damage + combo
  TIMING: 'attack',  // precise strike → big damage
  HOLD: 'attack',    // wind-up → heavy damage
  CHARGE: 'shield',  // brace & release in the green → raise a shield
  PAUSE: 'heal',     // catch your breath → recover HP
};

export const TELEGRAPH_MIN = 600;
export const TELEGRAPH_MAX = 900;
export const HOLD_DURATION = 1400;
export const PAUSE_DURATION = 1600;
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

// CHARGE: hold to fill a power bar, release inside the green zone.
export const CHARGE_FILL_DURATION = 1300; // ms to fill 0→100 while held
export const CHARGE_ZONE_WIDTH = 24;      // width of the green release zone (%)
export const CHARGE_PERFECT_RATIO = 0.4;  // perfect band as a fraction of green
export const CHARGE_TIMEOUT = 2800;       // fail if never released in time
export const CHARGE_UPDATE_INTERVAL = 30;

// Rewards
export const HEAL_AMOUNT = 12;        // PAUSE heal
export const CHARGE_PERFECT_HEAL = 8; // bonus heal on a perfect CHARGE
export const MAX_SHIELD = 2;

// Comeback engine: weight which check appears by how the fight is going.
// playerAdvantage = (playerHealth − opponentHealth) / 100, in [-1, 1].
// Behind ⇒ defensive checks more likely; ahead ⇒ offensive checks more likely.
export function pickPromptType(playerAdvantage) {
  const lead = Math.max(0, playerAdvantage);
  const deficit = Math.max(0, -playerAdvantage);
  const weights = PROMPT_TYPES.map((type) => {
    const w =
      PROMPT_ROLE[type] === 'attack'
        ? 1 + 1.6 * lead - 0.6 * deficit
        : 1 + 1.9 * deficit - 0.6 * lead;
    return Math.max(0.35, w);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PROMPT_TYPES.length; i++) {
    r -= weights[i];
    if (r <= 0) return PROMPT_TYPES[i];
  }
  return PROMPT_TYPES[PROMPT_TYPES.length - 1];
}
