import { expect, test } from '@playwright/test';

test.describe('Evolution section', () => {
  test('shows evolution copy after scrolling past hero', async ({ page }, testInfo) => {
    await page.goto('/');

    // Wait for WebGL canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Wait for model to settle
    await page.waitForTimeout(3000);

    // Scroll to evolution section (past the 100vh hero)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
    await page.waitForTimeout(2000);

    // Check evolution title is visible
    const evolutionTitle = page.locator('#evolution-title');
    await expect(evolutionTitle).toBeVisible();
    await expect(evolutionTitle).toContainText('Algo nele');

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

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to evolution
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
    await page.waitForTimeout(1000);

    // Check ARIA
    const evolutionSection = page.locator('[aria-label="Evolution"]');
    await expect(evolutionSection).toBeVisible();

    const titledSection = page.locator('[aria-labelledby="evolution-title"]');
    await expect(titledSection).toBeVisible();
  });
});
