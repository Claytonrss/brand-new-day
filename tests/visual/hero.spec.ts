import { expect, test } from '@playwright/test';

test.describe('Hero section', () => {
  test('loads hero copy and renders webgl canvas @smoke', async ({ page }, testInfo) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear (GLB asset loading)
    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Check title text
    const title = page.locator('h1');
    await expect(title).toContainText('NINGUÉM SABE.');

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
