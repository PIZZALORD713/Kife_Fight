# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo.

## What this is

Knife Fight — a client-only **Vite + React 19 + Tailwind** single-page game.
Practice Mode only today: single-player vs. a local AI bot, no backend, no
wallet, no real wagering. See [`README.md`](README.md) for play/run,
[`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) for status + roadmap, and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the code is organized.

## Commands

```bash
npm install
npm run dev      # Vite dev server (default http://localhost:5173)
npm run build    # production build — run before pushing non-trivial changes
npm run lint     # eslint
npm run preview  # serve the production build
```

## Architecture in one breath

Two layers: a **gameplay engine** (source of truth) and a **choreography** layer
(presentation that only *reads* engine state). Full detail in
`docs/ARCHITECTURE.md`. The rule to preserve: **choreography never calls back
into the engine** — it stays a pure consumer so it survives the planned
server-authoritative refactor.

- Gameplay tuning (check roster, roles, rewards, comeback weighting):
  `src/constants/game.js`
- Choreography vocabulary (clips, branched sequences, fighter-pack contract):
  `src/constants/choreography.js`

## Conventions

- **Lint baseline:** `npm run lint` reports a few pre-existing errors (currently
  four: ref access during render, a setState-in-effect, and a
  used-before-declared pair in `usePromptSystem`). Treat that as the baseline —
  don't add net-new lint problems, and don't silently "fix" the baseline as a
  side effect of unrelated work.
- Keep `npm run build` green.
- Logic lives in hooks; components stay small and presentational. Match the
  surrounding style.

## Git / PRs

- Develop on a feature branch; don't push to the default branch without explicit
  permission.
- Don't open a pull request unless asked.
