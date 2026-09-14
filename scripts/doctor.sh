#!/usr/bin/env bash
# Doctor — the env-isolation pre-flight (AGENTS.md §11, docs/agents/test-isolation.md
# §3/§9) as an executable gate instead of prose the agent has to interpret.
#
# Run as `pnpm env:doctor` (NOT `pnpm doctor` — that is a pnpm builtin and
# shadows this script silently).
#
# Usage:
#   pnpm env:doctor          # read-only diagnostic; exit 1 = do not run tests/evidence
#   pnpm env:doctor --fix    # repair THIS checkout: stop a degraded own server, kill
#                            # own orphan test processes, then boot a fresh dev server
#                            # with a health check. Processes of other checkouts are
#                            # reported, never touched (coordination rule, §3).

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

# Port follows .env (per-worktree, test-isolation.md §10); explicit env wins.
PORT="${PORT:-}"
if [ -z "$PORT" ] && [ -f .env ]; then
  PORT="$(sed -n 's/^PORT=//p' .env | head -1)"
fi
PORT="${PORT:-5173}"
BASE_URL="http://127.0.0.1:${PORT}"

AUTO_FIX=false
[ "${1:-}" = "--fix" ] && AUTO_FIX=true

DEV_LOG="test-results/logs/dev-server.log"
DEV_PID_FILE="test-results/logs/dev-server.pid"

proc_cwd() {
  lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1
}

# Exact dir or below it — sibling worktrees never match the prefix.
in_this_checkout() {
  [ "$2" = "$1" ] && return 0
  case "$2" in "$1"/*) return 0 ;; esac
  return 1
}

http_status() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$BASE_URL/" 2>/dev/null
}

# Suite runners + evidence collectors are the machine-global exclusive resource
# (§9.1). pgrep only narrows candidates; the cmdline filter avoids matching
# unrelated processes that merely contain "playwright".
suite_pids() {
  local pid cmd out=""
  for pid in $(pgrep -f 'playwright|collect-' 2>/dev/null); do
    cmd="$(ps -o command= -p "$pid" 2>/dev/null)" || continue
    case "$cmd" in *doctor.sh*|*teardown.sh*) continue ;; esac
    case "$cmd" in
      # " test " with a trailing space: `cli.js test --grep …` matches, the VS
      # Code extension's resident `cli.js test-server` daemon does not.
      *playwright*" test "*|*playwright*screenshot*|*collect-*evidence*) out="$out $pid" ;;
    esac
  done
  echo "$out"
}

load1() { uptime | sed -E 's/.*load averages?: ([0-9.]+).*/\1/'; }
cores() { command -v nproc >/dev/null 2>&1 && nproc || sysctl -n hw.ncpu 2>/dev/null; }

check_port() {
  PORT_PIDS="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | sort -u)"
  PORT_STATE="free"
  FOREIGN_CWD=""
  if [ -n "$PORT_PIDS" ]; then
    PORT_STATE="ours-degraded"
    local foreign=""
    for pid in $PORT_PIDS; do
      cwd="$(proc_cwd "$pid")"
      if in_this_checkout "$PROJECT_DIR" "$cwd"; then
        PORT_STATE="ours"
      else
        foreign="${foreign}${foreign:+; }$cwd (pid $pid)"
      fi
    done
    if [ -n "$foreign" ]; then
      PORT_STATE="foreign"
      FOREIGN_CWD="$foreign"
    elif [ "$PORT_STATE" = "ours" ]; then
      st="$(http_status)"
      case "$st" in [234]*) PORT_STATE="ours-healthy" ;; esac
    fi
  fi
}

stop_pid() {
  local pid="$1"
  kill "$pid" 2>/dev/null
  for _ in 1 2 3 4 5; do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 1
  done
  kill -9 "$pid" 2>/dev/null
}

boot_own_server() {
  echo "Booting this checkout's dev server on port $PORT (log: $DEV_LOG)..."
  mkdir -p "$(dirname "$DEV_LOG")"
  (
    cd "$PROJECT_DIR" || exit 1
    set -a
    # shellcheck disable=SC1091
    [ -f .env ] && . ./.env
    set +a
    export PORT
    nohup pnpm run dev -- --host 127.0.0.1 >"$DEV_LOG" 2>&1 &
    echo $! >"$DEV_PID_FILE"
  )
  SERVER_PID="$(cat "$DEV_PID_FILE" 2>/dev/null)"
  elapsed=0
  while [ "$elapsed" -lt 60 ]; do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "[BLOCKED] dev server (pid $SERVER_PID) died. Last log lines:"
      tail -5 "$DEV_LOG" 2>/dev/null
      return 1
    fi
    st="$(http_status)"
    case "$st" in
      [234]*)
        echo "[OK] dev server healthy on $BASE_URL (pid $SERVER_PID)"
        return 0
        ;;
    esac
    sleep 2
    elapsed=$((elapsed + 2))
    printf '.'
  done
  echo ""
  echo "[BLOCKED] dev server did not become healthy in 60s (pid $SERVER_PID); stopping it."
  stop_pid "$SERVER_PID"
  tail -5 "$DEV_LOG" 2>/dev/null
  return 1
}

