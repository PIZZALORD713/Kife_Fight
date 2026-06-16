# Architecture

Knife Fight is a client-only **Vite + React 19** single-page app (Tailwind for
styling). There is no backend yet — Practice Mode runs entirely in the browser
against a local AI bot. The Weeks 2–4 roadmap (see [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md))
moves the authoritative game logic to a server; this document describes the
structure that refactor needs to preserve.

## Two layers: engine and choreography

The codebase is deliberately split into a **gameplay engine** (the source of
truth) and a **choreography layer** (presentation that *dramatizes* the engine's
events without ever changing them).

```
App
 ├─ useGameState ................ ENGINE — owns all game truth
 │   ├─ usePromptSystem ......... skill-check state machine
 │   ├─ (local AI opponent loop)
 │   └─ round / match flow
 └─ BattleScreen ................ renders engine state (health, meters, button)
     └─ FightStage
         └─ useFightChoreography   CHOREOGRAPHY — pure consumer of engine state
```

### Engine (source of truth)

- **`src/hooks/useGameState.js`** — the orchestrator. Owns health, combo,
  shield, round/match state, the local AI opponent loop, and the win/KO flow.
  Emits one-shot *events* (`rewardEvent`, `shieldBlockEvent`, `promptResult`)
  that downstream layers react to.
- **`src/hooks/usePromptSystem.js`** — the skill-check state machine:
  `telegraph → active → success/fail`, one check at a time. It picks which check
  to spawn via the comeback weighting and reports the outcome (tier + type) back
  to `useGameState`.
- **`src/constants/game.js`** — all gameplay tuning: the check roster
  (`PROMPT_TYPES`), the offense/defense roles + rewards (`PROMPT_ROLE`), timing
  windows, damage/heal/shield amounts, and the **comeback weighting**
  (`pickPromptType`, which biases the check handed to a player by the live HP
  gap).

#### Skill-check roles

| Check  | Modality                            | Role    | Reward         |
|--------|-------------------------------------|---------|----------------|
| MASH   | rapid taps before the timer ends    | offense | damage + combo |
| TIMING | tap the moving sweet-spot           | offense | damage + combo |
| HOLD   | press & hold until full             | offense | damage + combo |
| CHARGE | hold to fill, release in the green  | defense | shield         |
| PAUSE  | hold still / don't move             | defense | heal           |

Offensive checks deal damage and build combo; defensive checks deal none and
grant a shield or heal instead. Perfect execution upgrades the payout.

### Choreography (pure consumer)

The choreography layer **only reads** engine state — it must never call back into
the engine. This contract is what lets it become a thin client-side renderer
once the server owns the game truth.

- **`src/hooks/useFightChoreography.js`** — the director. Watches the engine's
  events + the HP gap and fires **branched, multi-beat scripted sequences**: the
  "lane tier" (dominant / even / cornered) chooses the branch, so a dominant
  player lands a punishing combo while a cornered one scraps for a single
  counter. Outputs the current fighter clips, an FX pulse, and the momentum/lane
  value.
- **`src/constants/choreography.js`** — the choreography vocabulary: animation
  `CLIPS`, the `selectSequence` branch grammar, the HP-gap → momentum → lane →
  tone helpers, and `FIGHTER_PACKS` (the sprite-pack contract).
- **`src/components/fight/`** — `FightStage` (stage + camera shake), and within
  it `SpriteFighter`, `LaneMeter`, and `GlitchOverlay`.
- **`src/index.css`** — the `fighter-*` keyframes that realize each clip.

#### Momentum sign convention

`momentum = (playerHealth − opponentHealth) / 100`, clamped to `[-1, 1]`.
**`> 0` means the player is ahead.** The same convention drives the lane meter,
the sequence branch selection, and the comeback weighting in `game.js` — keep
them in agreement.

#### Swapping in real fighter art

Fighters are placeholder silhouettes today. `FIGHTER_PACKS` defines the contract:
a real character ships an atlas that satisfies every entry in `CLIPS`. Drop the
atlas into a pack and the existing sequences animate it — no choreography changes
required.

## Why the split matters for Week 2

When the WebSocket server becomes authoritative, the **engine** moves
server-side: it spawns checks, validates timing windows, tracks health, and
declares the winner. The client keeps `usePromptSystem`'s input handling and the
entire **choreography** layer unchanged, because choreography already treats game
state as read-only input. Preserve that boundary and the presentation work done
so far carries straight over.
