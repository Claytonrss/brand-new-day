import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';

/**
 * Generates the static posters used by the WebGL fallback.
 *
 * A single off-screen capture of the real model (option A in
 * docs/specs/webgl-static-fallback.md §3), taken from the canvas element with
 * the HTML layers set to opacity 0 (keeping layout, so the scroll position —
 * and therefore the camera framing — does not change).
 *
 * Usage: node scripts/collect-fallback-poster.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;
const OUT_DIR = process.argv[3] ?? 'public';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  await page
    .getByRole('progressbar', { name: 'Carregando experiência 3D' })
    .waitFor({ state: 'hidden', timeout: 90_000 })
    .catch(() => {});
  await page.waitForTimeout(4000);

  // FullBody framing: the whole figure, poster-like.
  await page.evaluate(() => {
    const view = globalThis;
    const max = view.document.body.scrollHeight - view.innerHeight;
    view.scrollTo(0, max * 0.93);
  });
  await page.waitForTimeout(4000);

  // Fade the HTML layers without changing layout (progress/camera stay put).
  await page.evaluate(() => {
    const view = globalThis;
    for (const node of view.document.querySelectorAll(
      'main > div.relative.z-10, .fixed.right-0.top-0.z-50, [role="status"]',
    )) {
      node.style.opacity = '0';
    }
  });
  await page.waitForTimeout(400);

  const target = `${OUT_DIR}/fallback-poster-${viewport.name}.png`;
  await page.locator('canvas').screenshot({ path: target });
  console.log(target);

  await context.close();
}

await browser.close();
