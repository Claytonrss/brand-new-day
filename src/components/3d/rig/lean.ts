import { Spring } from './spring';

/**
 * Velocity lean (Wave 4b) — the body reacts to the action the user performs
 * the most: scrolling. See docs/specs/velocity-lean.md.
 *
 * A critically damped spring follows `clamp(velocity × GAIN)` — inertia
 * without wobble — and the rig applies it as spine pitch plus a light
 * shoulder lift. Joins the FOV punch and the dolly lag as the third
 * velocity-coupled effect (calibrated together on device, T4.6).
 */

/** Absolute lean ceiling (rad, ~2.5°) — the plan's max. */
export const LEAN_MAX = 0.0436;
export const LEAN_GAIN = 0.02;
export const LEAN_STIFFNESS = 6;
/** Damping ratio 1 = critically damped: inertia, never oscillation. */
export const LEAN_DAMPING = 1;
export const LEAN_SPINE2_WEIGHT = 0.6;
/** Shoulder lift at full lean (rad, ~2°), mirrored L/R. */
export const LEAN_SHOULDER_LIFT = 0.035;

const spring = new Spring(0, LEAN_STIFFNESS, LEAN_DAMPING);

export const lean = { value: 0 };

export function leanTarget(velocity: number): number {
  return Math.max(-LEAN_MAX, Math.min(LEAN_MAX, velocity * LEAN_GAIN));
}

/**
 * Advance the lean by `delta` seconds towards the velocity target (call once
 * per frame from the rig). Reduced motion never calls this — lean stays 0.
 */
export function leanStep(delta: number, velocity: number): void {
  spring.target = leanTarget(velocity);
  lean.value = spring.step(delta);
}

export function leanShoulderLift(role: 'shoulderL' | 'shoulderR'): number {
  const magnitude = (Math.abs(lean.value) / LEAN_MAX) * LEAN_SHOULDER_LIFT;
  return role === 'shoulderL' ? magnitude : -magnitude;
}

/**
 * Restores the pristine state — the spring is a per-session singleton, so
 * tests need an explicit way back to the start.
 */
export function leanResetForTest(): void {
  spring.set(0);
  lean.value = 0;
}
