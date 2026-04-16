# OPERATIONS — day-2 cheatsheet

Short, scannable. For deploy procedures see `docs/DEPLOY.md`.

## Log tailing & shell

```bash
# API logs (streaming, all regions)
fly logs -a viktheatre-api

# Last N lines of a single machine
fly logs -a viktheatre-api -i <machine-id>

# SSH into a running machine (ephemeral)
fly ssh console -a viktheatre-api

# One-off command (no interactive shell)
fly ssh console -a viktheatre-api -C "/app/server --version"
```

Vercel logs: `cd web && vercel logs --prod` (or dashboard → Deployments → Functions).

## Running a migration against prod

```bash
export DATABASE_URL="$(grep ^DATABASE_URL= .env.production | cut -d= -f2-)"

# Always preview first
goose -dir api/migrations postgres "$DATABASE_URL" status

# Apply
goose -dir api/migrations postgres "$DATABASE_URL" up

# Roll back one step
goose -dir api/migrations postgres "$DATABASE_URL" down
```

Never run destructive migrations during peak hours (6–10pm IST class slots). Use Neon's branching for risky changes: branch prod → run migration on the branch → verify → promote.

## Rotating `JWT_SECRET` without downtime (dual-key window)

The API accepts two secrets during rotation: a primary (used to sign) and a secondary (accepted for verify only). Rotation takes ~`JWT_ACCESS_TTL` (1h) to fully drain old tokens.

1. Generate a new secret: `NEW=$(openssl rand -base64 48)`.
2. Move current value to `JWT_SECRET_PREVIOUS`, set new as `JWT_SECRET`:
   ```bash
   CUR=$(fly ssh console -a viktheatre-api -C 'printenv JWT_SECRET' | tr -d '\r')
   fly secrets set -a viktheatre-api JWT_SECRET="$NEW" JWT_SECRET_PREVIOUS="$CUR"
   ```
3. Fly rolls machines one at a time (`min_machines_running=1` holds traffic).
4. After `JWT_ACCESS_TTL + JWT_REFRESH_TTL` grace OR after confirming no refresh tokens reference old key, unset the previous:
   ```bash
   fly secrets unset -a viktheatre-api JWT_SECRET_PREVIOUS
   ```

(If the Go server doesn't yet support `JWT_SECRET_PREVIOUS`, force everyone to re-login: rotate once, accept short-term token invalidation.)

## On-call runbook — common alerts

### Alert: `api.viktheatre.in/v1/health` returning 5xx

1. `fly status -a viktheatre-api` — any machines unhealthy?
2. `fly logs -a viktheatre-api` — look for panics, pgx errors, OOM kills.
3. If DB-related: check Neon dashboard → Operations → recent errors. Confirm pool isn't exhausted (`SELECT count(*) FROM pg_stat_activity;`).
4. If OOM: `fly scale memory 1024 -a viktheatre-api` (temporary), then profile.
5. Rollback: `fly releases rollback <prev-version> -a viktheatre-api`.

### Alert: Neon Postgres unreachable

1. Check https://neonstatus.com.
2. Confirm `DATABASE_URL` secret is intact: `fly ssh console -a viktheatre-api -C 'printenv DATABASE_URL'`.
3. If only pooler is down, switch temporarily to direct connection string (port 5432 non-pooled). Update secret, `fly secrets deploy`.
4. If prolonged outage, flip to the Neon branch in `ap-southeast-1` (keep one as standby).

### Alert: Mux webhook failures spiking

1. Mux dashboard → Webhooks → recent deliveries. Is Mux retrying 5xx, or are we returning 4xx (signature mismatch)?
2. Verify `MUX_WEBHOOK_SECRET` in fly matches the secret Mux shows for that endpoint.
3. `grep mux_webhook` in Fly logs for the failing asset ID.
4. Safe to replay: Mux's "Resend" button is idempotent because our handler is keyed on `asset_id + status`.

### Alert: MSG91 OTP delivery dropping

1. MSG91 dashboard → Reports → failure reason. Common: DLT template mismatch, sender-ID block, balance empty.
2. If DLT issue: the template text must match EXACTLY what's registered on the DLT portal; one character off = block.
3. Fallback: flip `OTP_CHANNEL=email` for login (if Resend-email-OTP path exists) while MSG91 is debugged.

### Alert: Razorpay webhook signatures failing

1. Confirm `RAZORPAY_WEBHOOK_SECRET` matches the LIVE secret (not TEST). Test-mode and live-mode have different secrets.
2. Razorpay sends webhooks from fixed IP ranges — verify Cloudflare isn't challenging them (turn off bot-fight on `api.`).

## Recurring ops

- **Weekly**: review Sentry issues, triage top 5 by event count.
- **Weekly**: check Fly billing (`fly orgs show`) and Vercel usage.
- **Monthly**: rotate `JWT_SECRET` (dual-key procedure above).
- **Monthly**: test restore from Neon point-in-time backup to a throwaway branch.
- **Quarterly**: `go list -m -u all` + `pnpm outdated` → patch-bump dependencies.
