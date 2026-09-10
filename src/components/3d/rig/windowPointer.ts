import { useEffect } from 'react';

/**
 * Window-level pointer tracking, normalized to [-1, 1].
 *
 * Lives outside the canvas on purpose: the Canvas is `pointer-events: none`
 * (the scroll storytelling needs the HTML sections above it), so canvas-scoped
 * pointer events never fire.
 */
export const windowPointer = { x: 0, y: 0 };

export function useWindowPointer(): void {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      windowPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      windowPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);
}
