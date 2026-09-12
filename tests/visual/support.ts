import { expect, type Page } from '@playwright/test';

/**
 * Time the cinematic loader may take to finish.
 *
 * 60s proved too tight on CI: two Chromium/SwiftShader workers sharing the
 * runner's CPUs can push the 50MB GLB parse + first shader compiles past a
 * minute, failing the gate on load flakiness rather than on any assertion.
 */
const LOADER_TIMEOUT_MS = 120_000;

/**
 * Waits for the cinematic loader to finish (and optionally the scene to
 * settle). Every spec funnels through this so loader-side waits stay in one
 * place. Pass `settleMs: 0` when the spec does its own settling.
 */
export async function waitForScene(page: Page, settleMs = 4000): Promise<void> {
  const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
  await expect(loader).toBeHidden({ timeout: LOADER_TIMEOUT_MS });
  if (settleMs > 0) {
    await page.waitForTimeout(settleMs);
  }
}
