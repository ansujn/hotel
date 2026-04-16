#!/usr/bin/env bash
# Pushes NEXT_PUBLIC_* env vars from .env.production to a Vercel project.
# Run from repo root. Requires `vercel login` and `vercel link` already done in web/.
#
# Usage: scripts/set-vercel-env.sh [environment]
#   environment = production (default) | preview | development

set -euo pipefail

ENV_TARGET="${1:-production}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env.production"
WEB_DIR="${REPO_ROOT}/web"

case "${ENV_TARGET}" in
  production|preview|development) ;;
  *) echo "error: environment must be production|preview|development" >&2; exit 1 ;;
esac

[[ -f "${ENV_FILE}" ]] || { echo "error: ${ENV_FILE} not found" >&2; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo "error: vercel CLI not installed (npm i -g vercel)" >&2; exit 1; }
[[ -d "${WEB_DIR}/.vercel" ]] || { echo "error: run 'cd web && vercel link' first" >&2; exit 1; }

cd "${WEB_DIR}"

while IFS= read -r line || [[ -n "${line}" ]]; do
  line="${line%$'\r'}"
  [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]] && continue
  [[ "${line}" =~ ^NEXT_PUBLIC_[A-Za-z0-9_]+= ]] || continue
  key="${line%%=*}"
  value="${line#*=}"
  [[ -z "${value}" ]] && { echo "  skip ${key} (empty)"; continue; }

  # Idempotent: remove (ignore-fail) then add.
  echo "==> ${key} -> ${ENV_TARGET}"
  vercel env rm "${key}" "${ENV_TARGET}" --yes >/dev/null 2>&1 || true
  printf '%s' "${value}" | vercel env add "${key}" "${ENV_TARGET}" >/dev/null
done < "${ENV_FILE}"

echo "==> Done. List with: (cd web && vercel env ls ${ENV_TARGET})"
