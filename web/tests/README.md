# E2E Tests (Playwright)

## Quick start

```bash
# Install Playwright browsers (one-time)
npx playwright install chromium

# Run all tests (starts dev server automatically)
pnpm e2e

# Run with UI mode
pnpm e2e:ui
```

## Running with API (auth + channel tests)

The `@requires-api` tests need the Go API on `localhost:8080`:

```bash
# Terminal 1 — start the API
cd api && make dev

# Terminal 2 — run all e2e tests
cd web && pnpm e2e
```

Without the API, `@requires-api` tests skip automatically.

## CI behavior

The GitHub Actions workflow runs only `landing.spec.ts` (no API dependency).
API-dependent tests are for local development only.

## Test files

| File | Requires API | What it tests |
|---|---|---|
| `landing.spec.ts` | No | Headline, 4 class cards, login link |
| `auth-flow.spec.ts` | Yes | Middleware redirect, OTP login, logout |
| `public-channel.spec.ts` | Yes | Channel page loads without crash |
