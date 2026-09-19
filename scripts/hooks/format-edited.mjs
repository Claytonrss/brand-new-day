#!/usr/bin/env node
// PostToolUse feedback hook (Edit|Write|MultiEdit matcher) — keeps edited
// files formatted with the repo's prettier config. Never blocks.

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const FORMATTABLE = /\.(ts|tsx|css|md|json|mjs|js)$/;

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    process.exit(0);
  }
  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !FORMATTABLE.test(filePath)) process.exit(0);

  const result = spawnSync(
    process.execPath,
    [
      new URL('../../node_modules/prettier/bin/prettier.cjs', import.meta.url).pathname,
      '--write',
      filePath,
    ],
    { stdio: 'ignore' },
  );
  process.exit(result.status === null ? 0 : result.status);
}

main();
