import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Captures the loader teaser at three progress states per viewport.
 *
 * The GLB loads too fast on localhost to see the reveal, so the connection is
 * throttled with CDP and the script samples `aria-valuenow` until it crosses
 * the low / ~50% / ~100% marks. The last shot is the settled Hero, which the
 * loader hands over to.
 *
 * Usage: node scripts/collect-loader-evidence.mjs [baseUrl] [outDir]
 */
const BASE_URL = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT_DIR = process.argv[3] ?? 'docs/evidence/loader-teaser';

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
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 20,
    downloadThroughput: 3 * 1024 * 1024,
    uploadThroughput: 1024 * 1024,
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const bar = page.getByRole('progressbar', {
    name: 'Carregando experiência 3D',
  });
  await bar.waitFor({ state: 'visible', timeout: 90_000 }).catch(() => {});

  const capture = async (state) => {
    const target = `${OUT_DIR}/${viewport.name}-${state}.png`;
    await page.screenshot({ path: target });
    console.log(target);
  };

  await page.waitForTimeout(350);
  await capture('0');

  let mid = false;
  let full = false;
  for (let i = 0; i < 300; i++) {
    const hidden = await bar.isHidden().catch(() => true);
    if (hidden) break;
    const raw = await bar.getAttribute('aria-valuenow').catch(() => null);
    const value = raw === null ? 0 : Number(raw);
    if (!mid && value >= 45 && value <= 55) {
      await capture('50');
      mid = true;
    }
    if (!full && value >= 96) {
      await capture('100');
      full = true;
    }
    await page.waitForTimeout(250);
  }

  await bar.waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await capture('hero');

  await context.close();
}

await browser.close();
