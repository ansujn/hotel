# DEPLOY — Vik Theatre Platform (production runbook)

Canonical deploy guide. If a step here conflicts with a README snippet, this doc wins.

Production URLs:
- Web: `https://viktheatre.in`
- API: `https://api.viktheatre.in`
- Fly app: `viktheatre-api` (region `bom`)
- DB: Neon project `viktheatre` (region `ap-south-1`)

---

## Prerequisites

Install once on the deploy machine:

```bash
# Fly.io CLI
curl -L https://fly.io/install.sh | sh

# Vercel CLI
npm i -g vercel

# Neon CLI (optional — dashboard works too)
npm i -g neonctl

# goose for Postgres migrations
go install github.com/pressly/goose/v3/cmd/goose@latest
```

Accounts / access needed:
- Fly.io org with billing.
- Vercel team (Pro for `bom1` region; Hobby falls back to `iad1`).
- Neon account.
- Domain `viktheatre.in` at registrar with NS delegated to Cloudflare.
- Cloudflare zone for `viktheatre.in`.
- Mux, MSG91 (DLT-approved templates), Razorpay (LIVE mode), Resend, Anthropic, Sentry, PostHog, BetterStack.

One-time:

```bash
fly auth login
vercel login
cd web && vercel link          # pick viktheatre project
cp .env.production.example .env.production   # then fill in values
```

---

## Step 1 — Neon Postgres (ap-south-1)

Dashboard: https://console.neon.tech

1. **Create project** `viktheatre`, region **AWS ap-south-1 (Mumbai)**. If unavailable on your plan, use `ap-southeast-1 (Singapore)` — adds ~40ms vs Fly `bom`.
2. Disable "auto-suspend" for the prod branch (or set >= 5 min) so first request after idle is not cold.
3. Create a dedicated role `viktheatre_app` with `CREATE, CONNECT` on the `viktheatre` database.
4. Copy the **pooled** connection string (pgbouncer, port 5432). It must end with `?sslmode=require`.
5. Paste into `.env.production` as `DATABASE_URL`.

CLI equivalent:

```bash
neonctl projects create --name viktheatre --region-id aws-ap-south-1
neonctl connection-string --project-id <id> --role-name viktheatre_app --database-name viktheatre --pooled
```

---

## Step 2 — Run migrations

```bash
export DATABASE_URL="$(grep ^DATABASE_URL= .env.production | cut -d= -f2-)"
goose -dir api/migrations postgres "$DATABASE_URL" status
goose -dir api/migrations postgres "$DATABASE_URL" up
```

Always run `status` first. `up` is forward-only; to roll back use `goose down-to <version>`.

---

## Step 3 — Seed (staging only, optional)

```bash
psql "$DATABASE_URL" -f api/migrations/seed_dev.sql
```

Do NOT run this against the prod branch. Seed contains test users with known passwords.

---

## Step 4 — Deploy Go API to Fly.io

First time only:

```bash
cd api
fly launch --no-deploy --copy-config --name viktheatre-api --region bom
# Say NO to Postgres (we use Neon). Say NO to Redis.
```

Every deploy:

```bash
# from repo root
./scripts/set-fly-secrets.sh viktheatre-api    # pushes .env.production -> fly secrets
cd api && fly deploy --remote-only --config fly.toml
```

Verify:

```bash
fly status -a viktheatre-api
curl -s https://viktheatre-api.fly.dev/v1/health
fly logs -a viktheatre-api
```

---

## Step 5 — Deploy Web to Vercel

```bash
# env vars
./scripts/set-vercel-env.sh production

# deploy
cd web && vercel --prod
```

Or: connect the GitHub repo in the Vercel dashboard, set root directory to `web/`, and pushes to `main` deploy automatically.

---

## Step 6 — DNS (Cloudflare)

In the `viktheatre.in` zone:

