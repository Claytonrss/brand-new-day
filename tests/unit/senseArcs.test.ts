import { describe, expect, it } from 'vitest';
import { SENSE_ARCS, senseSquigglePath } from '../../src/design/senseArcs';

/**
 * Halo geometry guardrails — docs/specs/spider-sense.md §1: the strokes fan
 * over the TOP hemisphere only (never cover the face), stay inside the halo
 * box, and the draw-on stagger is short enough to read as one gesture.
 */
describe('SENSE_ARCS', () => {
  it('fans six strokes over the upper hemisphere only', () => {
    expect(SENSE_ARCS).toHaveLength(6);
    for (const arc of SENSE_ARCS) {
      expect(arc.angle).toBeLessThan(0);
      expect(arc.angle).toBeGreaterThan(-180);
    }
  });

  it('the fan spans enough of the head to read as a halo', () => {
    const angles = SENSE_ARCS.map((arc) => arc.angle);
    const span = Math.max(...angles) - Math.min(...angles);
    expect(span).toBeGreaterThanOrEqual(100);
  });

  it('radii clear the head and stay inside the box', () => {
    for (const arc of SENSE_ARCS) {
      expect(arc.r1).toBeGreaterThanOrEqual(0.3);
      expect(arc.r2).toBeLessThanOrEqual(0.5);
      expect(arc.r2).toBeGreaterThan(arc.r1);
    }
  });

  it('draw-on stagger stays under a quarter second', () => {
    const maxDelay = Math.max(...SENSE_ARCS.map((arc) => arc.delay));
    expect(maxDelay).toBeLessThanOrEqual(150);
  });
});

describe('senseSquigglePath', () => {
  const SIZE = 320;

  it('draws a cubic from the inner to the outer radius', () => {
    const arc = SENSE_ARCS[2];
    const path = senseSquigglePath(SIZE, arc);
    expect(path.startsWith('M ')).toBe(true);
    expect(path).toContain(' C ');

    const c = SIZE / 2;
    const numbers = path.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const [x1, y1] = [numbers[0], numbers[1]];
    const [x2, y2] = [numbers[numbers.length - 2], numbers[numbers.length - 1]];

    expect(Math.hypot(x1 - c, y1 - c)).toBeCloseTo(arc.r1 * SIZE, 0);
    expect(Math.hypot(x2 - c, y2 - c)).toBeCloseTo(arc.r2 * SIZE, 0);
  });
});
