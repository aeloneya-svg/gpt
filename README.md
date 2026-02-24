# EchoRift Vertical Slice (Final Completion Pass)

This repository delivers a runnable backend-centric vertical slice plus an instantly playable 3D browser prototype, with authoritative match simulation, Rift liveops rotation, moderation flows, anti-cheat hooks, analytics snapshots, optional Postgres persistence, ethical monetization endpoints, and Unity client integration scripts.

## One-command local stack

```bash
docker compose -f infra/docker-compose.yml up --build
```

Backend runs at `http://localhost:8080`.

## Play Right Now (no Docker / no Unity)

Run one command:

```bash
./scripts/play_now.sh
```

Then open:

- `http://127.0.0.1:9000/playable_now/index.html`

(Or pass a custom port: `./scripts/play_now.sh 7777`.)

This instant demo runs as a polished third-person 3D arena prototype: layered mountains, dense grass, a visible 3D player character, monster enemies inspired by your reference image, proper click-to-shoot gunplay, buildable cover, and Rift modifiers with clear gameplay impact.

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
