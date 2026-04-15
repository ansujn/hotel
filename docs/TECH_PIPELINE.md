# Vik Theatre — Full Tech Pipeline (v0.2)
**2026-04-15 · India · Custom build**
**Stack: Next.js (Vercel) + Go API + Postgres + Flutter mobile**

---

## 0. Installed Claude Code skills (for this project)

Symlinked into `~/.claude/skills/` — Claude will auto-load these when working on relevant code.

### Language / framework skills
| Skill | Purpose |
|---|---|
| `golang-patterns` | Idiomatic Go, project layout, error handling |
| `golang-testing` | Table tests, testify, integration tests |
| `flutter-dart-code-review` | Flutter code review, state mgmt patterns |
| `nextjs-turbopack` | Next.js 15 + Turbopack optimization |
| `frontend-patterns` | React/Next patterns, perf, a11y |
| `postgres-patterns` | Schema design, indexing, migrations |
| `backend-patterns` | API design, layering, service patterns |
| `api-design` | REST/gRPC/OpenAPI contracts |

### Delivery / ops skills
| Skill | Purpose |
|---|---|
| `database-migrations` | Safe, reversible migrations |
| `deployment-patterns` | Rollouts, rollbacks, feature flags |
| `docker-patterns` | Containerization, multi-stage builds |
| `e2e-testing` | Playwright / integration tests |
| `git-workflow` | Branching, PRs, commit hygiene |

### Senior-role skills (auto-invoke when task matches)
| Skill | Role |
|---|---|
| `senior-backend` | Go API design lead |
| `senior-frontend` | Next.js + Flutter UI lead |
| `senior-fullstack` | Cross-stack integration |
| `senior-architect` | System design reviews |
| `senior-devops` | Vercel + GCP/Fly + CI/CD |
| `senior-qa` | Test strategy |
| `code-reviewer` | PR reviews |

---

## 1. Revised architecture

```
                  ┌──────────────────────────────────────┐
                  │          USERS                        │
                  │  Student · Parent · Instructor · Admin│
                  └──────┬──────────────┬─────────────────┘
                         │              │
              ┌──────────▼─────┐  ┌─────▼──────────┐
              │ Web (Next.js)  │  │ Mobile (Flutter)│
              │ Vercel         │  │ iOS + Android   │
              └──────────┬─────┘  └─────┬──────────┘
                         │              │
                         └──────┬───────┘
                                │  HTTPS + JWT
                                ▼
                 ┌───────────────────────────────┐
                 │     Go API (monolith)         │
                 │   Fly.io / Cloud Run          │
                 │   chi router · sqlc · zap     │
                 └───┬──────────┬────────┬───────┘
                     │          │        │
        ┌────────────▼──┐ ┌─────▼──┐ ┌───▼────────┐
        │  Postgres 16  │ │  Mux   │ │Razorpay/   │
        │  Neon / RDS   │ │ Video  │ │MSG91/      │
        │  (primary DB) │ │        │ │Resend/Claude│
        └───────────────┘ └────────┘ └────────────┘
```

**Deployment split:**
- **Vercel** → Next.js web app (SSR/ISR, edge).
- **Fly.io** (recommended, Mumbai region) OR **GCP Cloud Run** → Go API container.
- **Neon** (serverless Postgres, ap-south-1) OR **Supabase Postgres only** (no auth, no SDK).
- **Cloudflare R2 or S3** → raw uploads (before Mux transcodes).

Why Go API separate from Vercel: Vercel's Go runtime is serverless functions only — fine for webhooks, not ideal for a stateful API with long-running jobs. Host the Go service on Fly.io (fast in India, ~$5/mo) and call it from Next.js.

---

## 2. Frontend — Next.js on Vercel

| Layer | Tool |
|---|---|
| Framework | Next.js 15 App Router |
| Lang | TypeScript |
| Styling | Tailwind v4 + shadcn/ui |
| Video | Mux Player React |
| State | TanStack Query + Zustand |
| Forms | React Hook Form + Zod |
| i18n | next-intl (English + Hindi) |
| Video player | @mux/mux-player-react |
| Auth | JWT from Go API, stored in HTTP-only cookie |
| Analytics | PostHog · Sentry |

