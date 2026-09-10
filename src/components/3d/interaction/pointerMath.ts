import * as THREE from 'three';

/**
 * Pure interaction math — kept free of React and the DOM so it can be unit
 * tested and reasoned about.
 *
 * @see docs/specs/model-interaction.md
 */

/** Degrees of freedom for the drag gesture. */
export const DRAG_LIMITS = { yaw: 0.21, pitch: 0.12 } as const;

/** Drag authority per pixel of pointer travel, before clamping. */
export const DRAG_SENSITIVITY = { yaw: 0.0045, pitch: 0.003 } as const;

/** Device orientation authority (radians). */
export const GYRO_LIMITS = { yaw: 0.12, pitch: 0.06 } as const;

/** Soft clamp with a knee — never a hard cut. */
export function softClamp(value: number, limit: number): number {
  if (limit <= 0) return 0;
  return limit * Math.tanh(value / limit);
}

/**
 * Convert pointer travel (pixels, from the gesture origin) into a clamped
 * rotation offset. Dragging right turns the model toward the pointer.
 */
export function dragTarget(
  deltaX: number,
  deltaY: number,
): { yaw: number; pitch: number } {
  return {
    yaw: softClamp(deltaX * DRAG_SENSITIVITY.yaw, DRAG_LIMITS.yaw),
    pitch: softClamp(deltaY * DRAG_SENSITIVITY.pitch, DRAG_LIMITS.pitch),
  };
}

/**
 * Convert `deviceorientation` angles (degrees) into a clamped offset.
 *
 * `gamma` is left/right tilt, `beta` front/back. Values are relative to the
 * device's initial reading so the model does not jump when the listener
 * attaches.
 */
export function gyroTarget(
  gamma: number,
  beta: number,
  origin: { gamma: number; beta: number } = { gamma: 0, beta: 0 },
): { yaw: number; pitch: number } {
  const dGamma = (gamma - origin.gamma) * (Math.PI / 180);
  const dBeta = (beta - origin.beta) * (Math.PI / 180);

  return {
    yaw: softClamp(-dGamma, GYRO_LIMITS.yaw),
    pitch: softClamp(-dBeta, GYRO_LIMITS.pitch),
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
  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const down = new THREE.Vector3(0, -1, 0);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3().lerpVectors(from, to, t);
    // droop is zero at the ends and maximal in the middle
    point.addScaledVector(down, sag * 4 * t * (1 - t));
    points.push(point);
  }

  // keep the control point in scope for future lateral variation
  void midpoint;

  return points;
}

/** Offset applied to the rim light from the cursor position (-1..1). */
export function rimOffset(pointerX: number, pointerY: number, amount = 0.35): THREE.Vector3 {
  return new THREE.Vector3(pointerX * amount, pointerY * amount, 0);
}
