import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * iOS gyro-permission chip evidence.
 *
 * Headless Chromium has no `DeviceOrientationEvent`, so an iOS-like
 * `requestPermission` is injected before the app boots. Then the first gesture
 * reveals the chip.
 *
 * Usage: node scripts/collect-gyro-evidence.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? `http://127.0.0.1:${process.env.PORT ?? 5173}`;
const OUT_DIR = process.argv[3] ?? 'docs/evidence/mobile-gyro-permission';

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await context.addInitScript(() => {
  const view = globalThis;
  function FakeDeviceOrientationEvent() {}
  FakeDeviceOrientationEvent.requestPermission = () => Promise.resolve('granted');

  view.DeviceOrientationEvent = FakeDeviceOrientationEvent;
});

const page = await context.newPage();
await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
await page
  .getByRole('progressbar', { name: 'Carregando experiência 3D' })
  .waitFor({ state: 'hidden', timeout: 90_000 })
  .catch(() => {});
await page.waitForTimeout(3500);

// First gesture reveals the chip.
await page.mouse.click(200, 500);
await page.getByText('Esta cena reage ao movimento.').waitFor({ state: 'visible', timeout: 5000 });
const target = `${OUT_DIR}/390-gyro-prompt.png`;
await page.screenshot({ path: target });
console.log(target);

await browser.close();
