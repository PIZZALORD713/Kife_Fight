# Knife Fight

A real-time crypto PvP duel game. Two players stake on Base, winner takes the
pot. Matches are short and repeatable. (See [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)
for the full concept, status, and roadmap.)

## 🎮 Play it

**Live (Practice Mode):** https://kife-fight.vercel.app

> Currently single-player practice mode — the opponent is a local AI bot, and
> stakes are simulated. Wallet connection, wagering, and PvP are on the
> Weeks 2–4 roadmap.

## How to play

You and the AI trade blows in a best-of-3 match (45-second rounds, first to 2
round wins). Tap **ATTACK** — or press **SPACEBAR** — to chip away at your
opponent and build a combo (up to 4×).

Throughout the round the game interrupts you with telegraphed **skill checks**,
in two flavours:

- **Offensive** (deal damage, build combo)
  - **MASH** — hammer the button before the timer runs out
  - **TIMING** — tap as the marker sweeps through the green/gold sweet-spot
  - **HOLD** — press and hold until the bar fills
- **Defensive** (your comeback tools)
  - **CHARGE** — hold to fill the power bar, then release while the leading edge
    sits in the green zone → raises a **shield**. Hold too long and it
    overcharges (fail), so don't just mash it.
  - **PAUSE** — stop moving and hold still → you **heal**

Nailing a check perfectly pays out more; flubbing one **stuns** you. The game
adapts to the score: behind, it hands you more defensive checks to claw back;
ahead, it leans aggressive.

## Tech

Vite + React 19, Tailwind CSS. Runs in any browser, mobile-friendly.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (defaults to http://localhost:5173).

## Other scripts

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # eslint
```

## Deployment

Hosted on Vercel at the link above. Pushes to the default branch deploy
automatically via Vercel's Git integration.
