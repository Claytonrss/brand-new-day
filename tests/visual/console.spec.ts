import { expect, test } from '@playwright/test';

/**
 * Console hygiene — the project must never log an error or throw an uncaught
 * exception, on load or during the full scroll.
 *
 * Known-benign noise (three.js deprecations and headless GPU driver messages)
 * is filtered explicitly; anything else fails the gate.
 *
 * @see docs/specs/wave-g-verification.md
 */
const IGNORED = [
  /THREE\.Clock: This module has been deprecated/,
  /PCFSoftShadowMap has been deprecated/,
  /GPU stall due to ReadPixels/,
  /Download the React DevTools/,
  /WebGL context lost/,
];

function isNoise(message: string) {
  return IGNORED.some((pattern) => pattern.test(message));
}

test.describe('Console errors', () => {
  test('no critical console errors on load @smoke', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error' && !isNoise(message.text())) {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      if (!isNoise(String(error))) errors.push(String(error));
    });

    await page.goto('/');
    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(4000);

    expect(errors).toEqual([]);
  });

  test('no console errors during a full scroll', async ({ page }) => {
    test.slow();
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error' && !isNoise(message.text())) {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      if (!isNoise(String(error))) errors.push(String(error));
    });

    await page.goto('/');
    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(3000);

    for (let step = 0; step <= 10; step++) {
      await page.evaluate((fraction) => {
        const max = document.body.scrollHeight - window.innerHeight;
        window.scrollTo(0, max * fraction);
      }, step / 10);
      await page.waitForTimeout(1200);
    }

    expect(errors).toEqual([]);
  });
});
