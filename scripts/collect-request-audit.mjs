import { DEFAULT_BASE_URL } from './lib/env.mjs';

import { chromium } from '@playwright/test';

/**
 * Loader determinism evidence (FALHA-08): loads the page and audits every
 * network request. After self-hosting the environment HDR, every request
 * must target the app origin — zero external hosts, so a fresh load works
 * offline (airplane mode) as long as the origin is reachable.
 *
 * Usage: node scripts/collect-request-audit.mjs [baseUrl]
 */
const BASE_URL = process.argv[2] ?? DEFAULT_BASE_URL;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const page = await context.newPage();

const external = [];
const local = [];
page.on('request', (request) => {
  const url = request.url();
  // blob:/data: are generated in-page (workers, transcoder) — no network.
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    local.push(url.slice(0, url.indexOf(':') + 1));
  } else if (url.startsWith(BASE_URL)) {
    local.push(url.slice(BASE_URL.length) || '/');
  } else {
    external.push(url);
  }
});

await page.goto(`${BASE_URL}/?debug=1`, { waitUntil: 'load' });
const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
await loader.waitFor({ state: 'hidden', timeout: 120_000 });
await page.waitForTimeout(4000);

await browser.close();

console.log(`local requests: ${local.length}`);
for (const path of [...new Set(local)].sort()) console.log(`  ${path}`);
console.log(`external requests: ${external.length}`);
for (const url of [...new Set(external)].sort()) console.log(`  ${url}`);
console.log(
  external.length === 0
    ? 'AIRPLANE MODE SAFE: every asset is same-origin (loader deterministic)'
    : 'FAIL: external dependencies remain — loader is not deterministic',
);
