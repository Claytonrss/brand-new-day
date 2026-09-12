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

/**
 * Module-level runtime state — the same object `BeatProvider` publishes via
 * `stateRef`, readable from outside the React tree.
 *
 * Exists because `PerformanceMonitor` sits outside `BeatProvider` (canvas
 * boilerplate) and needs `velocity` for the idle-gate on tier changes
 * (FALHA-09). Mutable per-frame state: read it in ticks and `useFrame`;
 * never drive renders from it.
 */
export const beatRuntime: BeatState = { ...INITIAL_BEAT_STATE };
