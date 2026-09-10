import { expect, test } from '@playwright/test';

/**
 * Motion tests for the procedural rig (Wave A).
 *
 * The GLB has no animation clips, so nothing proves the character moves except
 * these assertions: breathing advances, the head follows the pointer with the
 * neck and upper spine trailing behind it, and `prefers-reduced-motion` freezes
 * everything.
 *
 * @see docs/specs/procedural-rig-motion.md §10
 */
const RIG = '?debug=1';

async function waitForScene(page: import('@playwright/test').Page) {
  const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
  await expect(loader).toBeHidden({ timeout: 60_000 });
  await page.waitForTimeout(4000);
}

function readRig(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const rig = window.__rig;
    return rig
      ? {
          head: rig.head,
          neck: rig.neck,
          spine2: rig.spine2,
          breath: rig.breath,
          joints: rig.joints,
          pointer: rig.pointer,
          target: rig.target,
        }
      : null;
  });
}

test.describe('Procedural rig', () => {
  test('resolves every Mixamo joint used by the rig', async ({ page }) => {
    await page.goto(`/${RIG}`);
    await waitForScene(page);

    const rig = await readRig(page);
    expect(rig).not.toBeNull();
    expect(rig?.joints).toBe(16);
  });

  test('keeps drifting on devices without hover', async ({ page }) => {
    await page.goto(`/${RIG}`);
    await waitForScene(page);

    const canHover = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    test.skip(canHover, 'pointer-driven device — covered by the tracking test');

    const first = await readRig(page);
    await page.waitForTimeout(2000);
    const second = await readRig(page);

    expect(first?.head).not.toEqual(second?.head);
  });

  test('breathing advances while the page is idle', async ({ page }) => {
    await page.goto(`/${RIG}`);
    await waitForScene(page);

    const first = await readRig(page);
    await page.waitForTimeout(1200);
    const second = await readRig(page);

    expect(first?.breath).not.toBe(second?.breath);
  });

  test('the head follows the pointer and the neck trails behind it', async ({ page }) => {
    // Software rendering needs the 3x timeout: the spring converges in
    // simulated time, which crawls at a few FPS.
    test.slow();
    await page.goto(`/${RIG}`);
    await waitForScene(page);

    // Touch devices have no hover: they must fall back to autonomous drift
    // instead of pointer tracking (memorable-moments.md §Beat 1).
    const canHover = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    test.skip(!canHover, 'no pointer on this device — covered by the drift test');

    // Coordinates must stay inside the viewport or Playwright drops the move
    const size = page.viewportSize();
    const width = size?.width ?? 1440;
    const height = size?.height ?? 900;

    await page.mouse.move(width * 0.1, height * 0.5);
    await page.waitForTimeout(3000);
    const left = await readRig(page);

    await page.mouse.move(width * 0.9, height * 0.5);
    await page.waitForTimeout(3000);
    const right = await readRig(page);

    expect(left).not.toBeNull();
    expect(right).not.toBeNull();

    // The pointer must reach the rig and be clamped to the Beat 1 limits
    expect(left?.pointer[0] ?? 0).toBeLessThan(0);
    expect(right?.pointer[0] ?? 0).toBeGreaterThan(0);
    expect(left?.target[0] ?? 0).toBeLessThan(0);
    expect(right?.target[0] ?? 0).toBeGreaterThan(0);
    // Beat 1 spec: 25-30 degrees of total yaw (bias included)
    expect(Math.abs(right?.target[0] ?? 0)).toBeLessThanOrEqual(0.52);

    // yaw lives in the Y component of the head quaternion and must travel
    // toward the new target (this environment renders too slowly for the
    // spring to fully converge inside a test timeout)
    const leftYaw = left?.head[1] ?? 0;
    const rightYaw = right?.head[1] ?? 0;

    expect(rightYaw).toBeGreaterThan(leftYaw);

    // follow-through: head leads, neck and upper spine follow with lower weight
    const head = Math.abs(rightYaw);
    const neck = Math.abs(right?.neck[1] ?? 0);
    const spine = Math.abs(right?.spine2[1] ?? 0);

    expect(head).toBeGreaterThan(neck);
    expect(neck).toBeGreaterThan(spine);
  });
});

test.describe('Reduced motion', () => {
  test('freezes the rig completely', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${RIG}`);
    await waitForScene(page);

    const first = await readRig(page);
    await page.waitForTimeout(1500);
    const second = await readRig(page);

    expect(first?.head).toEqual(second?.head);
    expect(first?.breath).toBe(second?.breath);
  });

  test('holds a pixel-identical composition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForScene(page);

    const first = await page.screenshot();
    await page.waitForTimeout(1500);
    const second = await page.screenshot();

    expect(Buffer.compare(first, second)).toBe(0);
  });
});
