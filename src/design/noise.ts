/**
 * Deterministic value noise (fbm) shared by camera and rig layers.
 *
 * No dependency, no allocation, stable across reloads — the same input always
 * produces the same output, which keeps screenshots comparable.
 */
import { smoothstep } from '@/lib/math';

function hash(n: number): number {
  const value = Math.sin(n * 127.1) * 43758.5453123;
  return value - Math.floor(value);
}

function noise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = smoothstep(f, 0, 1);
  const a = hash(i);
  const b = hash(i + 1);
  return (a + (b - a) * u) * 2 - 1;
}

/** 3-octave fractional Brownian motion, normalized to roughly [-1, 1]. */
export function fbm(x: number): number {
  return noise(x) * 0.6 + noise(x * 2.3 + 19.7) * 0.3 + noise(x * 4.7 + 47.3) * 0.1;
}
