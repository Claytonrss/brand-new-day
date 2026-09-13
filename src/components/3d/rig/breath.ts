import type { BeatId } from '../beat/beats';

/**
 * Beat-directed breathing — IDEIA-3D-09 (docs/specs/spider-sense.md §2).
 *
 * The rig used to breathe at a constant 0.25 Hz. Now the breath is directed:
 * held and shallow in the hero (the mask watches you), slow and deep in
 * fullBody (the poster exhales). Rate and amplitude ease toward the beat
 * target and the phase is **integrated**, never recomputed — so a rate change
 * can never jump the chest.
 */

export const BREATH_BEATS: Record<BeatId, { rate: number; amp: number }> = {
  hero: { rate: 0.18, amp: 0.7 },
  chapter1: { rate: 0.25, amp: 1 },
  evolution: { rate: 0.28, amp: 1.1 },
  chapter2: { rate: 0.25, amp: 1 },
  arsenal: { rate: 0.22, amp: 0.9 },
  fullBody: { rate: 0.14, amp: 1.3 },
  colophon: { rate: 0.12, amp: 1 },
};

/** Rate/amplitude easing (exponential, frame-rate independent). */
export const BREATH_SMOOTH_K = 3;

export interface BreathState {
  /** Integrated phase (rad) — advance-only, never derived from wall time. */
  phase: number;
  rate: number;
  amp: number;
}

export const breathRuntime: BreathState = {
  phase: 0,
  rate: BREATH_BEATS.hero.rate,
  amp: BREATH_BEATS.hero.amp,
};

/** Advance one frame; returns the breath sample (−amp..amp) for the spine. */
export function breathStep(delta: number, beat: BeatId): number {
  const target = BREATH_BEATS[beat];
  const alpha = 1 - Math.exp(-BREATH_SMOOTH_K * delta);
  breathRuntime.rate += (target.rate - breathRuntime.rate) * alpha;
  breathRuntime.amp += (target.amp - breathRuntime.amp) * alpha;
  breathRuntime.phase += delta * Math.PI * 2 * breathRuntime.rate;
  return Math.sin(breathRuntime.phase) * breathRuntime.amp;
}

export function breathResetForTest(): void {
  breathRuntime.phase = 0;
  breathRuntime.rate = BREATH_BEATS.hero.rate;
  breathRuntime.amp = BREATH_BEATS.hero.amp;
}
