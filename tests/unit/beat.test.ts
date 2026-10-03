import { describe, expect, it } from 'vitest';
import { BEAT_TIMELINE, beatAt, beatLocalProgress } from '@/components/3d/beat/beats';
import { MAX_SCROLL_VH, SECTION_SPANS } from '@/components/3d/beat/sections';

/** Beat boundary for a cumulative vh position — mirrors the beats.ts math. */
const at = (vh: number) => vh / MAX_SCROLL_VH;

/** Cumulative top of a section, in vh. */
function topOf(id: keyof typeof SECTION_SPANS): number {
  const order = Object.keys(SECTION_SPANS) as (keyof typeof SECTION_SPANS)[];
  return order.slice(0, order.indexOf(id)).reduce((sum, key) => sum + SECTION_SPANS[key], 0);
}

describe('beat timeline', () => {
  it('covers the whole scroll without gaps', () => {
    expect(BEAT_TIMELINE[0].scrollStart).toBe(0);
    expect(BEAT_TIMELINE[BEAT_TIMELINE.length - 1].scrollEnd).toBe(1);

    for (let i = 1; i < BEAT_TIMELINE.length; i++) {
      expect(BEAT_TIMELINE[i].scrollStart).toBe(BEAT_TIMELINE[i - 1].scrollEnd);
    }
  });

  it('derives boundaries from the section spans (hero covers opening)', () => {
    // Midpoints of a couple of beats, computed from SECTION_SPANS itself so a
    // re-gear (ADR-024) recalibrates the test instead of breaking it.
    const heroMid = at((topOf('chapter1') * 1) / 2);
    expect(beatAt(0).id).toBe('hero');
    expect(beatAt(heroMid).id).toBe('hero');
    expect(beatAt(at(topOf('evolution') + SECTION_SPANS.evolution / 2)).id).toBe('evolution');
    expect(beatAt(at(topOf('arsenal') + SECTION_SPANS.arsenal / 2)).id).toBe('arsenal');
    expect(beatAt(at(topOf('colophon') + SECTION_SPANS.colophon / 2)).id).toBe('colophon');
  });

  it('clamps progress outside 0-1', () => {
    expect(beatAt(-1).id).toBe('hero');
    expect(beatAt(9).id).toBe('colophon');
  });

  it('computes local progress inside the beat', () => {
    const evolution = BEAT_TIMELINE.find((b) => b.id === 'evolution')!;
    expect(beatLocalProgress(evolution, evolution.scrollStart)).toBe(0);
    expect(beatLocalProgress(evolution, evolution.scrollEnd)).toBe(1);
    expect(
      beatLocalProgress(evolution, (evolution.scrollStart + evolution.scrollEnd) / 2),
    ).toBeCloseTo(0.5, 5);
  });
});
