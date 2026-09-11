import { describe, expect, it } from 'vitest';
import { BEAT_TIMELINE, beatAt, beatLocalProgress } from '../../src/components/3d/beat/beats';

describe('beat timeline', () => {
  it('covers the whole scroll without gaps', () => {
    expect(BEAT_TIMELINE[0].scrollStart).toBe(0);
    expect(BEAT_TIMELINE[BEAT_TIMELINE.length - 1].scrollEnd).toBe(1);

    for (let i = 1; i < BEAT_TIMELINE.length; i++) {
      expect(BEAT_TIMELINE[i].scrollStart).toBe(BEAT_TIMELINE[i - 1].scrollEnd);
    }
  });

  it('resolves the beat for every sampled progress', () => {
    for (let p = 0; p <= 1.0001; p += 0.01) {
      expect(beatAt(p)).toBeDefined();
    }
  });

  it('matches the 800vh page layout', () => {
    // Opening title card (100vh) + Hero (100vh) share the hero beat.
    expect(beatAt(0).id).toBe('hero');
    expect(beatAt(0.1).id).toBe('hero');
    expect(beatAt(0.2).id).toBe('hero');
    expect(beatAt(0.3).id).toBe('chapter1');
    expect(beatAt(0.45).id).toBe('evolution');
    expect(beatAt(0.6).id).toBe('chapter2');
    expect(beatAt(0.8).id).toBe('arsenal');
    expect(beatAt(0.95).id).toBe('fullBody');
  });

  it('clamps progress outside 0-1', () => {
    expect(beatAt(-1).id).toBe('hero');
    expect(beatAt(9).id).toBe('fullBody');
  });

  it('computes local progress inside the beat', () => {
    const evolution = beatAt(0.45);
    expect(evolution.id).toBe('evolution');
    expect(beatLocalProgress(evolution, 0.375)).toBe(0);
    expect(beatLocalProgress(evolution, 0.5625)).toBe(1);
    expect(beatLocalProgress(evolution, 0.46875)).toBeCloseTo(0.5, 5);
  });
});
