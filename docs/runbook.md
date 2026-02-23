# Runbook

## Start stack
```bash
docker compose -f infra/docker-compose.yml up --build
```

## Environment variables
- `PORT` default `8080`
- `DATABASE_URL` optional (when absent, in-memory fallback is used)
- `MATCH_DURATION_SECONDS` default `480`
- `RIFT_ROTATION_SECONDS` default `180`

## Preflight
```bash
./scripts/preflight.sh
```

## Instant playable demo
```bash
python -m http.server 9000
# then open http://127.0.0.1:9000/playable_now/index.html
```

## Smoke flow
```bash
curl -X POST http://localhost:8080/auth/login -H 'content-type: application/json' -d '{"username":"runner","isMinor":true}'
curl http://localhost:8080/store/catalog
curl http://localhost:8080/analytics/summary
curl http://localhost:8080/analytics/cohorts
```

## Operational checks
- `GET /admin/active-matches` for live match visibility.
- `GET /admin/reports` for moderation backlog.
- `GET /admin/anti-cheat/flags` for security investigations.

## Troubleshooting: `docker` command not found
If `docker compose ...` fails with `command not found: docker`, your machine does not have Docker CLI installed or it is not on `PATH`.

1. Install Docker Engine / Docker Desktop for your OS.
2. Re-open terminal so PATH updates are applied.
3. Verify with:
   ```bash
   docker --version
   docker compose version
   ```
4. Re-run:
   ```bash
   docker compose -f infra/docker-compose.yml up --build
   ```
