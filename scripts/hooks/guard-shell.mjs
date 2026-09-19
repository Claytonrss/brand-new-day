#!/usr/bin/env node
// PreToolUse gate hook (Bash matcher) — mirrors AGENTS.md §11 limits.
// Reads Claude Code hook JSON from stdin, exits 2 (block) on risky commands.

import { readFileSync } from 'node:fs';

const REGEX_RULES = [
  [
    'git push --force / -f requires human confirmation (AGENTS.md §11)',
    /git\s+push\s+([^&|;]*\s)?(-f\b|--force(?!-with-lease))/,
  ],
  ['git reset --hard requires human confirmation (AGENTS.md §11)', /git\s+reset\s+[^&|;]*--hard/],
  [
    'dependency install is a human-reviewed operation (AGENTS.md §11)',
    /\b(pnpm|npm|yarn|bun)\s+(install|add|remove|unlink)\b/,
  ],
  [
    'agent config edits require human confirmation (AGENTS.md §11)',
    />\s*(opencode\.json|\.opencode\/|\.claude\/|\.cursor\/|\.agents\/)/,
  ],
];

/** rm with both recursive and force flags in the same invocation → deny */
function rmForce(segment) {
  const tokens = segment.trim().split(/\s+/);
  const bin = tokens[0]?.split('/').pop();
  if (bin !== 'rm') return false;
  let sawR = false;
  let sawF = false;
  for (const token of tokens.slice(1)) {
    if (!token.startsWith('-') || token === '-') break;
    if (token === '--') break;
    sawR ||= /[rR]/.test(token);
    sawF ||= /[fF]/.test(token);
  }
  return sawR && sawF;
}

/** @returns {string[]} denial reasons, [] when the command is allowed */
export function denials(command) {
  const segments = String(command ?? '').split(/&&|\|\||;|\|/);
  const reasons = [];
  for (const segment of segments) {
    if (rmForce(segment)) {
      reasons.push(`rm -rf requires human confirmation (AGENTS.md §11) :: ${segment.trim()}`);
    }
    for (const [label, re] of REGEX_RULES) {
      if (re.test(segment)) reasons.push(`${label} :: ${segment.trim()}`);
    }
  }
  return reasons;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    process.exit(0); // unparseable input: fail open, never brick the agent loop
  }
  const command = payload?.tool_input?.command ?? '';
  const reasons = denials(command);
  if (reasons.length > 0) {
    process.stderr.write(`BLOCKED by guard-shell:\n- ${reasons.join('\n- ')}\n`);
    process.exit(2); // exit 2 = deny (Claude Code hook convention)
  }
}

if (process.argv[1]?.endsWith('guard-shell.mjs')) main();
