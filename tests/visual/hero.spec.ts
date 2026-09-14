import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

test.describe('Hero section', () => {
  test('loads hero copy and renders webgl canvas @smoke', async ({ page }, testInfo) => {
    await page.goto('/');

    await waitForScene(page, 0);

    const title = page.locator('h1');
    await expect(title).toContainText('NINGUÉM SABE.');

    await expect(page.getByText('Portfolio Showcase')).toBeVisible();

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    await page.waitForTimeout(3000);

    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-hero.png`,
      fullPage: true,
    });
  });
});
