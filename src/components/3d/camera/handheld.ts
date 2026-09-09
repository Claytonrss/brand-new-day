/**
 * Handheld camera noise — low-frequency fbm (3 octaves).
 *
 * Value noise with smoothstep interpolation; no dependency, no allocation.
 * Used to break the perfectly rigid CG feel of the scroll-driven rig.
 *
 * @see docs/specs/cinematic-camera-path.md §6.5
 */

function hash(n: number): number {
  const value = Math.sin(n * 127.1) * 43758.5453123;
  return value - Math.floor(value);
}

function noise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i);
  const b = hash(i + 1);
  return (a + (b - a) * u) * 2 - 1;
}

export function fbm(x: number): number {
  return noise(x) * 0.6 + noise(x * 2.3 + 19.7) * 0.3 + noise(x * 4.7 + 47.3) * 0.1;
}
