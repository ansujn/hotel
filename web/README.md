# Vik Theatre — Web (Next.js 15)

Student-facing web app. Server-components-first, Tailwind v4, TanStack Query, RHF + Zod.

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your Go API
pnpm dev                     # http://localhost:3000
```

Requires the Go API (Agent 1) running on `http://localhost:8080`. In dev mode the
API should accept OTP code `000000` for any phone number.

## Login flow (end-to-end)

1. `/login` Step 1 — user enters phone (default `+91` prefix).
2. Client `POST`s `{ phone: "+91..." }` to `API/v1/auth/otp/send`.
3. `/login` Step 2 — user types 6-digit OTP (`000000` in dev).
4. Client `POST`s `{ phone, code }` to `API/v1/auth/otp/verify` and receives a `TokenPair`.
5. Client forwards tokens to **our own** `POST /api/auth/session` route handler,
   which sets `access_token` (and `refresh_token`) as `httpOnly`, `sameSite=lax`,
   `secure` (in prod) cookies.
6. Client calls `router.replace("/home")`; middleware allows the request because
   the cookie is now present. Server components in `(app)/*` use `requireSession()`
   which reads the cookie and calls `GET /v1/me`.
7. Logout: `DELETE /api/auth/session` clears both cookies.

## File structure

```
web/
  app/
    layout.tsx                  # Fraunces + Inter via next/font, QueryProvider
    page.tsx                    # Landing (Screen 13)
    globals.css                 # Tailwind v4 theme tokens
    (auth)/login/
      page.tsx                  # 2-col login layout
      login-form.tsx            # Client form (RHF + Zod, 2-step)
    (app)/home/
      page.tsx                  # Dashboard (Screen 02) — requires session
      logout-button.tsx
    api/auth/session/route.ts   # Sets/clears access_token cookie
  components/
    Button.tsx                  # primary | ghost | accent
    Input.tsx
    PrivacyBadge.tsx
  lib/
    api.ts                      # fetch helper + domain types
    auth.ts                     # getSession / requireSession
    query-client.tsx            # TanStack Query provider
    schemas/auth.ts             # Zod schemas
  middleware.ts                 # Gate /home, /channel, /progress
```

## Admin & Channel routes (Phase 2)

New route groups:

```
app/
  (app)/channel/[id]/page.tsx              # Screen 3 — student channel
  (app)/channel/[id]/v/[assetId]/page.tsx  # Screen 4 — video detail + Mux player
  (admin)/layout.tsx                       # Gated to role=admin|instructor
  (admin)/students/page.tsx                # Screen 10 — student roster table
  (admin)/upload/page.tsx                  # Screen 9 — upload wrapper (server)
  (admin)/upload/upload-form.tsx           # Client form with progress
  (admin)/upload/actions.ts                # Server actions (createAsset, publishAsset)
components/
  BannerGradient.tsx
  AdminNav.tsx
  video/MuxPlayer.tsx                      # thin @mux/mux-player-react wrapper
  video/VideoCard.tsx                      # Mux thumb + privacy badge
lib/
  channel.ts                               # getChannel, getAsset, AssetType
```

### Admin upload walkthrough

1. Sign in as an admin/instructor user (role enforced in `(admin)/layout.tsx`).
2. Visit `/upload`. Left pane = drop zone; right pane = metadata form (student, type, title, note, rubric sliders, privacy).
3. Drop an MP4/MOV or click to browse. The file stays in the browser.
4. Submit — the client calls the `createAssetAction` server action which:
   - Reads the `access_token` cookie server-side.
   - `POST`s `/v1/admin/assets` with the metadata.
   - Returns `{ asset_id, mux_upload_url }` to the browser. The bearer token never leaves the server.
5. Client `PUT`s the file directly to `mux_upload_url` via `XMLHttpRequest` (so we can wire real upload-progress events; `fetch` doesn't expose them).
6. If privacy = "Request parent consent", client calls `publishAssetAction` which `POST`s `/v1/admin/assets/:id/publish` — flipping the asset to `pending_consent` and kicking off the parent email.
7. Success toast renders inline; "Reset" clears the form for another upload.

### Channel pages

- `/channel/[id]` — cinematic banner, stats strip, tab switcher (`?tab=monologue|scene|showcase|catalog|about`), responsive grid of `VideoCard`s.
- `/channel/[id]/v/[assetId]` — Mux player (with optional signed token), rubric bars, private instructor-notes panel, related videos.
- Middleware leaves `/channel/**` anonymous-friendly; the API filters private assets per viewer role.

## Conventions

- Server components by default. `"use client"` only where we need interactivity.
- Tailwind v4 with theme tokens in `globals.css` — no CSS modules.
- Strict TypeScript, no `any`.
- API types mirror `openapi.yaml`. Run `pnpm gen:api` to regenerate from the spec.
