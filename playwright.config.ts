import { defineConfig } from '@playwright/test';

// Port follows the env so parallel worktrees never share a dev server
// (docs/agents/test-isolation.md §10). The webServer inherits this env, so
// `PORT=5200 pnpm test:smoke` boots vite on 5200 and points every test at it.
const PORT = Number(process.env.PORT ?? 5173);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  // Software rendering (SwiftShader) is the norm both in CI and on machines
  // without a spare GPU: the 22MB GLB + environment + post-processing can push
  // a single test past 2 minutes.
  timeout: 240_000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/playwright',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm run dev -- --host 127.0.0.1',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  // Two tiers: `@smoke` tests (see pnpm test:smoke / CI smoke job) are the
  // PR gate; everything else is the deep suite that runs on main.
  // mobile-430 is intentionally absent — it differs from mobile-390 by 40px,
  // which these DOM/state assertions can't distinguish. The 430 viewport is
  // still covered by `pnpm evidence:visual` screenshots for PR bodies.
  projects: [
    {
      name: 'mobile-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true },
    },
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
});