Skills active: `nextjs-turbopack`, `frontend-patterns`, `senior-frontend`.

---

## 3. Mobile — Flutter

| Layer | Tool |
|---|---|
| Framework | Flutter 3.x (latest stable) |
| Lang | Dart 3 |
| State | **Riverpod** (preferred) |
| Routing | **go_router** |
| Networking | **dio** + `retrofit_generator` for typed clients from Go OpenAPI |
| Auth | `flutter_secure_storage` for JWT |
| Video | `video_player` + `chewie` (HLS from Mux) |
| Forms | `reactive_forms` |
| Localization | `flutter_localizations` + ARB files (EN/HI) |
| Push | Firebase Cloud Messaging |
| Analytics | PostHog Flutter SDK · Sentry Flutter |
| Build | Codemagic or GitHub Actions |

Parent app + Student app can be a **single Flutter app** with role-based routing. Launch on Play Store first (cheaper), then App Store.

Skills active: `flutter-dart-code-review`.

---

## 4. Backend — Go API

### Project layout (idiomatic Go, skills say so)
```
/api
├── cmd/
│   └── server/main.go
├── internal/
│   ├── auth/        (JWT, OTP verify)
│   ├── student/     (handlers, service, repo)
│   ├── parent/
│   ├── batch/
│   ├── asset/       (upload, privacy, Mux integration)
│   ├── consent/     (DPDP critical path)
│   ├── payment/     (Razorpay)
│   ├── social/      (Buffer/Metricool)
│   ├── ai/          (Claude client for clips + captions)
│   └── platform/
│       ├── db/      (pgx + sqlc generated)
│       ├── mux/
│       ├── msg91/
│       ├── resend/
│       └── razorpay/
├── migrations/      (goose or atlas)
├── openapi.yaml
└── Dockerfile
```

### Core libraries
| Concern | Library |
|---|---|
| HTTP router | **chi** (stdlib-flavored, fast) |
| DB driver | **pgx/v5** |
| Type-safe SQL | **sqlc** (generates Go from SQL) |
| Migrations | **goose** |
| Config | **viper** or `envconfig` |
| Logging | **zap** (structured) |
| Validation | **go-playground/validator** |
| JWT | **golang-jwt/jwt/v5** |
| OpenAPI codegen | **oapi-codegen** (generates server handlers + Flutter + TS clients) |
| Jobs/cron | **river** (Postgres-backed queue) |
| Testing | **testify** + **testcontainers-go** for Postgres |
| HTTP client | stdlib `net/http` + `retryablehttp` |

Skills active: `golang-patterns`, `golang-testing`, `backend-patterns`, `api-design`, `senior-backend`.

### Sample endpoint layout (REST)
```
POST   /v1/auth/otp/send
POST   /v1/auth/otp/verify         → returns JWT
GET    /v1/me
GET    /v1/students/:id/channel    (public if consented)
POST   /v1/admin/assets            (multipart init → Mux direct upload URL)
POST   /v1/admin/assets/:id/publish
POST   /v1/consent/:token          (parent consent signing)
GET    /v1/batches/:id
POST   /v1/social/posts            (schedule via Buffer)
POST   /v1/payments/order          (Razorpay)
POST   /v1/webhooks/mux            (asset.ready)
POST   /v1/webhooks/razorpay
POST   /v1/webhooks/buffer
```

OpenAPI spec → generates:
- Go server stubs (`oapi-codegen -generate chi-server`)
- TypeScript fetch client for Next.js (`openapi-typescript`)
- Dart client for Flutter (`openapi-generator-cli dart-dio`)

One contract, three consumers.

---

## 5. Database — Postgres 16

Hosted on **Neon** (serverless, branching, Mumbai region) or **GCP Cloud SQL**.

Schemas same as before (12 tables), enforced now in Go service layer instead of Supabase RLS:
- `users`, `profiles`, `parents_students`
- `batches`, `enrollments`
- `assets`, `consents`, `rubric_scores`, `notes`
- `attendance`, `announcements`
- `payments`, `social_posts`, `audit_log`

