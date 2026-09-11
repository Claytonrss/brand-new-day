import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Captures the eight scroll checkpoints used by the portfolio audit, for the
 * three mandatory viewports (390x844, 430x932, 1440x900).
 *
 * These stills are the evidence evaluated against
 * `docs/design/composition-rules.md` and the visual rubric (P0.5).
 *
 * Usage: node scripts/collect-portfolio-audit.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT_DIR = process.argv[3] ?? 'docs/evidence/portfolio-audit-p0';

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

const POINTS = [0, 15, 30, 45, 60, 75, 90, 100];

mkdirSync(OUT_DIR, { recursive: true });

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

  await page.waitForTimeout(3000);

  for (const point of POINTS) {
    // globalThis instead of window/document: this callback runs in the browser,
    // but eslint analyses the file as Node code (no-undef).
    await page.evaluate((fraction) => {
      const view = globalThis;
      const max = view.document.body.scrollHeight - view.innerHeight;
      view.scrollTo(0, max * fraction);
    }, point / 100);
    await page.waitForTimeout(5000);
    const target = `${OUT_DIR}/${viewport.name}-scroll-${point}.png`;
    await page.screenshot({ path: target });
    console.log(target);
  }

  await context.close();
}

await browser.close();
