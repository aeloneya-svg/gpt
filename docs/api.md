# API Spec

OpenAPI source: `backend/openapi/openapi.yaml`

## Auth
- `POST /auth/login`

## Match
- `POST /matchmaking/join`
- `GET /match/{id}/state`
- `GET /matches`

## Creator
- `POST /builds/publish`
- `GET /builds/trending`

## Safety / Wellbeing
- `GET /players/{id}/settings`
- `POST /players/{id}/settings`

## Store (Ethical Monetization)
- `GET /store/catalog`
- `POST /store/purchase`

## Anti-Cheat
- `POST /anti-cheat/flag`
- `GET /admin/anti-cheat/flags`

## LiveOps + Analytics
- `POST /admin/rift-modifier`
- `GET /admin/active-matches`
- `GET /analytics/summary`
- `GET /analytics/cohorts`

## Moderation
- `POST /reports`
- `GET /admin/reports`
