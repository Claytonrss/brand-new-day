import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = 'http://127.0.0.1:5173';
const OUT = 'docs/evidence/spider-sense';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

const browser = await chromium.launch();

// --- Debug probe: envelope spike + breath rate across beats ----------------
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/?debug=1`, { waitUntil: 'load' });
const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
await loader.waitFor({ state: 'hidden', timeout: 120_000 });
await page.waitForTimeout(3000);

console.log('--- spider-sense + breath probe (desktop, ?debug=1) ---');
const stops = [
  ['hero (rest)', 0.5],
  ['→ chapter1 (boundary!)', 2.2],
  ['→ evolution (boundary!)', 3.2],
  ['→ arsenal (boundary!)', 5.8],
  ['→ fullBody (boundary!)', 6.9],
];
let previousBreath = null;
for (const [label, mult] of stops) {
  await page.evaluate((m) => window.scrollTo(0, window.innerHeight * m), mult);
  // sample immediately — the envelope spikes on the beat change
  const probe = await page.evaluate(() => ({
    sense: window.__rig?.sense,
    breath: window.__rig?.breath,
    beat: document.querySelector('main')?.getAttribute('data-beat'),
  }));
  const breathDir =
    previousBreath === null ? '' : probe.breath >= previousBreath ? 'rising' : 'falling';
  previousBreath = probe.breath;
  console.log(
    `scroll ${label.padEnd(24)} beat=${String(probe.beat).padEnd(9)} sense=${probe.sense?.toFixed(3)}  breath=${probe.breath?.toFixed(3)} ${breathDir}`,
  );
  // the envelope decays in ~200ms; a later read should be far below the spike
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__rig?.sense);
  console.log(`  300ms later: sense=${after?.toFixed(3)}`);
  await page.waitForTimeout(400);
}

await context.close();

// --- Screenshots per viewport (arsenal boundary + fullBody deep breath) ----
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

  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 5.8));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${v.name}-arsenal.png`, timeout: 60_000 });

  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 6.9));
  await p.waitForTimeout(2500);
  await p.screenshot({
    path: `${OUT}/${v.name}-fullbody-breath.png`,
    timeout: 60_000,
  });
  console.log(`${OUT}/${v.name}-arsenal.png + ${v.name}-fullbody-breath.png`);
  await ctx.close();
}

await browser.close();
