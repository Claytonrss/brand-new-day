import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

/**
 * DOM micro craft — docs/specs/dom-micro-craft.md.
 *
 * §2 BeatStamp: an editorial field log on the left spine that crossfades with
 * `data-beat`. §1 VelocityType: `--type-wght` is published on the root and
 * returns to the poster rest weight. §7 Suit weave present behind the
 * colophon.
 */
test.describe('DOM micro craft', () => {
  test('stamp shows the hero field log and follows the beats @smoke', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    const stamp = page.locator('[data-beat-stamp]');
    await expect(stamp).toBeVisible();
    await expect(stamp).toHaveAttribute('aria-hidden', 'true');
    await expect(stamp).toContainText('04:37');

    // Arsenal (04:52) — 0.72 * scrollHeight = 648vh of 800vh max scroll ≈ 0.81
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.72));
    await page.waitForTimeout(1500);
    await expect(stamp).toContainText('04:52');

    // Colophon (05:00) closes the night
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight));
    await page.waitForTimeout(1500);
    await expect(stamp).toContainText('05:00');
  });

  test('headline weight returns to the poster rest after the scroll settles', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    const headline = page.locator('#hero-title');
    await expect(headline).toBeVisible();

    // A burst of scroll arms the controller; at rest it must publish 700.
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
    await page.waitForTimeout(1600);

    const fontVariation = await headline.evaluate(
      (node) => getComputedStyle(node).fontVariationSettings,
    );
    expect(fontVariation).toContain('700');
  });

  test('suit weave sits behind the colophon content', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight));
    await page.waitForTimeout(1500);

    const weave = page.locator('.suit-weave').last();
    await expect(weave).toBeAttached();
    const opacity = await weave.evaluate((node) => Number(getComputedStyle(node).opacity));
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThanOrEqual(0.06);
  });
});
