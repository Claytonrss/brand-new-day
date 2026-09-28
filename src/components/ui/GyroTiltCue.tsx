import { useEffect, useState, useSyncExternalStore } from 'react';
import { getGyroController } from '@/components/3d/interaction/gyroController';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** How long the tilt hint stays up before fading out of the story. */
export const GYRO_CUE_S = 6;

const CUE_SEEN_KEY = 'spiderman-landing:gyro-cue';

/**
 * GyroTiltCue — the one-shot Android discovery hint (ADR-031).
 *
 * On Android the sensor activates without a chip, so nothing tells the
 * visitor the scene listens to the phone's tilt. This micro-hint — same
 * voice as every other mono label — names the affordance once per session,
 * only where the sensor is actually live. Chip and cue are mutually
 * exclusive by state (`prompt` vs `granted`).
 *
 * @see docs/specs/mobile-gyro-sensor-polish.md §7.9
 */
export function GyroTiltCue() {
  const controller = getGyroController();
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState,
  );
  const reduceMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  const eligible = state === 'granted' && !reduceMotion;

  useEffect(() => {
    if (!eligible) return;
    if (sessionStorage.getItem(CUE_SEEN_KEY)) return;

    setVisible(true);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(CUE_SEEN_KEY, '1');
      setVisible(false);
    }, GYRO_CUE_S * 1000);
    return () => window.clearTimeout(timer);
  }, [eligible]);

  if (!visible) return null;

  return (
    <p
      aria-hidden="true"
      data-testid="gyro-tilt-cue"
      className="gyro-chip-enter absolute bottom-20 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.24em] text-dim"
    >
      incline o aparelho
    </p>
  );
}
