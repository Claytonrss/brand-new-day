import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

/**
 * Interaction tests (Wave D) — drag orbit, rim reaction and the web shot.
 *
 * These are the first assertions that exercise real input; without them the
 * interaction layer would ship unverified.
 *
 * @see docs/specs/model-interaction.md
 */
function readInteraction(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.__interaction ?? null);
}

test.describe('Model interaction', () => {
  test('drag orbits the model and springs back on release', async ({ page }) => {
    test.slow();
    await page.goto('/?debug=1');
    await waitForScene(page);

    const size = page.viewportSize() ?? { width: 1440, height: 900 };
    const cx = size.width * 0.5;
    const cy = size.height * 0.6;

    const rest = await readInteraction(page);
    expect(rest).not.toBeNull();

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + size.width * 0.25, cy, { steps: 8 });
    await page.waitForTimeout(600);

    const dragged = await readInteraction(page);
    expect(dragged?.dragging).toBe(true);
    expect(Math.abs(dragged?.yaw ?? 0)).toBeGreaterThan(0.02);

    await page.mouse.up();
    await page.waitForTimeout(4000);

    const settled = await readInteraction(page);
    expect(Math.abs(settled?.yaw ?? 0)).toBeLessThan(Math.abs(dragged?.yaw ?? 0));
  });

  test('the rim light follows the cursor @smoke', async ({ page }) => {
    await page.goto('/?debug=1');
    await waitForScene(page);

    const size = page.viewportSize() ?? { width: 1440, height: 900 };

    await page.mouse.move(size.width * 0.15, size.height * 0.4);
    await page.waitForTimeout(600);
    const left = await readInteraction(page);

    await page.mouse.move(size.width * 0.85, size.height * 0.4);
    await page.waitForTimeout(600);
    const right = await readInteraction(page);

    expect(left?.rimX ?? 0).toBeLessThan(0);
    expect(right?.rimX ?? 0).toBeGreaterThan(0);
  });

  test('clicking during the Arsenal beat fires a web strand', async ({ page }) => {
    test.slow();
    await page.goto('/?debug=1');
    await waitForScene(page);

    await page.evaluate(() =>
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.75),
    );
    await page.waitForTimeout(3000);

    const before = await readInteraction(page);
    const size = page.viewportSize() ?? { width: 1440, height: 900 };
    await page.mouse.click(size.width * 0.5, size.height * 0.5);
    await page.waitForTimeout(800);
    const after = await readInteraction(page);

    expect(after?.shotId ?? 0).toBeGreaterThan(before?.shotId ?? 0);
  });
});

test.describe('Model interaction — touch input class', () => {
  // A real phone matches `(hover: none)` / `(pointer: coarse)`. In Playwright
  // that media flip only happens when the context itself is mobile + touch
  // (emulateMedia cannot express hover/pointer features).
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('touch devices (hover: none) never enter drag orbit', async ({ page }) => {
    await page.goto('/?debug=1');
    await waitForScene(page);

    const size = page.viewportSize() ?? { width: 390, height: 844 };
    const cx = size.width * 0.5;
    const cy = size.height * 0.6;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + size.width * 0.25, cy, { steps: 8 });
    await page.waitForTimeout(600);

    const state = await readInteraction(page);
    expect(state?.dragging).toBe(false);
    expect(state?.yaw ?? 0).toBe(0);

    await page.mouse.up();
  });
});

test.describe('Reduced motion', () => {
  test('disables drag orbit entirely', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?debug=1');
    await waitForScene(page);

    const size = page.viewportSize() ?? { width: 1440, height: 900 };
    await page.mouse.move(size.width * 0.5, size.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(size.width * 0.8, size.height * 0.6, { steps: 6 });
    await page.waitForTimeout(600);

    const state = await readInteraction(page);
    expect(state?.yaw ?? 0).toBe(0);
    expect(state?.dragging).toBe(false);

    await page.mouse.up();
  });
});
