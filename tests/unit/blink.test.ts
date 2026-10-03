import { describe, expect, it } from 'vitest';
import {
  BLINK_AMOUNT,
  BLINK_DURATION,
  BLINK_INTERVAL,
  blinkClosure,
  nextBlinkAt,
  rand,
} from '@/components/3d/materials/blink';

describe('blink scheduler', () => {
  it('schedules the next blink inside the cadence window', () => {
    for (const seed of [0, 1, 7.3, 42]) {
      const next = nextBlinkAt(10, seed);
      expect(next).toBeGreaterThanOrEqual(10 + BLINK_INTERVAL.min);
      expect(next).toBeLessThanOrEqual(10 + BLINK_INTERVAL.max);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(nextBlinkAt(0, 5)).toBe(nextBlinkAt(0, 5));
    expect(rand(5)).toBe(rand(5));
  });

  it('closes and reopens within the duration', () => {
    expect(blinkClosure(-0.01)).toBe(0);
    expect(blinkClosure(0)).toBeCloseTo(0, 5);
    expect(blinkClosure(BLINK_DURATION * 0.45)).toBeCloseTo(1, 3);
    expect(blinkClosure(BLINK_DURATION)).toBeCloseTo(0, 3);
    expect(blinkClosure(BLINK_DURATION + 0.5)).toBe(0);
  });

  it('scales with the mode amount', () => {
    const half = BLINK_DURATION * 0.45;
    expect(blinkClosure(half, BLINK_AMOUNT.subtle)).toBeCloseTo(BLINK_AMOUNT.subtle, 3);
    expect(blinkClosure(half, BLINK_AMOUNT.off)).toBe(0);
  });

  it('is asymmetric (closes slower than it opens)', () => {
    const closing = blinkClosure(BLINK_DURATION * 0.3);
    const opening = blinkClosure(BLINK_DURATION * 0.75);
    expect(closing).toBeGreaterThan(opening);
  });

  it('never leaves the 0..1 range', () => {
    for (let t = -0.1; t < BLINK_DURATION + 0.1; t += 0.005) {
      const value = blinkClosure(t);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
