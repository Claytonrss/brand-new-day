import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import { COLORS } from '../../design/tokens';
import { useQualityProfile } from './qualityContext';

/** Particle count per quality tier */
const PARTICLE_COUNT = {
  high: 200,
  medium: 120,
  low: 0,
} as const;

/** Drift speed (units/sec) — slow, atmospheric */
const DRIFT_SPEED = 0.1;

/** Spatial bounds for particle distribution */
const SPREAD = 10;

/**
 * Particles — atmospheric dust motes for cinematic depth.
 *
 * 200 points (desktop) / 120 (mobile) with slow upward drift.
 * Uses `COLORS.dim` (#6b6a63) at 0.3 opacity — visible but never
 * competing with the character or UI.
 *
 * Respects:
 * - `prefers-reduced-motion`: animation paused, particles static
 * - Quality profile: particle count scales with tier; hidden on 'low'
 *
 * @see docs/design/design-bible.md (§Atmosfera — grão sutil)
 * @see docs/design/performance-design.md (§Ordem de degradação)
 */
export function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const profile = useQualityProfile();

  // Particle count: 0 on low tier, reduced on mobile medium
  const count = useMemo(() => {
    if (!profile.particles) return 0;
    const base = isMobile ? PARTICLE_COUNT.medium : PARTICLE_COUNT.high;
    return profile.tier === 'medium' ? Math.floor(base * 0.6) : base;
  }, [isMobile, profile.particles, profile.tier]);

  // Generate initial positions (random within a cube)
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT.high * 3);
    for (let i = 0; i < PARTICLE_COUNT.high; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SPREAD * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 2;
    }
    return pos;
  }, []);

  // Animate: slow upward drift, wrap around when exceeding bounds
  useFrame((_, delta) => {
    if (!pointsRef.current || count === 0) return;
    if (prefersReducedMotion) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Slow upward drift
      arr[i3 + 1] += delta * DRIFT_SPEED;

      // Wrap: reset to bottom when exceeding top
      if (arr[i3 + 1] > SPREAD) {
        arr[i3 + 1] = -SPREAD;
      }
    }

    posAttr.needsUpdate = true;
  });

  // Don't render if particles are disabled or count is 0
  if (count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={COLORS.dim}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
