import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

test.describe('FullBody section', () => {
  test('shows full body copy after scrolling past arsenal', async ({ page }, testInfo) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    await page.waitForTimeout(3000);

    // 94% of the scrollable range lands inside FullBody, short of the colophon
    await page.evaluate(() =>
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.94),
    );
    await page.waitForTimeout(2000);

    const fullbodyTitle = page.locator('#fullbody-title');
    await expect(fullbodyTitle).toBeVisible();
    await expect(fullbodyTitle).toContainText('UM HOMEM');
    await expect(fullbodyTitle).toContainText('SEM ESCOLHA.');

    await expect(page.getByText('31 de julho', { exact: true })).toBeVisible();

    await expect(page.getByText('BRAND NEW DAY chega aos cinemas')).toBeVisible();

    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-fullbody.png`,
      fullPage: false,
    });
  });

  test('has correct ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() =>
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.94),
    );
    await page.waitForTimeout(1000);

    const fullbodySection = page.locator('[aria-label="FullBody"]');
    await expect(fullbodySection).toBeVisible();

    const titledSection = page.locator('[aria-labelledby="fullbody-title"]');
    await expect(titledSection).toBeVisible();

    const title = page.locator('h2#fullbody-title');
    await expect(title).toBeVisible();
  });

  test('full body copy is centered and does not overflow', async ({ page }) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() =>
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.94),
    );
    await page.waitForTimeout(1000);

    const section = page.locator('[aria-labelledby="fullbody-title"]');
    await expect(section).toBeVisible();

    const box = await section.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 9999);
    }
  });
});
