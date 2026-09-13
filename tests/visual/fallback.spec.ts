import { expect, test } from '@playwright/test';

/**
 * WebGL fallback — the piece must stay presentable without a GPU.
 *
 * `getContext('webgl*')` is forced to return null before boot, so the app
 * chooses the editorial poster instead of mounting the canvas.
 *
 * @see docs/specs/webgl-static-fallback.md
 */
test.describe('WebGL fallback', () => {
  test('renders an editorial poster, not an error @smoke', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (String(type).startsWith('webgl')) return null;
        return original.call(this, type, ...(args as []));
      } as typeof original;
    });

    await page.goto('/');

    // Brand + editorial copy, no "3D unavailable" error message.
    await expect(page.getByRole('heading', { name: /SPIDER-MAN/ })).toBeVisible();
    await expect(page.getByText('Ninguém sabe.')).toBeVisible();
    await expect(page.getByText(/chega aos cinemas/)).toBeVisible();

    // Attribution and the in-tone WebGL note are present.
    await expect(page.getByText(/CC BY 4\.0/)).toBeVisible();
    await expect(page.getByText(/requer WebGL/)).toBeVisible();
    await expect(page.getByText('3D unavailable')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});
