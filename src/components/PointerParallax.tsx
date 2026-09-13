import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { usePointerParallax } from '../hooks/usePointerParallax';

/**
 * PointerParallax — enables desktop pointer parallax only where it belongs.
 *
 * Desktop with hover and without `prefers-reduced-motion`; mobile uses the
 * gyroscope instead (P2b.2).
 *
 * @see docs/specs/desktop-pointer-parallax.md §4
 */
export function PointerParallax() {
  const hasHover = useMediaQuery('(hover: hover)');
  const reduceMotion = usePrefersReducedMotion();

  usePointerParallax(hasHover && !reduceMotion);

  return null;
}
