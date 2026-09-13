/**
 * Magnetic CTA math (IDEIA-PAG-06, docs/specs/dom-micro-craft.md §3).
 *
 * Pure so the hook stays thin: inside the radius the element leans toward the
 * cursor by `strength` of the offset; outside it rests at its layout position.
 */

export const MAGNET = {
  /** Attraction radius around the element centre (px). */
  radius: 120,
  /** Fraction of the cursor offset applied as translate. */
  strength: 0.32,
} as const;

export interface Offset {
  x: number;
  y: number;
}

/** Translate for a pointer position, or `null` when outside the radius. */
export function magneticOffset(
  pointerX: number,
  pointerY: number,
  centerX: number,
  centerY: number,
  radius: number = MAGNET.radius,
  strength: number = MAGNET.strength,
): Offset | null {
  const dx = pointerX - centerX;
  const dy = pointerY - centerY;
  if (Math.hypot(dx, dy) >= radius) return null;
  return { x: dx * strength, y: dy * strength };
}
