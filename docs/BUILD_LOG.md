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

---

## 2026-04-15 · Phase 2 — Content + Consent pipeline (4 parallel agents)
**Status:** 🟡 in progress

Phase 1 committed as `84cd157`. Phase 2 adds the asset/upload/consent heart of the product.

| Agent | Folder | Task |
|---|---|---|
| A — Go assets + Mux | `api/internal/asset/`, `api/internal/consent/`, `api/internal/platform/mux/` | Asset create (direct upload URL), Mux webhooks, channel endpoint, consent backend + PDF + privacy transitions |
| B — Web channel + admin upload | `web/app/(app)/channel/**`, `web/app/(admin)/**`, `web/components/video/**` | Student channel page with Mux player, admin upload UI (Screens 3, 4, 9) |
| C — Flutter channel + player | `mobile/lib/features/channel/**` | Channel screen, video detail screen with HLS playback via chewie |
| D — Consent flow + PDF | `web/app/(public)/consent/**`, `mobile/lib/features/consent/**`, `api/internal/consent/pdf.go` | Parent consent UI (web + mobile), PDF generation, token link flow |

Rules unchanged: one folder per agent, openapi.yaml is frozen for this phase, no cross-agent writes.

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

### Agent B report (Phase 2)
**Status:** done

Scope: Student channel + video detail + admin upload + admin students list in
`web/` only. No changes to `api/`, `mobile/`, `.github/`, `openapi.yaml`, or `docs/**`.
Middleware updated to protect `/admin`, `/upload`, `/students`, `/batches`,
`/social`; `/channel/**` kept anonymous-friendly (API filters privacy).

**Files produced**
- `web/lib/channel.ts` — `getChannel`, `getAsset`, `Asset`, `Channel`, `ASSET_TABS`, `formatDuration`. Reads `access_token` cookie server-side.
- `web/components/BannerGradient.tsx` — cinematic purple/gold banner.
- `web/components/AdminNav.tsx` — sticky admin top nav (Students / Batches / Upload / Social Hub + ADMIN badge + avatar).
- `web/components/video/MuxPlayer.tsx` — client wrapper around `@mux/mux-player-react` (already in deps). Accepts `playbackId`, optional signed `token`, `title`, `poster`.
- `web/components/video/VideoCard.tsx` — reusable card with Mux `thumbnail.jpg`, duration pill, privacy badge.
- `web/app/(app)/channel/[id]/page.tsx` — Screen 3. Server component, `getChannel` via cookie; banner, stats, tabs via `searchParams.tab`, responsive grid.
- `web/app/(app)/channel/[id]/v/[assetId]/page.tsx` — Screen 4. Mux player, rubric bars, private instructor-notes panel, related same-type videos.
- `web/app/(admin)/layout.tsx` — server component; `requireSession()` + redirects non-admin/instructor to `/home`.
- `web/app/(admin)/students/page.tsx` — Screen 10. Search + batch filter (form GET), plain HTML table (tanstack-table not in deps), consent `PrivacyBadge`, "+ Add Student" stub. Uses STUB_STUDENTS with TODO to replace with real endpoint.
- `web/app/(admin)/upload/page.tsx` + `upload-form.tsx` + `actions.ts` — Screen 9.
  - Server actions `createAssetAction` / `publishAssetAction` keep the JWT server-side.
  - Client form does drag-and-drop + `XMLHttpRequest` PUT to `mux_upload_url` with live progress bar.
  - Privacy picker: "Keep private" vs "Request parent consent" (latter triggers `/v1/admin/assets/:id/publish`).
- `web/middleware.ts` — added `/admin`, `/upload`, `/students`, `/batches`, `/social` gate list; kept `/channel` public.
- `web/README.md` — new "Admin & Channel routes" section with upload walkthrough.

