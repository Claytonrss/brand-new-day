import { useEffect } from 'react';
import { useWindowPointer, windowPointer } from '@/components/3d/rig/windowPointer';

/**
 * Publishes a smoothed pointer offset as CSS custom properties on the root
 * element (`--pointer-x`, `--pointer-y`, both -1..1, +1 = right / bottom).
 *
 * Reads the shared `windowPointer` publisher (one `pointermove` listener for
 * the whole app) and mirrors it into CSS in one rAF loop, no React re-renders.
 * The DOM overlays consume them through the `.parallax-*` utility classes
 * (index.css); the 3D camera reads `windowPointer` directly.
 *
 * Note the Y convention flip: `windowPointer.y` is +1 at the top (3D), the
 * CSS var is +1 at the bottom (screen space).
 *
 * @see docs/specs/desktop-pointer-parallax.md
 */
export function usePointerParallax(enabled: boolean): void {
  useWindowPointer();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const root = document.documentElement;
    let raf = 0;
    const current = { x: 0, y: 0 };

    const tick = () => {
      // Generous smoothing so the parallax settles instead of jittering.
      current.x += (windowPointer.x - current.x) * 0.06;
      current.y += (-windowPointer.y - current.y) * 0.06;
      root.style.setProperty('--pointer-x', current.x.toFixed(4));
      root.style.setProperty('--pointer-y', current.y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty('--pointer-x');
      root.style.removeProperty('--pointer-y');
    };
  }, [enabled]);
}
