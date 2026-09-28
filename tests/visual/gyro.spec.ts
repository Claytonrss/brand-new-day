import { expect, test, type Page } from '@playwright/test';

import { waitForScene } from './support';

/**
 * Gyro mobile suite (mobile-gyro-sensor-polish §12, grupos F–I).
 *
 * Headless Chromium has no motion sensor, so the iOS-shaped
 * `requestPermission` is injected before the app boots (same pattern as
 * `scripts/collect-gyro-evidence.mjs`) and state is driven through the real
 * controller — storage, gestures and the `data-beat` channel included.
 *
 * Proofs here cover the DOM/UI side; the sensor math itself is proven by
 * `tests/unit/gyroStream.test.ts` / `gyro.test.ts`, and real-device readings
 * stay with the TD-002 runbook.
 */

const CHIP = '[data-testid="gyro-prompt"]';
const CUE = '[data-testid="gyro-tilt-cue"]';
const TOGGLE = '[data-testid="gyro-colophon-toggle"]';

type GyroStub = { requestPermissionResult: 'granted' | 'denied' };

/** Injects an iOS-like DeviceOrientationEvent before any app code runs. */
async function stubGyro(page: Page, stub: GyroStub): Promise<void> {
  await page.addInitScript((result: string) => {
    const view = globalThis as Record<string, unknown>;
    function StubDeviceOrientationEvent() {}
    Object.defineProperty(StubDeviceOrientationEvent, 'requestPermission', {
      value: () => Promise.resolve(result),
    });
    view.DeviceOrientationEvent = StubDeviceOrientationEvent;
  }, stub.requestPermissionResult);
}

/** A returning visitor with a stored grant: chip never shows, gyro is live. */
async function stubGrantedVisitor(page: Page): Promise<void> {
  await stubGyro(page, { requestPermissionResult: 'granted' });
  await page.addInitScript(() => {
    window.localStorage.setItem('spiderman-landing:gyro', 'granted');
  });
}

/** Scrolls a section's top to the viewport top (same approach as interaction.spec). */
async function scrollToSection(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    if (!section) throw new Error(`missing section ${sel}`);
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + 4);
  }, selector);
}

test.describe('gyro permission chip (mobile)', () => {
  test.use({ hasTouch: true });

  test('appears in the hero without any gesture @smoke', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGyro(page, { requestPermissionResult: 'granted' });
    await page.goto('/');
    await waitForScene(page);

    await expect(page.locator(CHIP)).toBeVisible();
  });

  test('follows the hero beat: hidden outside, back on return, no penalty', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGyro(page, { requestPermissionResult: 'granted' });
    await page.goto('/');
    await waitForScene(page);

    await expect(page.locator(CHIP)).toBeVisible();
    await scrollToSection(page, '#evolution-section');
    await expect(page.locator(CHIP)).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(CHIP)).toBeVisible();
    // Leaving the hero must not spend the dismissal budget.
    expect(
      await page.evaluate(() => localStorage.getItem('spiderman-landing:gyro-dismissals')),
    ).toBeNull();
  });

  test('an explicit "não" is terminal across reloads', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGyro(page, { requestPermissionResult: 'granted' });
    await page.goto('/');
    await waitForScene(page);

    await page
      .locator(CHIP)
      .getByRole('button', { name: 'Não ativar o sensor de movimento' })
      .click();
    await expect(page.locator(CHIP)).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('spiderman-landing:gyro'))).toBe(
      'denied',
    );

    await page.reload();
    await waitForScene(page);
    await expect(page.locator(CHIP)).toBeHidden();
  });

  test('entering is animated at 12px copy and reduced motion never shows it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGyro(page, { requestPermissionResult: 'granted' });
    await page.goto('/');
    await waitForScene(page);

    const chip = page.locator(CHIP);
    await expect(chip).toBeVisible();
    // The 12px copy lives on the inner paragraph; the entrance on the chip.
    await expect(chip.locator('p')).toHaveCSS('font-size', '12px');
    await expect(chip).toHaveCSS('animation-name', 'gyro-chip-enter');
  });

  test('stays hidden under prefers-reduced-motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await stubGyro(page, { requestPermissionResult: 'granted' });
    await page.goto('/');
    await waitForScene(page);

    await expect(page.locator(CHIP)).toHaveCount(0);
  });

  test('a chip ignored for its whole patience backs off for the session', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGyro(page, { requestPermissionResult: 'granted' });
    await page.goto('/');
    await waitForScene(page);

    const chip = page.locator(CHIP);
    await expect(chip).toBeVisible();
    // 15s of accumulated visibility + tick margin, inside the 240s test cap.
    await expect(chip).toBeHidden({ timeout: 22_000 });
    expect(
      await page.evaluate(() => localStorage.getItem('spiderman-landing:gyro-dismissals')),
    ).toBe('1');
    expect(await page.evaluate(() => localStorage.getItem('spiderman-landing:gyro'))).toBeNull();
  });
});

