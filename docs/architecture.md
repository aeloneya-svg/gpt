# EchoRift Architecture

## Services and runtime

- **Unity client** (`/client/unity_project`): movement/parkour, building, weapon modules, network state bridge.
- **Backend API** (`/backend/src`):
  - Auth service (`POST /auth/login`)
  - Matchmaking service (`POST /matchmaking/join`)
  - Match service (`GET /match/{id}/state`, `GET /matches`)
  - Builds service (`POST /builds/publish`, `GET /builds/trending`)
  - Safety service (`GET/POST /players/{id}/settings`)
  - Store service (`GET /store/catalog`, `POST /store/purchase`)
  - Anti-cheat service (`POST /anti-cheat/flag`, `GET /admin/anti-cheat/flags`)
  - Liveops + analytics (`POST /admin/rift-modifier`, `GET /admin/active-matches`, `GET /analytics/summary`, `GET /analytics/cohorts`)
  - Moderation (`POST /reports`, `GET /admin/reports`)
- **Authoritative systems**:
  - `AuthoritativeMatchEngine`: ticks running matches, increases Rift intensity, finalizes results.
  - `LiveopsScheduler`: rotates Rift modifiers on interval.
- **Data layer**:
  - Postgres adapter (if `DATABASE_URL` is available)
  - In-memory fallback for constrained local runs.

## Match lifecycle

1. Login creates player profile and ethical defaults.
2. Queue entries are evaluated by party-first matchmaking.
3. Match created with `RUNNING` status and configured duration.
4. Authoritative tick loop updates Rift state and finalizes results.
5. Completed match results are exposed via `GET /match/{id}/state` and analytics events.

## Ethics, privacy, and well-being

- Parent controls defaults for minors and spend caps.
- Session reminder + daily limit settings built into profile model and API.
- Opt-in analytics behavior respected before event storage; when Postgres is enabled, events are persisted.
- Transparent non-pay-to-win store APIs with odds disclosures.
- Moderation and anti-cheat queues for trust-and-safety operations.
