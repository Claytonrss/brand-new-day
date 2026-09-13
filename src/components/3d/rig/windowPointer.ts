import { useEffect } from 'react';

/**
 * Window-level pointer tracking, normalized to [-1, 1] (+1 = right / top).
 *
 * Lives outside the canvas on purpose: the Canvas is `pointer-events: none`
 * (the scroll storytelling needs the HTML sections above it), so canvas-scoped
 * pointer events never fire.
 *
 * Single publisher: every consumer reads `windowPointer` directly instead of
 * attaching its own `pointermove` listener. Mounts are ref-counted so any
 * number of components can enable it — the listener lives while at least one
 * is mounted.
 */
export const windowPointer = { x: 0, y: 0 };

let refCount = 0;

function handleMove(e: PointerEvent): void {
  windowPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  windowPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

export function useWindowPointer(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (refCount++ === 0) {
      window.addEventListener('pointermove', handleMove, { passive: true });
    }
    return () => {
      if (--refCount === 0) {
        window.removeEventListener('pointermove', handleMove);
      }
    };
  }, []);
}
