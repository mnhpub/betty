# Demo Credentials & Local Development

## Quick Start

Run `make up` to start the full local dev stack:
- **API** with local SQLite database (D1)
- **CQRS Edge Worker** with local PostgreSQL database (Neon)
- **Web** (Next.js)
- **App** (React Native / Metro)

Everything is automatically seeded with demo data.

## Login Credentials

```
Email:    demo@example.com
Password: demo1234
```

## What's Running

| Service | URL | Purpose |
|---------|-----|---------|
| **API** | `http://localhost:8787` | Hono backend, routes to local CQRS |
| **Web** | `http://localhost:3000` | Next.js frontend |
| **CQRS** | Background process | atomik-cqrs edge worker + local Neon DB |
| **App** | Metro on `:8081` | React Native |

## What to Test

- Sign in at `http://localhost:3000/login` with demo credentials
- Access the dashboard after login
- View the authenticated "Journey" view
- Explore seeded CQRS event data via `/cqrs/events` endpoint

## Databases

### API Database (D1 / SQLite)
- **Location**: `.wrangler/state/v3/d1/`
- **Ephemeral**: Fresh copy each dev session
- **Contains**: User accounts (seeded with demo user)

### CQRS Database (PostgreSQL / Neon)
- **Location**: `.env.local` in `packages/atomik-cqrs/`
- **Ephemeral**: Fresh Neon instance provisioned each `make up`
- **Contains**: Event store data (seeded with realistic LMS events)
- **Claim URL**: Printed after first `make up` if you want to make it persistent

## Resetting Demo Data

For a fresh start:

```bash
make down                               # Stop all services
rm -rf packages/api/.wrangler/state     # Clear API database
rm packages/atomik-cqrs/.env.local      # Deprovision CQRS database
make up                                 # Recreate everything
```

## Customizing Demo Data

### API Users
Edit `packages/api/scripts/seed-demo.ts` to add more demo accounts.

### CQRS Events
Edit `packages/schema-etl/seeds/atomik-cqrs/events.yaml` and re-run:
```bash
make seed-cqrs-local
```

## Logs

All service logs are in `.logs/`:
- `.logs/api.log` — API server
- `.logs/cqrs.log` — CQRS edge worker
- `.logs/web.log` — Next.js dev server
- `.logs/app.log` — Metro bundler
