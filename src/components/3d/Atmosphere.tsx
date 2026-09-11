import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import { COLORS } from '../../design/tokens';
import { useQualityProfile } from './qualityContext';
import { useBeat } from './beat/beatContext';
import type { BeatId } from './beat/beats';
import { FX } from './materials/fxUniforms';
import {
  ATMOSPHERE,
  buildParticleAttributes,
  particleCount,
} from './atmosphere/particles';
import { PARTICLE_FRAGMENT, PARTICLE_VERTEX } from './atmosphere/particlesShader';

/**
 * Per-beat atmosphere signature (docs/specs/atmosphere-per-beat.md §3).
 *
 * The same motes/buffer is reused; beats only change density, opacity, fog
 * density and warmth, cross-faded over time. This is the "temporal texture"
 * that lets a fast scroll read chapter changes without reading any copy.
 */
interface AtmosphereCue {
  /** Opacity multiplier for the motes (0-1). */
  density: number;
  /** Fog density (FogExp2). */
  fog: number;
  /** 0 = cold `dim` motes, 1 = warm `oxide` motes. */
  warm: number;
}

const CUES: Record<BeatId, AtmosphereCue> = {
  hero: { density: 0.55, fog: 0.018, warm: 0 },
  chapter1: { density: 0.7, fog: 0.022, warm: 0.05 },
  evolution: { density: 1.0, fog: 0.03, warm: 0.3 },
  chapter2: { density: 0.8, fog: 0.024, warm: 0.1 },
  arsenal: { density: 0.6, fog: 0.016, warm: 0 },
  fullBody: { density: 0.28, fog: 0.012, warm: 0 },
  colophon: { density: 0.1, fog: 0.009, warm: 0 },
};

/** Cross-fade rate between beats (exponential, frame-rate independent). */
const FADE_K = 3;

/**
 * Atmosphere — GPU particles with depth, directed by beat.
 *
 * Replaces the previous `Particles.tsx`, which moved a fixed buffer on the CPU
 * with a uniform upward drift and no parallax. Here the motion (drift,
 * turbulence, per-layer parallax) lives entirely in the vertex shader, so the
 * whole atmosphere is a single draw call and reacts to the camera and to the
 * Beat 2 spotlight.
 *
 * The per-beat cue also drives `FogExp2` (density) so the depth cue stays in
 * sync with the motes. Under `prefers-reduced-motion` values snap to the beat
 * instead of cross-fading, and time is frozen (no drift).
 *
 * @see docs/specs/atmosphere-depth.md
 * @see docs/specs/atmosphere-per-beat.md
 */
export function Atmosphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const profile = useQualityProfile();
  const { beat } = useBeat();

  const count = particleCount(profile.tier);

  const attributes = useMemo(() => buildParticleAttributes(Math.max(count, 1)), [count]);

  const colors = useMemo(
    () => ({ dim: new THREE.Color(COLORS.dim), oxide: new THREE.Color(COLORS.oxide), target: new THREE.Color() }),
    [],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPos: { value: new THREE.Vector3() },
      uSpread: { value: ATMOSPHERE.spread },
      uHeight: { value: ATMOSPHERE.height },
      uDrift: { value: new THREE.Vector3(...ATMOSPHERE.drift) },
      uParallax: { value: new THREE.Vector3(...ATMOSPHERE.parallax) },
      uSpotY: FX.uSweepY,
      uSpot: FX.uSweep,
      uColor: { value: new THREE.Color(COLORS.dim) },
      uGlowColor: { value: new THREE.Color(COLORS.glow) },
      uBaseOpacity: { value: isMobile ? 0.5 : 0.7 },
      uDensity: { value: CUES.hero.density },
    }),
    [isMobile],
  );

  useFrame(({ clock }, delta) => {
    const cue = CUES[beat];

    // Reduced motion: snap to the beat (signature reads via colour/light, not
    // motion) and keep the frame stable.
    const alpha = prefersReducedMotion ? 1 : 1 - Math.exp(-FADE_K * delta);

    // Fog is beat-directed even when the particle tier is `low` (count 0).
    const fog = scene.fog as THREE.FogExp2 | undefined;
    if (fog) {
      fog.density = THREE.MathUtils.lerp(fog.density, cue.fog, alpha);
    }

    if (!pointsRef.current || count === 0) return;

    uniforms.uDensity.value = THREE.MathUtils.lerp(uniforms.uDensity.value, cue.density, alpha);
    colors.target.copy(colors.dim).lerp(colors.oxide, cue.warm);
    uniforms.uColor.value.lerp(colors.target, alpha);

    // Frozen under reduced motion: time simply does not advance
    if (!prefersReducedMotion) {
      uniforms.uTime.value = clock.elapsedTime;
    }
    uniforms.uCameraPos.value.copy(camera.position);
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[attributes.positions, 3]}
        />
        <bufferAttribute attach="attributes-aLayer" args={[attributes.layers, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[attributes.phases, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seeds, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[attributes.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
