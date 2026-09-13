/**
 * Spider-sense halo geometry — IDEIA-3D-10 redesign
 * (docs/specs/spider-sense.md §1).
 *
 * Pure SVG geometry for the comic emanata: six wavy strokes fanned over the
 * TOP hemisphere around the projected head position — never below the
 * horizon, so the face is never covered (composition-rules). Radii are
 * fractions of the square halo box (0 = centre, 0.5 = edge).
 */

export interface SenseArc {
  /** Screen angle in degrees; −90 is straight up, the fan spans the top. */
  angle: number;
  /** Inner radius (fraction of the halo box). */
  r1: number;
  /** Outer radius (fraction of the halo box). */
  r2: number;
  /** Lateral wiggle amplitude (fraction of the halo box). */
  wiggle: number;
  /** Draw-on delay (ms), staggered from the fan centre outwards. */
  delay: number;
}

/** Six strokes, fanned −153°…−27° (upper hemisphere), edge-out stagger. */
export const SENSE_ARCS: readonly SenseArc[] = (
  [
    { angle: -153, r1: 0.34, r2: 0.46, wiggle: 0.05, delay: 75 },
    { angle: -126, r1: 0.33, r2: 0.45, wiggle: -0.055, delay: 45 },
    { angle: -99, r1: 0.32, r2: 0.45, wiggle: 0.06, delay: 15 },
    { angle: -72, r1: 0.32, r2: 0.45, wiggle: -0.06, delay: 15 },
    { angle: -45, r1: 0.33, r2: 0.45, wiggle: 0.055, delay: 45 },
    { angle: -18, r1: 0.34, r2: 0.46, wiggle: -0.05, delay: 75 },
  ] as const
).map((arc) => ({ ...arc }));

/**
 * One squiggle as an SVG path — a cubic from the inner to the outer radius
 * with control points alternating either side of the radial direction, which
 * reads as the wavy comic stroke at hairline width.
 */
export function senseSquigglePath(size: number, arc: SenseArc): string {
  const c = size / 2;
  const a = (arc.angle * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const px = -uy; // perpendicular to the radial direction
  const py = ux;

  const at = (r: number, w: number): [number, number] => [
    +(c + ux * r * size + px * w * size).toFixed(1),
    +(c + uy * r * size + py * w * size).toFixed(1),
  ];

  const [x1, y1] = at(arc.r1, 0);
  const [cx1, cy1] = at(arc.r1 + (arc.r2 - arc.r1) / 3, arc.wiggle);
  const [cx2, cy2] = at(arc.r1 + (2 * (arc.r2 - arc.r1)) / 3, -arc.wiggle);
  const [x2, y2] = at(arc.r2, 0);

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}
