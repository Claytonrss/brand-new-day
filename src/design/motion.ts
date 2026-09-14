/**
 * Motion Design System
 * Centralized motion tokens for consistent animation timing and easing.
 *
 * All durations in ms. Easings are CSS cubic-bezier strings — valid wherever
 * CSS transitions/animations consume them. GSAP call sites use GSAP's own
 * named eases (e.g. 'power3.out') instead.
 *
 * @see docs/design/design-bible.md
 */

export const MOTION = {
  duration: {
    /** Button hover, small UI feedback */
    micro: 150,
    /** Element transitions, reveals */
    fast: 350,
    /** Section transitions, modal open */
    base: 700,
    /** Complex animations, page transitions */
    slow: 1200,
  },

  ease: {
    /** For elements entering the screen */
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    /** Premium easing for cinematic moments */
    premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  stagger: {
    /** Standard stagger for lists */
    base: 60,
    /** Dramatic stagger for headlines */
    cinematic: 150,
  },
} as const;
