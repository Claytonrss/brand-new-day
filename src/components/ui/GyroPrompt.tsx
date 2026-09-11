import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { getGyroController } from '../3d/interaction/gyroController';

/**
 * GyroPrompt — the discreet iOS motion-permission chip.
 *
 * Appears only after the first gesture, only on iOS (where
 * `requestPermission` exists), and only for a first-time visitor. Tapping
 * "ativar" calls the permission request from the gesture (required by Safari);
 * ignoring it dismisses and falls back to scroll. A returning visitor with a
 * stored grant is re-requested silently on the first gesture — no chip.
 *
 * @see docs/specs/mobile-gyro-permission.md §4
 * @see docs/memory/decisions.md (ADR-018)
 */
export function GyroPrompt() {
  const controller = getGyroController();
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState,
  );

  const [gestureSeen, setGestureSeen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // First user gesture: reveal the chip, or silently re-request a stored grant.
  useEffect(() => {
    if (state !== 'prompt') return;

    const onGesture = () => {
      setGestureSeen(true);
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

  // Ignored chips recede on their own.
  useEffect(() => {
    if (state !== 'prompt' || !gestureSeen || !controller.needsChip()) return;
    const timer = window.setTimeout(() => controller.dismiss(), 9000);
    return () => window.clearTimeout(timer);
  }, [controller, gestureSeen, state]);

  const activate = useCallback(() => {
    setDismissed(true);
    void controller.request();
  }, [controller]);

  const visible =
    state === 'prompt' && gestureSeen && !dismissed && controller.needsChip();

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-30 flex w-[82vw] max-w-[320px] -translate-x-1/2 items-center justify-between gap-4 rounded-full border border-paper/15 bg-concrete/90 px-4 py-2 backdrop-blur-sm"
    >
      <p className="font-mono text-[10px] uppercase leading-tight tracking-[0.16em] text-paper/80">
        Esta cena reage ao movimento.
      </p>
      <button
        type="button"
        onClick={activate}
        className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:text-paper"
      >
        ativar
      </button>
    </div>
  );
}
