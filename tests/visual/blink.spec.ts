import { expect, test } from '@playwright/test';

/**
 * Stylised blink on the mask lenses (Wave D+).
 *
 * The asset has no eyelids, so the lenses close to a slit. The schedule is
 * verified here; the closure curve is covered by unit tests
 * (`tests/unit/blink.test.ts`).
 *
 * This headless renderer runs at a few FPS, so a 180ms blink can land entirely
 * between two frames — the assertion therefore polls the scheduler state, which
 * stays observable for one frame per blink.
 */
test.describe('Mask blink', () => {
  test('blinks within a reasonable window', async ({ page }) => {
    test.slow();
    await page.goto('/?debug=1&blink=full');

    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(4000);

    let sawBlink = false;
    let peak = 0;

    for (let i = 0; i < 80 && !sawBlink; i++) {
      const state = await page.evaluate(() => {
        const fx = window.__fx;
        return fx ? { blink: fx.blink, start: fx.blinkState.start } : null;
      });

      if (state) {
        peak = Math.max(peak, state.blink);
        if (state.start >= 0 || state.blink > 0) sawBlink = true;
      }

      await page.waitForTimeout(400);
    }

    expect(sawBlink).toBe(true);
    expect(peak).toBeGreaterThan(0);
  });

  test('stays open with prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?debug=1&blink=full');

    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(4000);

    for (let i = 0; i < 10; i++) {
      const blink = await page.evaluate(() => window.__fx?.blink ?? 0);
      expect(blink).toBe(0);
      await page.waitForTimeout(400);
    }
  });
});
