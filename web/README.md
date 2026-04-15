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

## Conventions

- Server components by default. `"use client"` only where we need interactivity.
- Tailwind v4 with theme tokens in `globals.css` — no CSS modules.
- Strict TypeScript, no `any`.
- API types mirror `openapi.yaml`. Run `pnpm gen:api` to regenerate from the spec.
