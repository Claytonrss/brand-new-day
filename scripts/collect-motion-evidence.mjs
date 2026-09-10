import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Records one scroll-through video per viewport.
 *
 * Parallax, camera behaviour, the web shot and the blink cannot be judged from
 * a still image, so motion evidence is captured as video instead.
 *
 * Usage: node scripts/collect-motion-evidence.mjs [baseUrl]
 */
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT_DIR = 'docs/evidence/wave-g-verification';
const TEMP_DIR = 'test-results/motion-video';

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '430', width: 430, height: 932, isMobile: true },
  { name: '1440', width: 1440, height: 900, isMobile: false },
];

const STEPS = 14;
const STEP_MS = 700;

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(TEMP_DIR, { recursive: true });

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    recordVideo: { dir: TEMP_DIR, size: { width: viewport.width, height: viewport.height } },
  });

  const page = await context.newPage();
  await page.goto(`${BASE_URL}/?debug=1`, { waitUntil: 'load' });

  // wait for the cinematic loader to finish
  await page
    .getByRole('progressbar', { name: 'Carregando experiência 3D' })
    .waitFor({ state: 'hidden', timeout: 90_000 })
    .catch(() => {});

  await page.waitForTimeout(2500);

  for (let step = 0; step <= STEPS; step++) {
    // globalThis instead of window/document: this callback runs in the browser,
    // but eslint analyses the file as Node code (no-undef).
    await page.evaluate((fraction) => {
      const view = globalThis;
      const max = view.document.body.scrollHeight - view.innerHeight;
      view.scrollTo(0, max * fraction);
    }, step / STEPS);
    await page.waitForTimeout(STEP_MS);
  }

  const video = page.video();
  await context.close(); // finalises the recording

  if (video) {
    const source = await video.path();
    const target = join(OUT_DIR, `${viewport.name}-scroll.webm`);
    renameSync(source, target);
    const size = (statSync(target).size / 1024 / 1024).toFixed(2);
    console.log(`${viewport.name}: ${target} (${size} MB)`);
  }
}

await browser.close();

// clear leftover fragments from the recording
for (const file of readdirSync(TEMP_DIR)) {
  rmSync(join(TEMP_DIR, file), { force: true });
}
