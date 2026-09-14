/**
 * Section spans — single source of truth for the page's scroll gearing
 * (ADR-024).
 *
 * Every section's height and every beat boundary derive from this table:
 * `App.tsx` and the section components size themselves from `SECTION_SPANS`,
 * and `beats.ts` converts the cumulative spans into scroll fractions. To
 * re-pace the journey, edit the numbers here — camera, lighting, overlays and
 * the narrative stay in sync by construction.
 *
 * Layout: Opening (100) → Hero (140) → Chapter1 (70) → Evolution (210) →
 *         Chapter2 (70) → Arsenal (210) → FullBody (130) → Colophon (140)
 *         = 1070vh of document, 970vh of scroll.
 *
 * Units follow each section's pre-existing behavior: full-viewport sections
 * use `dvh` (mobile URL-bar aware), the two scroll-driven sections keep `vh`.
 *
 * The Opening keeps 100vh by contract: the landing fires when the Hero's top
 * touches the viewport bottom, so an opening of exactly one viewport pins
 * that timing (docs/specs/arrival-landing.md).
 *
 * @see src/components/3d/beat/beats.ts
 */

export type SectionId =
  'opening' | 'hero' | 'chapter1' | 'evolution' | 'chapter2' | 'arsenal' | 'fullBody' | 'colophon';

/** Section height in vh, in document order. */
export const SECTION_SPANS: Record<SectionId, number> = {
  opening: 100,
  hero: 140,
  chapter1: 70,
  evolution: 210,
  chapter2: 70,
  arsenal: 210,
  fullBody: 130,
  colophon: 140,
};

/** Total document height, in vh. */
export const TOTAL_VH: number = Object.values(SECTION_SPANS).reduce((sum, vh) => sum + vh, 0);

/**
 * Scrollable height, in vh — the document minus one viewport. Beat fractions
 * in `beats.ts` are expressed against this (the master ScrollTrigger runs
 * `top top` → `bottom bottom`).
 */
export const MAX_SCROLL_VH: number = TOTAL_VH - 100;
