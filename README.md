# Knife Fight

A real-time crypto PvP duel game. Two players stake on Base, winner takes the
pot. Matches are short and repeatable. (See [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)
for the full concept, status, and roadmap.)

## 🎮 Play it

**Live (Practice Mode):** https://kife-fight.vercel.app

> Currently single-player practice mode — the opponent is a local AI bot, and
> stakes are simulated. Wallet connection, wagering, and PvP are on the
> Weeks 2–4 roadmap.

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
