import { Spring } from './rig/spring';
import type { BoneRole } from './rig/rigBones';

/**
 * Arrival landing (Wave 4a) — "a chegada" — see docs/specs/arrival-landing.md.
 *
 * The model group is held at `LANDING_DROP` above its rest height from load
 * (invisible behind the opaque opening card). `LandingTrigger` fires once —
 * the first pixel of scroll, when the Hero section enters the viewport — and
 * a spring drops the model to rest with a subtle overshoot; the impact drives
 * a camera kick/FOV punch and a transient hip/knee flexion that decays.
 *
 * Module store (same pattern as `INTERACTION`/`beatRuntime`): consumers read
 * it per frame; it never triggers a React render. `landingStep(delta)` must
 * be called exactly once per frame (the rig does it).
 */

/** Height where the model is held before the landing fires (world units). */
export const LANDING_DROP = 0.6;
/** Spring angular frequency — "k ≈ 9" from the plan. */
export const LANDING_STIFFNESS = 9;
/** Damping ratio — 0.7 gives the plan's 4–6% overshoot (≈4.6%). */
export const LANDING_DAMPING = 0.7;
/** Hip flexion at impact (rad, ~6°). Sign is Look-Dev calibratable. */
export const LANDING_FLEX_HIPS = 0.105;
/** Knee flexion at impact (rad, ~8°). Sign is Look-Dev calibratable. */
export const LANDING_FLEX_KNEE = 0.14;
/** Flexion decay rate after the settle (1/s) — gone in ~1s. */
export const LANDING_FLEX_DECAY = 3;
/** Camera vertical kick at impact (world units, dips down). */
export const LANDING_KICK = 0.08;
/** Camera FOV punch at impact (degrees). */
export const LANDING_FOV_PUNCH = -2;
/** Fall speed that saturates the kick (ω·DROP·0.75 ≈ 4). */
export const LANDING_KICK_NORMALIZER = 4;
/** Impact/settle thresholds (world units and units/s). */
export const LANDING_SETTLE_EPS = 0.02;

/** Additive pose offsets applied while the landing flex is active. */
export const LANDING_POSE: Partial<Record<BoneRole, readonly [number, number, number]>> = {
  hips: [LANDING_FLEX_HIPS, 0, 0],
  upLegL: [LANDING_FLEX_KNEE, 0, 0],
  upLegR: [LANDING_FLEX_KNEE, 0, 0],
};

const spring = new Spring(LANDING_DROP, LANDING_STIFFNESS, LANDING_DAMPING);

export const landing = {
  fired: false,
  fireCount: 0,
  kick: 0,
  flex: 0,
  spring,
};

let settledFor: number | null = null;

/**
 * Arms the landing: the spring is released and the model starts to fall.
 * Idempotent — the landing happens once per session (callers gate reduced
 * motion; this module stays animation-only).
 */
export function landingFire(): void {
  if (landing.fired) return;
  landing.fired = true;
  landing.fireCount += 1;
  spring.target = 0;
}

/**
 * Marks the landing as already happened (deep scroll restoration: the hero is
 * fully above the viewport) — the model snaps to rest with no animation.
 */
export function landingSnap(): void {
  if (landing.fired) return;
  landing.fired = true;
  landing.fireCount += 1;
  spring.set(0);
}

/** Current group Y offset (world units) — held at DROP until fired. */
export function landingOffset(): number {
  return landing.fired ? spring.value : LANDING_DROP;
}

/**
 * Advance the landing state by `delta` seconds (call once per frame from the
 * rig). Before the fire it is a no-op.
 */
export function landingStep(delta: number): void {
  if (!landing.fired) return;

  spring.step(delta);

  // Kick peaks with the fall speed (≈ at impact) and fades with the settle.
  landing.kick = Math.min(1, Math.abs(spring.velocity) / LANDING_KICK_NORMALIZER);

  // Flexion grows as the model approaches the ground, then decays away.
  const approach = 1 - Math.min(1, Math.abs(spring.value) / LANDING_DROP);
  if (
    settledFor === null &&
    Math.abs(spring.value) < LANDING_SETTLE_EPS &&
    Math.abs(spring.velocity) < LANDING_SETTLE_EPS
  ) {
    settledFor = 0;
  }
  if (settledFor !== null) settledFor += delta;
  landing.flex = approach * (settledFor === null ? 1 : Math.exp(-settledFor * LANDING_FLEX_DECAY));
}

declare global {
  interface Window {
    __landing?: { fired: boolean; fireCount: number; offset: number; flex: number; kick: number };
  }
}

/** Debug snapshot for `?debug=1` (motion.spec reads this). */
export function landingDebug(): Window['__landing'] {
  return {
    fired: landing.fired,
    fireCount: landing.fireCount,
    offset: landingOffset(),
    flex: landing.flex,
    kick: landing.kick,
  };
}

/**
 * Restores the pristine pre-fire state — the landing is a per-session
 * singleton, so tests need an explicit way back to the start.
 */
export function landingResetForTest(): void {
  landing.fired = false;
  landing.fireCount = 0;
  landing.kick = 0;
  landing.flex = 0;
  settledFor = null;
  spring.set(LANDING_DROP);
  spring.target = LANDING_DROP;
}
