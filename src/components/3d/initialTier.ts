import { BREAKPOINTS } from '../../design/breakpoints';
import type { QualityTier } from './qualityContext';
import { REDUCED_MOTION_QUERY } from '../../hooks/usePrefersReducedMotion';

/**
 * Synchronous initial quality tier (FALHA-01).
 *
 * The first painted frame already carries the device's real cost (dpr, MSAA,
 * shadows), so the tier must be known during the first render — a
 * `useMediaQuery` initializer defaults to `false` and only syncs after the
 * mount effect, which let mobile devices start on `high` (dpr 1.75 + MSAA 4×)
 * for the entire first session on viewports that never resize.
 *
 * Mirrors docs/design/quality-matrix.md: reduced-motion → low, mobile
 * viewport → medium, desktop → high. The `useMediaQuery` hooks stay mounted
 * for reactive changes (resize, reduced-motion toggle).
 *
 * Client-only component; guards `typeof window` for tests and SSR.
 */
export function detectInitialTier(): QualityTier {
  if (typeof window === 'undefined') return 'high';
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return 'low';
  if (window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`).matches) {
    return 'medium';
  }
  return 'high';
}
