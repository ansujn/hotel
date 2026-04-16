#!/usr/bin/env bash
# Reads .env.production and pushes every non-NEXT_PUBLIC_* key to Fly.io as a secret.
# Idempotent — `fly secrets set` is a no-op if value is unchanged.
#
# Usage: scripts/set-fly-secrets.sh [app-name]
#   app-name defaults to viktheatre-api.

set -euo pipefail

APP_NAME="${1:-viktheatre-api}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env.production"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "error: ${ENV_FILE} not found. Copy .env.production.example and fill in values." >&2
  exit 1
fi

if ! command -v fly >/dev/null 2>&1 && ! command -v flyctl >/dev/null 2>&1; then
  echo "error: fly(ctl) CLI not installed. See https://fly.io/docs/hands-on/install-flyctl/" >&2
  exit 1
fi
FLY="$(command -v fly || command -v flyctl)"

echo "==> Target app: ${APP_NAME}"
"${FLY}" status -a "${APP_NAME}" >/dev/null || {
  echo "error: app '${APP_NAME}' not found or not authenticated. Run 'fly auth login' first." >&2
  exit 1
}

# Collect KEY=VALUE pairs, skipping comments, blanks, and NEXT_PUBLIC_* (those go to Vercel).
declare -a PAIRS=()
while IFS= read -r line || [[ -n "${line}" ]]; do
  # strip trailing CR from Windows-edited files
  line="${line%$'\r'}"
  # skip comments / blanks
  [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]] && continue
  # must look like KEY=VALUE
  [[ "${line}" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
  key="${line%%=*}"
  value="${line#*=}"
  # skip web-only vars
  [[ "${key}" == NEXT_PUBLIC_* ]] && continue
  # skip unset placeholders
  [[ -z "${value}" ]] && { echo "  skip ${key} (empty)"; continue; }
  PAIRS+=("${key}=${value}")
done < "${ENV_FILE}"

if [[ ${#PAIRS[@]} -eq 0 ]]; then
  echo "warning: no secrets found to set."
  exit 0
fi

echo "==> Staging ${#PAIRS[@]} secret(s) to ${APP_NAME}"
for p in "${PAIRS[@]}"; do echo "     - ${p%%=*}"; done

read -r -p "Proceed? [y/N] " confirm
[[ "${confirm,,}" == "y" || "${confirm,,}" == "yes" ]] || { echo "aborted."; exit 0; }

# --stage avoids triggering a deploy per-secret; single restart at the end.
"${FLY}" secrets set --stage -a "${APP_NAME}" "${PAIRS[@]}"
"${FLY}" secrets deploy -a "${APP_NAME}"

echo "==> Done. Verify with: ${FLY} secrets list -a ${APP_NAME}"
