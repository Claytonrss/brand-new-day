/**
 * Blink scheduler — pure logic so the cadence and the closure curve can be
 * unit tested without a renderer.
 *
 * The asset has no eyelids: the mask lenses close to a slit, which reads as a
 * blink. `?blink=off|subtle|full` picks the intensity; reduced motion disables
 * it entirely.
 */

export type BlinkMode = 'off' | 'subtle' | 'full';

function readMode(): BlinkMode {
  if (typeof window === 'undefined') return 'subtle';
  const value = new URLSearchParams(window.location.search).get('blink');
  return value === 'off' || value === 'full' ? value : 'subtle';
}

export const BLINK_MODE: BlinkMode = readMode();

/** Peak closure per mode (0 = never closes). */
export const BLINK_AMOUNT: Record<BlinkMode, number> = {
  off: 0,
  subtle: 0.7,
  full: 1,
};

/** Cadence, in seconds between blinks (inclusive range). */
export const BLINK_INTERVAL = { min: 2.6, max: 7.2 } as const;

/** How long a single blink takes, in seconds. */
export const BLINK_DURATION = 0.18;

/** Deterministic pseudo-random in [0, 1) from a seed. */
export function rand(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Next blink time given the current time and a seed. */
export function nextBlinkAt(now: number, seed: number): number {
  return now + BLINK_INTERVAL.min + rand(seed) * (BLINK_INTERVAL.max - BLINK_INTERVAL.min);
}

/**
 * Closure amount (0..1) for a blink that started at `start`.
 *
 * Fast close, faster open — the asymmetry is what makes it read as a blink
 * instead of a fade.
 */
export function blinkClosure(elapsed: number, amount = 1): number {
  if (elapsed < 0 || elapsed > BLINK_DURATION) return 0;

  const t = elapsed / BLINK_DURATION;
  const curve = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55;
  return Math.max(0, Math.min(1, curve)) * amount;
}
