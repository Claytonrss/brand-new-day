#!/usr/bin/env bash
# Teardown — end-of-task hygiene scoped to THIS checkout
# (docs/agents/test-isolation.md §7 cleanup / §9.2 orphan rules).
#
# Usage:
#   pnpm env:teardown            # graceful: stop THIS checkout's dev server on $PORT
#   pnpm env:teardown --force    # + kill THIS checkout's orphan playwright/chromium
#   pnpm env:teardown --clean    # + remove build/test artifacts (dist, test-results,
#                                #   playwright-report). .env is kept — it is this
#                                #   checkout's port identity.
#
# Processes whose cwd is outside this checkout are reported, never killed:
# another checkout's server or another agent's suite is coordination territory (§3).

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

PORT="${PORT:-}"
if [ -z "$PORT" ] && [ -f .env ]; then
  PORT="$(sed -n 's/^PORT=//p' .env | head -1)"
fi
PORT="${PORT:-5173}"

FORCE=false
CLEAN=false
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    --clean) CLEAN=true ;;
    *)
      echo "unknown flag: $arg (use --force and/or --clean)"
      exit 2
      ;;
  esac
done

proc_cwd() {
  lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1
}

# Exact dir or below it — sibling worktrees never match the prefix.
in_this_checkout() {
  [ "$2" = "$1" ] && return 0
  case "$2" in "$1"/*) return 0 ;; esac
  return 1
}

echo "== teardown: $PROJECT_DIR (port $PORT) =="

KILLED=0
LEFT_ALONE=0

# 1) dev/preview server on this checkout's port (graceful, then force)
PORT_PIDS="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | sort -u)"
if [ -n "$PORT_PIDS" ]; then
  for pid in $PORT_PIDS; do
    cwd="$(proc_cwd "$pid")"
    if in_this_checkout "$PROJECT_DIR" "$cwd"; then
      kill "$pid" 2>/dev/null
      for _ in 1 2 3 4 5; do
        kill -0 "$pid" 2>/dev/null || break
        sleep 1
      done
      kill -9 "$pid" 2>/dev/null
      echo "[STOPPED] dev server pid $pid"
      KILLED=$((KILLED + 1))
    else
      echo "[SKIPPED] pid $pid on port $PORT serves another checkout ($cwd) — not touching"
      LEFT_ALONE=$((LEFT_ALONE + 1))
    fi
  done
else
  echo "[OK] no server on port $PORT"
fi

# 2) --force: orphan suite runners and browsers scoped by cwd
if [ "$FORCE" = true ]; then
  for pid in $(pgrep -f 'playwright|collect-' 2>/dev/null); do
    cmd="$(ps -o command= -p "$pid" 2>/dev/null)" || continue
    case "$cmd" in *doctor.sh*|*teardown.sh*) continue ;; esac
    case "$cmd" in
      *playwright*" test"*|*playwright*screenshot*|*collect-*evidence*) ;;
      *) continue ;;
    esac
    cwd="$(proc_cwd "$pid")"
    if in_this_checkout "$PROJECT_DIR" "$cwd"; then
      kill -9 "$pid" 2>/dev/null && {
        echo "[KILLED] orphan runner pid $pid"
        KILLED=$((KILLED + 1))
      }
    else
      LEFT_ALONE=$((LEFT_ALONE + 1))
    fi
  done

  for pid in $(pgrep -f 'ms-playwright/chromium' 2>/dev/null); do
    cwd="$(proc_cwd "$pid")"
    if in_this_checkout "$PROJECT_DIR" "$cwd"; then
      kill -9 "$pid" 2>/dev/null && {
        echo "[KILLED] orphan chromium pid $pid"
        KILLED=$((KILLED + 1))
      }
    else
      LEFT_ALONE=$((LEFT_ALONE + 1))
    fi
  done

  if [ "$KILLED" -eq 0 ]; then
    echo "[OK] --force found no orphans in this checkout"
  fi
fi

# 3) --clean: build/test artifacts only — .env stays (port identity)
if [ "$CLEAN" = true ]; then
  for dir in dist test-results playwright-report; do
    if [ -d "$dir" ]; then
      rm -rf "$dir"
      echo "[CLEANED] $dir/"
    fi
  done
fi

if [ "$LEFT_ALONE" -gt 0 ]; then
  echo "[INFO] $LEFT_ALONE process(es) outside this checkout were left alone (§3)"
fi
echo "STATUS: PASS"
exit 0
