import { useMediaQuery } from './useMediaQuery';

/**
 * The `prefers-reduced-motion` media query, shared verbatim by every motion
 * kill-switch in the app (was repeated as a literal in ~20 components).
 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Reactive `prefers-reduced-motion: reduce` — the global motion kill-switch. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
