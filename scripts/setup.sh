#!/usr/bin/env bash
set -euo pipefail

trap 'echo "STATUS: FAIL"; exit 1' ERR

echo "== Setup: checking runtime =="
node --version
pnpm --version
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Expected Node.js >= 22, got $(node --version)"
  exit 1
fi

echo "== Setup: installing dependencies =="
pnpm install --frozen-lockfile

echo "== Setup: installing Playwright browsers =="
pnpm exec playwright install --with-deps chromium

echo "STATUS: PASS"
