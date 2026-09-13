import { describe, expect, it } from 'vitest';
import { MAGNET, magneticOffset } from '../../src/design/magnetic';

/**
 * Magnetic CTA guardrails — docs/specs/dom-micro-craft.md §3: rest outside
 * the radius, lean toward the cursor inside it, never overshoot the pull.
 */
describe('magneticOffset', () => {
  it('rests outside the radius', () => {
    expect(magneticOffset(200, 0, 0, 0, 120, 0.32)).toBeNull();
    expect(magneticOffset(0, -180, 0, 0, 120, 0.32)).toBeNull();
    // exactly on the rim is still outside
    expect(magneticOffset(120, 0, 0, 0, 120, 0.32)).toBeNull();
  });

  it('leans toward the cursor inside the radius', () => {
    const offset = magneticOffset(60, 0, 0, 0, 120, 0.32);
    expect(offset).not.toBeNull();
    expect(offset!.x).toBeCloseTo(19.2);
    expect(offset!.y).toBe(0);
  });

  it('follows the pointer side on both axes', () => {
    const offset = magneticOffset(-30, 40, 0, 0);
    expect(offset).not.toBeNull();
    expect(offset!.x).toBeLessThan(0);
    expect(offset!.y).toBeGreaterThan(0);
  });

  it('never pulls further than the cursor itself', () => {
    const offset = magneticOffset(119, 0, 0, 0, 120, 0.32)!;
    expect(Math.abs(offset.x)).toBeLessThan(119);
  });

  it('defaults to the spec radius and strength', () => {
    const offset = magneticOffset(MAGNET.radius - 1, 0, 0, 0)!;
    expect(offset.x).toBeCloseTo((MAGNET.radius - 1) * MAGNET.strength);
  });
});
