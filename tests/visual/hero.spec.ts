import { expect, test } from '@playwright/test';

test.describe('Hero section', () => {
  test('loads and shows hero copy', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('NINGUÊM SABE.');
  });
});
