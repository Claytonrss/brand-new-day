import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { loaderCover } from '../ui/loaderCover';
import { landingFire, landingSnap } from './landing';

gsap.registerPlugin(ScrollTrigger);

/**
 * LandingTrigger — arms "a chegada" (docs/specs/arrival-landing.md).
 *
 * Fires the landing exactly once, on the first pixel of scroll (the Hero
 * section's top touching the viewport bottom) — the model drops while the
 * opening card lifts. Edges:
 *
 * - never fires behind an opaque cover: arming waits for the loader to lift;
 * - hero already in view at that moment (scroll restoration / anchor):
 *   fires immediately;
 * - `prefers-reduced-motion`: never arms — the statue design keeps the model
 *   at rest from the first frame.
 */
export function LandingTrigger() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion) return;

    let armed = false;
    let trigger: ScrollTrigger | null = null;
    let timer = 0;

    const arm = () => {
      if (armed || loaderCover.covering) return;
      const hero = document.querySelector<HTMLElement>('main section[aria-label="Hero"]');
      if (!hero) return;
      armed = true;
      window.clearInterval(timer);

      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) {
        // Deep scroll restoration: the landing "happened in the past" — snap
        // the model to rest with no animation.
        landingSnap();
        return;
      }
      if (window.scrollY > 1 && rect.top < window.innerHeight) {
        // Hero already in view as the cover lifts (anchor/restoration): the
        // reveal IS the landing — fire now.
        landingFire();
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top bottom',
        once: true,
        onEnter: () => landingFire(),
      });
    };

    arm();
    timer = window.setInterval(arm, 250);

    return () => {
      window.clearInterval(timer);
      trigger?.kill();
    };
  }, [prefersReducedMotion]);

  return null;
}
