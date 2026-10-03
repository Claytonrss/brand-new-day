import { describe, expect, it } from 'vitest';
import {
  GYRO_ALPHA_FAST,
  GYRO_ALPHA_SLOW,
  GYRO_JUMP_DEG,
  GYRO_SATURATION_RATIO,
  GYRO_SATURATION_S,
  GYRO_LIMITS,
  accumulateSaturation,
  adaptiveLowPass,
  remapForOrientation,
  wrapDeltaDeg,
} from '@/components/3d/interaction/pointerMath';

describe('remapForOrientation', () => {
  const gamma = 12;
  const beta = 30;

  it('keeps the portrait axes at angle 0', () => {
    expect(remapForOrientation(gamma, beta, 0)).toEqual({ x: 12, y: 30 });
  });

  it('swaps the axes for landscape-primary (90°)', () => {
    expect(remapForOrientation(gamma, beta, 90)).toEqual({ x: 30, y: -12 });
  });

  it('negates both axes at 180°', () => {
    expect(remapForOrientation(gamma, beta, 180)).toEqual({ x: -12, y: -30 });
  });

  it('swaps and negates for landscape-secondary (270°)', () => {
    expect(remapForOrientation(gamma, beta, 270)).toEqual({ x: -30, y: 12 });
  });

  it('normalizes arbitrary angles (450° ≡ 90°, −90° ≡ 270°)', () => {
    expect(remapForOrientation(gamma, beta, 450)).toEqual(remapForOrientation(gamma, beta, 90));
    expect(remapForOrientation(gamma, beta, -90)).toEqual(remapForOrientation(gamma, beta, 270));
  });
});

describe('adaptiveLowPass', () => {
  it('starts exactly at the raw value (no startup jump)', () => {
    expect(adaptiveLowPass(Number.NaN, 30)).toBe(30);
  });

  it('covers the bulk of a real tilt fast (≥ 85% in 5 events)', () => {
    let filtered = 0;
    for (let i = 0; i < 5; i++) filtered = adaptiveLowPass(filtered, 30);
    expect(filtered / 30).toBeGreaterThanOrEqual(0.85);
    expect(GYRO_ALPHA_FAST).toBeGreaterThan(GYRO_ALPHA_SLOW);
  });

  it('switches to the slow α for the residual tail (anti-jitter by design)', () => {
    let filtered = 0;
    for (let i = 0; i < 8; i++) filtered = adaptiveLowPass(filtered, 30);
    // Once within GYRO_JUMP_DEG of the target every step moves only the slow
    // share — the filter never overshoots into visible wobble.
    const next = adaptiveLowPass(filtered, 30);
    expect(next - filtered).toBeCloseTo((30 - filtered) * GYRO_ALPHA_SLOW, 9);
  });

  it('creeps under quantization noise (≤ 0.15°/event at ±1.5° steps)', () => {
    const step = adaptiveLowPass(0, 1.5);
    expect(step).toBeLessThanOrEqual(0.15);
    // and a jump of exactly the threshold is still noise, not a tilt
    expect(adaptiveLowPass(0, GYRO_JUMP_DEG)).toBeCloseTo(GYRO_JUMP_DEG * GYRO_ALPHA_SLOW, 9);
  });
});

describe('wrapDeltaDeg', () => {
  it('takes the short path across the ±180° seam', () => {
    expect(wrapDeltaDeg(-358)).toBe(2);
    expect(wrapDeltaDeg(358)).toBe(-2);
    expect(wrapDeltaDeg(190)).toBe(-170);
  });

  it('keeps in-range deltas untouched', () => {
    expect(wrapDeltaDeg(0)).toBe(0);
    expect(wrapDeltaDeg(45)).toBe(45);
    expect(wrapDeltaDeg(-45)).toBe(-45);
  });
});

describe('accumulateSaturation', () => {
  it('accumulates only while the output is saturated', () => {
    let acc = 0;
    for (let i = 0; i < 250; i++) acc = accumulateSaturation(acc, true, 0.01);
    expect(acc).toBeCloseTo(2.5, 9);
  });

  it('resets the instant the output leaves the clamp', () => {
    expect(accumulateSaturation(2.49, false, 0.02)).toBe(0);
  });

  it('crosses the recenter threshold one tick later (2.49s vs 2.51s)', () => {
    expect(accumulateSaturation(2.49, true, 0)).toBeLessThan(GYRO_SATURATION_S);
    expect(accumulateSaturation(2.49, true, 0.02)).toBeGreaterThanOrEqual(GYRO_SATURATION_S);
  });

  it('saturation is measured against 80% of the gyro limits', () => {
    expect(GYRO_LIMITS.yaw * GYRO_SATURATION_RATIO).toBeCloseTo(0.096, 9);
  });
});
