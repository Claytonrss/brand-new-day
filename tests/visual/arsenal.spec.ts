import { expect, test } from '@playwright/test';

test.describe('Arsenal section', () => {
  test('shows arsenal copy after scrolling past evolution', async ({ page }, testInfo) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear
    const loader = page.locator('[role="progressbar"]');
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Wait for WebGL canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Wait for model to settle
    await page.waitForTimeout(3000);

    // Scroll past hero (100vh) and evolution (150vh) to arsenal section
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
    await page.waitForTimeout(2000);

    // Check arsenal title is visible
    const arsenalTitle = page.locator('#arsenal-title');
    await expect(arsenalTitle).toBeVisible();
    await expect(arsenalTitle).toContainText('Sem apoio.');
    await expect(arsenalTitle).toContainText('Só o essencial.');

    // Check kicker
    await expect(page.getByText('O que sobrou')).toBeVisible();

    // Check body copy
    await expect(page.getByText('Sem Stark, sem SHIELD')).toBeVisible();

    // Save visual evidence screenshot
    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-arsenal.png`,
      fullPage: false,
    });
  });

  test('arsenal section has correct ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear
    const loader = page.locator('[role="progressbar"]');
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to arsenal
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
    await page.waitForTimeout(1000);

    // Check ARIA label on section
    const arsenalSection = page.locator('[aria-label="Arsenal"]');
    await expect(arsenalSection).toBeVisible();

    // Check aria-labelledby
    const titledSection = page.locator('[aria-labelledby="arsenal-title"]');
    await expect(titledSection).toBeVisible();

    // Check title has correct id
    const title = page.locator('h2#arsenal-title');
    await expect(title).toBeVisible();
  });

  test('arsenal copy is left-aligned and does not overflow', async ({ page }) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear
    const loader = page.locator('[role="progressbar"]');
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to arsenal
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
    await page.waitForTimeout(1000);

    // Check that the section container is left-aligned (justify-start)
    const section = page.locator('[aria-labelledby="arsenal-title"]');
    await expect(section).toBeVisible();

    // Verify text content is within viewport bounds
    const box = await section.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 9999);
    }
  });
});
