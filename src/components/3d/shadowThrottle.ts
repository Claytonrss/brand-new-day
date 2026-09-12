import type { BeatId } from './beat/beats';

/** Shadow map refresh cadence on the throttled (medium) tier — 10 Hz. */
export const SHADOW_INTERVAL_S = 1 / 10;

/** Pose delta (rad) above which the shadow refreshes immediately. */
export const SHADOW_MOVE_EPSILON = 0.001;

/** Scroll velocity below which a fling counts as finished (tier idle-gate value). */
export const SHADOW_IDLE_VELOCITY = 0.02;

/** Mutable per-frame bookkeeping for `shouldRefreshShadow`. */
export interface ShadowThrottleState {
  sinceRefresh: number;
  beat: BeatId;
  dragging: boolean;
  yaw: number;
  pitch: number;
  velocity: number;
}

export function createShadowThrottleState(beat: BeatId): ShadowThrottleState {
  return { sinceRefresh: 0, beat, dragging: false, yaw: 0, pitch: 0, velocity: 0 };
}

export interface ShadowInputs {
  beat: BeatId;
  dragging: boolean;
  /** Drag/gyro rotation offset — the pose the shadow must follow. */
  yaw: number;
  pitch: number;
  velocity: number;
}

/**
 * FALHA-04 — decides whether the shadow map must refresh on this frame.
 *
 * The character is a near-static subject, so on the throttled tier the shadow
 * pass does not run every frame: a 10 Hz heartbeat keeps the self-shadow
 * visually identical while the model rests, and the refresh is immediate
 * whenever the pose could actually diverge — beat change, drag or gyro
 * movement (both write the same yaw/pitch offset), drag release and fling
 * end (scroll velocity crossing into idle).
 *
 * Pure bookkeeping over the given inputs: mutates `state`, never the inputs.
 */
export function shouldRefreshShadow(
  state: ShadowThrottleState,
  inputs: ShadowInputs,
  delta: number,
): boolean {
  state.sinceRefresh += delta;

  let immediate = false;

  if (inputs.beat !== state.beat) {
    state.beat = inputs.beat;
    immediate = true;
  }

  const dragReleased = state.dragging && !inputs.dragging;
  state.dragging = inputs.dragging;

  if (
    inputs.dragging ||
    dragReleased ||
    Math.abs(inputs.yaw - state.yaw) > SHADOW_MOVE_EPSILON ||
    Math.abs(inputs.pitch - state.pitch) > SHADOW_MOVE_EPSILON
  ) {
    immediate = true;
  }
  state.yaw = inputs.yaw;
  state.pitch = inputs.pitch;

  if (
    Math.abs(state.velocity) > SHADOW_IDLE_VELOCITY &&
    Math.abs(inputs.velocity) <= SHADOW_IDLE_VELOCITY
  ) {
    immediate = true;
  }
  state.velocity = inputs.velocity;

  if (immediate || state.sinceRefresh >= SHADOW_INTERVAL_S) {
    state.sinceRefresh = 0;
    return true;
  }
  return false;
}