### Migrations with goose
```
migrations/
  20260415_0001_users.sql
  20260415_0002_batches.sql
  ...
```
Each file has `-- +goose Up` / `-- +goose Down`. Run on startup or via CI.

### sqlc workflow
```
queries/students.sql    (plain SQL with --name comments)
         ↓ sqlc generate
internal/student/db.gen.go   (typed Go funcs)
```
No ORM, no runtime reflection — just compiled type-safe SQL.

Skills active: `postgres-patterns`, `database-migrations`.

---

## 6. Consent pipeline (DPDP-critical) — Go version

```go
// pseudocode
func PublishAsset(ctx, assetID) error {
    asset := repo.Get(ctx, assetID)
    asset.Privacy = "pending_consent"
    repo.Save(ctx, asset)

    parent := repo.ParentOfStudent(ctx, asset.StudentID)
    token := jwt.Sign(parent.ID, assetID, 7*24*time.Hour)
    link := fmt.Sprintf("https://viktheatre.in/consent/%s", token)

    go msg91.SendSMS(parent.Phone, consentSMS(link))
    go resend.SendEmail(parent.Email, consentEmail(link))
    return nil
}

func SignConsent(ctx, token, scope) error {
    claims := jwt.Verify(token)
    // OTP verified upstream
    pdf := pdflib.Generate(scope, parent, asset)
    pdfURL := storage.Upload(pdf)
    repo.InsertConsent(ctx, Consent{
        AssetID: claims.AssetID,
        ParentID: claims.ParentID,
        ScopeChannel: scope.Channel,
        ScopeSocial: scope.Social,
        IP: ctx.IP, UA: ctx.UA,
        PDFURL: pdfURL, ValidUntil: now.AddMonths(12),
    })
    repo.UpdateAssetPrivacy(ctx, claims.AssetID, "public")
    audit.Log(ctx, "consent.signed", claims.AssetID)
    return nil
}
```

---

## 7. Video pipeline (unchanged)

1. Admin clicks Upload → Go API returns Mux **direct-upload URL** (single-use JWT).
2. Browser/Flutter uploads raw file directly to Mux (not through our API — saves bandwidth).
3. Mux webhook → `POST /v1/webhooks/mux` → `asset.ready` → we save `playback_id`.
4. Playback: Go API issues 10-min signed JWT → Next.js / Flutter plays via Mux Player.
5. Auto-clip: nightly cron (river) picks new consented assets → Claude picks 3 clips → Mux creates 9:16 → posts to `social_posts` queue.

---

## 8. Auth pipeline (phone-first India)

```
Web/Mobile → POST /v1/auth/otp/send {phone}
           Go API → MSG91 send OTP (DLT-registered template)
Web/Mobile → POST /v1/auth/otp/verify {phone, code}
           Go API → MSG91 verify
           Go API → upsert users row
           Go API → issue JWT (access 1h + refresh 30d)
Web  → store JWT in HTTP-only Secure cookie
Flutter → store JWT in flutter_secure_storage
```

All subsequent requests: `Authorization: Bearer <jwt>`. Go middleware validates and loads user into ctx.

---

## 9. DevOps — Vercel + Fly.io + Neon

| Component | Host | Cost (est, ₹/mo) |
|---|---|---|
| Next.js web | **Vercel Pro** | 1,700 |
| Go API | **Fly.io** (1 shared-cpu-1x, Mumbai) | 400–800 |
| Postgres | **Neon Pro** or Fly Postgres | 1,500–2,000 |
| Video | **Mux** pay-as-you-go | 2–4k |
| Mobile builds | **Codemagic** free tier → ₹2k when pro | 0–2k |

**CI/CD (GitHub Actions):**
```yaml
web:     lint → typecheck → playwright → vercel deploy
api:     golangci-lint → go test ./... → docker build → fly deploy
mobile:  dart analyze → flutter test → codemagic build
migrations: goose up on release
```

Skills active: `deployment-patterns`, `docker-patterns`, `git-workflow`, `senior-devops`, `e2e-testing`.

