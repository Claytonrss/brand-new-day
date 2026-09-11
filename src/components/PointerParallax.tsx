import { useMediaQuery } from '../hooks/useMediaQuery';
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
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  usePointerParallax(hasHover && !reduceMotion);

  return null;
}
