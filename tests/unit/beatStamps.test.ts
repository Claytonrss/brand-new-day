import { describe, expect, it } from 'vitest';
import { BEAT_TIMELINE } from '../../src/components/3d/beat/beats';
import { BEAT_STAMPS } from '../../src/design/beatStamps';

/**
 * Beat stamp guardrails — docs/specs/dom-micro-craft.md §2: every beat has a
 * stamp, the log reads as one continuous night (04:37 → 05:00), and no stamp
 * repeats itself.
 */
describe('BEAT_STAMPS', () => {
  it('covers every beat in the timeline', () => {
    for (const beat of BEAT_TIMELINE) {
      expect(BEAT_STAMPS[beat.id]).toBeTruthy();
    }
    expect(Object.keys(BEAT_STAMPS)).toHaveLength(BEAT_TIMELINE.length);
  });

  it('runs one rainy NYC night forward, 04:37 → 05:00', () => {
    expect(BEAT_STAMPS.hero).toContain('04:37');
    expect(BEAT_STAMPS.colophon).toContain('05:00');
    // fullBody carries the film date from the storyboard kicker
    expect(BEAT_STAMPS.fullBody).toContain('31 de julho');
  });

  it('never repeats a stamp', () => {
    const values = Object.values(BEAT_STAMPS);
    expect(new Set(values).size).toBe(values.length);
  });
});
