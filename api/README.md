# Vik Theatre API (Go)

Student platform API. Phone-OTP auth + JWT, PostgreSQL, chi router.

## Run

```
make dev        # boots postgres + api on :8080
```

Requires env (set via `.env` or shell):

| Var | Required | Notes |
| --- | --- | --- |
| `APP_ENV` | no (default `local`) | `local` bypasses MSG91 |
| `API_PORT` | no (default `8080`) | |
| `DATABASE_URL` | yes | Postgres DSN |
| `JWT_SECRET` | yes | HS256 signing key |
| `MSG91_AUTH_KEY` | prod only | MSG91 REST auth key |
| `MSG91_TEMPLATE_ID` | prod only | OTP template |
| `MSG91_SENDER_ID` | optional | sender shortcode |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | later | for video uploads |

## Local OTP bypass

When `APP_ENV=local`, OTP send is a no-op and the code `000000` is accepted
for any phone number. The user is upserted into `users` with role `student`
on first verify.

## Auth endpoints (curl)

Send OTP:

```
curl -X POST http://localhost:8080/v1/auth/otp/send \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+919876543210"}'
# -> 204
```

Verify OTP, get tokens:

```
curl -X POST http://localhost:8080/v1/auth/otp/verify \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+919876543210","code":"000000"}'
# -> 200 {"access_token":"...","refresh_token":"..."}
```

Refresh:

```
curl -X POST http://localhost:8080/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refresh_token":"<refresh>"}'
# -> 200 {"access_token":"..."}
```

Current user:

```
curl http://localhost:8080/v1/me \
  -H "Authorization: Bearer <access_token>"
# -> 200 {"id":"...","phone":"...","role":"student","locale":"en"}
```

## Token details

- HS256 signed with `JWT_SECRET`.
- Access token TTL: 1 hour.
- Refresh token TTL: 30 days.
- Claims: `sub` (user id), `role`, `phone`, `kind` (`access` | `refresh`).

## Tests

```
cd api
go test ./internal/auth/...
```
