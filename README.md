# Vik Theatre Platform

Monorepo for the Vik Theatre & Public Speaking student platform.

## Structure

```
victor-sir/
├── api/              Go 1.23 API (chi + pgx + sqlc + goose)
├── web/              Next.js 15 (App Router, TS, Tailwind, shadcn)
├── mobile/           Flutter 3 (Riverpod, go_router, dio)
├── openapi.yaml      Single API contract → generates Go server + TS + Dart clients
├── .github/          CI/CD workflows
└── docs/             Plan, pipeline, wireframes
```

## Stack

- **Web**: Next.js 15 on **Vercel**
- **API**: Go on **Fly.io** (Mumbai region)
- **DB**: Postgres 16 on **Neon** (ap-south-1)
- **Mobile**: Flutter on Play Store + App Store
- **Video**: Mux · **SMS**: MSG91 · **Email**: Resend · **Payments**: Razorpay · **AI**: Claude

## Quick start (after cloning)

```bash
cp .env.example .env           # fill in secrets

# API
cd api
go mod download
make migrate-up
make dev                       # runs on :8080

# Web (new terminal)
cd web
pnpm install
pnpm dev                       # runs on :3000

# Mobile (new terminal)
cd mobile
flutter pub get
flutter run
```

## Docs

- [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md)
- [`docs/TECH_PIPELINE.md`](docs/TECH_PIPELINE.md)
- [`docs/FIGMA_WIREFRAMES.md`](docs/FIGMA_WIREFRAMES.md)
- [`docs/mockups.html`](docs/mockups.html) — visual preview
