# Build Log — Vik Theatre Platform

A running journal of every phase, every agent, every merge. Append-only.

---

## 2026-04-15 · Phase 0 — Scaffold
**Status:** ✅ done

- Monorepo created at `/Users/harshitjain/Documents/victor-sir/`
- `openapi.yaml` drafted (auth, me, channel, admin/assets, consent, webhooks)
- Go API skeleton: chi router, pgx pool, zap logger, `/v1/health`
- Next.js 15 skeleton: landing page, Tailwind v4, TS
- Flutter: README with `flutter create` command
- CI workflows: api.yml · web.yml · mobile.yml
- Postgres migrations: 12 tables, enums, indexes
- Git repo initialized + first commit
- 20 Claude skills symlinked into `~/.claude/skills/`

**Files produced**
- `README.md`, `.gitignore`, `.env.example`, `openapi.yaml`
- `api/**` (Go skeleton + Dockerfile + fly.toml + migrations)
- `web/**` (Next.js 15 skeleton)
- `mobile/README.md`
- `.github/workflows/*.yml`
- `docs/` (plan, pipeline, wireframes, mockups)

---

## 2026-04-15 · Phase 1 — Auth end-to-end (4 parallel agents)
**Status:** 🟡 in progress

Launching 4 agents in parallel. Each owns a distinct folder (no write conflicts).

| Agent | Folder | Task |
|---|---|---|
| 1 — Go API | `api/**` | MSG91 OTP + JWT + `/auth/otp/{send,verify}` + `/me` + middleware |
| 2 — Next.js | `web/**` | OTP login screen + JWT cookie + protected route |
| 3 — Flutter | `mobile/**` | `flutter create` + Riverpod + go_router + login screen |
| 4 — DB layer | `api/internal/**` + `api/migrations/**` | sqlc config + auth queries + seed data |

**Convention**
- Each agent appends to this log with `### Agent N report` section when done.
- No agent edits `openapi.yaml` (contract is frozen for this phase).
- No agent touches `.github/` or another agent's folder.

### Agent 1 report (Go API)

**Scope:** Phone-OTP auth + JWT for the Go API. Folder: `api/` only.

**Files created:**
- `api/internal/auth/service.go` — `Service` + `User` DTO, `SendOTP`, `VerifyOTP` (upsert-by-phone), `LoadUser`.
- `api/internal/auth/jwt.go` — HS256 issuer; access (1h) + refresh (30d); claims `sub`, `role`, `phone`, `kind`.
- `api/internal/auth/otp.go` — `MSG91Client` interface + HTTP impl hitting `control.msg91.com/api/v5/otp{,/verify}`. `DevBypassCode = "000000"`.
- `api/internal/auth/middleware.go` — `RequireAuth`, `UserIDFromCtx`, `RoleFromCtx`.
- `api/internal/auth/handlers.go` — `HandleOTPSend`, `HandleOTPVerify`, `HandleRefresh`, `HandleMe` + `readJSON`/`writeJSON` helpers.
- `api/internal/auth/jwt_test.go` — round-trip, expiry, tamper, refresh-kind.
- `api/internal/auth/otp_test.go` — local-mode bypass accepted, wrong code rejected, missing args rejected.
- `api/README.md` — run + curl examples + env var table.

**Files modified:**
- `api/internal/platform/config/config.go` — added `MSG91TemplateID`, `MSG91SenderID`.
- `api/internal/platform/httpx/router.go` — wired real auth handlers, added `/auth/refresh`, applied `RequireAuth` to `/me` and `/admin/*`. Health preserved.
- `api/cmd/server/main.go` — constructs `auth.Service` (+ MSG91 client when non-local).
- `go.mod` already had `github.com/golang-jwt/jwt/v5 v5.2.1`; no new deps required.

**Test commands:**
```
cd api
go mod tidy
go build ./...
go test ./internal/auth/...
```

**Follow-ups for Agent 4 (DB) / integration:**
- `VerifyOTP` upserts with `INSERT ... ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id, role`. If DB layer adds an `updated_at` column later, swap the no-op update.
- `/me` reads `name`, `email` as nullable text — schema already matches.
- Admin role-gating not yet enforced (only auth-required). Needs role-check middleware once admin endpoints arrive.
- MSG91 template/sender env vars (`MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID`) must be added to infra secrets for staging/prod.
- OTP rate-limiting is not implemented — recommend a Redis/PG-based limiter before prod.

### Agent 2 report (Next.js web)
**Status:** done

Wired OTP login flow end-to-end against the Go API contract. Server-components-first,
HTTP-only cookie session, middleware-protected `/home`. Matches mockup Screens 01
(Login), 02 (Dashboard), 13 (Landing) in the cinematic dark aesthetic.

