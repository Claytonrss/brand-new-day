#!/usr/bin/env bash
set -euo pipefail

trap 'echo "STATUS: FAIL"; exit 1' ERR

mkdir -p test-results/visual test-results/logs

SESSION="spiderman"
BASE_URL="${BASE_URL:-http://localhost:${PORT:-5173}}"

echo "== Visual evidence: checking app at $BASE_URL =="

collect_viewport() {
  label="$1"
  width="$2"
  height="$3"

  echo "== Collecting $label ${width}x${height} =="
  pnpm exec playwright screenshot \
    --viewport-size="$width,$height" \
    --wait-for-timeout=5000 \
    "$BASE_URL" \
    "test-results/visual/${label}-hero.png"
}

collect_viewport "390" 390 844
collect_viewport "430" 430 932
collect_viewport "1440" 1440 900

echo "STATUS: PASS"
echo "Evidence saved in test-results/visual/"
