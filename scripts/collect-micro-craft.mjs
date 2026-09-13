import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.argv[2] ?? `http://127.0.0.1:${process.env.PORT ?? 5173}`;
const OUT = 'docs/evidence/dom-micro-craft';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

const browser = await chromium.launch();

// --- Beat stamp audit (mobile-390): one rainy night, 04:37 → 05:00 --------
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
await loader.waitFor({ state: 'hidden', timeout: 120_000 });
await page.waitForTimeout(3000);

console.log('--- beat stamp audit (mobile-390) ---');
const stops = [
  ['0 (hero)', 0],
  ['2.05 (chapter1)', 2.05],
  ['3.0 (evolution)', 3.0],
  ['5.0 (chapter2)', 5.0],
  ['5.8 (arsenal)', 5.8],
  ['6.9 (fullBody)', 6.9],
  ['7.9 (colophon)', 7.9],
];
for (const [label, mult] of stops) {
  await page.evaluate((m) => window.scrollTo(0, window.innerHeight * m), mult);
  await page.waitForTimeout(900);
  const stamp = await page.evaluate(() => document.querySelector('[data-beat-stamp]')?.textContent);
  console.log(`scroll ${label.padEnd(18)} stamp="${stamp}"`);
}

// Velocity weight under a scroll burst, then settled
console.log('--- velocity type (mobile-390) ---');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
const settleProbe = await page.evaluate(async () => {
  const read = () => getComputedStyle(document.querySelector('#hero-title')).fontVariationSettings;
  const atRest = read();
  for (let i = 0; i < 12; i++) {
    window.scrollBy(0, window.innerHeight / 3);
    await new Promise((r) => setTimeout(r, 40));
  }
  const during = read();
  const varDuring = document.documentElement.style.getPropertyValue('--type-wght');
  await new Promise((r) => setTimeout(r, 1600));
  return { atRest, during, varDuring, settled: read() };
});
console.log(
  `rest=${settleProbe.atRest}  during-burst=${settleProbe.during} (--type-wght=${settleProbe.varDuring})  settled=${settleProbe.settled}`,
);
await context.close();

// --- Desktop: magnetic CTA pull --------------------------------------------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  const bar = p.getByRole('progressbar', { name: 'Carregando experiência 3D' });
  await bar.waitFor({ state: 'hidden', timeout: 120_000 });
  await p.waitForTimeout(3000);

  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight));
  await p.waitForTimeout(2000);

  const cta = p.getByRole('link', { name: /ver o código/i });
  const box = await cta.boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await p.mouse.move(cx, cy, { steps: 8 });
    await p.mouse.move(cx + 48, cy + 24, { steps: 8 });
    await p.waitForTimeout(300);
    const pulled = await cta.evaluate((node) => node.style.transform);
    console.log(`--- magnetic CTA (desktop-1440) ---`);
    console.log(`transform with cursor 48,24px away: "${pulled}"`);
    await p.mouse.move(cx - 400, cy - 300, { steps: 8 });
    await p.waitForTimeout(300);
    const rested = await cta.evaluate((node) => node.style.transform);
    console.log(`transform far away: "${rested}"`);
    await p.screenshot({ path: `${OUT}/1440-colophon-magnet.png` });
    console.log(`${OUT}/1440-colophon-magnet.png`);
  }
  await ctx.close();
}

// --- Screenshots per viewport ----------------------------------------------
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

  await p.screenshot({ path: `${OUT}/${v.name}-opening-weave.png` });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${OUT}/${v.name}-colophon.png` });
  console.log(`${OUT}/${v.name}-opening-weave.png + ${v.name}-colophon.png`);
  await ctx.close();
}

await browser.close();