test.describe('gyro cue + colophon control (mobile, granted visitor)', () => {
  test.use({ hasTouch: true });

  test('the tilt cue greets a granted visitor once per session', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGrantedVisitor(page);
    await page.goto('/');
    await waitForScene(page);

    // The stored grant re-requests on the session's first gesture.
    await page.mouse.click(200, 500);
    const cue = page.locator(CUE);
    await expect(cue).toBeVisible({ timeout: 10_000 });
    await expect(cue).toBeHidden({ timeout: 12_000 });
    expect(await page.evaluate(() => sessionStorage.getItem('spiderman-landing:gyro-cue'))).toBe(
      '1',
    );

    await page.reload();
    await waitForScene(page);
    await expect(page.locator(CUE)).toHaveCount(0);
  });

  test('the colophon line flips the sensor off and back on', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await stubGrantedVisitor(page);
    await page.goto('/?debug=1');
    await waitForScene(page);

    await page.mouse.click(200, 500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const toggle = page.locator(TOGGLE);
    await expect(toggle).toContainText('movimento ativo');
    await toggle.getByRole('button').click();
    await expect(toggle).toContainText('movimento desativado');
    expect(await page.evaluate(() => window.__interaction?.gyro?.state)).toBe('denied');

    await toggle.getByRole('button').click();
    await expect(toggle).toContainText('movimento ativo');
    expect(await page.evaluate(() => window.__interaction?.gyro?.state)).toBe('granted');
  });

  test('reduced motion hides the cue and the colophon control', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'gyro is a mobile affordance');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await stubGrantedVisitor(page);
    await page.goto('/');
    await waitForScene(page);

    await expect(page.locator(CUE)).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await expect(page.locator(TOGGLE)).toHaveCount(0);
  });
});

test.describe('gyro HUD + desktop absence', () => {
  test('publishes the full sensor chain under ?debug', async ({ page }) => {
    await page.goto('/?debug=1');
    await waitForScene(page);

    const gyro = await page.evaluate(() => window.__interaction?.gyro ?? null);
    expect(gyro).not.toBeNull();
    expect(Object.keys(gyro ?? {}).sort()).toEqual([
      'eventsHz',
      'fBeta',
      'fGamma',
      'originBeta',
      'originGamma',
      'rawBeta',
      'rawGamma',
      'state',
      'targetPitch',
      'targetYaw',
    ]);
  });

  test('the HUD renders the gyro line and desktop shows unavailable', async ({
    page,
  }, testInfo) => {
    await page.goto('/?debug=1');
    await waitForScene(page);

    const hud = page.locator('[data-testid="perf-hud"]');
    await expect(hud).toContainText(/gyro \w+/);
    if (testInfo.project.name === 'desktop-1440') {
      await expect(hud).toContainText('gyro unavailable');
    }
  });

  test('desktop never sees chip, cue or colophon toggle', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'desktop-only assertion');
    await page.goto('/');
    await waitForScene(page);

    await expect(page.locator(CHIP)).toHaveCount(0);
    await expect(page.locator(CUE)).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await expect(page.locator(TOGGLE)).toHaveCount(0);
  });
});