**Files produced/modified**
- `web/app/layout.tsx` — Fraunces + Inter via `next/font/google`, wraps `QueryProvider`
- `web/app/globals.css` — Tailwind v4 theme tokens + hero/login gradients + progress-ring util
- `web/app/page.tsx` — Landing (Screen 13): top nav, hero with "finds its **stage**" headline, Book Trial + Login CTAs, 4 class cards, footer
- `web/app/(auth)/login/page.tsx` — 2-column login shell (purple→gold gradient left with Shakespeare quote, form right)
- `web/app/(auth)/login/login-form.tsx` — RHF + Zod, 2-step flow (phone `+91` prefix → 6-digit OTP boxes with auto-advance/paste), posts to `/v1/auth/otp/send` and `/v1/auth/otp/verify`, then to `/api/auth/session` to persist cookie
- `web/app/api/auth/session/route.ts` — POST sets `access_token`/`refresh_token` httpOnly cookies; DELETE clears them
- `web/app/(app)/home/page.tsx` — Dashboard (Screen 02): welcome hero, next-class card, term-progress ring (72%), announcements feed. Server component calling `requireSession()`
- `web/app/(app)/home/logout-button.tsx` — DELETEs session + redirects to `/`
- `web/middleware.ts` — gates `/home`, `/channel`, `/progress` when `access_token` cookie is absent
- `web/lib/api.ts` — typed `api<T>()` helper, `ApiError`, `User`/`TokenPair` types mirroring `openapi.yaml`
- `web/lib/auth.ts` — `getSession()` reads cookie + calls `GET /v1/me`, `requireSession()` redirects to `/login`
- `web/lib/query-client.tsx` — TanStack Query provider (client component)
- `web/lib/schemas/auth.ts` — Zod schemas
- `web/components/Button.tsx` — primary | ghost | accent variants, md/lg sizes
- `web/components/Input.tsx` — labeled input with optional prefix + error
- `web/components/PrivacyBadge.tsx` — private | pending_consent | public
- `web/package.json` — added `@hookform/resolvers`
- `web/.env.example` — `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- `web/README.md` — quickstart + login flow + file layout

**How to test locally**
1. Run Agent 1's Go API on `:8080` with dev OTP bypass code `000000`.
2. `cd web && pnpm install && pnpm dev`.
3. Open `http://localhost:3000` → landing with gradient hero + 4 class cards.
4. Click **Login** → 2-col login screen. Type any 10-digit number → Send OTP.
5. Enter `000000` → auto-submits on 6th digit → `/home`.
6. Dashboard shows welcome, next class card, 72% progress ring, 3 announcements.
7. **Logout** clears cookie and returns to `/`.
8. Visiting `/home` while logged out → middleware redirects to `/login?next=/home`.

**Screen notes**
- Landing: `grad-hero` radial purple+gold over `#0B0B0F`, Fraunces headline with italic "stage" in primary gold.
- Login: left pane `grad-login` (stronger purple/gold wash) with stippled dots and Shakespeare quote; right pane minimal form. OTP inputs are 6 independent 48px boxes, Fraunces, gold text.
- Dashboard: next-class card spans 2 cols with a gradient "now playing" tile; progress ring uses a CSS `conic-gradient` mask trick for the arc.

### Agent 3 report (Flutter mobile)
**Status:** scaffolding complete (source-only; native folders still need `flutter create`)

**Files produced**
- `mobile/pubspec.yaml` — deps: flutter_riverpod, go_router, dio, flutter_secure_storage, google_fonts, chewie, video_player, sentry_flutter, intl
- `mobile/analysis_options.yaml` — `package:flutter_lints/flutter.yaml`
- `mobile/lib/main.dart` — `ProviderScope` + `MaterialApp.router`
- `mobile/lib/theme/app_theme.dart` — dark theme, Fraunces display / Inter body via `google_fonts`; palette `#0B0B0F` / `#E8C872` / `#8B5CF6`
- `mobile/lib/routes/app_router.dart` — go_router with `/`, `/login`, `/home`, `/channel`, `/consent/:token`; auth-aware redirect using `authStateProvider`
- `mobile/lib/api/api_client.dart` — Dio with bearer interceptor and refresh-on-401; base URL from `const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:8080')`
- `mobile/lib/models/user.dart`, `mobile/lib/models/token_pair.dart` — plain Dart (no freezed)
- `mobile/lib/features/auth/token_storage.dart` — wraps `flutter_secure_storage`
- `mobile/lib/features/auth/auth_repository.dart` — `sendOtp`, `verifyOtp`, `me`, `logout`
- `mobile/lib/features/auth/auth_providers.dart` — `tokenStorageProvider`, `apiClientProvider`, `authRepositoryProvider`, `authStateProvider` (`AsyncNotifierProvider<AuthController, User?>`)
- `mobile/lib/features/auth/login_screen.dart` — 2-step phone -> 6-box OTP; cinematic gradient header
- `mobile/lib/features/home/home_screen.dart` — greeting card, next-class card, custom-painted progress ring, announcements
- `mobile/test/auth_flow_test.dart` — widget test: login screen builds
- `mobile/README.md` — updated with prereqs, setup, run commands, dev OTP `000000`