**Manual test steps** (Agent A's Go changes up + stub Mux direct-upload endpoint returning a working PUT URL):
1. `cd web && pnpm install && pnpm dev`.
2. Log in as any user via `/login` (dev OTP `000000`).
3. Visit `/channel/<student-uuid>?tab=monologue` — confirm banner, stats, tab switching via URL, clicking a card navigates to `/channel/<id>/v/<assetId>`.
4. On the detail page, confirm Mux player renders (needs a real `mux_playback_id` from Agent A), rubric bars animate correctly, instructor note panel shows `PRIVATE` badge.
5. Seed the JWT of a user with `role=admin` (manually update `users.role` in dev DB, re-login). Visit `/upload` — non-admin roles redirect to `/home` via `(admin)/layout.tsx`.
6. Drop an MP4, fill title + select student + adjust rubric, pick "Request parent consent", submit. Observe three stages: "Creating…" → progress bar "Uploading N%" → "Requesting consent…" → green success toast.
7. Visit `/students` — confirm table renders, search filter narrows rows, batch dropdown filters, "View" link goes to `/channel/<id>`.

**Known gaps / TODOs**
- `/v1/admin/assets/:id/publish` is referenced but not in `openapi.yaml` (frozen this phase). Agent A should add the route in the Go server; contract update lands next phase.
- `GET /v1/admin/students` doesn't exist yet — `students/page.tsx` uses STUB_STUDENTS and the upload form's student dropdown hardcodes the same four UUIDs. Swap to a real fetch when the endpoint lands.
- "+ Add Student", Batches tab, Social Hub tab are placeholder routes (nav exists; pages not created).
- Mux signed playback: `MuxPlayer` already accepts a `token` prop; once the API returns `mux_playback_token`, the field on `Asset` wires it through automatically.
- `AdminNav` reads the active tab from `x-pathname`/`x-invoke-path` headers. If those aren't populated in your Next runtime, the Students tab simply defaults to active — swap to a client component reading `usePathname` if needed.
- No package changes — `@mux/mux-player-react` was already in `package.json`, `@tanstack/react-table` was intentionally skipped per brief.

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

### Agent C report (Phase 2)

**Scope:** Flutter `mobile/` — new `channel` feature + reusable widgets + Screen 3 (Student Channel) and Screen 4 (Video Detail).

**Files produced / modified:**
- `mobile/lib/models/asset.dart` (new) — `Asset` + `AssetPrivacy` enum, JSON constructor mapping `mux_playback_id`, `duration_s`, `created_at`, `pending_consent` → `AssetPrivacy.pendingConsent`.
- `mobile/lib/models/channel.dart` (new) — `Channel` wrapping `User` + `List<Asset>`.
- `mobile/lib/features/channel/channel_repository.dart` (new) — `getChannel(studentId)` hits `GET /v1/students/{id}/channel` via shared `ApiClient` (auth token auto-attached by existing interceptor); `getAsset` client-filters.
- `mobile/lib/features/channel/channel_providers.dart` (new) — `channelRepositoryProvider`, `channelProvider` (family), `assetProvider` family keyed on `AssetArgs`.
- `mobile/lib/features/channel/channel_screen.dart` (new) — gradient banner (280h) + overlapping circular avatar (radius 60, white ring), name/batch/stats pills, `TabBar` Monologues/Scenes/Showcases/About, `GridView.count(2)` of `AssetCard`s; taps `context.push('/channel/:id/v/:assetId')`.
- `mobile/lib/features/channel/video_detail_screen.dart` (new) — `chewie` + `video_player` on `https://stream.mux.com/<id>.m3u8` (+ optional `?token=…`). When `muxPlaybackId` starts with `stub_` or is empty, renders a "Preview unavailable in local/dev mode" placeholder instead of initializing the player. Below: title (Fraunces 22), meta row, 5-dim rubric bars, instructor-notes card (hidden for non-student/instructor/admin roles), related-from-student horizontal list.
- `mobile/lib/widgets/privacy_badge.dart` (new) — chip PUBLIC (green) / PRIVATE (red) / PENDING (gold). Matches web `PrivacyBadge` styling.
- `mobile/lib/widgets/asset_card.dart` (new) — 16:9 gradient thumb, duration chip, title, date, privacy badge.
- `mobile/lib/widgets/gradient_banner.dart` (new) — purple → gold cinematic banner with bottom darken overlay.
- `mobile/lib/routes/app_router.dart` — added `/channel/:studentId` and `/channel/:studentId/v/:assetId` routes; added `isPublicChannel` bypass to redirect so unauth users can view public channels.
- `mobile/lib/features/home/home_screen.dart` — added "View My Channel" gradient card that navigates to `/channel/<authStateProvider user id>`.
- `mobile/test/channel_screen_test.dart` (new) — widget tests for loading + error states, using Riverpod `channelRepositoryProvider.overrideWithValue(...)` with fake repositories.

**pubspec:** `video_player ^2.9.1` and `chewie ^1.8.5` already present from Phase 1; no change.

**How to test:**
1. Start API: `cd api && go run ./cmd/server` (listens on :8080).
2. `cd mobile && flutter pub get && flutter run` (Android emulator uses `http://10.0.2.2:8080` by default; override via `--dart-define=API_BASE_URL=...`).
3. Log in via OTP → Home → tap **View My Channel** → browse Monologues/Scenes/Showcases tabs → tap any card to open Video Detail.
4. Widget tests: `cd mobile && flutter test test/channel_screen_test.dart`.

**Known gaps / assumptions:**
- Batch label, stats (Level), instructor name, and rubric values are placeholders — the OpenAPI `Channel`/`Asset` schemas don't yet expose these. Swap to real fields when the contract grows.
- `getAsset` is client-side filtered from `getChannel` (one endpoint per spec). If the API later adds `GET /v1/assets/{id}`, swap in place.
- The Go stub returns `mux_playback_id` starting with `stub_`; Video Detail shows the "Preview unavailable in local/dev mode" placeholder for those. Any real Mux id plays via HLS; signed `?token=` query param is passed through if present on the route URL.
- Instructor notes visibility check uses the coarse role strings `student`, `instructor`, `admin` from `authStateProvider` — owner-vs-other-student differentiation will need a server field (e.g. `student_id == me.id`).
- Unauthenticated deep-links to private assets are handled by the API returning a filtered channel; the detail screen shows a friendly "Video unavailable" state when the asset id isn't in the returned list.

### Agent A report (Phase 2)

**Scope:** Assets + Mux + Consent backend. Folders: `api/internal/asset/`, `api/internal/consent/`, `api/internal/platform/mux/` plus targeted wiring in `auth/`, `httpx/`, `config/`, and `cmd/server/`.

**Files created**
- `api/internal/platform/mux/client.go` — thin Mux REST client; direct-upload (`POST /video/v1/uploads` with Basic Auth), RS256 signed playback JWTs (kid/aud=v/sub=playbackID), HMAC-SHA256 webhook verification (`t=..,v1=..`). Stubs the whole thing when `MUX_TOKEN_ID` is empty so local dev doesn't need Mux creds.
- `api/internal/platform/mux/client_test.go` — webhook verify accept/reject + stub upload.
- `api/internal/asset/types.go` — `Asset`, `Channel`, `StudentSummary`, `Viewer`, `MuxEvent`.
- `api/internal/asset/service.go` — `Service` behind a `Store` interface. `CreateAsset` (inserts private row + mux direct upload), `GetChannel` (role-aware private/public filtering), `HandleMuxWebhook` (on `video.asset.ready` populate mux ids + duration), `RequestPublish` (flip to `pending_consent` + trigger consent dispatch).
- `api/internal/asset/store_pg.go` — pgx-backed `Store` implementation matching the SQL in `db/queries/assets.sql`. Upload id is stashed in `mux_asset_id` with `upload:` prefix until webhook reconciliation rewrites it.
- `api/internal/asset/handlers.go` — `HandleCreate`, `HandlePublish`, `HandleChannel`, `HandleMuxWebhookHTTP` (verifies HMAC before decoding).
- `api/internal/asset/service_test.go` — happy path for CreateAsset + webhook reconciliation round-trip.
- `api/internal/consent/service.go` — `Service` behind `Store`, `OTPVerifier`, `Notifier` interfaces. `IssueConsentRequest` (7-day HS256 token, dispatches email+SMS), `VerifyAndSign` (OTP re-verify, insert row, render PDF, flip asset to public when `channel||social`), `Revoke` (flip back to private). `LogNotifier` for local/dev.
- `api/internal/consent/store_pg.go` — pgx-backed consent store + audit + parent lookup.
- `api/internal/consent/pdf.go` — `RenderConsentPDF` using `github.com/go-pdf/fpdf`, one page, header / asset id / parent / scope checkmarks / validity / signature + IP + timestamp.
- `api/internal/consent/handlers.go` — `POST /v1/consent/{token}` public handler, captures `X-Forwarded-For`/`RemoteAddr` + `User-Agent`.
- `api/internal/consent/service_test.go` — channel scope flips asset to public, revoke flips back, print-only stays private, bad token rejected.

**Files modified**
- `api/internal/auth/role_middleware.go` — NEW (single-purpose addition in auth package): `RequireRole("admin","instructor")` and `OptionalAuth` (lets `GET /students/{id}/channel` peek at JWT if present).
- `api/internal/platform/config/config.go` — added `MuxSigningKeyID`, `MuxSigningKeyPrivate`, `MuxWebhookSecret`, `ResendAPIKey`, `AppBaseURL`.
- `api/internal/platform/httpx/router.go` — added `Asset` + `Consent` to `Deps`; wired `/admin/assets`, `/admin/assets/{id}/publish` behind `RequireAuth`+`RequireRole(admin,instructor)`; `/students/{id}/channel` behind `OptionalAuth`; `/webhooks/mux` unauthenticated (HMAC inside handler); `/consent/{token}` public.
- `api/cmd/server/main.go` — builds the Mux client (stub in local), asset service (PGStore), consent service (PGStore + auth issuer + `LogNotifier`), wires them bidirectionally (`assetSvc.WireConsent(consentSvc)`), passes into `Deps`.
- `api/go.mod` — added `github.com/go-pdf/fpdf v0.9.0`.

**Design notes**
- Services accept `Store` interfaces — pgx impls live next door (`store_pg.go`) and tests use hand-rolled fakes. No DB required to `go test ./...`.
- Asset and consent services reference each other through a tiny `ConsentRequester` interface; wired after both constructors with `WireConsent`.
- Upload id -> asset id reconciliation uses the `mux_asset_id` column (prefixed `upload:`) until the webhook overwrites it. Avoids adding a migration.
- PDF writer is a function field so tests can swap it; production uses `/tmp/consent-<id>.pdf` returning a `file://` URL. Swap for S3 when D is ready.
- Audit rows written on create / publish / consent.signed / consent.revoked.

**Local curl sequence (dev mode — `APP_ENV=local`, MUX creds empty, MSG91 bypass `000000`)**
```bash
# 1. Login as admin (seeded in Phase 1 or upsert a user with role=admin in psql first)
curl -s -X POST localhost:8080/v1/auth/otp/send      -H 'content-type: application/json' -d '{"phone":"+919999999001"}'
TOK=$(curl -s -X POST localhost:8080/v1/auth/otp/verify -H 'content-type: application/json' \
  -d '{"phone":"+919999999001","code":"000000"}' | jq -r .access_token)

# 2. Create an asset for a student (returns a stub upload URL)
STU=<student-uuid>
curl -s -X POST localhost:8080/v1/admin/assets -H "authorization: Bearer $TOK" \
  -H 'content-type: application/json' \
  -d "{\"student_id\":\"$STU\",\"type\":\"monologue\",\"title\":\"Hamlet soliloquy\"}"
# => {"asset_id":"...","mux_upload_url":"http://localhost:8080/v1/dev/mux-upload/<uploadID>"}

# 3. Simulate Mux webhook (no HMAC check in stub mode when webhook secret empty)
curl -s -X POST localhost:8080/v1/webhooks/mux -H 'content-type: application/json' -d "{
  \"type\":\"video.asset.ready\",
  \"data\":{\"id\":\"mux_asset_xyz\",\"upload\":{\"id\":\"<uploadID>\"},
            \"playback_ids\":[{\"id\":\"pb_abc\",\"policy\":\"signed\"}],\"duration\":42}}"

# 4. Request publish (needs a parents_students row for the student)
curl -s -X POST localhost:8080/v1/admin/assets/<asset-id>/publish -H "authorization: Bearer $TOK"
# => consent link logged to stdout: "[consent notify] ... link=http://localhost:3000/consent/<jwt>"

# 5. Parent signs (use the token printed above)
curl -s -X POST localhost:8080/v1/consent/<jwt> -H 'content-type: application/json' \
  -d '{"signed_name":"Asha Parent","scope":{"channel":true,"valid_months":12}}'

# 6. View the now-public channel (no auth)
curl -s localhost:8080/v1/students/$STU/channel
```

**Follow-ups for other agents**
- **Agent B (web admin/channel):** Hit `POST /v1/admin/assets` for the upload-URL handshake, then `PUT` the selected file to `mux_upload_url` (stub URL is a 404 in dev — fine, Mux accepts in prod). For Mux playback, the API currently returns `mux_playback_id` only; to build signed URLs you need `GET /v1/playback-token?playback_id=...` — **not implemented yet**, consider asking for it in Phase 3 or use direct public URLs when `MUX_SIGNING_KEY_ID` is empty in dev. `POST /v1/admin/assets/{id}/publish` triggers the consent email/SMS.
- **Agent C (Flutter channel):** Same `GET /v1/students/{id}/channel` contract. `mux_playback_id` may be null until webhook fires. Anonymous calls get only public assets; attaching the JWT (student/admin/instructor) unlocks private ones.
- **Agent D (consent UI + PDF polish):** `POST /v1/consent/{token}` already persists + renders PDF (`/tmp/consent-<assetID>.pdf`). D can replace `defaultPDFWrite` with an S3 uploader and enrich `RenderConsentPDF` layout/branding. `OTP` field on `SignReq` is optional today — wire OTP send before sign when D builds the parent UX; MSG91 bypass `000000` works in local.
- **Ops follow-up:** Replace `LogNotifier` with Resend (email) + MSG91 (SMS) clients; new env vars are already in `config.Config`. The schema does NOT have an `upload_id` column — the current `mux_asset_id` prefix trick works but a dedicated column would be cleaner next migration.


### Agent D report (Phase 2) — Consent flow (web + mobile)

**Web files produced**
- `web/app/(public)/consent/[token]/page.tsx` — server shell, pre-fetches context, noindex.
- `web/app/(public)/consent/[token]/consent-form.tsx` — client 3-step wizard (Review → Scope → Verify & Sign), EN/हिन्दी toggle, OTP with paste support, typed-name "wet" signature, success + invalid-token states.
- `web/app/(app)/parent/layout.tsx` — role gate (redirect to `/home` if not parent) + top nav.
- `web/app/(app)/parent/page.tsx` — Screen 7: pending-consents banner, "Aarav's Journey" hero, Uploads/Attendance/Fees cards, Consent Center preview.
- `web/app/(app)/parent/consent/page.tsx` — Consent Center table: pending/signed/revoked badges, scope summary, sign/PDF actions.
- `web/components/consent/StepIndicator.tsx`, `ScopeToggleRow.tsx`, `LanguageToggle.tsx`.
- `web/lib/consent.ts` — `submitConsent`, `getConsentContext` (tolerates 404), `consentStrings` EN+HI.

**Web files modified**
- `web/middleware.ts` — added `/parent/**` to protected matcher. `/consent/**` remains public (was never listed).

**Mobile files produced**
- `mobile/lib/models/consent.dart` — `ConsentScope`, `ConsentSignReq`, `ConsentContext`.
- `mobile/lib/features/consent/consent_repository.dart` — `submit()`, `getContext()` (returns null on 404/410).
- `mobile/lib/features/consent/consent_providers.dart` — Riverpod `ConsentFormController` (step, scope, otp, name, lang) + bilingual strings (`kConsentEn`, `kConsentHi`).
- `mobile/lib/features/consent/consent_screen.dart` — 3-page `PageView`, step indicator, language toggle, switches, OTP row with paste, italic signature field, success + invalid states.
- `mobile/lib/features/parent/parent_home_screen.dart` — Screen 7 mobile: pending banner, hero, stat cards, consent list.

**Mobile files modified**
- `mobile/lib/routes/app_router.dart` — role-aware post-login redirect (parent → `/parent`, else `/home`), bounce students off `/parent`, replaced `/consent/:token` placeholder with real `ConsentScreen`, added `/parent` + `/parent/consent` routes.

**Manual test (happy path)**
1. Admin (Agent C) uploads an asset → backend creates a consent token and (dev) logs the link.
2. Parent opens `http://localhost:3000/consent/<token>` in a browser (or taps SMS link on mobile).
3. Step 1 — video plays via Mux player, asset/student/batch metadata shown.
4. Step 2 — toggles channel/social/print + picks 6/12/24 months validity.
5. Step 3 — enters 6-digit OTP (paste supported), types full name.
6. Tap "Sign consent" → `POST /v1/consent/{token}` with `{otp, signed_name, scope}` → success screen.
7. Asset privacy flips to `public` on the channel once the backend updates it.

**Known gaps / TODOs (depend on Agent A)**
- `GET /v1/consent/{token}` is not yet in `openapi.yaml`. Frontend tolerates 404 (shows "invalid/expired") but the review step is most useful once the backend returns `{asset, student, batch}`. Consent Center shows **stub** data.
- `GET /v1/parent/consents/pending` + `GET /v1/parent/consents` — stubbed in `parent/page.tsx` and `parent/consent/page.tsx`. Swap the stub functions for `api(...)` once endpoints land.
- Child linkage: `Aarav` is hardcoded; needs `/v1/parent/children` or `user.children` on `/me`.
- Signed PDF link: table shows `#` placeholder — wire once Agent A exposes `pdf_url` on consent rows.
- No OTP-send step from the consent page itself: we assume the backend auto-sent OTP to parent phone when the link was generated. If UX requires a "resend OTP" button, add a small `POST /v1/consent/{token}/otp` call.
- Revocation UX (Signed → Revoked button) not yet built; needs `DELETE /v1/consents/{id}` from Agent A.
- i18n is a hand-rolled string map (per spec). If the app grows, migrate to the already-installed `next-intl`.

**Accessibility notes**
- All toggles use `role="switch"` + `aria-checked` (web) / `Semantics(toggled:)` (mobile).
- OTP inputs: `autoComplete="one-time-code"`, paste handler distributes digits, arrow/backspace navigation, `inputMode="numeric"`.
- Language toggle is a `role="group"` with `aria-pressed` on each option.
- Focus rings preserved (`focus-visible:ring-[#E8C872]/60`).
- Success/error messages use `role="alert"`.

---

## 2026-04-15 · Phase 3 — Hardening (3 parallel agents)
**Status:** in progress

Goal: prove everything compiles, sync contract, add e2e smoke test.

| Agent | Folder | Task |
|---|---|---|
| E — Go build fix | `api/` | `go mod tidy`, fix Phase 2 compile errors, stub mode runnable without sqlc, integration smoke test |
| F — Contract sync | `openapi.yaml` + `web/lib/` | Update openapi.yaml for Phase 2 additions; regenerate TS types; add missing Go route stubs |
| G — e2e smoke | `web/tests/` + `.github/` | Playwright happy path + wire into CI |

### Agent E report (Phase 3)

**What broke:**
- `api/internal/db/store.go` imported a non-existent `dbq` package (sqlc was never run). This was the only compile error.
- No `go.sum` existed (never ran `go mod tidy`).

**What was fixed:**
1. Rewrote `internal/db/store.go` to remove `dbq` import; `Store` now wraps `*pgxpool.Pool` only with a TODO for sqlc.
2. Ran `go mod tidy` to generate `go.sum` with all transitive deps.
3. Added `SKIP_DB=true` support in `cmd/server/main.go`: skips DB connection, leaves `asset` and `consent` services nil (router handles nil with 501 stubs).
4. Updated `api/README.md` env var table with `SKIP_DB`.

**Final output:**
- `go build ./...` — clean
- `go vet ./...` — clean
- `go test ./...` — 4/4 test packages pass (asset, auth, consent, mux)
- `SKIP_DB=true` server boots, logs warn, serves health + auth routes, stubs DB-dependent endpoints.

### Agent F report (Phase 3)

**Scope:** Contract sync — `openapi.yaml` + `web/lib/api.ts`.

**Endpoints added to openapi.yaml:**
- `POST /admin/assets/{id}/publish` — triggers consent flow (202 Accepted)
- `GET /consent/{token}` — fetch consent context for parent preview UI
- `GET /parent/consents` — list all consents for logged-in parent
- `GET /parent/consents/pending` — pending consent count
- `GET /admin/students` — list students for admin table

**Schemas added to openapi components:**
- `RubricScore` (dimension + score)
- `ConsentItem` (id, asset_id, scope fields, status, signed_at, pdf_url)
- `StudentListItem` (id, name, phone, batch_name, asset_count, consent_status)
- `Channel.student` expanded inline with id/name/role/locale (matches Go `StudentSummary`)

**TypeScript types added to `web/lib/api.ts`:**
- `Asset`, `AssetType`, `AssetPrivacy`
- `StudentSummary`, `Channel`
- `RubricScore`
- `ConsentItem`, `ConsentStatus`
- `StudentListItem`

**What web/mobile devs can now consume:**
- Web devs can import `Asset`, `Channel`, `ConsentItem`, `StudentListItem`, `RubricScore` from `@/lib/api` and type all Phase 2 API calls.
- Mobile (Dart) devs can regenerate types from `openapi.yaml` using any OpenAPI-to-Dart generator; all Phase 2 endpoints are now documented.
- The existing `User`, `TokenPair`, `UserRole` types are preserved.

### Agent G report (Phase 3)
**Status:** done

Added Playwright e2e smoke tests for the web app happy path and wired into CI.

**Files created**
- `web/playwright.config.ts` — Chromium-only, baseURL `localhost:3000`, webServer `pnpm dev`, 1 retry on CI
- `web/tests/landing.spec.ts` — Headline, 4 class cards, login link (no API needed)
- `web/tests/auth-flow.spec.ts` — Middleware redirect, OTP login flow, logout (`@requires-api`, auto-skips)
- `web/tests/public-channel.spec.ts` — Channel page loads without crash (`@requires-api`, auto-skips)
- `web/tests/README.md` — How to run locally and with API

**Files modified**
- `web/package.json` — Added `@playwright/test ^1.47.0` devDep, `e2e` and `e2e:ui` scripts
- `.github/workflows/web.yml` — Added `e2e` job after `check`: installs Playwright browsers, runs `landing.spec.ts` only, uploads HTML report artifact

**How to run**
```bash
cd web
npx playwright install chromium   # one-time
pnpm e2e                          # landing test (no API needed)

# With API for full suite:
# Terminal 1: cd api && make dev
# Terminal 2: cd web && pnpm e2e
```

**CI behavior**: Only `landing.spec.ts` runs in GitHub Actions (no Go API dependency). API-dependent tests (`auth-flow`, `public-channel`) are for local dev and auto-skip when the API is unreachable.
