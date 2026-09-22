#!/usr/bin/env bash
# envctl — lightweight lifecycle for THIS checkout's dev server: up / health / logs.
# doctor.sh stays the heavy pre-flight (suite exclusivity, capacity, orphans);
# envctl is the everyday "boot / answer / observe" loop so an agent never works
# in the dark. Conventions mirror doctor.sh exactly: port from .env, log and
# pid under test-results/logs/, and the §3 coordination rule — another
# checkout's server is reported, never touched.
#
# Usage:
#   pnpm env:up            # idempotent: boot this checkout's server + health check
#   pnpm env:health        # quick: is THIS checkout serving? (exit 1 = no)
#   pnpm env:logs          # last 80 lines of the dev-server log
#   pnpm env:logs -f       # follow the log (tail -f)
#   pnpm env:logs -n 200   # custom line count (any tail flags pass through)

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

# Port follows .env (per-worktree, docs/agents/test-isolation.md §10); explicit env wins.
PORT="${PORT:-}"
if [ -z "$PORT" ] && [ -f .env ]; then
  PORT="$(sed -n 's/^PORT=//p' .env | head -1)"
fi
PORT="${PORT:-5173}"
BASE_URL="http://127.0.0.1:${PORT}"

DEV_LOG="test-results/logs/dev-server.log"
DEV_PID_FILE="test-results/logs/dev-server.pid"

CMD="${1:-}"
case "$CMD" in
  up | health | logs) ;;
  *)
    echo "usage: envctl.sh up|health|logs [tail flags for logs]"
    exit 2
    ;;
esac

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

stop_pid() {
  local pid="$1"
  kill "$pid" 2>/dev/null
  for _ in 1 2 3 4 5; do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 1
  done
  kill -9 "$pid" 2>/dev/null
}

# Classifies the port: free | ours-healthy | ours-degraded | foreign.
# Sets PORT_STATE and FOREIGN_CWD (same state machine as doctor.sh).
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

boot_own_server() {
  if [ ! -d node_modules ]; then
    echo "[BLOCKED] no node_modules in this checkout — run \`pnpm bootstrap\` first"
    return 1
  fi
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
        echo "     logs: pnpm env:logs (-f) · stop: pnpm env:teardown"
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

cmd_up() {
  check_port
  case "$PORT_STATE" in
    ours-healthy)
      echo "[OK] already up — this checkout serves $BASE_URL (nothing to do)"
      exit 0
      ;;
    ours-degraded)
      echo "[WARN] port $PORT is this checkout's server but NOT responding — replacing it"
      for pid in $PORT_PIDS; do
        cwd="$(proc_cwd "$pid")"
        if in_this_checkout "$PROJECT_DIR" "$cwd"; then
          stop_pid "$pid"
          echo "[FIXED] stopped degraded server pid $pid"
        fi
      done
      check_port
      ;;
    foreign)
      echo "[BLOCKED] port $PORT belongs to ANOTHER checkout: $FOREIGN_CWD"
      echo "          This script never kills it — coordinate (§3) or pick another port via .env."
      exit 1
      ;;
  esac
  if [ "$PORT_STATE" != "free" ]; then
    echo "[BLOCKED] port $PORT still occupied after repair (state: $PORT_STATE)"
    exit 1
  fi
  boot_own_server || exit 1
}

cmd_health() {
  check_port
  case "$PORT_STATE" in
    ours-healthy)
      echo "[OK] $BASE_URL responds (HTTP ok, this checkout)"
      exit 0
      ;;
    free)
      echo "[DOWN] nothing listening on port $PORT — start with \`pnpm env:up\`"
      ;;
    ours-degraded)
      echo "[DOWN] this checkout's server is on port $PORT but NOT responding — repair with \`pnpm env:up\`"
      ;;
    foreign)
      echo "[BLOCKED] port $PORT serves ANOTHER checkout: $FOREIGN_CWD — not ours to touch (§3)"
      ;;
  esac
  exit 1
}

cmd_logs() {
  if [ ! -f "$DEV_LOG" ]; then
    echo "[ERR] no dev-server log at $DEV_LOG — boot first: \`pnpm env:up\`"
    exit 1
  fi
  echo "== $DEV_LOG =="
  if [ "$#" -gt 1 ]; then
    exec tail "${@:2}" "$DEV_LOG"
  fi
  exec tail -n 80 "$DEV_LOG"
}

case "$CMD" in
  up) cmd_up ;;
  health) cmd_health ;;
  logs) cmd_logs "$@" ;;
esac
