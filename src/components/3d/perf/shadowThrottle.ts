import type { BeatId } from '@/components/3d/beat/beats';

/** Shadow map refresh cadence on the throttled (medium) tier — 10 Hz. */
export const SHADOW_INTERVAL_S = 1 / 10;

/**
 * Pose delta (rad) above which the shadow refreshes immediately.
 *
 * Hysteresis (ADR-031): measured against the pose captured at the LAST
 * shadow refresh, not the previous frame. 0.005 rad ≈ 0.29° — above the
 * per-frame drift the filtered gyro produces at rest, below anything the eye
 * can read in a self-shadow. The old 0.001-vs-previous-frame test let the
 * integer-degree steps of the sensor refresh the map every frame.
 */
export const SHADOW_MOVE_EPSILON = 0.005;

/** Scroll velocity below which a fling counts as finished (tier idle-gate value). */
export const SHADOW_IDLE_VELOCITY = 0.02;

interface ShadowThrottleState {
  sinceRefresh: number;
  beat: BeatId;
  dragging: boolean;
  velocity: number;
  /** Pose captured at the last shadow refresh — the hysteresis reference. */
  refreshedYaw: number;
  refreshedPitch: number;
}

export function createShadowThrottleState(beat: BeatId): ShadowThrottleState {
  return {
    sinceRefresh: 0,
    beat,
    dragging: false,
    velocity: 0,
    refreshedYaw: 0,
    refreshedPitch: 0,
  };
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
 * movement beyond the epsilon, drag release and fling end. Every refresh
 * (immediate or heartbeat) advances the hysteresis reference, so sensor noise
 * cannot chain immediate refreshes frame after frame (ADR-031).
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

  const moved =
    Math.abs(inputs.yaw - state.refreshedYaw) > SHADOW_MOVE_EPSILON ||
    Math.abs(inputs.pitch - state.refreshedPitch) > SHADOW_MOVE_EPSILON;

  if (inputs.dragging || dragReleased || moved) {
    immediate = true;
  }

  if (
    Math.abs(state.velocity) > SHADOW_IDLE_VELOCITY &&
    Math.abs(inputs.velocity) <= SHADOW_IDLE_VELOCITY
  ) {
    immediate = true;
  }
  state.velocity = inputs.velocity;

  if (immediate || state.sinceRefresh >= SHADOW_INTERVAL_S) {
    state.sinceRefresh = 0;
    state.refreshedYaw = inputs.yaw;
    state.refreshedPitch = inputs.pitch;
    return true;
  }
  return false;
}
