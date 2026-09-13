import { useEffect } from 'react';
import { beatRuntime } from '../3d/beat/beatState';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { VELOCITY_TYPE, velocityWeight } from '../../design/velocityType';

/** Without scroll events for this long the page counts as at rest. */
const IDLE_MS = 300;
/** Fraction of the remaining gap covered per frame while easing. */
const EASE_PER_FRAME = 0.25;

/**
 * VelocityType — publishes `--type-wght` on the root for `.velocity-type`
 * headlines (IDEIA-PAG-01).
 *
 * The live target is the quantized `beatRuntime.velocity` weight; after
 * `IDLE_MS` without scroll events the target is the poster rest (700) and the
 * written weight eases home. Idle time — not the velocity value — is the
 * authoritative rest signal: ScrollTrigger's velocity decay is not guaranteed
 * to reach zero after the last event, and a stale thin weight would leave
 * every headline thinned after the first scroll.
 *
 * The rAF loop exits at rest (zero cost while idle) and restarts on the next
 * scroll event. Never arms under `prefers-reduced-motion`.
 *
 * @see src/design/velocityType.ts
 */
export function VelocityType() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    let rafId = 0;
    let weight: number = VELOCITY_TYPE.BASE;
    let lastWritten = weight;
    let lastScrollAt = -Infinity;

    const write = () => {
      rafId = 0;
      const idle = performance.now() - lastScrollAt > IDLE_MS;
      const target = idle ? VELOCITY_TYPE.BASE : velocityWeight(beatRuntime.velocity);

      const diff = target - weight;
      if (Math.abs(diff) <= VELOCITY_TYPE.STEP) weight = target;
      else weight += diff * EASE_PER_FRAME;

      if (weight !== lastWritten) {
        lastWritten = weight;
        root.style.setProperty(VELOCITY_TYPE.CSS_VAR, String(weight));
      }

      // Keep easing while a scroll is live or while the weight settles home.
      if (!idle || weight !== VELOCITY_TYPE.BASE) {
        rafId = requestAnimationFrame(write);
      }
    };

    const schedule = () => {
      lastScrollAt = performance.now();
      if (!rafId) rafId = requestAnimationFrame(write);
    };

    schedule(); // initial paint publishes the rest weight
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      if (rafId) cancelAnimationFrame(rafId);
      root.style.removeProperty(VELOCITY_TYPE.CSS_VAR);
    };
  }, [prefersReducedMotion]);

  return null;
}
