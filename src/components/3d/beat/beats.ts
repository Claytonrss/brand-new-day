/**
 * Beat timeline — single source of truth for narrative state.
 *
 * Ranges mirror the page layout (900vh total, see `src/App.tsx`):
 * - Opening+ Hero 200vh  → 0.0000–0.2222 (title card shares the Hero camera)
 * - Chapter1       100vh → 0.2222–0.3333
 * - Evolution      150vh → 0.3333–0.5000
 * - Chapter2       100vh → 0.5000–0.6111
 * - Arsenal        150vh → 0.6111–0.7778
 * - FullBody       100vh → 0.7778–0.8889
 * - Colophon       100vh → 0.8889–1.0000
 *
 * The Opening title card (P1a.2) is a typographic beat with no 3D of its own;
 * it reuses the static `hero` camera keyframe, so the beat id stays `hero`.
 * The Colophon (P1b) holds the `fullBody` camera keyframe while the model is
 * dissolved into the fog by the section gradient and a quiet light cue.
 *
 * These are the same boundaries used by `cameraPath.ts`, so lighting and
 * camera stay in sync by construction.
 *
 * @see docs/specs/headroom-lighting.md §7
 */
export type BeatId =
  | 'hero'
  | 'chapter1'
  | 'evolution'
  | 'chapter2'
  | 'arsenal'
  | 'fullBody'
  | 'colophon';

export interface Beat {
  id: BeatId;
  scrollStart: number;
  scrollEnd: number;
}

export const BEAT_TIMELINE: readonly Beat[] = [
  { id: 'hero', scrollStart: 0, scrollEnd: 0.2222 },
  { id: 'chapter1', scrollStart: 0.2222, scrollEnd: 0.3333 },
  { id: 'evolution', scrollStart: 0.3333, scrollEnd: 0.5 },
  { id: 'chapter2', scrollStart: 0.5, scrollEnd: 0.6111 },
  { id: 'arsenal', scrollStart: 0.6111, scrollEnd: 0.7778 },
  { id: 'fullBody', scrollStart: 0.7778, scrollEnd: 0.8889 },
  { id: 'colophon', scrollStart: 0.8889, scrollEnd: 1.0 },
] as const;

/** Resolve the beat that contains a given global scroll progress. */
export function beatAt(progress: number): Beat {
  const clamped = Math.min(Math.max(progress, 0), 1);
  for (const beat of BEAT_TIMELINE) {
    if (clamped >= beat.scrollStart && clamped <= beat.scrollEnd) return beat;
  }
  return BEAT_TIMELINE[BEAT_TIMELINE.length - 1];
}

/** Local progress (0-1) of `progress` inside `beat`. */
export function beatLocalProgress(beat: Beat, progress: number): number {
  const range = beat.scrollEnd - beat.scrollStart;
  if (range <= 0) return 0;
  return Math.min(Math.max((progress - beat.scrollStart) / range, 0), 1);
}

/**
 * World-space anchors shared by lighting, camera and effects.
 * Extracted from the previous per-scene constants so every consumer aims at
 * the same point.
 */
export const CHEST_Y = {
  mobile: -1.5,
  desktop: -2.0,
} as const;

export const WRIST_POSITION = {
  mobile: [-0.9, -2.6, 0.1] as const,
  desktop: [-0.5, -3.3, 0] as const,
} as const;
