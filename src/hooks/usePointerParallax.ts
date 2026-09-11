import { useEffect } from 'react';

/**
 * Publishes a smoothed pointer offset as CSS custom properties on the root
 * element (`--pointer-x`, `--pointer-y`, both -1..1).
 *
 * The DOM overlays consume them through the `.parallax-*` utility classes
 * (index.css); the 3D camera reads `windowPointer` directly. One listener,
 * one rAF loop, no React re-renders.
 *
 * @see docs/specs/desktop-pointer-parallax.md
 */
export function usePointerParallax(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const root = document.documentElement;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      // Generous smoothing so the parallax settles instead of jittering.
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      root.style.setProperty('--pointer-x', current.x.toFixed(4));
      root.style.setProperty('--pointer-y', current.y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      root.style.removeProperty('--pointer-x');
      root.style.removeProperty('--pointer-y');
    };
  }, [enabled]);
}
