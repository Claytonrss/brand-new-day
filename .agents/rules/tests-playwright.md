---
description: Non-negotiables for unit and Playwright visual tests — isolation, projects, evidence.
globs: tests/**, playwright.config.ts, scripts/collect-*.mjs
---

# Rules — Tests (Vitest + Playwright)

Binding source: `docs/agents/test-isolation.md` (runbook completo).

- Port discipline: any Playwright/evidence run requires `pnpm env:doctor`
  first (exit 1 = stop). One Playwright suite per machine at a time.
- Projects are `mobile-390` and `desktop-1440` — single source:
  `playwright.config.ts`. The 430 viewport enters via `pnpm evidence:visual`.
- Smoke tier (`@smoke`, `mobile-390`) is the PR gate; deep visual suite runs
  on main/CI.
- Evidence collectors (`scripts/collect-*.mjs`) photograph the `.env` port's
  server — never assume 5173 blindly.
- New visual test? Add the `data-testid` in the same PR; selectors must exist
  in the checkout under test (contamination symptoms → runbook §6).
