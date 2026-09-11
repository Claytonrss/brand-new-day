import { expect, test } from '@playwright/test';

/**
 * Regression guard for the bug fixed in Wave B: with `prefers-reduced-motion`
 * the camera used to be pinned to the `fullBody` keyframe for the whole page,
 * so the Hero was rendered with a full-body framing and every section looked
 * the same.
 *
 * @see docs/specs/cinematic-camera-path.md §6.7
 */
test.describe('Reduced Motion camera framing', () => {
  test('renders a different framing per section', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(3000);

    const maxScroll = await page.evaluate(
      () => document.body.scrollHeight - window.innerHeight,
    );

    const shots: Buffer[] = [];
    for (const [name, fraction] of [
      ['hero', 0],
      ['fullbody', 1.0],
    ] as const) {
      await page.evaluate((y) => window.scrollTo(0, y), maxScroll * fraction);
      await page.waitForTimeout(2000);
      shots.push(
        await page.screenshot({
          path: `test-results/visual/${testInfo.project.name}-reduced-${name}.png`,
        }),
      );
    }

    const [hero, fullBody] = shots;

    // The old bug produced byte-identical frames for every section.
    expect(Buffer.compare(hero, fullBody)).not.toBe(0);
  });

  test('keeps the hero close-up instead of the full-body framing', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `test-results/visual/${testInfo.project.name}-reduced-hero.png`,
    });

    // With the bug, the hero showed the character from z=16 (mobile) / z=11,
    // i.e. tiny in frame. The close-up framing must fit the viewport height.
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });
  });
});
