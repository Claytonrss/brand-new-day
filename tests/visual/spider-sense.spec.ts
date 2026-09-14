import { expect, test } from '@playwright/test';

import { waitForScene } from './support';

/**
 * Spider-sense redesign — docs/specs/spider-sense.md.
 *
 * Trigger discipline: the sense fires ONLY when the narrative enters a
 * danger beat (evolution / arsenal / fullBody) — the hero and the chapter
 * cards never fire it.
 *
 * Assertions use the LATCHED fire count (`__rig.senseCount`), not the
 * envelope: under software rendering the desktop can run at ~5fps, and the
 * envelope (>0.05 for ~650ms at 60fps) decays per FRAME — the visual window
 * can close before the first poll lands. The latch survives it.
 */
async function scrollToProgress(page: import('@playwright/test').Page, progress: number) {
  await page.evaluate(
    (p) => window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * p),
    progress,
  );
}

async function readState(page: import('@playwright/test').Page) {
  // A Vite full reload can destroy the execution context mid-test (HMR under
  // a long-lived dev server); retry instead of failing on the reload itself.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const state = await page.evaluate(() => ({
        sense: window.__rig?.sense ?? -1,
        senseCount: window.__rig?.senseCount ?? -1,
      }));
      if (state.senseCount >= 0) return state;
    } catch {
      // context destroyed — wait for the fresh page
    }
    await page.waitForTimeout(400);
  }
  return { sense: -1, senseCount: -1 };
}

test.describe('Spider-sense', () => {
  test('does not fire in the hero or on the chapter card @smoke', async ({ page }) => {
    await page.goto('/?debug=1');
    await waitForScene(page);
    expect(await readState(page)).toMatchObject({ senseCount: 0 });

    // hero → chapter1 boundary (0.25): must NOT fire
    await scrollToProgress(page, 0.3);
    await page.waitForTimeout(900);
    const state = await readState(page);
    expect(state.senseCount).toBe(0);
    expect(state.sense).toBe(0);
  });

  test('fires entering evolution and the halo anchors to the head', async ({ page }) => {
    await page.goto('/?debug=1');
    await waitForScene(page);
    expect((await readState(page)).senseCount).toBe(0);

    // straight into evolution (0.375) — crossing chapter1 silently on the way
    await scrollToProgress(page, 0.45);

    // latch: the fire survives the envelope decay
    let fired = false;
    for (let i = 0; i < 15 && !fired; i++) {
      fired = (await readState(page)).senseCount >= 1;
      if (!fired) await page.waitForTimeout(200);
    }
    expect(fired).toBe(true);

    // while it rings, SenseAnchor publishes the head's screen position
    let anchored = false;
    for (let i = 0; i < 20 && !anchored; i++) {
      anchored = await page.evaluate(
        () => document.documentElement.style.getPropertyValue('--sense-x') !== '',
      );
      if (!anchored) await page.waitForTimeout(150);
    }
    expect(anchored).toBe(true);
    await expect(page.locator('[data-spider-sense]')).toBeAttached();
  });

  test('leaving a danger beat back to a card does not re-fire', async ({ page }) => {
    await page.goto('/?debug=1');
    await waitForScene(page);

    await scrollToProgress(page, 0.45); // into evolution (fires)
    let before = -1;
    for (let i = 0; i < 15 && before < 1; i++) {
      before = (await readState(page)).senseCount;
      if (before < 1) await page.waitForTimeout(200);
    }
    expect(before).toBe(1);

    await scrollToProgress(page, 0.3); // back into chapter1 (must not fire)
    await page.waitForTimeout(1200);
    expect((await readState(page)).senseCount).toBe(1);
  });

  test('scrolling back UP into a danger beat does not re-fire @smoke', async ({ page }) => {
    // Regression: chapter2→evolution sits exactly where the
    // REVELAÇÃO card covers the viewport — a backward re-entry used to spend
    // a fire behind the card (docs/specs/spider-sense.md §3 direction gate).
    await page.goto('/?debug=1');
    await waitForScene(page);
    expect((await readState(page)).senseCount).toBe(0);

    // forward entry into evolution — the one legitimate fire
    await scrollToProgress(page, 0.45);
    let fired = -1;
    for (let i = 0; i < 15 && fired < 1; i++) {
      fired = (await readState(page)).senseCount;
      if (fired < 1) await page.waitForTimeout(200);
    }
    expect(fired).toBe(1);

    // down into chapter2, then back up across the card-covered boundary
    await scrollToProgress(page, 0.6);
    await page.waitForTimeout(600);
    await scrollToProgress(page, 0.45);
    await page.waitForTimeout(1200);
    expect((await readState(page)).senseCount).toBe(1);
    expect((await readState(page)).sense).toBe(0);
  });
});