**Commands to run after (on a dev machine with Flutter SDK)**
```bash
cd mobile
flutter create --org in.viktheatre --project-name vik_theatre \
  --platforms=ios,android --empty .   # generates ios/ + android/ only; leaves lib/ alone
flutter pub get
flutter test
# Android emulator:
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
# iOS simulator:
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

**Known gaps / follow-ups**
- `ios/` and `android/` native folders not committed (generated by `flutter create`).
- Sentry init not wired in `main.dart` (dep present; add DSN later).
- `/channel` and `/consent/:token` are placeholder screens — real implementations in later phases.
- Hand-rolled Dio calls against `/auth/otp/send`, `/auth/otp/verify`, `/auth/refresh`, `/me` — matches Agent 1's routes.
- `google_fonts` fetches TTFs at runtime on first launch; consider bundling Fraunces + Inter later for offline resilience.
- No OpenAPI-generated client yet; `dart-dio` generator step deferred.

### Agent 4 report (DB layer)
**Status:** done

Owned `api/internal/db/**`, `api/migrations/seed_dev.sql`, `api/sqlc.yaml`,
`api/docker-compose.yml`, `api/Makefile`, `api/go.mod`. Did not touch
Go service code, web, mobile, openapi.yaml, or `.github/`.

**Files produced**
- `api/sqlc.yaml` — sqlc v2 config, `pgx/v5`, uuid/timestamptz overrides, `emit_interface: true`.
- `api/internal/db/queries/users.sql` — `UserGetByID`, `UserGetByPhone`, `UserUpsertByPhone`, `UserUpdateProfile`, `UserGetByIDs`.
- `api/internal/db/queries/batches.sql` — `BatchCreate`, `BatchGetByID`, `BatchListForInstructor`, `EnrollmentCreate` (idempotent), `EnrollmentListByBatch`.
- `api/internal/db/queries/assets.sql` — `AssetCreate`, `AssetGetByID`, `AssetListForStudent` (optional privacy filter via `sqlc.narg`), `AssetListPublicForStudent`, `AssetSetMuxIDs`, `AssetUpdatePrivacy`.
- `api/internal/db/queries/consents.sql` — `ConsentCreate`, `ConsentGetLatestForAsset`, `ConsentRevoke`.
- `api/internal/db/queries/notes_rubric.sql` — `RubricUpsert`, `RubricListForAsset`, `RubricAverageForStudent` (grouped avg), `NoteCreate`, `NoteListForAsset` (private toggle via `sqlc.narg`).
- `api/internal/db/queries/audit.sql` — `AuditInsert`.
- `api/internal/db/store.go` — `Store{Pool, *dbq.Queries}` with `NewStore(p)`. `dbq` import marked `// TODO: run sqlc generate` since the package is generated.
- `api/migrations/seed_dev.sql` — deterministic UUID seed (admin Vik Prasad, instructor Anita Rao, 3 parents, 3 students, `parents_students` links, "Thursday Evening" batch with 3 enrollments, 2 assets (public+private), consent row for the public asset, 2 rubric scores). Uses `ON CONFLICT DO NOTHING` so it is idempotent.
- `api/docker-compose.yml` — local Postgres 16-alpine (`vik/vik/vik`, port 5432, `pgdata` volume).
- `api/internal/db/README.md` — workflow + conventions + how to add a query.

**Files modified**
- `api/Makefile` — added `sqlc-gen`, `db-up`, `db-down`, `seed`. Existing targets untouched.
- `api/go.mod` — added `github.com/google/uuid v1.6.0`.

**Exact commands**
```
cd api
make db-up
export DATABASE_URL=postgres://vik:vik@localhost:5432/vik?sslmode=disable
make migrate-up
sqlc generate          # or: make sqlc-gen  (generates internal/db/dbq/)
go mod tidy
make seed
make dev
```

**Integration hooks for Agent 1 (auth)**
- In `api/internal/auth/service.go`, replace the raw `INSERT ... ON CONFLICT` in `VerifyOTP` with `store.UserUpsertByPhone(ctx, phone)` — returns the full `dbq.User` row (id, role, etc.).
- `LoadUser` → `store.UserGetByID(ctx, id)`.
- Audit the OTP verification with `store.AuditInsert(ctx, dbq.AuditInsertParams{ActorID: user.ID, Action: "auth.otp.verify", Target: "user:"+user.ID.String()})`.
- Wire in `cmd/server/main.go`: `store := db.NewStore(pool); authSvc := auth.NewService(cfg, store, ...)`.
- For transactions, use `store.Pool.BeginTx` and `dbq.New(tx)` for a per-tx Querier.
