import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;
const OUT = 'docs/evidence/beat-chrome';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/?debug=1`, { waitUntil: 'load' });
const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
await loader.waitFor({ state: 'hidden', timeout: 120_000 });
await page.waitForTimeout(3000);

console.log('--- beat chrome audit (mobile-390) ---');
const stops = [
  ['0 (opening)', 0],
  ['1.3 (hero)', 1.3],
  ['2.5 (chapter1/MUDANÇA)', 2.5],
  ['3.5 (evolution)', 3.5],
  ['5.3 (chapter2/REVELAÇÃO)', 5.3],
  ['6.5 (arsenal)', 6.5],
  ['9.6 (colophon)', 9.6],
];
for (const [label, mult] of stops) {
  await page.evaluate((m) => window.scrollTo(0, window.innerHeight * m), mult);
  await page.waitForTimeout(600);
  const state = await page.evaluate(() => {
    const main = document.querySelector('main');
    return {
      beat: main?.getAttribute('data-beat'),
      accent: main?.style.getPropertyValue('--beat-accent'),
    };
  });
  console.log(`scroll ${label.padEnd(26)} beat=${state.beat}  accent=${state.accent}`);
}
await context.close();

// Chapter card screenshots per viewport
for (const v of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    isMobile: v.isMobile,
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  const bar = p.getByRole('progressbar', { name: 'Carregando experiência 3D' });
  await bar.waitFor({ state: 'hidden', timeout: 120_000 });
  await p.waitForTimeout(3000);

  for (const [name, mult] of [
    ['mudanca', 2.25],
    ['revelacao', 5.05],
  ]) {
    await p.evaluate((m) => window.scrollTo(0, window.innerHeight * m), mult);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/${v.name}-${name}.png` });
    console.log(`${OUT}/${v.name}-${name}.png`);
  }
  await ctx.close();
}
await browser.close();
