import { useEffect, useRef } from 'react';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** Max ARIA update rate — screen readers don't need 60 Hz (FALHA-05). */
const ARIA_INTERVAL_MS = 200;

/**
 * ProgressBar — fixed scroll progress indicator.
 *
 * Thin 1px vertical bar on the right edge of the viewport, filled with signal
 * color (#c23b34). Scroll events only mark a frame dirty; the single write
 * per rAF is `transform: scaleY()` (compositor-only, no layout thrash), with
 * the document height cached and refreshed on resize (FALHA-05). Visual
 * parity with the previous `height`-driven bar is exact.
 *
 * Accessible: role="progressbar" with ARIA value attributes updated at ≤ 5 Hz.
 * Respects `prefers-reduced-motion` — disables transition duration.
 *
 * @see docs/design/design-bible.md
 */
export function ProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    let docHeight = 1;
    let rafId = 0;
    let dirty = false;
    let lastAria = 0;

    const measure = () => {
      docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
    };

    const write = () => {
      rafId = 0;
      if (!dirty) return;
      dirty = false;

      const progress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
      fill.style.transform = `scaleY(${progress})`;

      const now = performance.now();
      if (now - lastAria >= ARIA_INTERVAL_MS) {
        lastAria = now;
        const percent = Math.round(progress * 100);
        fill.setAttribute('aria-valuenow', String(percent));
        fill.setAttribute('aria-label', `Progresso: ${percent}%`);
      }
    };

    const schedule = () => {
      dirty = true;
      if (!rafId) rafId = requestAnimationFrame(write);
    };

    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    schedule(); // initial paint
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const transitionDuration = prefersReducedMotion ? 0 : MOTION.duration.micro;

  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-1 bg-concrete/20">
      <div
        ref={fillRef}
        className="h-full w-full origin-top bg-signal"
        role="progressbar"
        aria-label="Progresso: 0%"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          transform: 'scaleY(0)',
          transitionProperty: 'transform',
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: MOTION.ease.decelerate,
        }}
      />
    </div>
  );
}
