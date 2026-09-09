/**
 * Beat timeline — single source of truth for narrative state.
 *
 * Ranges mirror the page layout (700vh total, see `src/App.tsx`):
 * - Hero      100vh  → 0.00–0.14
 * - Chapter1  100vh  → 0.14–0.28
 * - Evolution 150vh  → 0.28–0.50
 * - Chapter2  100vh  → 0.50–0.64
 * - Arsenal   150vh  → 0.64–0.86
 * - FullBody  100vh  → 0.86–1.00
 *
 * These are the same boundaries used by `cameraPath.ts`, so lighting and
 * camera stay in sync by construction.
 *
 * @see docs/specs/headroom-lighting.md §7
 */
export type BeatId = 'hero' | 'chapter1' | 'evolution' | 'chapter2' | 'arsenal' | 'fullBody';

export interface Beat {
  id: BeatId;
  scrollStart: number;
  scrollEnd: number;
}

export const BEAT_TIMELINE: readonly Beat[] = [
  { id: 'hero', scrollStart: 0, scrollEnd: 0.14 },
  { id: 'chapter1', scrollStart: 0.14, scrollEnd: 0.28 },
  { id: 'evolution', scrollStart: 0.28, scrollEnd: 0.5 },
  { id: 'chapter2', scrollStart: 0.5, scrollEnd: 0.64 },
  { id: 'arsenal', scrollStart: 0.64, scrollEnd: 0.86 },
  { id: 'fullBody', scrollStart: 0.86, scrollEnd: 1.0 },
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