| Type  | Name | Target                     | Proxy   | TTL  |
| ----- | ---- | -------------------------- | ------- | ---- |
| A     | `@`  | `76.76.21.21` (Vercel)     | Proxied | Auto |
| CNAME | `www`| `cname.vercel-dns.com`     | Proxied | Auto |
| CNAME | `api`| `viktheatre-api.fly.dev`   | **DNS only** (grey cloud — Fly terminates TLS) | Auto |

Then in Vercel → Domains add `viktheatre.in` + `www`; in Fly → `fly certs add api.viktheatre.in -a viktheatre-api`.

Wait for certs to go green (usually < 2 min). Test:

```bash
curl -sI https://viktheatre.in
curl -sI https://api.viktheatre.in/v1/health
```

---

## Step 7 — External service wiring

| Service   | Where                                  | Target                                                   |
| --------- | -------------------------------------- | -------------------------------------------------------- |
| Mux       | Dashboard → Settings → Webhooks        | `https://api.viktheatre.in/v1/webhooks/mux`              |
| Razorpay  | Dashboard → Settings → Webhooks (LIVE) | `https://api.viktheatre.in/v1/webhooks/razorpay`         |
| MSG91     | DLT portal                             | Register sender ID `VIKTHR` + OTP template; copy IDs     |
| Resend    | Domains                                | Add `viktheatre.in`, paste SPF + DKIM + DMARC into Cloudflare |
| Sentry    | Projects                               | Create `viktheatre-api` (Go) + `viktheatre-web` (Next.js) |
| PostHog   | Project settings                       | Copy project API key into `NEXT_PUBLIC_POSTHOG_KEY`      |

---

## Step 8 — Smoke test

```bash
# 1. API health
curl -fsS https://api.viktheatre.in/v1/health

# 2. OTP send (uses a real MSG91 credit — use a throwaway number)
curl -fsS -X POST https://api.viktheatre.in/v1/auth/otp/send \
  -H 'content-type: application/json' \
  -d '{"phone":"+91XXXXXXXXXX"}'

# 3. Landing page
curl -fsS -o /dev/null -w '%{http_code}\n' https://viktheatre.in/

# 4. Admin login page
curl -fsS -o /dev/null -w '%{http_code}\n' https://viktheatre.in/admin/login
```

Browser checks:
- Landing page renders, no mixed-content warnings.
- Admin login → OTP flow works.
- Student channel page loads a signed Mux playback.
- CSP: open DevTools, confirm no `Refused to load` errors.

---

## Rollback

### API (Fly)

```bash
fly releases -a viktheatre-api                  # pick previous version id
fly deploy --image registry.fly.io/viktheatre-api:deployment-<id> -a viktheatre-api
```

Or instant revert via machine image rollback: `fly releases rollback <version> -a viktheatre-api`.

### Web (Vercel)

Dashboard → Deployments → pick previous → "Promote to Production". Zero-downtime.

### Database

Neon → Branches → "Restore" from point-in-time (up to 7 days retained on Free / 30 on Pro). Prefer forward-fix over restore for anything beyond accidental mass deletes.

---

## Monitoring

- **BetterStack Uptime**: monitor `GET https://api.viktheatre.in/v1/health` + `GET https://viktheatre.in/` every 60s from Mumbai + Singapore. Alert via email + Telegram.
- **Sentry**: `viktheatre-api` (Go SDK) + `viktheatre-web` (Next.js SDK). Release = git SHA (set `SENTRY_RELEASE` env).
- **PostHog**: session replay on `/admin/*` disabled (student privacy); autocapture on public pages.
- **Fly metrics**: Prometheus endpoint at `/metrics` on port 9091 — scrape into Grafana Cloud free tier.

---

## See also

- `docs/OPERATIONS.md` — day-2 ops cheatsheet (log tail, ssh, JWT rotation, common alerts).
- `scripts/deploy-all.sh` — orchestrated one-command deploy.
