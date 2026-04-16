#!/usr/bin/env bash
# One-command production deploy: migrations -> API -> Web -> smoke test.
# Interactive confirmation at each step. Safe to abort between stages.
#
# Prereqs: fly auth login, vercel login, .env.production populated,
#          goose installed (go install github.com/pressly/goose/v3/cmd/goose@latest).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env.production"
APP_NAME="viktheatre-api"
API_URL="${API_URL:-https://api.viktheatre.in}"
WEB_URL="${WEB_URL:-https://viktheatre.in}"

cyan()  { printf '\033[1;36m%s\033[0m\n' "$*"; }
green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
red()   { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }

confirm() {
  local prompt="${1:-Continue?}"
  read -r -p "${prompt} [y/N] " r
  [[ "${r,,}" == "y" || "${r,,}" == "yes" ]]
}

[[ -f "${ENV_FILE}" ]] || { red "missing ${ENV_FILE}"; exit 1; }

# Source DATABASE_URL only (no set -a to avoid polluting env with secrets).
DATABASE_URL="$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)"
[[ -n "${DATABASE_URL}" ]] || { red "DATABASE_URL missing from ${ENV_FILE}"; exit 1; }

cyan "=== Step 1/4: goose migrations against prod DB ==="
command -v goose >/dev/null 2>&1 || { red "goose not installed"; exit 1; }
(cd "${REPO_ROOT}/api" && goose -dir migrations postgres "${DATABASE_URL}" status)
if confirm "Run 'goose up' on production?"; then
  (cd "${REPO_ROOT}/api" && goose -dir migrations postgres "${DATABASE_URL}" up)
  green "  migrations applied."
else
  cyan "  skipped."
fi

cyan "=== Step 2/4: Fly.io API deploy ==="
if confirm "Sync secrets to Fly (${APP_NAME})?"; then
  "${REPO_ROOT}/scripts/set-fly-secrets.sh" "${APP_NAME}"
fi
if confirm "fly deploy --remote-only?"; then
  (cd "${REPO_ROOT}/api" && fly deploy --remote-only --config fly.toml -a "${APP_NAME}")
  green "  API deployed."
else
  cyan "  skipped API deploy."
fi

cyan "=== Step 3/4: Vercel web deploy ==="
if confirm "Sync NEXT_PUBLIC_* env to Vercel production?"; then
  "${REPO_ROOT}/scripts/set-vercel-env.sh" production
fi
if confirm "vercel --prod?"; then
  (cd "${REPO_ROOT}/web" && vercel --prod --yes)
  green "  Web deployed."
else
  cyan "  skipped web deploy."
fi

cyan "=== Step 4/4: smoke test ==="
set +e
api_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "${API_URL}/v1/health")
web_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 -L "${WEB_URL}/")
set -e
printf '  API  %s/v1/health -> %s\n' "${API_URL}" "${api_code}"
printf '  WEB  %s/         -> %s\n' "${WEB_URL}" "${web_code}"

if [[ "${api_code}" == "200" && "${web_code}" == "200" ]]; then
  green "=== deploy OK ==="
else
  red "=== smoke test failed — check 'fly logs -a ${APP_NAME}' and Vercel dashboard ==="
  exit 1
fi
