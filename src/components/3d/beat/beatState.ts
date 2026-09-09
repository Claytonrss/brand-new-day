import type { BeatId } from './beats';

/**
 * Beat runtime state.
 *
 * `progress` and `t` are normalized (0-1). `velocity` is scroll progress per
 * second (positive scrolling down, negative scrolling up) — groundwork for
 * Wave B (FOV punch / dolly lag). No consumer in Wave F.
 */
export interface BeatState {
  /** Global scroll progress of the whole page (0-1) */
  progress: number;
  /** Local progress inside the current beat (0-1) */
  t: number;
  /** Scroll velocity in progress-units per second */
  velocity: number;
  beat: BeatId;
}

export const INITIAL_BEAT_STATE: BeatState = {
  progress: 0,
  t: 0,
  velocity: 0,
  beat: 'hero',
};
