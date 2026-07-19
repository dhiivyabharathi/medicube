# Medicube Healthcare + QA Automation Platform

Medicube is a healthcare SaaS product with a **separate** Playwright QA dashboard.

## Architecture

```
medi/
├── frontend/       Medicube healthcare app (port 5173)
├── qa-dashboard/   Medicube QA results app (port 5174)  ← separate from product
├── backend/        Shared API (port 3001)
└── automation/     Playwright + Page Object Model
```

| App | Audience | URL |
|-----|----------|-----|
| Medicube Healthcare | Ops / admins | http://localhost:5173 |
| Medicube QA Dashboard | QA / engineers | http://localhost:5174 |
| API | Both apps | http://localhost:3001 |

The healthcare product sidebar has **no Test Suites** entry. Automation metrics only appear in the QA dashboard.

## Quick Start

```bash
npm run install:all
cd automation && npm run install:browsers && cd ..

# Terminal 1 — API
npm run dev:backend

# Terminal 2 — Healthcare product
npm run dev:frontend

# Terminal 3 — QA dashboard (separate app)
npm run dev:qa

# Terminal 4 — Playwright
npm test
```

### Demo credentials

| Username | Password |
|----------|----------|
| `admin`  | `test123` |

## CI/CD

See `.github/workflows/ci.yml` — build healthcare + QA dashboard, then run Playwright E2E.

## Env vars (automation publish)

- `MEDICUBE_API_URL` — API base (default `http://localhost:3001`)
- `MEDICUBE_PUBLISH=0` — disable auto-publish to QA dashboard
