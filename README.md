# EchoRift Vertical Slice (Final Completion Pass)

This repository delivers a runnable backend-centric vertical slice with authoritative match simulation, Rift liveops rotation, moderation flows, anti-cheat hooks, analytics snapshots, optional Postgres persistence, ethical monetization endpoints, and Unity client integration scripts.

## One-command local stack

```bash
docker compose -f infra/docker-compose.yml up --build
```

Backend runs at `http://localhost:8080`.

## Play Right Now (no Docker / no Unity)

Open this file directly in your browser:

```bash
# Linux
xdg-open playable_now/index.html

# macOS
open playable_now/index.html

# Windows (PowerShell)
start playable_now/index.html
```

This instant demo includes a complete short-session loop: move, shoot, build, collect crafting drops, survive rotating Rift modifiers, and finish a timed match.

## Preflight

Run environment checks before starting:

```bash
./scripts/preflight.sh
```

If `docker` is missing, install Docker Engine/Desktop (or use another host with Docker) before running compose.

## Implemented capabilities

- Matchmaking for 30-player queues using party-first + widening skill delta.
- Authoritative match progression loop with timed completion and persisted/servable results.
- Liveops scheduler plus admin override endpoint for Rift modifiers.
- Creator publishing + trending endpoint.
- Moderation report submission + admin queue view.
- Anti-cheat flagging endpoint + admin review queue.
- Analytics summary (DAU/MAU, completed matches, avg duration) and 1/7/28 cohort snapshots.
- Player safety settings API (parental controls, session reminders, daily limits, spend caps, analytics opt-in).
- Transparent cosmetics store with spend-cap enforcement and no pay-to-win items.

## Local development

```bash
cd backend
npm install
npm run dev
```

## Test commands

```bash
cd backend && npm run test
cd backend && npm run test:integration
cd backend && npm run stress
```
