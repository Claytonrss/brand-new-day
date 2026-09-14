/**
 * Beat timeline — single source of truth for narrative state.
 *
 * Ranges are fractions of the **maximum scroll** (total height − viewport) and
 * are DERIVED from the section heights in `sections.ts`, so they always line
 * up with the layout in `src/App.tsx` (1070vh page = 970vh of scroll).
 * See `beatAt`/`beatLocalProgress`.
 *
 * - Opening+ Hero 000–240vh → 0.0000–0.2474 (title card shares the Hero camera)
 * - Chapter1       240–310vh → 0.2474–0.3196
 * - Evolution      310–520vh → 0.3196–0.5361
 * - Chapter2       520–590vh → 0.5361–0.6082
 * - Arsenal        590–800vh → 0.6082–0.8247
 * - FullBody       800–930vh → 0.8247–0.9588
 * - Colophon       930–970vh → 0.9588–1.0000
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
 * @see docs/memory/decisions.md (ADR-024)
 */
import { MAX_SCROLL_VH, SECTION_SPANS, type SectionId } from './sections';

export type BeatId =
  'hero' | 'chapter1' | 'evolution' | 'chapter2' | 'arsenal' | 'fullBody' | 'colophon';

export interface Beat {
  id: BeatId;
  scrollStart: number;
  scrollEnd: number;
}

/** Sections each beat spans, in document order — `hero` covers the opening card. */
const BEAT_SECTIONS: readonly { id: BeatId; sections: readonly SectionId[] }[] = [
  { id: 'hero', sections: ['opening', 'hero'] },
  { id: 'chapter1', sections: ['chapter1'] },
  { id: 'evolution', sections: ['evolution'] },
  { id: 'chapter2', sections: ['chapter2'] },
  { id: 'arsenal', sections: ['arsenal'] },
  { id: 'fullBody', sections: ['fullBody'] },
  { id: 'colophon', sections: ['colophon'] },
] as const;

/**
 * Beat boundaries as fractions of the maximum scroll, accumulated from
 * `SECTION_SPANS` so camera, lighting and the narrative can never drift from
 * the layout.
 */
export const BEAT_TIMELINE: readonly Beat[] = (() => {
  let cursor = 0;
  return BEAT_SECTIONS.map(({ id, sections }) => {
    const scrollStart = cursor / MAX_SCROLL_VH;
    for (const section of sections) cursor += SECTION_SPANS[section];
    // The last beat ends at maxScroll, not at the document's bottom edge —
    // the final viewport of the last section is in view, not scrolled past.
    const scrollEnd = Math.min(cursor, MAX_SCROLL_VH) / MAX_SCROLL_VH;
    return { id, scrollStart, scrollEnd };
  });
})();

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
