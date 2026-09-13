/**
 * Velocity-driven typography weight (IDEIA-PAG-01,
 * docs/specs/dom-micro-craft.md §1).
 *
 * The self-hosted Space Grotesk is variable 400-700 (ADR-021), so headline
 * weight can follow the scroll without any extra download. At rest headlines
 * hold the poster weight (700); while the page moves they shed weight toward
 * 480 — the type "resists" the scroll alongside the 3D velocity lean — and
 * settle back when the page rests.
 *
 * Pure module: `velocityWeight` maps `beatRuntime.velocity` (progress-units/s)
 * to a quantized weight. Weight changes reflow the headline, so the value is
 * quantized to `STEP` — the controller only rewrites the CSS custom property
 * when a step boundary is crossed, which bounds the layout cost to the moments
 * the effect is actually visible.
 */

export const VELOCITY_TYPE = {
  /** Poster weight at rest (headlines are `font-bold`). */
  BASE: 700,
  /** Weight at (or above) the max mapped velocity. */
  MIN: 480,
  /** Velocity (progress-units/s) that maps to the full deflection. */
  MAX_VELOCITY: 3,
  /** Quantization — 12 distinct values bound style/layout recalcs. */
  STEP: 20,
  /** Root custom property published by the `VelocityType` controller. */
  CSS_VAR: '--type-wght',
} as const;

/** Map scroll velocity to a quantized headline weight (BASE → MIN). */
export function velocityWeight(velocity: number): number {
  const magnitude = Math.min(Math.abs(velocity) / VELOCITY_TYPE.MAX_VELOCITY, 1);
  const eased = magnitude * magnitude; // ease-in: slow scrolls barely thin the type
  const raw = VELOCITY_TYPE.BASE - (VELOCITY_TYPE.BASE - VELOCITY_TYPE.MIN) * eased;
  const quantized = Math.round(raw / VELOCITY_TYPE.STEP) * VELOCITY_TYPE.STEP;
  return Math.min(VELOCITY_TYPE.BASE, Math.max(VELOCITY_TYPE.MIN, quantized));
}
