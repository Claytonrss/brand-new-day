import { expect, test, type Page } from '@playwright/test';

import { waitForScene } from './support';

const STORAGE_KEY = 'spiderman-landing:heroMouseHintShown';
/** Landing settle (~2.5s) + poll (150ms) + cue delay (1.5s) — generous for CI. */
const ARM_TIMEOUT = 30_000;
/** Full cycle is ~2.75s; slack covers attribute-poll latency. */
const CYCLE_TIMEOUT = 8_000;

/**
 * Hero mouse cue (docs/specs/hero-mouse-cue.md §11) — EARS proofs.
 *
 * The cue is asserted through <html data-hero-cue> (armed|scheduled|active|done)
 * and the session flag, never through pixels: the dot peaks at 0.35 opacity and
 * pixel-hunting it would be flake, not proof. State semantics: "done" means the
 * session was consumed (shown or discovered); an absent attribute means the cue
 * was never applicable (touch-primary / reduced-motion).
 */

async function arriveAtHero(page: Page): Promise<void> {
  // Wheel-only arrival: jump into the hero first viewport, never move the pointer.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.9));
}

async function cueState(page: Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.dataset.heroCue ?? null);
}

async function sessionFlag(page: Page): Promise<string | null> {
  return page.evaluate((key) => sessionStorage.getItem(key), STORAGE_KEY);
}

test.describe('hero mouse cue', () => {
  test('appears after the arrival and dismisses itself, once per session @desktop', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'fine-pointer only');

    await page.goto('/');
    await waitForScene(page, 0);
    await arriveAtHero(page);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-hero-cue', 'active', { timeout: ARM_TIMEOUT });
    const activeSince = Date.now();

    await expect(html).toHaveAttribute('data-hero-cue', 'done', { timeout: CYCLE_TIMEOUT });
    // Cycle bound (spec EARS #1): ≤3.5s of animation + polling latency.
    expect(Date.now() - activeSince).toBeLessThanOrEqual(5000);
    await expect(page.locator('[data-hero-cue-dot]')).toBeHidden();
    expect(await sessionFlag(page)).toBe('1');

    // Re-scrolling inside the same session must not resurrect it.
    await page.evaluate(() => window.scrollTo(0, 0));
    await arriveAtHero(page);
    await page.waitForTimeout(2500);
    expect(await cueState(page)).toBe('done');
  });

  test('a real pointer move cancels it fast and consumes the session @desktop', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'fine-pointer only');

    await page.goto('/');
    await waitForScene(page, 0);
    await arriveAtHero(page);

    await page.waitForFunction(
      () =>
        document.documentElement.dataset.heroCue === 'scheduled' ||
        document.documentElement.dataset.heroCue === 'active',
      { timeout: ARM_TIMEOUT },
    );
    // First move primes the baseline (viewport entry is not "moving"); the
    // second is the real move the cue exists to catch.
    await page.mouse.move(600, 450);
    await page.mouse.move(920, 500);

    await expect(page.locator('html')).toHaveAttribute('data-hero-cue', 'done', {
      timeout: 1000,
    });
    expect(await sessionFlag(page)).toBe('1');
    await expect(page.locator('[data-hero-cue-dot]')).toBeHidden({ timeout: 1000 });
  });

  test('scrolling past the hero before activation aborts without the flag @desktop', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'fine-pointer only');

    await page.goto('/');
    await waitForScene(page, 0);
    await arriveAtHero(page);

    await page.waitForFunction(() => document.documentElement.dataset.heroCue === 'scheduled', {
      timeout: ARM_TIMEOUT,
    });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
    await expect(page.locator('html')).toHaveAttribute('data-hero-cue', 'done', {
      timeout: 2000,
    });
    expect(await sessionFlag(page)).toBeNull();

    // Single attempt per session: coming back to the hero does not re-arm.
    await arriveAtHero(page);
    await page.waitForTimeout(2500);
    expect(await cueState(page)).toBe('done');
    expect(await sessionFlag(page)).toBeNull();
  });

  test('never arms under prefers-reduced-motion @desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'fine-pointer only');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForScene(page, 0);
    await arriveAtHero(page);
    await page.waitForTimeout(5000);
    expect(await cueState(page)).toBeNull();
  });

  test('a stored session flag suppresses it from the first load @desktop', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'fine-pointer only');

    await page.addInitScript((key) => sessionStorage.setItem(key, '1'), STORAGE_KEY);
    await page.goto('/');
    await waitForScene(page, 0);
    await arriveAtHero(page);
    await page.waitForTimeout(5000);
    // Session already consumed: state settles to "done", dot never mounts.
    expect(await cueState(page)).toBe('done');
    await expect(page.locator('[data-hero-cue-dot]')).toBeHidden();
  });

  test('never arms on touch-primary devices @mobile', async ({ browser }) => {
    // The mobile-390 project emulates the viewport but not touch (`hasTouch`
    // unset ⇒ Chromium reports a fine pointer), so this proof needs its own
    // context — a real touch-primary device.
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    await page.goto('/');
    await waitForScene(page, 0);
    await arriveAtHero(page);
    await page.waitForTimeout(5000);
    expect(await cueState(page)).toBeNull();

    await context.close();
  });
});
