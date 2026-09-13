import type { BeatId } from '../beat/beats';

/**
 * Spider-sense envelope — IDEIA-3D-10 (docs/specs/spider-sense.md §1).
 *
 * Every time the narrative beat changes (`beatRuntime.beat`, ~6× per full
 * scroll) the model "feels" the transition: the rim light spikes to 3× and
 * the head gives a micro-tilt, decaying fast (~200ms) — the shiver of a
 * boundary being crossed. Pure module stepped once per frame by the rig; the
 * `rim` light slot reads the multiplier.
 */

export const SPIDER_SENSE = {
  /** Rim multiplier headroom — rim intensity ×(1 + RIM_BOOST·envelope). */
  RIM_BOOST: 2,
  /** Exponential decay rate (1/s). At 60fps the spike is ~2-3 bright frames. */
  DECAY_K: 9,
  /** Below this the envelope is snapped to 0 so the light work stops. */
  EPSILON: 0.01,
  /** Head roll at the spike (rad, ~2°) — ear toward the shoulder. */
  TILT: 0.035,
} as const;

export interface SpiderSenseState {
  envelope: number;
  beat: BeatId | null;
  /** First step only arms the tracker — mounting never shivers. */
  started: boolean;
  /** Alternates on every trigger so consecutive boundaries tick opposite ways. */
  sign: 1 | -1;
}

export const spiderSense: SpiderSenseState = {
  envelope: 0,
  beat: null,
  started: false,
  sign: 1,
};

/** Advance the envelope for this frame; returns it (0..1). */
export function spiderSenseStep(delta: number, beat: BeatId): number {
  let triggered = false;
  if (!spiderSense.started) {
    spiderSense.started = true;
    spiderSense.beat = beat;
  } else if (beat !== spiderSense.beat) {
    spiderSense.beat = beat;
    spiderSense.envelope = 1;
    spiderSense.sign = spiderSense.sign === 1 ? -1 : 1;
    triggered = true;
  }

  // The trigger frame delivers the full spike; decay starts on the next one.
  if (!triggered && spiderSense.envelope > 0) {
    spiderSense.envelope *= Math.exp(-SPIDER_SENSE.DECAY_K * delta);
    if (spiderSense.envelope < SPIDER_SENSE.EPSILON) spiderSense.envelope = 0;
  }
  return spiderSense.envelope;
}

/** Rim intensity multiplier for the `rim` light slot (1 → 1 + RIM_BOOST). */
export function spiderSenseRim(): number {
  return 1 + SPIDER_SENSE.RIM_BOOST * spiderSense.envelope;
}

/** Head roll offset (rad) for this frame — head leads, neck follows in the rig. */
export function spiderSenseTilt(): number {
  return spiderSense.sign * SPIDER_SENSE.TILT * spiderSense.envelope;
}

export function spiderSenseResetForTest(): void {
  spiderSense.envelope = 0;
  spiderSense.beat = null;
  spiderSense.started = false;
  spiderSense.sign = 1;
}
