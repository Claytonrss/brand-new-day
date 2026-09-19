import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

/**
 * CC-BY 4.0 attribution — required to be visible without hover, in every
 * section that shows the model, with a reachable link to the author.
 *
 * Channel split (first-frame-legibility wave): during the live scene the
 * attribution is fixed chrome (`AttributionBadge`, always on screen); on the
 * Colophon beat the badge yields to the permanent legal footer in
 * `ColophonSection` (ADR-019) — never both at once.
 */
const ATTRIBUTION = /CC BY 4\.0/i;
const AUTHOR = 'Eskze';
const LICENSE = 'CC BY 4.0';
const BADGE = 'attribution-badge';

test.describe('CC-BY Attribution', () => {
  test('is visible in the Hero without hovering @smoke', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    const author = page.getByRole('link', { name: AUTHOR }).first();
    await expect(author).toBeVisible();

    // visible means rendered with a readable opacity, not just present
    const opacity = await author.evaluate((node) => Number(getComputedStyle(node).opacity));
    expect(opacity).toBeGreaterThan(0.3);

    await expect(page.getByText(ATTRIBUTION).first()).toBeVisible();
  });

  test('fixed badge carries the attribution through the Arsenal beat @smoke', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    // Deep into the Arsenal beat — where the old per-section line used to
    // cross the web-shooter close-up and collide with the section copy.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.72));
    await page.waitForTimeout(1500);

    const badge = page.getByTestId(BADGE);
    await expect(badge).toBeVisible();
    await expect(badge.getByText(ATTRIBUTION)).toBeVisible();

    // The per-section floating lines are gone — only the badge carries the
    // credit inside the scene sections (Colophon keeps its legal footer).
    await expect(page.locator('section[aria-label="Hero"] footer')).toHaveCount(0);
    await expect(page.locator('#arsenal-section footer')).toHaveCount(0);
    await expect(page.locator('#fullbody-section footer')).toHaveCount(0);
  });

  test('is visible in the final section (Colophon legal footer)', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight));
    await page.waitForTimeout(2500);

    // The badge yields to the permanent Colophon footer (never duplicated).
    await expect(page.getByTestId(BADGE)).toHaveCount(0);
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

  test('links to the CC BY 4.0 license text with safe rel attributes', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);

    const license = page.getByRole('link', { name: LICENSE }).first();
    await expect(license).toBeVisible();

    await expect(license).toHaveAttribute('href', /creativecommons\.org\/licenses\/by\/4\.0/);
    await expect(license).toHaveAttribute('target', '_blank');
    await expect(license).toHaveAttribute('rel', /noopener/);
    await expect(license).toHaveAttribute('rel', /noreferrer/);
  });
});
