import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Desktop pointer-parallax evidence: the same frame with the cursor at two
 * extremes. Differences are intentionally subtle (a few px).
 *
 * Usage: node scripts/collect-parallax-evidence.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;
const OUT_DIR = process.argv[3] ?? 'docs/evidence/desktop-pointer-parallax';

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Headless Chromium reports `hover: none`; the parallax is gated on a real
// pointer, so emulate one for the evidence.
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setEmulatedMedia', {
  features: [
    { name: 'hover', value: 'hover' },
    { name: 'pointer', value: 'fine' },
  ],
});

await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
await page
  .getByRole('progressbar', { name: 'Carregando experiência 3D' })
  .waitFor({ state: 'hidden', timeout: 90_000 })
  .catch(() => {});
await page.waitForTimeout(4000);

// The parallax layers live on the Hero (the opening title card is at scroll 0).
await page.evaluate(() => {
  const view = globalThis;
  view.scrollTo(0, view.innerHeight * 1.2);
});
await page.waitForTimeout(2500);

for (const [name, x, y] of [
  ['hero-left', 120, 420],
  ['hero-right', 1320, 420],
]) {
  await page.mouse.move(x, y, { steps: 20 });
  await page.waitForTimeout(1500);
  const debug = await page.evaluate(() => {
    const view = globalThis;
    const hero = view.document.querySelector('[aria-labelledby="hero-title"]');
    const header = view.document.querySelector('header');
    return {
      hover: view.matchMedia('(hover: hover)').matches,
      px: view.getComputedStyle(view.document.documentElement).getPropertyValue('--pointer-x'),
      heroTransform: hero ? view.getComputedStyle(hero).transform : null,
      headerTransform: header ? view.getComputedStyle(header).transform : null,
    };
  });
  console.log(name, JSON.stringify(debug));
  const target = `${OUT_DIR}/1440-${name}.png`;
  await page.screenshot({ path: target });
  console.log(target);
}

await browser.close();
