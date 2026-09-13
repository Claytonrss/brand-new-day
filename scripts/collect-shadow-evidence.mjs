import { chromium } from '@playwright/test';

/**
 * Shadow-throttle evidence (FALHA-04): samples `window.__perf.calls` on the
 * medium tier (mobile viewport → `detectInitialTier`) while the page rests.
 *
 * With the throttle active, `QualityAdapter` turns `shadowMap.autoUpdate`
 * off and refreshes on demand (10 Hz heartbeat), so draw calls must
 * alternate between a base level and base + shadow pass. A single flat call
 * level means the throttle is not observable.
 *
 * Usage: node scripts/collect-shadow-evidence.mjs [baseUrl]
 */
const BASE_URL = process.argv[2] ?? `http://127.0.0.1:${process.env.PORT ?? 5173}`;
const FRAMES = 90;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const page = await context.newPage();

await page.goto(`${BASE_URL}/?debug=1`, { waitUntil: 'load' });
const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
await loader.waitFor({ state: 'hidden', timeout: 120_000 });
await page.waitForTimeout(4000);

// One reading per RENDERED frame (rAF inside the page), so the valley shows
// regardless of how slow SwiftShader is: a wall-clock sample can miss the
// shadow-off frames entirely when fps ≈ the 10 Hz heartbeat.
const readings = await page.evaluate(
  (frameCount) =>
    new Promise((resolve) => {
      const frames = [];
      const tick = () => {
        const snapshot = window.__perf;
        if (snapshot)
          frames.push({ calls: snapshot.calls, tier: snapshot.tier, fps: snapshot.fps });
        if (frames.length >= frameCount) resolve(frames);
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }),
  FRAMES,
);

await browser.close();

const tiers = [...new Set(readings.map((r) => r.tier))];
console.log(`tier: ${tiers.join(', ')}`);
console.log(`rendered frames: ${readings.length}`);

// Per-tier call levels — degradation to `low` (shadows off) is expected on
// SwiftShader; the throttle evidence is the medium-tier valley.
let observable = false;
for (const tier of tiers) {
  const rows = readings.filter((r) => r.tier === tier);
  const levels = [...new Set(rows.map((r) => r.calls))].sort((a, b) => a - b);
  const fps = rows.reduce((sum, r) => sum + r.fps, 0) / rows.length;
  const valley = levels[levels.length - 1] - levels[0];
  console.log(
    `calls [${tier}]: fps ~${fps.toFixed(1)} · min ${levels[0]} · max ${levels[levels.length - 1]} · levels [${levels.join(', ')}]`,
  );
  if (tier !== 'low' && levels.length >= 2) {
    console.log(
      `shadow-pass valley on ${tier}: ${valley} calls between refreshes — throttle observable`,
    );
    observable = true;
  }
}
if (!observable) {
  console.log(
    'NOTE: no valley — with fps at or below the 10 Hz heartbeat every frame refreshes (graceful degradation, no staleness); re-run on a less loaded machine for fps > 10.',
  );
}
