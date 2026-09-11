import { expect, test } from '@playwright/test';

/**
 * Performance budget gate.
 *
 * Draw calls, programs and triangles are measurable in this headless renderer
 * and are asserted here. **FPS is not**: the headless browser runs on
 * SwiftShader (1-5 FPS for any version of the project), so an FPS assertion
 * would be noise. Set `PERF_FPS_ASSERT=1` to enable it on a real GPU:
 *
 *     PERF_FPS_ASSERT=1 pnpm test:visual tests/visual/budget.spec.ts
 *
 * @see docs/specs/wave-g-verification.md
 */
const DRAW_CALL_BUDGET = 48;
const PROGRAM_BUDGET = 24;

interface PerfSnapshot {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  programs: number;
}

async function readPerf(page: import('@playwright/test').Page): Promise<PerfSnapshot> {
  return (await page.evaluate(() => window.__perf ?? null)) as PerfSnapshot;
}

async function waitForScene(page: import('@playwright/test').Page) {
  const loader = page.getByRole('progressbar', { name: 'Carregando experiência 3D' });
  await expect(loader).toBeHidden({ timeout: 60_000 });
  await page.waitForTimeout(4000);
}

test.describe('Performance budget', () => {
  test('stays inside the draw call and program budget', async ({ page }) => {
    test.slow();
    await page.goto('/?debug=1&fx=subtle');
    await waitForScene(page);

    const hero = await readPerf(page);
    expect(hero).not.toBeNull();
    expect(hero.calls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
    expect(hero.programs).toBeLessThanOrEqual(PROGRAM_BUDGET);
    expect(hero.triangles).toBeGreaterThan(100_000);

    // and it must hold at the heaviest framing (close-up with all lights on)
    await page.evaluate(() =>
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * 0.85),
    );
    await page.waitForTimeout(3500);

    const arsenal = await readPerf(page);
    expect(arsenal.calls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
    expect(arsenal.programs).toBeLessThanOrEqual(PROGRAM_BUDGET);
  });

  test('does not recompile shaders while scrolling', async ({ page }) => {
    test.slow();
    await page.goto('/?debug=1&fx=subtle');
    await waitForScene(page);

    const first = await readPerf(page);

    for (let step = 1; step <= 6; step++) {
      await page.evaluate((fraction) => {
        const max = document.body.scrollHeight - window.innerHeight;
        window.scrollTo(0, max * fraction);
      }, step / 6);
      await page.waitForTimeout(1500);
    }

    const last = await readPerf(page);

    // program count must not grow with scroll (mount/unmount churn was the
    // original Wave F problem: 10 -> 27)
    expect(last.programs).toBeLessThanOrEqual(first.programs + 2);
  });

  test('measures FPS only when explicitly enabled', async ({ page }) => {
    test.skip(process.env.PERF_FPS_ASSERT !== '1', 'FPS is meaningless on SwiftShader');

    await page.goto('/?debug=1&fx=subtle');
    await waitForScene(page);
    await page.waitForTimeout(3000);

    const perf = await readPerf(page);
    const isMobile = (page.viewportSize()?.width ?? 1440) < 768;
    expect(perf.fps).toBeGreaterThanOrEqual(isMobile ? 45 : 55);
  });
});
