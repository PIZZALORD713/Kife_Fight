# Knife Fight MVP — Project Brief v2 (Revised)

**Revision date:** June 12, 2026 (end of Week 1 of the 4-week MVP timeline)
**Supersedes:** Original pitch brief (pre-development)
**Repo:** `pizzalord713/kife_fight`
**Live (Practice Mode):** https://kife-fight.vercel.app

---

## 1. Where We Actually Are

The original brief described a 4-week build: Week 1 design/planning, Weeks 2–3
development + smart contract integration, Week 4 testing and deployment.

One week in, the team skipped straight to building — and shipped a playable,
polished **single-player practice-mode game** (Vite + React, Tailwind, runs in
any browser). That's ahead of plan on game feel and behind plan on everything
that makes Knife Fight *Knife Fight*: there is currently **no wallet, no smart
contract, no second player**.

### Status audit vs. original MVP feature set

| Original MVP feature | Status | Notes |
|---|---|---|
| Basic front-end UI (lobby, battle, result screens) | ✅ **Done, over-delivered** | Lobby, countdown, battle, round-result, match-result screens; mobile-friendly; error boundary |
| Real-time battle gameplay | 🟡 **Single-player only** | Opponent is a local AI bot (attacks every ~170ms). No server, no WebSockets, no second human |
| Wallet connection (Base) | ❌ **Built, then removed** | wagmi/RainbowKit was scaffolded in Phase 1, then ripped out in PR #2 to fix a blank-screen-on-load bug. Deps still in `package.json`, unused. Lobby now says "Practice Mode — stakes are simulated" |
| Stake mechanic & smart contract | ❌ **Not started** | No Solidity anywhere in the repo. Stake amount is a cosmetic input; "potential win" and "5% protocol fee" are displayed but fake |
| Match initialization / lobby (matchmaking or challenge links) | ❌ **Not started** | "Enter Arena" starts a local match vs. AI immediately |
| Win/loss resolution → payout | ❌ **Not started** | Result screens exist; nothing moves money |
| Matchmaking logic | ❌ **Not started** | No backend at all |
| Auth & deposit verification | ❌ **Not started** | Depends on wallet + contract |

### Unplanned work that shipped (and is mostly a good thing)

Three PRs deepened gameplay well beyond the brief's "one button, health bars" spec:

- **Prompt mini-game system** — five interrupt types (HOLD, DOUBLE-tap, PAUSE,
  MASH, TIMING-bar) that telegraph and demand a skill response. Success deals
  crit damage; perfect timing deals more.
- **Combo multiplier** (up to 4×), **shields**, **heals**, reward popups.
- **Best-of-3 round format** (45s rounds, first to 2 round wins).

