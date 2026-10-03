import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getGyroController } from '@/components/3d/interaction/gyroController';
import type { BeatId } from '@/components/3d/beat/beats';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Seconds of accumulated on-screen time before an ignored chip backs off. */
export const CHIP_PATIENCE_S = 15;

/** Reads `data-beat` off `<main>` — the same channel `BeatStamp` uses, so
 * components outside the canvas track the narrative without touching it. */
function useCurrentBeat(): BeatId {
  const [beat, setBeat] = useState<BeatId>('hero');
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const initial = main.getAttribute('data-beat') as BeatId | null;
    if (initial) setBeat(initial);
    const observer = new MutationObserver(() => {
      const next = main.getAttribute('data-beat') as BeatId | null;
      if (next) setBeat(next);
    });
    observer.observe(main, { attributes: true, attributeFilter: ['data-beat'] });
    return () => observer.disconnect();
  }, []);
  return beat;
}

/**
 * GyroPrompt — the motion-permission chip (ADR-018, reworked in ADR-031).
 *
 * Appears in the hero beat — the moment the scene actually introduces itself —
 * not on an arbitrary first gesture. Ignoring it costs one dismissal from a
 * budget of three across visits (the chip comes back); tapping "não" or
 * denying the OS prompt is what closes the topic for good. Tapping "ativar"
 * calls the permission request from the gesture (required by Safari). A
 * returning visitor with a stored grant is re-requested silently on the
 * first gesture — no chip.
 *
 * @see docs/specs/mobile-gyro-permission.md §4 (git history)
 * @see docs/specs/mobile-gyro-sensor-polish.md §7.6
 */
export function GyroPrompt() {
  const controller = getGyroController();
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState,
  );
  const reduceMotion = usePrefersReducedMotion();
  const beat = useCurrentBeat();

  const [dismissed, setDismissed] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const patienceRef = useRef(0);

  // Stored grant: no chip, but the sensor needs one gesture of the session
  // to re-request (usually silent on Safari).
  useEffect(() => {
    if (state !== 'prompt') return;

    const onGesture = () => {
      if (!controller.needsChip() && !controller.isAttached()) {
        void controller.request();
      }
    };

    const options = { once: true } as const;
    window.addEventListener('pointerdown', onGesture, options);
    window.addEventListener('touchstart', onGesture, options);
    window.addEventListener('wheel', onGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('touchstart', onGesture);
      window.removeEventListener('wheel', onGesture);
    };
  }, [controller, state]);

  const visible =
    state === 'prompt' && !reduceMotion && beat === 'hero' && !dismissed && controller.needsChip();

  // Patience accumulates only while the chip is actually seen: hero in view,
  // chip on screen, tab visible. Leaving the hero costs nothing — the count
  // survives and resumes when the visitor returns (same session).
  useEffect(() => {
    if (!visible) return;
    const chip = chipRef.current;
    if (!chip) return;

    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
    });
    observer.observe(chip);

    const id = window.setInterval(() => {
      if (!inViewRef.current || document.hidden) return;
      patienceRef.current += 1;
      if (patienceRef.current >= CHIP_PATIENCE_S) {
        setDismissed(true);
        controller.dismiss();
      }
    }, 1000);

    return () => {
      observer.disconnect();
      window.clearInterval(id);
    };
  }, [visible, controller]);

  const activate = useCallback(() => {
    setDismissed(true);
    void controller.request();
  }, [controller]);

  const decline = useCallback(() => {
    setDismissed(true);
    controller.decline();
  }, [controller]);

  if (!visible) return null;

  return (
    <div
      ref={chipRef}
      role="status"
      aria-live="polite"
      data-testid="gyro-prompt"
      className="gyro-chip-enter beat-accent-border-soft fixed bottom-20 left-1/2 z-30 flex w-[82vw] max-w-[320px] -translate-x-1/2 items-center justify-between gap-3 rounded-full border bg-concrete/90 px-4 py-2.5 backdrop-blur-sm"
    >
      <p className="font-mono text-[12px] uppercase leading-tight tracking-[0.14em] text-paper/80">
        Esta cena reage ao movimento.
      </p>
      <span className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={activate}
          className="font-mono text-[12px] uppercase tracking-[0.16em] text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:text-paper"
        >
          ativar
        </button>
        <button
          type="button"
          onClick={decline}
          aria-label="Não ativar o sensor de movimento"
          className="font-mono text-[12px] uppercase tracking-[0.16em] text-dim underline decoration-dim/40 underline-offset-4 transition-colors hover:text-paper"
        >
          não
        </button>
      </span>
    </div>
  );
}
