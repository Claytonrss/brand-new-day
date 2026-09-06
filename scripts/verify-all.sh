#!/usr/bin/env bash
set -u

mkdir -p test-results/logs
failed=()

run_gate() {
  name="$1"
  shift
  echo "== Running $name =="
  if "$@" > "test-results/logs/$name.log" 2>&1; then
    echo "PASS: $name"
  else
    echo "FAIL: $name (see test-results/logs/$name.log)"
    failed+=("$name")
  fi
}

run_gate lint pnpm run lint
run_gate typecheck pnpm run typecheck
run_gate test pnpm run test
run_gate build pnpm run build

if [ "${#failed[@]}" -eq 0 ]; then
  echo "STATUS: PASS"
  exit 0
fi

echo "STATUS: FAIL"
echo "Failed gates:"
printf '%s\n' "${failed[@]}"
echo "See logs in test-results/logs/"
exit 1
