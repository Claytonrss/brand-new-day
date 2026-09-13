/**
 * Conventional Commits (AGENTS.md §5) — types fix/feat/docs/chore/test/
 * refactor/perf/ci/build/style + optional scope. Extends the shareable
 * config; scopes are free-form (branch/slug vocabulary varies by PR).
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [0],
  },
};

export default config;
