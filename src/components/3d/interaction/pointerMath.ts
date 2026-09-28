import * as THREE from 'three';
import { softClamp } from '@/lib/math';

/**
 * Pure interaction math — kept free of React and the DOM so it can be unit
 * tested and reasoned about.
 *
 * @see docs/specs/model-interaction.md
 * @see docs/specs/mobile-gyro-sensor-polish.md
 */

/** Degrees of freedom for the drag gesture. */
export const DRAG_LIMITS = { yaw: 0.21, pitch: 0.12 } as const;

/** Drag authority per pixel of pointer travel, before clamping. */
export const DRAG_SENSITIVITY = { yaw: 0.0045, pitch: 0.003 } as const;

/** A pointer gesture counts as a tap only below these envelopes (FALHA-13). */
export const TAP_MAX_DISTANCE_PX = 8;
export const TAP_MAX_DURATION_MS = 300;

export interface PointerSample {
  x: number;
  y: number;
  /** `performance.now()` captured at the event. */
  time: number;
}

/**
 * Tap × drag classifier (FALHA-13): the web shot fires on `pointerup` only
 * when the gesture stayed inside the tap envelope — short travel AND short.
 * A drag (long travel or long press) orbits the model and never shoots.
 */
export function isTap(down: PointerSample, up: PointerSample): boolean {
  const dx = up.x - down.x;
  const dy = up.y - down.y;
  return Math.hypot(dx, dy) < TAP_MAX_DISTANCE_PX && up.time - down.time < TAP_MAX_DURATION_MS;
}

/** Device orientation authority (radians). */
export const GYRO_LIMITS = { yaw: 0.12, pitch: 0.06 } as const;

/** Sensor-noise filter tuning: hand tremor (small steps) vs. a real tilt. */
export const GYRO_JUMP_DEG = 4;
export const GYRO_ALPHA_FAST = 0.35;
export const GYRO_ALPHA_SLOW = 0.08;

/**
 * Auto-recenter trigger: an output held near its clamp for this long means
 * the user rotated the phone and the calibration baseline is stale.
 */
export const GYRO_SATURATION_RATIO = 0.8;
export const GYRO_SATURATION_S = 2.5;

export interface OrientationAxes {
  /** Left/right tilt in degrees — feeds the gyro yaw. */
  x: number;
  /** Front/back tilt in degrees — feeds the gyro pitch. */
  y: number;
}

/**
 * Map raw `deviceorientation` axes into portrait-relative yaw/pitch degrees.
 *
 * Chrome remaps gamma/beta when the screen rotates; this restores the
 * portrait meaning for every `screen.orientation.angle` so "tilt right"
 * keeps meaning "yaw right" in landscape too.
 */
export function remapForOrientation(
  gamma: number,
  beta: number,
  angleDeg: number,
): OrientationAxes {
  switch (((angleDeg % 360) + 360) % 360) {
    case 90:
      return { x: beta, y: -gamma };
    case 180:
      return { x: -gamma, y: -beta };
    case 270:
      return { x: -beta, y: gamma };
    default:
      return { x: gamma, y: beta };
  }
}

/**
 * Adaptive one-pole low-pass over one axis, in degrees.
 *
 * A jump larger than `GYRO_JUMP_DEG` is a deliberate move of the phone —
 * converge quickly. Anything smaller is quantization/hand tremor — creep,
 * so a resting arm produces a resting model. A `NaN` prev means "no sample
 * yet": the filter starts exactly at the raw value (no startup jump).
 */
export function adaptiveLowPass(prev: number, raw: number): number {
  if (Number.isNaN(prev)) return raw;
  const alpha = Math.abs(raw - prev) > GYRO_JUMP_DEG ? GYRO_ALPHA_FAST : GYRO_ALPHA_SLOW;
  return prev + (raw - prev) * alpha;
}

/** Shortest-path delta across the ±180° seam of gamma/beta. */
export function wrapDeltaDeg(delta: number): number {
  return ((delta + 540) % 360) - 180;
}

/**
 * Saturation accumulator for the auto-recenter: adds time while the output
 * is pinned near a clamp, resets the instant it is not.
 */
export function accumulateSaturation(
  acc: number,
  saturated: boolean,
  deltaSeconds: number,
): number {
  return saturated ? acc + deltaSeconds : 0;
}

/**
 * Convert pointer travel (pixels, from the gesture origin) into a clamped
 * rotation offset. Dragging right turns the model toward the pointer.
 */
export function dragTarget(deltaX: number, deltaY: number): { yaw: number; pitch: number } {
  return {
    yaw: softClamp(deltaX * DRAG_SENSITIVITY.yaw, DRAG_LIMITS.yaw),
    pitch: softClamp(deltaY * DRAG_SENSITIVITY.pitch, DRAG_LIMITS.pitch),
  };
}

/**
 * Convert device tilt (degrees, relative to the calibration origin) into a
 * clamped offset.
 *
 * `x` is left/right tilt, `y` front/back — the output of `remapForOrientation`
 * fed with the filtered stream. Values are relative to the origin captured at
 * attach (or the last recenter) so the model does not jump. The sign matches
 * the drag on purpose: tilt right = drag right = yaw+ (ADR-031).
 */
export function gyroTarget(
  x: number,
  y: number,
  origin: { gamma: number; beta: number } = { gamma: 0, beta: 0 },
): { yaw: number; pitch: number } {
  const dGamma = wrapDeltaDeg(x - origin.gamma) * (Math.PI / 180);
  const dBeta = wrapDeltaDeg(y - origin.beta) * (Math.PI / 180);

  return {
    yaw: softClamp(dGamma, GYRO_LIMITS.yaw),
    pitch: softClamp(dBeta, GYRO_LIMITS.pitch),
  };
}

/**
 * Points of a sagging web strand from `from` to `to`.
 *
 * Quadratic droop perpendicular to the strand, so the line reads as webbing
 * rather than a laser.
 */
export function webStrandPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  segments = 12,
  sag = 0.25,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const down = new THREE.Vector3(0, -1, 0);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3().lerpVectors(from, to, t);
    // droop is zero at the ends and maximal in the middle
    point.addScaledVector(down, sag * 4 * t * (1 - t));
    points.push(point);
  }

  return points;
}

/** Offset applied to the rim light from the cursor position (-1..1). */
export function rimOffset(pointerX: number, pointerY: number, amount = 0.35): THREE.Vector3 {
  return new THREE.Vector3(pointerX * amount, pointerY * amount, 0);
}