The prompt system is genuinely strategic: the original brief flagged
**botting** as the #1 risk of a pure click-speed game, and these
timing/pattern prompts are exactly the mitigation it called for ("random
elements... requiring timing or pattern matching, not just pure click
speed"). This Alpha-phase item effectively landed in Week 1. It also pushes
the game toward **score-racing against your own prompts** rather than
twitch-reaction vs. the opponent — which is the latency-tolerant design the
brief recommended for Telegram/mobile play.

### Scope drift to flag

- **Match length:** the brief promised 30–60 second matches. Best-of-3 at 45s
  per round (plus countdowns and 5s inter-round cooldowns) is ~2.5–3 minutes.
  For wagered MVP matches, consider single-round (or Bo3 as a higher-stakes
  option) to preserve the "quick adrenaline hit, rinse & repeat" loop.
- **Effort allocation:** 100% of week 1 went into the layer the brief
  explicitly deprioritized ("polish is not the priority"). The two pillars of
  the thesis — *wagering* and *PvP* — have zero code. The next three weeks
  must invert that ratio.

---

## 2. Unchanged: Concept, Audience, Budget

The core thesis stands: a real-time crypto PvP duel game, two players stake on
Base, winner takes the pot (minus fee), matches are short and repeatable,
targeting Telegram-native crypto degens. Budget remains ~$300, follow-on goal
remains a $30–50k Alpha raise. See the original brief for the full rationale
(Base-first, multi-chain later, off-chain gameplay / on-chain money, no NFTs,
no token, no social features in MVP). None of that changes.

---

## 3. Revised Plan: Weeks 2–4

The remaining work is sequenced by **risk to the thesis**. The thesis is "two
humans will wager crypto on this." That requires, in order of technical risk:
(1) two humans in one match, (2) crypto in and out.

### Week 2 — PvP spine (highest risk, do first)

- Stand up a minimal **Node.js WebSocket game server** (single instance, in
  keeping with the budget). Server-authoritative match state: it spawns the
  prompts, validates input timing windows, tracks both players' health/damage,
  and declares the winner. Client becomes a renderer + input device.
- **Matchmaking:** first-come-first-served queue keyed on stake amount, plus a
  **direct-challenge link** (room code in URL) — the Telegram-shareable path.
- **PvP design decision (made):** each player races their *own* prompt stream;
  the server compares performance. This is latency-tolerant (no
  frame-precise interaction between clients) and reuses the entire existing
  prompt system as-is. Do not build twitch-synced dueling.
- Keep the current AI opponent as **Practice Mode** — it's a real asset for
  onboarding and for solo players waiting in queue.

### Week 3 — Money rails

- **Re-introduce wallet connect** (wagmi/RainbowKit deps are already
  installed). Root-cause the blank-screen bug rather than re-attempting the
  same integration — almost certainly the missing `VITE_WC_PROJECT_ID` env var
  / provider setup crashing at boot. Wallet must be lazy/optional: practice
  mode should never require it (the PR #2 lesson).
- **Escrow contract on Base Sepolia (testnet):** minimal scope — two equal
  deposits open a match, a server-held oracle key reports the winner, contract
  pays out pot minus fee, with a timeout-refund path if a match never starts
  or never resolves. Base it on an audited open-source escrow pattern; no
  custom cleverness.
- Server verifies both deposits on-chain before starting a wagered match.

### Week 4 — Integration, testing, deploy

- End-to-end on testnet: connect → stake → matched → fight → payout lands in
  winner's wallet → rematch.
- Test the worst realistic path: two phones on mobile data via Telegram's
  in-app browser.
- Decide on mainnet: deploy with a **hard wager cap** (e.g. ≤ 0.01 ETH) and a
  visible "unaudited beta" label, or stay testnet-only for the funding pitch.
  Either is defensible; a working mainnet demo with tiny caps is the stronger
  pitch artifact.
- Tune wagered-match format (single round vs. Bo3 — see scope drift above).

### Explicitly still out of scope (unchanged from v1)

NFTs, tokens/governance, social features, rankings/leaderboards, multi-chain,
fiat on-ramps, art polish, sound, scaling infrastructure, formal audit, KYC.

---

## 4. Updated Risk Register

| Risk | Change since v1 | Current posture |
|---|---|---|
| Botting / fair play | ⬇️ **Improved** | Prompt mini-games landed early and make pure click-bots ineffective. Server-side timing validation (Week 2) closes most of the rest for MVP scale |
| Real-time sync / latency | ⬇️ **Improved (by design)** | Own-prompt-stream racing means no client-to-client twitch dependency. Still untested over real networks — Week 2/4 work |
| Wallet integration regression | 🆕 **New, proven risk** | The first wallet attempt shipped a blank screen and was reverted. Re-integrate behind practice mode, with env-var fallbacks and the error boundary already in place |
| Off-chain trust in game server | ➡️ Unchanged | Accepted MVP trade-off; server-authoritative logic at least makes outcomes consistent. Open-sourcing remains the cheap trust lever |
| Smart contract security | ➡️ Unchanged (still zero code) | Mitigation unchanged: audited open-source pattern, tiny wager caps, testnet-first |
| Regulatory (wagering) | ➡️ Unchanged | Small-scale, crypto-only, no KYC for MVP; revisit before any growth push |
| Market fit | ➡️ Untested | Practice mode is now shareable today — start dropping the link in 1–2 friendly Telegram groups *this week* for free signal while PvP is built |
| Timeline | 🆕 **At risk** | 3 weeks remain for 7 of 8 MVP features. The buffer is that the hardest UX work is done; the spine work is well-trodden territory (WebSocket rooms + escrow contract) |

---

## 5. Roadmap & Funding (Adjusted)

The post-MVP roadmap (Alpha: $30–50k, 3 months) is unchanged in structure, with
two adjustments:

1. **"Enhanced game mechanics" and first-pass "anti-cheat" are done** — pull
   them out of the Alpha pitch as *completed*, which strengthens the story:
   "we shipped Alpha-tier game feel in week one on a $300 budget."
2. **Re-scope Alpha month 1** toward what MVP will genuinely leave rough:
   payout reliability/refund edge cases, contract audit, server hardening, and
   Telegram bot integration (announce matches, start challenges via chat
   command) — the growth loop the audience section was always about.

**The single sentence that should drive every decision for the next three
weeks:** the MVP is proven the first time two strangers stake real (test)ETH
on Base, fight, and the winner gets paid automatically. Everything that
doesn't move toward that moment waits.
