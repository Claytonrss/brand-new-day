#!/usr/bin/env bash
set -euo pipefail

trap 'echo "STATUS: FAIL"; exit 1' ERR

# --no-editor: for non-interactive bootstraps (envctl init) — same setup,
# without launching VS Code.
NO_EDITOR=false
for arg in "$@"; do
  case "$arg" in
    --no-editor) NO_EDITOR=true ;;
    *)
      echo "unknown flag: $arg (use --no-editor)"
      exit 2
      ;;
  esac
done

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

echo "== Setup: per-checkout .env (isolated dev port) =="
# The main checkout keeps the default 5173; a worktree (.git is a file there)
# gets a deterministic free port derived from its path — so parallel worktrees
# never share a dev server (docs/agents/test-isolation.md §10).
if [ -f .env ]; then
  echo "  .env already present (PORT=$(sed -n 's/^PORT=//p' .env | head -1)) — keeping it"
elif [ -f .git ]; then
  port=$((5174 + $(printf '%s' "$(pwd -P)" | cksum | cut -d' ' -f1) % 126))
  for _ in $(seq 1 50); do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 || break
    port=$((port + 1))
  done
  printf '# Unique dev port for this worktree (docs/agents/test-isolation.md §10)\nPORT=%s\n' "$port" > .env
  echo "  .env created with PORT=$port"
else
  printf '# Default dev port for the main checkout (docs/agents/test-isolation.md §10)\nPORT=5173\n' > .env
  echo "  .env created with PORT=5173"
fi

if [ "$NO_EDITOR" = true ]; then
  echo "== Setup: skipping editor launch (--no-editor) =="
else
  echo "== Setup: opening VS Code on this checkout =="
  if command -v code >/dev/null 2>&1; then
    code .
  else
    echo "  'code' CLI not found — open this folder in VS Code manually"
  fi
fi

echo "STATUS: PASS"
