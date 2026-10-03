import { beforeEach, describe, expect, it } from 'vitest';
import {
  landing,
  landingFire,
  landingOffset,
  landingResetForTest,
  landingSnap,
  landingStep,
  LANDING_DROP,
  LANDING_SETTLE_EPS,
} from '@/components/3d/landing';

const DT = 1 / 60;

beforeEach(landingResetForTest);

/** Simulates the drop; returns per-step snapshots. */
function simulate(steps = 200) {
  const trace: { t: number; offset: number; kick: number; flex: number }[] = [];
  for (let i = 0; i < steps; i++) {
    landingStep(DT);
    trace.push({
      t: (i + 1) * DT,
      offset: landingOffset(),
      kick: landing.kick,
      flex: landing.flex,
    });
  }
  return trace;
}

/**
 * Wave 4a guardrails — docs/specs/arrival-landing.md §4–§5: the drop is a
 * single underdamped spring (ω=9, ζ=0.7) with 4–6% overshoot settling in
 * ~0.45s, and the kick/flex envelopes peak at the impact.
 */
describe('arrival landing', () => {
  beforeEach(landingResetForTest);

  it('drops, overshoots 4–6% and settles under ~0.8s', () => {
    landingFire();
    const trace = simulate();

    const min = Math.min(...trace.map((s) => s.offset));
    expect(min).toBeLessThan(0);
    expect(min).toBeGreaterThanOrEqual(-LANDING_DROP * 0.06); // 4–6% overshoot

    const settled = trace.find((s) => Math.abs(s.offset) < LANDING_SETTLE_EPS);
    expect(settled).toBeDefined();
    expect(settled!.t).toBeLessThan(0.8);
    expect(Math.abs(trace[trace.length - 1].offset)).toBeLessThan(0.005);
  });

  it('peaks the camera kick at the impact and fades it away', () => {
    landingFire();
    const trace = simulate(120);

    const maxKick = Math.max(...trace.map((s) => s.kick));
    expect(maxKick).toBeGreaterThan(0.3);
    expect(trace[trace.length - 1].kick).toBeLessThan(0.05);
  });

  it('grows the flexion towards the impact and decays it after the settle', () => {
    landingFire();
    const trace = simulate(200);

    // during the fall the flexion is already visible
    expect(trace[10].flex).toBeGreaterThan(0);
    // it peaks around the impact (first half of the sim)
    const peak = Math.max(...trace.slice(0, 60).map((s) => s.flex));
    expect(peak).toBeGreaterThan(0.5);
    // and it decays to ~0 afterwards
    expect(trace[trace.length - 1].flex).toBeLessThan(0.1);
  });

  it('snaps to rest for deep scroll restoration (no animation)', () => {
    landingSnap();
    expect(landing.fired).toBe(true);
    expect(landing.fireCount).toBe(1);
    expect(landingOffset()).toBe(0);
  });
});
