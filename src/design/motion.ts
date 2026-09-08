/**
 * Motion Design System
 * Centralized motion tokens for consistent animation timing and easing.
 *
 * All durations in ms. Easings are CSS cubic-bezier strings.
 * Spring presets for use with animation libraries that support physics.
 *
 * @see docs/design/design-bible.md
 */

export const MOTION = {
  /** Durations (ms) */
  duration: {
    /** Button hover, small UI feedback */
    micro: 150,
    /** Element transitions, reveals */
    fast: 350,
    /** Section transitions, modal open */
    base: 700,
    /** Complex animations, page transitions */
    slow: 1200,
    /** Cinematic moments, hero reveals */
    epic: 1800,
  },

  /** Easing functions (CSS cubic-bezier) */
  ease: {
    /** Standard easing for most transitions */
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    /** Decelerate for elements entering the screen */
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    /** Accelerate for elements leaving the screen */
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    /** Premium easing for cinematic moments */
    premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
    /** Sharp for quick, snappy interactions */
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },

  /** Stagger delays (ms) */
  stagger: {
    /** Tight stagger for small elements */
    micro: 30,
    /** Standard stagger for lists */
    base: 60,
    /** Relaxed stagger for cards */
    loose: 100,
    /** Dramatic stagger for headlines */
    cinematic: 150,
  },

  /** Spring physics presets (for Framer Motion or similar) */
  spring: {
    gentle: { stiffness: 100, damping: 15 },
    standard: { stiffness: 200, damping: 20 },
    stiff: { stiffness: 300, damping: 25 },
    bouncy: { stiffness: 400, damping: 10 },
  },
} as const;

export type Duration = keyof typeof MOTION.duration;
export type Ease = keyof typeof MOTION.ease;
export type Stagger = keyof typeof MOTION.stagger;
export type Spring = keyof typeof MOTION.spring;
