/**
 * Breakpoint constants shared across components.
 * @see docs/design/mobile-first.md
 */
export const BREAKPOINTS = {
  MOBILE: 768,
} as const;

/** The two camera/keyframe breakpoints (mobile-first — see cameraKeyframes). */
export type Breakpoint = 'mobile' | 'desktop';