**Environments:**
- `main` → prod (viktheatre.in + api.viktheatre.in + mobile production track)
- `staging` → staging.viktheatre.in + staging-api.fly.dev
- PR preview → Vercel + Fly preview app per PR

---

## 10. Team with this stack

| # | Role | Skill match |
|---|---|---|
| 1 | Next.js dev (FT) | `senior-frontend`, `nextjs-turbopack`, `frontend-patterns` |
| 2 | Go backend dev (FT) | `senior-backend`, `golang-patterns`, `golang-testing`, `backend-patterns`, `api-design`, `postgres-patterns` |
| 3 | Flutter dev (FT or contract 3mo) | `flutter-dart-code-review` |
| 4 | DevOps (fractional 1d/wk) | `senior-devops`, `deployment-patterns`, `docker-patterns` |
| 5 | Designer (contract 6 wks) | Figma |
| 6 | QA (last 6 weeks) | `senior-qa`, `e2e-testing` |
| 7 | PM/founder | you |
| 8 | Legal (one-off) | DPDP review |

Adjusted monthly cost vs v0.1: **+₹80k–1.5L/mo** for Flutter dev during build, then Flutter goes to maintenance (~20 hrs/mo).

---

## 11. Revised 20-week build plan (added mobile)

```
Wk  1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
Design ████
OpenAPI spec (contract first) ██
Go API scaffold + auth + DB      ██████
Next.js scaffold                   ██████
Core flows (upload/channel/consent)     ████████
Rubric + batches                               ██████
Parent web + consent                                  ████
Landing + Social Hub                                   ██████
Flutter app (student+parent)                ████████████
Payments                                                 ████
QA + e2e + mobile builds                                      ██████
Pilot launch (web)                                                 ██
App Store + Play Store submit                                        ██
Public launch                                                          ██
```

Milestones:
- **Wk 6** — Go API + Next.js alpha, admin can upload
- **Wk 10** — Web pilot live (30 students)
- **Wk 14** — Flutter beta (TestFlight/internal track)
- **Wk 18** — Mobile on Play Store
- **Wk 20** — iOS + public launch

---

## 12. Running cost at pilot scale (India, 30 students)

| Item | ₹/mo |
|---|---|
| Vercel Pro | 1,700 |
| Fly.io (Go API) | 600 |
| Neon Postgres | 1,600 |
| Mux Video | 2,000–4,000 |
| Anthropic (Claude) | 2,000 |
| MSG91 | 1,000 |
| Resend | 800 |
| Razorpay | 2% txn |
| Buffer/Metricool | 1,500 |
| Sentry/PostHog/BetterStack | 2,500 |
| Codemagic (mobile CI) | 0 (free tier) |
| Domain + Cloudflare | 200 |
| **Total** | **~14k–17k/mo** |

---

## 13. Ship checklist before pilot

- [ ] `openapi.yaml` complete → clients auto-generated for Next + Flutter
- [ ] Go API: all endpoints with tests (`go test -cover` ≥ 70%)
- [ ] Postgres migrations reversible
- [ ] Parent consent PDF template signed off by legal
- [ ] DPDP privacy policy + ToS published
- [ ] Razorpay KYC approved
- [ ] MSG91 DLT templates approved
- [ ] Mux webhooks verified via HMAC
- [ ] Rate limiting on `/v1/auth/*` and `/v1/consent/*`
- [ ] Sentry + PostHog wired in web + mobile + Go
- [ ] Playwright e2e: happy paths for student, parent, admin
- [ ] Flutter integration tests for login + consent + video playback
- [ ] Staging smoke-tested by 3 internal users for 1 week

---

## 14. What I ship next (on "scaffold")

1. `openapi.yaml` — full API contract.
2. `/api` — Go service with auth + DB + one working endpoint (`/me`) + Docker + Fly config.
3. `/web` — Next.js 15 with Tailwind + shadcn + auth flow hitting Go API.
4. `/mobile` — Flutter app with Riverpod + go_router + auth + home screen.
5. `/db/migrations` — goose files for all 12 tables.
6. GitHub Actions workflows for all three.
7. `.env.example` + `README.md` with setup commands.

Say **"scaffold"** and I'll start building.
