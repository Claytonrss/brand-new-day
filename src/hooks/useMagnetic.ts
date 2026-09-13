import { useEffect, useRef } from 'react';
import { MAGNET, magneticOffset } from '@/design/magnetic';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface MagneticOptions {
  radius?: number;
  strength?: number;
}

/**
 * useMagnetic — translate the element toward a fine pointer that comes within
 * `radius` (IDEIA-PAG-06).
 *
 * Transform-only (compositor), `pointer: fine` desktop only, and never armed
 * under `prefers-reduced-motion`. Scroll resets the pull so the label can
 * never drift away from its layout position. The easing comes from the
 * `.magnetic-cta` transition, not from a rAF loop.
 *
 * @see src/design/magnetic.ts
 */
export function useMagnetic<T extends HTMLElement>(options: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const reduceMotion = usePrefersReducedMotion();
  const finePointer = useMediaQuery('(pointer: fine)');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || !finePointer) return;

    const radius = options.radius ?? MAGNET.radius;
    const strength = options.strength ?? MAGNET.strength;
    let pulled = false;

    const rest = () => {
      if (!pulled) return;
      pulled = false;
      el.style.transform = '';
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      // Cheap reject before measuring the centre.
      if (
        event.clientX < rect.left - radius ||
        event.clientX > rect.right + radius ||
        event.clientY < rect.top - radius ||
        event.clientY > rect.bottom + radius
      ) {
        rest();
        return;
      }
      const offset = magneticOffset(
        event.clientX,
        event.clientY,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        radius,
        strength,
      );
      if (offset) {
        pulled = true;
        el.style.transform = `translate(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px)`;
      } else {
        rest();
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', rest, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', rest);
      rest();
    };
  }, [reduceMotion, finePointer, options.radius, options.strength]);

  return ref;
}