echo "== doctor: environment pre-flight for $PROJECT_DIR =="
echo ""

# --- .env / port identity -----------------------------------------------------
if [ -f .env ]; then
  echo "[OK] .env present (PORT=$PORT)"
else
  if [ -f .git ]; then
    echo "[WARN] worktree without .env — run \`pnpm bootstrap\`; using default port $PORT"
  else
    echo "[PENDING] no .env — using default port $PORT"
  fi
fi

check_port
case "$PORT_STATE" in
  free)
    echo "[OK] port $PORT free — the suite will boot this checkout's server"
    ;;
  ours-healthy)
    echo "[OK] port $PORT serves THIS checkout (HTTP ok)"
    ;;
  ours-degraded)
    echo "[BLOCKED] port $PORT is this checkout's server but NOT responding — run \`pnpm env:doctor --fix\`"
    ;;
  foreign)
    echo "[BLOCKED] port $PORT belongs to ANOTHER checkout: $FOREIGN_CWD"
    echo "          Do not run tests/evidence (§3). Orphan of another agent → kill it there;"
    echo "          user session → coordinate. This script never kills it."
    ;;
esac

# --- machine-global suite exclusivity (§9.1) ----------------------------------
SUITE_PIDS="$(suite_pids)"
SUITE_COUNT=0
for _ in $SUITE_PIDS; do SUITE_COUNT=$((SUITE_COUNT + 1)); done
if [ "$SUITE_COUNT" -gt 0 ]; then
  echo "[BLOCKED] $SUITE_COUNT playwright suite/evidence process(es) already running (§9.1) — wait, don't stack:"
  for pid in $SUITE_PIDS; do
    echo "          pid $pid: $(ps -o command= -p "$pid" 2>/dev/null | cut -c1-100)"
  done
else
  echo "[OK] no playwright suite running on this machine"
fi

# --- orphan browsers (leftovers from dead runs, §9.2) -------------------------
CHROM_TOTAL=0
CHROM_FOREIGN=0
for pid in $(pgrep -f 'ms-playwright/chromium' 2>/dev/null); do
  CHROM_TOTAL=$((CHROM_TOTAL + 1))
  cwd="$(proc_cwd "$pid")"
  in_this_checkout "$PROJECT_DIR" "$cwd" || CHROM_FOREIGN=$((CHROM_FOREIGN + 1))
done
if [ "$CHROM_TOTAL" -gt 0 ] && [ "$SUITE_COUNT" -eq 0 ]; then
  echo "[WARN] $CHROM_TOTAL chromium process(es) alive with no suite running ($CHROM_FOREIGN outside this checkout)"
  echo "       Own leftovers → \`pnpm env:doctor --fix\`; others are not ours to kill."
fi

# --- machine capacity (§9) ----------------------------------------------------
L="$(load1)"
C="$(cores)"
if [ -n "$L" ] && [ -n "$C" ]; then
  if awk -v l="$L" -v c="$C" 'BEGIN{exit !(l>c)}'; then
    echo "[WARN] load $L > $C cores — machine already saturated, runs will be slow/flaky"
  else
    echo "[OK] load $L / $C cores"
  fi
fi

# --- repair pass (--fix only touches this checkout) ---------------------------
if [ "$AUTO_FIX" = true ]; then
  echo ""
  echo "== doctor --fix: repairing this checkout =="

  if [ "$PORT_STATE" = "ours-degraded" ] && [ "$SUITE_COUNT" -eq 0 ]; then
    for pid in $PORT_PIDS; do
      cwd="$(proc_cwd "$pid")"
      if in_this_checkout "$PROJECT_DIR" "$cwd"; then
        stop_pid "$pid"
        echo "[FIXED] stopped degraded server pid $pid"
      fi
    done
    check_port
  elif [ "$PORT_STATE" = "ours-degraded" ]; then
    echo "[SKIP] suite active on this machine — not stopping the degraded server now"
  fi

  if [ "$SUITE_COUNT" -eq 0 ] && [ "$CHROM_TOTAL" -gt 0 ]; then
    for pid in $(pgrep -f 'ms-playwright/chromium' 2>/dev/null); do
      cwd="$(proc_cwd "$pid")"
      if in_this_checkout "$PROJECT_DIR" "$cwd"; then
        kill -9 "$pid" 2>/dev/null && echo "[FIXED] killed orphan chromium pid $pid"
      fi
    done
  fi

  if [ "$PORT_STATE" = "free" ]; then
    boot_own_server || exit 1
    check_port
  elif [ "$PORT_STATE" = "foreign" ]; then
    echo "[SKIP] foreign server on port $PORT — not ours to fix; coordinate (§3)"
  fi
fi

echo ""
if [ "$PORT_STATE" = "foreign" ] || [ "$PORT_STATE" = "ours-degraded" ] || [ "$SUITE_COUNT" -gt 0 ]; then
  echo "VERDICT: BLOCKED — do not run playwright/evidence until resolved (see [BLOCKED] above)"
  exit 1
fi
echo "VERDICT: CLEAR — safe to run playwright/evidence on port $PORT"
exit 0
