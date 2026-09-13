import { beforeEach, describe, expect, it } from 'vitest';
import {
  lean,
  leanResetForTest,
  leanStep,
  leanTarget,
  leanShoulderLift,
  LEAN_MAX,
  LEAN_SHOULDER_LIFT,
} from '@/components/3d/rig/lean';

const DT = 1 / 60;

/**
 * Wave 4b guardrails — docs/specs/velocity-lean.md: the lean follows the
 * SIGN of the scroll velocity, saturates at 2.5°, decays to rest and never
 * overshoots (critically damped — inertia, not wobble).
 */
describe('velocity lean', () => {
  beforeEach(leanResetForTest);

  it('clamps the target at LEAN_MAX however fast the scroll is', () => {
    expect(leanTarget(0.5)).toBeCloseTo(0.5 * 0.02, 6);
    expect(leanTarget(50)).toBe(LEAN_MAX);
    expect(leanTarget(-50)).toBe(-LEAN_MAX);
  });

  it('follows the sign of the velocity', () => {
    for (let i = 0; i < 60; i++) leanStep(DT, 2.2);
    expect(lean.value).toBeGreaterThan(0);
    expect(lean.value).toBeLessThanOrEqual(LEAN_MAX);

    for (let i = 0; i < 60; i++) leanStep(DT, -2.2);
    expect(lean.value).toBeLessThan(0);
    expect(lean.value).toBeGreaterThanOrEqual(-LEAN_MAX);
  });

  it('decays to rest when the scroll stops', () => {
    for (let i = 0; i < 120; i++) leanStep(DT, 3);
    for (let i = 0; i < 180; i++) leanStep(DT, 0);
    expect(Math.abs(lean.value)).toBeLessThan(0.002);
  });

  it('never overshoots the target (critically damped)', () => {
    let max = 0;
    for (let i = 0; i < 240; i++) {
      leanStep(DT, 2.2);
      max = Math.max(max, lean.value);
    }
    const target = leanTarget(2.2);
    expect(max).toBeLessThanOrEqual(target + 1e-6);
  });

  it('lifts the shoulders mirrored, proportional to the lean', () => {
    for (let i = 0; i < 120; i++) leanStep(DT, 2.2);
    const liftL = leanShoulderLift('shoulderL');
    const liftR = leanShoulderLift('shoulderR');
    expect(liftL).toBeGreaterThan(0);
    expect(liftR).toBe(-liftL);
    expect(liftL).toBeLessThanOrEqual(LEAN_SHOULDER_LIFT);
  });

  it('stays at zero without stepping (reduced-motion safety)', () => {
    expect(lean.value).toBe(0);
    leanShoulderLift('shoulderL');
    expect(lean.value).toBe(0);
  });
});
