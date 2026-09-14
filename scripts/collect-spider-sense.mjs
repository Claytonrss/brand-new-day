import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;
const OUT = 'docs/evidence/spider-sense';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

const browser = await chromium.launch();

// --- Trigger discipline probe (desktop): latch + envelope ------------------
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/?debug=1`, { waitUntil: 'load' });
const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
await loader.waitFor({ state: 'hidden', timeout: 120_000 });
await page.waitForTimeout(3000);

const read = () =>
  page.evaluate(() => ({
    sense: +(window.__rig?.sense ?? -1).toFixed(3),
    count: window.__rig?.senseCount ?? -1,
    breath: +(window.__rig?.breath ?? 0).toFixed(3),
    beat: document.querySelector('main')?.getAttribute('data-beat'),
  }));

console.log('--- spider-sense trigger discipline (desktop, ?debug=1) ---');
// [label, scroll progress, fires?, halo shot name during the ring (or null)]
const stops = [
  ['hero rest (must NOT fire)', 0.1, false, null],
  ['→ chapter1 card (must NOT fire)', 0.3, false, null],
  ['→ evolution entry (FIRES; head off-frame → edge poke)', 0.45, true, 'sense-halo.png'],
  ['→ arsenal entry (FIRES)', 0.75, true, null],
  ['→ fullBody entry (FIRES; head in frame)', 0.9, true, 'sense-halo-fullbody.png'],
  ['→ back to chapter1 (no re-fire)', 0.3, false, null],
];
let previousCount = 0;
for (const [label, progress, fires, haloShot] of stops) {
  await page.evaluate(
    (p) => window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * p),
    progress,
  );
  let after = await read();
  if (fires) {
    // the beat commit reaches the rig a frame late — poll for the latch
    for (let i = 0; i < 12 && after.count <= previousCount; i++) {
      await page.waitForTimeout(150);
      after = await read();
    }
  } else {
    await page.waitForTimeout(1200); // let any (wrong) fire happen
    after = await read();
  }
  const verdict = fires ? after.count > previousCount : after.count === previousCount;
  console.log(
    `${label.padEnd(52)} beat=${String(after.beat).padEnd(9)} sense=${after.sense} count=${after.count} breath=${after.breath} → ${verdict ? 'OK' : 'UNEXPECTED'}`,
  );
  previousCount = after.count;
  // capture the halo while it rings, if asked for this stop
  if (fires && haloShot) {
    const anchored = await page.evaluate(
      () => document.documentElement.style.getPropertyValue('--sense-x') !== '',
    );
    if (anchored) {
      await page.screenshot({ path: `${OUT}/${haloShot}`, timeout: 60_000 });
      console.log(`  halo captured → ${OUT}/${haloShot}`);
    }
  }
  await page.waitForTimeout(1500);
}
await context.close();

// --- Screenshots per viewport (danger beats) -------------------------------
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

  await p.evaluate(() =>
    window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.72),
  );
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${v.name}-arsenal.png`, timeout: 60_000 });

  await p.evaluate(() =>
    window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.9),
  );
  await p.waitForTimeout(2500);
  await p.screenshot({
    path: `${OUT}/${v.name}-fullbody-breath.png`,
    timeout: 60_000,
  });
  console.log(`${OUT}/${v.name}-arsenal.png + ${v.name}-fullbody-breath.png`);
  await ctx.close();
}

await browser.close();
