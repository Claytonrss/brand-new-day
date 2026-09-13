import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Fallback evidence with WebGL disabled (`getContext('webgl*')` returns null).
 *
 * Usage: node scripts/collect-fallback-evidence.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;
const OUT_DIR = process.argv[3] ?? 'docs/evidence/webgl-fallback';

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
  });
  await context.addInitScript(() => {
    const view = globalThis;
    const original = view.HTMLCanvasElement.prototype.getContext;
    view.HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });

  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: `${OUT_DIR}/${viewport.name}-top.png`,
  });
  console.log(`${OUT_DIR}/${viewport.name}-top.png`);

  await page.evaluate(() => {
    const view = globalThis;
    view.scrollTo(0, view.document.body.scrollHeight);
  });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: `${OUT_DIR}/${viewport.name}-footer.png`,
  });
  console.log(`${OUT_DIR}/${viewport.name}-footer.png`);

  await context.close();
}

await browser.close();
