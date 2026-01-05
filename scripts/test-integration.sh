#!/usr/bin/env bash
set -euo pipefail

# Runs Vitest integration tests using existing Supabase instance.
# Assumes Supabase is already running locally.
# Usage: scripts/test-integration.sh [vitest args...]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Root directory..." ${ROOT_DIR}
echo "Script directory..." ${SCRIPT_DIR} 
echo "Bash source..." ${BASH_SOURCE[0]}

# Load .env file if it exists
if [ -f "${ROOT_DIR}/.env" ]; then
  echo "Loading environment variables from .env file..." >&2
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

# Try to get env vars from supabase status if available
if command -v npx >/dev/null 2>&1; then
  echo "Getting Supabase env vars from local instance via npx..." >&2
  eval "$(npx supabase status --env 2>/dev/null)" || {
    echo "Warning: Could not get env vars from npx supabase status." >&2
  }
fi

# Try to get service role key from Supabase .env file if not set
if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ] && [ -f "${ROOT_DIR}/supabase/.env" ]; then
  echo "Trying to load service role key from supabase/.env..." >&2
  set -a
  source "${ROOT_DIR}/supabase/.env" 2>/dev/null || true
  set +a
fi

# Verify required env vars are set
if [ -z "${SUPABASE_URL:-}" ]; then
  echo "Error: SUPABASE_URL must be set." >&2
  echo "" >&2
  echo "Options:" >&2
  echo "  1. Add to .env file: SUPABASE_URL=http://127.0.0.1:54321" >&2
  echo "  2. Export in shell: export SUPABASE_URL=http://127.0.0.1:54321" >&2
  exit 1
fi

if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: SUPABASE_SERVICE_ROLE_KEY must be set." >&2
  echo "" >&2
  echo "Note: This is different from SUPABASE_KEY (anon key)." >&2
  echo "The service role key bypasses Row Level Security (RLS) for testing." >&2
  echo "" >&2
  echo "Options:" >&2
  echo "  1. Add to .env file: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" >&2
  echo "  2. Export in shell: export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" >&2
  echo "  3. Get from local Supabase:" >&2
  echo "     - Run: supabase status" >&2
  echo "     - Or check: supabase/config.toml (look for service_role_key)" >&2
  echo "     - Or in Supabase Studio: Settings > API > service_role key" >&2
  exit 1
fi

cd "${ROOT_DIR}"
echo "Running Vitest integration suite..." >&2
# Run all integration tests if no specific test is provided
if [ $# -eq 0 ]; then
  # Find all integration test files and pass them to Vitest
  INTEGRATION_TESTS=$(find . -name "*integration*.test.ts" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.astro/*" | tr '\n' ' ')
  if [ -z "${INTEGRATION_TESTS}" ]; then
    echo "Error: No integration test files found." >&2
    exit 1
  fi
  # Use --maxConcurrency 1 to run tests sequentially and avoid database conflicts
  SUPABASE_URL="${SUPABASE_URL}" SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}" npx vitest run --maxConcurrency 1 ${INTEGRATION_TESTS}
else
  SUPABASE_URL="${SUPABASE_URL}" SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}" npx vitest run --maxConcurrency 1 "${@}"
fi

