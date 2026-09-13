import { describe, expect, it } from 'vitest';
import { VELOCITY_TYPE, velocityWeight } from '@/design/velocityType';

/**
 * Velocity typography guardrails — docs/specs/dom-micro-craft.md §1: the
 * weight stays inside the variable font range, moves monotonically with
 * scroll speed and is quantized so the CSS var rewrite (and the headline
 * reflow it causes) is bounded.
 */
describe('velocityWeight', () => {
  it('rests at the poster weight', () => {
    expect(velocityWeight(0)).toBe(VELOCITY_TYPE.BASE);
    expect(velocityWeight(-0.01)).toBe(VELOCITY_TYPE.BASE);
  });

  it('never leaves the variable font range, in either direction', () => {
    for (const velocity of [0.5, 1, 3, 10, 100, -3, -50]) {
      const weight = velocityWeight(velocity);
      expect(weight).toBeLessThanOrEqual(VELOCITY_TYPE.BASE);
      expect(weight).toBeGreaterThanOrEqual(VELOCITY_TYPE.MIN);
    }
    expect(velocityWeight(1000)).toBe(VELOCITY_TYPE.MIN);
    expect(velocityWeight(-1000)).toBe(VELOCITY_TYPE.MIN);
  });

  it('is symmetric for the scroll direction', () => {
    expect(velocityWeight(2)).toBe(velocityWeight(-2));
    expect(velocityWeight(0.4)).toBe(velocityWeight(-0.4));
  });

  it('quantizes to STEP so CSS var rewrites are bounded', () => {
    for (const velocity of [0.3, 0.7, 1.2, 2.4, 2.9]) {
      expect(velocityWeight(velocity) % VELOCITY_TYPE.STEP).toBe(0);
    }
  });

  it('thins monotonically as the page speeds up', () => {
    let previous = velocityWeight(0);
    for (let v = 0.25; v <= 3; v += 0.25) {
      const current = velocityWeight(v);
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
    expect(previous).toBe(VELOCITY_TYPE.MIN);
  });
});
