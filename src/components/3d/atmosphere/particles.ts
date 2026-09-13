import type { QualityTier } from '@/components/3d/perf/qualityContext';

/** Particle budget per tier — one draw call regardless of count. */
export const PARTICLE_BUDGET: Record<QualityTier, number> = {
  high: 420,
  medium: 180,
  low: 0,
};

/** Parallax layers: near / mid / far. Slower layers read as further away. */
export const LAYERS = 3;

export const ATMOSPHERE = {
  /** Spatial bounds of the volume the motes live in (world units). */
  spread: 14,
  height: 20,
  /** Base upward drift (units/sec) per layer. */
  drift: [0.16, 0.1, 0.06] as const,
  /** Parallax factor per layer — how much the volume follows the camera. */
  parallax: [0.85, 0.6, 0.35] as const,
  /** Size range per layer (world units, sizeAttenuation on). */
  size: [0.05, 0.075, 0.11] as const,
  /** Opacity per layer — far motes are dimmer. */
  opacity: [0.28, 0.2, 0.13] as const,
} as const;

export function particleCount(tier: QualityTier): number {
  return PARTICLE_BUDGET[tier] ?? 0;
}

/**
 * Per-particle attributes generated on the CPU once.
 *
 * Kept as plain arrays so the geometry is built without per-frame work; the
 * animation itself lives entirely in the vertex shader.
 */
interface ParticleAttributes {
  positions: Float32Array;
  layers: Float32Array;
  phases: Float32Array;
  seeds: Float32Array;
  sizes: Float32Array;
}

export function buildParticleAttributes(count: number): ParticleAttributes {
  const positions = new Float32Array(count * 3);
  const layers = new Float32Array(count);
  const phases = new Float32Array(count);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const layer = i % LAYERS;
    positions[i * 3] = (Math.random() - 0.5) * ATMOSPHERE.spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * ATMOSPHERE.height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * ATMOSPHERE.spread;
    layers[i] = layer;
    phases[i] = Math.random() * Math.PI * 2;
    seeds[i] = Math.random();
    sizes[i] = ATMOSPHERE.size[layer] * (0.7 + Math.random() * 0.6);
  }

  return { positions, layers, phases, seeds, sizes };
}
