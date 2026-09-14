import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

test.describe('Evolution section', () => {
  test('shows evolution copy after scrolling past hero', async ({ page }, testInfo) => {
    await page.goto('/');

    await waitForScene(page, 0);

    // Wait for WebGL canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Wait for model to settle
    await page.waitForTimeout(3000);

    // Scroll to evolution (hero 140vh + chapter1 70vh → section starts at
    // 310vh; 3.5 viewports lands just inside it)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3.5));
    await page.waitForTimeout(2000);

    // Check evolution title is visible
    const evolutionTitle = page.locator('#evolution-title');
    await expect(evolutionTitle).toBeVisible();
    await expect(evolutionTitle).toContainText('ALGO NELE');

    // Check kicker
    await expect(page.getByText('A mudança')).toBeVisible();

    // Save visual evidence screenshot
    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-evolution.png`,
      fullPage: false,
    });
  });

  test('evolution section has correct ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    await waitForScene(page, 0);

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to evolution (hero 140vh + chapter1 70vh → section starts at 310vh)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3.5));
    await page.waitForTimeout(1000);

    // Check ARIA
    const evolutionSection = page.locator('[aria-label="Evolution"]');
    await expect(evolutionSection).toBeVisible();

    const titledSection = page.locator('[aria-labelledby="evolution-title"]');
    await expect(titledSection).toBeVisible();
  });
});
