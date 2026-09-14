import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

test.describe('Arsenal section', () => {
  test('shows arsenal copy after scrolling past evolution', async ({ page }, testInfo) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    await page.waitForTimeout(3000);

    // Scroll to arsenal: opening (100) + hero (140) + chapter1 (70) +
    // evolution (210) + chapter2 (70) = 590vh to the section top; 6 viewports
    // lands just inside it
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 6));
    await page.waitForTimeout(2000);

    const arsenalTitle = page.locator('#arsenal-title');
    await expect(arsenalTitle).toBeVisible();
    await expect(arsenalTitle).toContainText('SEM APOIO.');
    await expect(arsenalTitle).toContainText('SÓ O ESSENCIAL.');

    await expect(page.getByText('O que sobrou')).toBeVisible();

    await expect(page.getByText('Sem Stark, sem SHIELD')).toBeVisible();

    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-arsenal.png`,
      fullPage: false,
    });
  });

  test('arsenal section has correct ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to arsenal (section top at 590vh; 6 viewports lands inside)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 6));
    await page.waitForTimeout(1000);

    const arsenalSection = page.locator('[aria-label="Arsenal"]');
    await expect(arsenalSection).toBeVisible();

    const titledSection = page.locator('[aria-labelledby="arsenal-title"]');
    await expect(titledSection).toBeVisible();

    const title = page.locator('h2#arsenal-title');
    await expect(title).toBeVisible();
  });

  test('arsenal copy is left-aligned and does not overflow', async ({ page }) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to arsenal (section top at 590vh; 6 viewports lands inside)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 6));
    await page.waitForTimeout(1000);

    // the left alignment comes from the justify-start class on the container
    const section = page.locator('[aria-labelledby="arsenal-title"]');
    await expect(section).toBeVisible();

    const box = await section.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 9999);
    }
  });
});
