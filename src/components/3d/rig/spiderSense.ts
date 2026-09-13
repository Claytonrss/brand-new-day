import { BEAT_TIMELINE, type BeatId } from '@/components/3d/beat/beats';

/**
 * Spider-sense — IDEIA-3D-10, redesigned 2026-09-13
 * (docs/specs/spider-sense.md).
 *
 * The first cut was a ×3 rim flash on every beat boundary: it read as "glow
 * around the head" (indistinguishable from the hero's own rim/atmosphere)
 * and fired on the very first scroll. The redesign gives the sense its comic
 * iconography and trigger discipline:
 *
 * - fires only when the narrative ARRIVES at a danger beat (evolution,
 *   arsenal, fullBody) — never in the hero/opening, never on transition
 *   cards. The first fire happens at 37.5% of the scroll, after the page has
 *   earned it;
 * - arrival means scrolling FORWARD into the beat (§3 direction gate).
 *   Flipping back into one — chapter2→evolution sits exactly under the
 *   REVELAÇÃO card that covers the viewport — re-arms silently instead of
 *   firing behind the card; scroll away and return forward to hear it again;
 * - once per arrival;
 * - the envelope lives ~500ms — long enough to read as an event, short
 *   enough to stay discreet.
 *
 * The body answers with the alert expression: the head snaps toward the
 * camera (rig), the lenses flare (`uLensPulse`) and the breath catches
 * (breath.ts). The DOM halo (`SpiderSense.tsx`) draws the iconography.
 * Pure module; stepped once per frame by the rig BEFORE its early returns
 * so it decays even in statue/reduced-motion.
 */

export const SPIDER_SENSE = {
  /** Beats whose ENTRY fires the sense — the three danger framings. */
  DANGER_BEATS: ['evolution', 'arsenal', 'fullBody'] as const,
  /** Exponential decay (1/s): envelope ≈ 0.1 at ~500ms. */
  DECAY_K: 4.6,
  /** Below this the envelope snaps to zero. */
  EPSILON: 0.01,
  /** Head roll at the spike (rad) — the alert tilt, alternating sides. */
  TILT: 0.022,
  /** Lens flare added on top of the beat's uLensPulse target. */
  LENS_BOOST: 0.9,
  /** Fraction of the breath amplitude suppressed at the spike (catch). */
  BREATH_CATCH: 0.9,
} as const;

const DANGER = new Set<BeatId>(SPIDER_SENSE.DANGER_BEATS);

export function isDangerBeat(beat: BeatId): boolean {
  return DANGER.has(beat);
}

/**
 * A forward entry lands on a beat LATER in the timeline than the one being
 * left — the story arriving. Flipping back into an earlier beat is a re-read
 * and never an arrival. Indexes always exist: both ids come from the
 * timeline itself.
 */
function isForwardEntry(previous: BeatId, next: BeatId): boolean {
  const from = BEAT_TIMELINE.findIndex((b) => b.id === previous);
  const to = BEAT_TIMELINE.findIndex((b) => b.id === next);
  return to > from;
}

export interface SpiderSenseState {
  envelope: number;
  beat: BeatId | null;
  /** First step only arms the tracker — mounting never fires. */
  started: boolean;
  /** Alternates on every trigger so consecutive fires tilt opposite ways. */
  sign: 1 | -1;
  /** How many times it fired — robust signal for tests and evidence. */
  count: number;
}

export const spiderSense: SpiderSenseState = {
  envelope: 0,
  beat: null,
  started: false,
  sign: 1,
  count: 0,
};

/**
 * Advance the envelope for this frame; returns it (0..1).
 *
 * `velocity` is the normalized scroll velocity (progress/s, positive down)
 * from `beatRuntime` — the direction gate reads its SIGN only. A fire
 * requires scrolling forward into a danger beat: scroll-up re-entries fire
 * behind the chapter card covering the boundary, and a velocity-0 beat flip
 * is layout jitter (ScrollTrigger refresh), not reader intent.
 */
export function spiderSenseStep(delta: number, beat: BeatId, velocity: number): number {
  let triggered = false;
  if (!spiderSense.started) {
    spiderSense.started = true;
    spiderSense.beat = beat;
  } else if (beat !== spiderSense.beat) {
    const previous = spiderSense.beat;
    spiderSense.beat = beat;
    if (previous !== null && DANGER.has(beat) && velocity > 0 && isForwardEntry(previous, beat)) {
      spiderSense.envelope = 1;
      spiderSense.sign = spiderSense.sign === 1 ? -1 : 1;
      spiderSense.count += 1;
      triggered = true;
    }
  }

  // The trigger frame delivers the full spike; decay starts on the next one.
  if (!triggered && spiderSense.envelope > 0) {
    spiderSense.envelope *= Math.exp(-SPIDER_SENSE.DECAY_K * delta);
    if (spiderSense.envelope < SPIDER_SENSE.EPSILON) spiderSense.envelope = 0;
  }
  return spiderSense.envelope;
}

/** Head roll offset (rad) — the alert tilt on top of the head-chain pose. */
export function spiderSenseTilt(): number {
  return spiderSense.sign * SPIDER_SENSE.TILT * spiderSense.envelope;
}

export function spiderSenseResetForTest(): void {
  spiderSense.envelope = 0;
  spiderSense.beat = null;
  spiderSense.started = false;
  spiderSense.sign = 1;
  spiderSense.count = 0;
}
