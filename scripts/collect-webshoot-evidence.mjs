import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Web-shoot discovery evidence: the pulse hint on entering Beat 3 and the
 * strand right after a click.
 *
 * Usage: node scripts/collect-webshoot-evidence.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT_DIR = process.argv[3] ?? 'docs/evidence/web-shoot-discovery';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900, isMobile: false },
  { name: '390', width: 390, height: 844, isMobile: true },
];

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
  await page.waitForTimeout(3500);

  // Enter Beat 3 and catch the hint while it plays.
  await page.evaluate(() => {
    const view = globalThis;
    const max = view.document.body.scrollHeight - view.innerHeight;
    view.scrollTo(0, max * 0.72);
  });
  await page.waitForTimeout(380);
  await page.screenshot({ path: `${OUT_DIR}/${viewport.name}-hint.png` });
  console.log(`${OUT_DIR}/${viewport.name}-hint.png`);

  // Fire and catch the strand.
  await page.mouse.click(viewport.width * 0.5, viewport.height * 0.5);
  await page.waitForTimeout(180);
  await page.screenshot({ path: `${OUT_DIR}/${viewport.name}-shot.png` });
  console.log(`${OUT_DIR}/${viewport.name}-shot.png`);

  await context.close();
}

await browser.close();
