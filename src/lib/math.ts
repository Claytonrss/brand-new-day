/**
 * Pure math helpers shared by the 3D layers. No THREE import — usable from
 * any module (and unit tests) without pulling the renderer.
 */

/**
 * Soft clamp with a knee — keeps small inputs linear and bends the extremes
 * instead of cutting them hard.
 */
export function softClamp(value: number, limit: number): number {
  if (limit <= 0) return 0;
  return limit * Math.tanh(value / limit);
}

/** Frame-rate independent smoothing factor for a given rate constant `k`. */
export function smooth(delta: number, k: number): number {
  return 1 - Math.exp(-k * delta);
}

/** Hermite interpolation between `a` and `b`, clamped to [0, 1]. */
export function smoothstep(x: number, a: number, b: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}
