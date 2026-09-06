import { expect, test } from '@playwright/test';

test.describe('Hero section', () => {
  test('loads hero copy and renders webgl canvas', async ({ page }, testInfo) => {
    await page.goto('/');

    // Check title text
    const title = page.locator('h1');
    await expect(title).toContainText('NINGUÊM SABE.');

    // Check header metadata
    await expect(page.getByText('Portfolio Showcase')).toBeVisible();

    // Check webgl canvas element exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Wait for WebGL 3D model to settle
    await page.waitForTimeout(3000);

    // Save visual evidence screenshot
    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-hero.png`,
      fullPage: true,
    });
  });
});
