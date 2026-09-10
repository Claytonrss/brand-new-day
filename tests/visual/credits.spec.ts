import { expect, test } from '@playwright/test';

/**
 * CC-BY 4.0 attribution — required to be visible without hover, in every
 * section that shows the model, with a reachable link to the author.
 *
 * @see docs/specs/wave-g-verification.md
 */
const ATTRIBUTION = /CC-BY 4\.0/i;
const AUTHOR = 'Eskze';

async function waitForScene(page: import('@playwright/test').Page) {
  const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
  await expect(loader).toBeHidden({ timeout: 60_000 });
  await page.waitForTimeout(3000);
}

test.describe('CC-BY Attribution', () => {
  test('is visible in the Hero without hovering', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    const author = page.getByRole('link', { name: AUTHOR }).first();
    await expect(author).toBeVisible();

    // visible means rendered with a readable opacity, not just present
    const opacity = await author.evaluate((node) => Number(getComputedStyle(node).opacity));
    expect(opacity).toBeGreaterThan(0.3);

    await expect(page.getByText(ATTRIBUTION).first()).toBeVisible();
  });

  test('is visible in the FullBody section', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    await page.evaluate(() =>
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.95),
    );
    await page.waitForTimeout(2500);

    const author = page.getByRole('link', { name: AUTHOR }).last();
    await expect(author).toBeVisible();
  });

  test('links to the author with safe rel attributes', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    const author = page.getByRole('link', { name: AUTHOR }).first();

    await expect(author).toHaveAttribute('href', /sketchfab\.com/);
    await expect(author).toHaveAttribute('target', '_blank');
    await expect(author).toHaveAttribute('rel', /noopener/);
    await expect(author).toHaveAttribute('rel', /noreferrer/);
  });
});
