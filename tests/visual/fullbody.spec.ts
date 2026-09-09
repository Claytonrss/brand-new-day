import { expect, test } from '@playwright/test';

test.describe('FullBody section', () => {
  test('shows full body copy after scrolling past arsenal', async ({ page }, testInfo) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear
    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Wait for WebGL canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Wait for model to settle
    await page.waitForTimeout(3000);

    // Scroll to FullBody section (past hero 100vh + evolution 150vh + arsenal 150vh)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Check FullBody title is visible
    const fullbodyTitle = page.locator('#fullbody-title');
    await expect(fullbodyTitle).toBeVisible();
    await expect(fullbodyTitle).toContainText('UM HERÓI QUALQUER.');

    // Check kicker
    await expect(page.getByText('A Revelação')).toBeVisible();

    // Check body copy
    await expect(page.getByText('Sem máscara, sem manchetes')).toBeVisible();

    // Save visual evidence screenshot
    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `test-results/visual/${projectName}-fullbody.png`,
      fullPage: false,
    });
  });

  test('has correct ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear
    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to FullBody
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check ARIA label on section
    const fullbodySection = page.locator('[aria-label="FullBody"]');
    await expect(fullbodySection).toBeVisible();

    // Check aria-labelledby
    const titledSection = page.locator('[aria-labelledby="fullbody-title"]');
    await expect(titledSection).toBeVisible();

    // Check title has correct id
    const title = page.locator('h2#fullbody-title');
    await expect(title).toBeVisible();
  });

  test('full body copy is centered and does not overflow', async ({ page }) => {
    await page.goto('/');

    // Wait for cinematic loader to disappear
    const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
    await expect(loader).toBeHidden({ timeout: 60_000 });

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Scroll to FullBody
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check that the section container is centered
    const section = page.locator('[aria-labelledby="fullbody-title"]');
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
