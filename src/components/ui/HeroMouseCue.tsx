import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { LANDING_SETTLE_EPS, landing } from '@/components/3d/landing';
import {
  HERO_CUE,
  HERO_CUE_POINTER_EPS_PX,
  HERO_CUE_SCROLL,
  canSchedule,
  createHeroCueStorage,
  createPointerMovementDetector,
  createScrollTracker,
} from '@/design/heroCue';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type HeroCuePhase = 'armed' | 'scheduled' | 'active' | 'done';

/**
 * HeroMouseCue — the ambient light ping near the lenses that invites a first
 * cursor move (docs/specs/hero-mouse-cue.md).
 *
 * The head tracking only reveals itself to whoever moves the mouse; a wheel-only
 * visitor never meets it. One faint glow dot, one horizontal drift, one chance
 * per session — if it reads as a UI hint, it failed.
 *
 * Cost follows the SpiderSense pattern: a 150ms watcher while idle, listeners
 * only while the cue is pending, GSAP on transform/opacity of a single hidden
 * element (compositor-only, zero layout). Never armed on touch-primary devices
 * or under reduced motion. The phase is mirrored on <html data-hero-cue> for
 * E2E assertions and device debugging — never for pixels.
 */
export function HeroMouseCue() {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useMediaQuery('(pointer: fine)');
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!finePointer || reducedMotion) return;
    const dot = dotRef.current;
    if (!dot) return;

    const storage = createHeroCueStorage();
    const root = document.documentElement;
    const pointer = createPointerMovementDetector(HERO_CUE_POINTER_EPS_PX);
    const scrollTracker = createScrollTracker();
    let phase: HeroCuePhase = 'armed';
    let pollId = 0;
    let delayId = 0;
    let tl: ReturnType<typeof gsap.timeline> | null = null;

    const setPhase = (next: HeroCuePhase) => {
      phase = next;
      root.dataset.heroCue = next;
    };

    const hideDot = () => {
      gsap.killTweensOf(dot);
      dot.style.visibility = 'hidden';
      dot.style.opacity = '0';
    };

    /** Tear the whole watcher down; `fade` keeps a visible dot alive briefly. */
    const finish = (markShown = false, fade = false) => {
      if (phase === 'done') return;
      if (markShown) storage.markShown();
      setPhase('done');
      window.clearInterval(pollId);
      window.clearTimeout(delayId);
      detach();
      if (fade) {
        tl?.kill();
        gsap.to(dot, {
          opacity: 0,
          duration: HERO_CUE.cancelFadeMs / 1000,
          ease: 'sine.out',
          onComplete: hideDot,
        });
      } else {
        hideDot();
      }
    };

    const activate = () => {
      if (phase !== 'scheduled') return;
      setPhase('active');
      storage.markShown();
      dot.style.visibility = 'visible';
      tl = gsap.timeline({ onComplete: () => finish() });
      tl.fromTo(
        dot,
        { opacity: 0 },
        { opacity: HERO_CUE.peakOpacity, duration: HERO_CUE.fadeInMs / 1000, ease: 'sine.inOut' },
      );
      tl.to(
        dot,
        { x: HERO_CUE.driftPx, duration: HERO_CUE.driftMs / 1000, ease: 'power2.inOut' },
        HERO_CUE.driftStartMs / 1000,
      );
      tl.to(
        dot,
        { opacity: 0, duration: HERO_CUE.fadeOutMs / 1000, ease: 'sine.inOut' },
        (HERO_CUE.driftStartMs + HERO_CUE.driftMs - HERO_CUE.driftFadeOverlapMs) / 1000,
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      // The discovery already happened — the cue's job is done, for good.
      if (pointer.move(event.clientX, event.clientY)) finish(true, phase === 'active');
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (scrollTracker.moved(y)) {
        if (phase === 'active') {
          finish(true, true);
        } else if (phase === 'scheduled') {
          const inWindow =
            y >= window.innerHeight * HERO_CUE_SCROLL.windowStartVh &&
            y <= window.innerHeight * HERO_CUE_SCROLL.windowEndVh;
          if (inWindow) {
            // Still settling into the hero (Lenis momentum): defer, don't kill.
            scrollTracker.rebase(y);
            window.clearTimeout(delayId);
            delayId = window.setTimeout(activate, HERO_CUE.cueDelayMs);
          } else {
            finish();
          }
        }
      }
    };

    const onTouchStart = () => finish(phase === 'active');

    const attach = () => {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
    };
    const detach = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
    };

    if (storage.wasShown()) {
      setPhase('done');
      return;
    }

    const poll = () => {
      if (phase !== 'armed') return;
      const settled =
        landing.fired &&
        Math.abs(landing.spring.value) < LANDING_SETTLE_EPS &&
        Math.abs(landing.spring.velocity) < LANDING_SETTLE_EPS;
      if (
        !canSchedule({
          finePointer: true,
          reducedMotion: false,
          shownThisSession: storage.wasShown(),
          landingFired: landing.fired,
          landingSettled: settled,
          scrollY: window.scrollY,
          viewportHeight: window.innerHeight,
        })
      ) {
        return;
      }
      setPhase('scheduled');
      window.clearInterval(pollId);
      scrollTracker.rebase(window.scrollY);
      delayId = window.setTimeout(activate, HERO_CUE.cueDelayMs);
    };

    attach();
    setPhase('armed');
    pollId = window.setInterval(poll, HERO_CUE.settlePollMs);

    return () => {
      window.clearInterval(pollId);
      window.clearTimeout(delayId);
      detach();
      tl?.kill();
      gsap.killTweensOf(dot);
      delete root.dataset.heroCue;
    };
  }, [finePointer, reducedMotion]);

  if (!finePointer || reducedMotion) return null;

  return (
    <div
      ref={dotRef}
      data-hero-cue-dot
      aria-hidden="true"
      className="hero-cue pointer-events-none fixed z-20"
    />
  );
}
