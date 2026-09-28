import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Gyro permission chip evidence (mobile-gyro-sensor-polish §7.6).
 *
 * Headless Chromium has no motion sensor, so an iOS-like `requestPermission`
 * is injected before the app boots. Since ADR-031 the chip appears by itself
 * in the hero beat — no priming gesture — so the capture is a plain load.
 *
 * Usage: node scripts/collect-gyro-evidence.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;
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

// The chip announces itself in the hero (ADR-031) — no gesture needed.
await page.getByText('Esta cena reage ao movimento.').waitFor({ state: 'visible', timeout: 5000 });
const target = `${OUT_DIR}/390-gyro-prompt.png`;
await page.screenshot({ path: target });
console.log(target);

await browser.close();
