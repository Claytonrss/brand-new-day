import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import { COLORS } from '../../design/tokens';
import { useQualityProfile } from './qualityContext';
import { FX } from './materials/fxUniforms';
import {
  ATMOSPHERE,
  buildParticleAttributes,
  particleCount,
} from './atmosphere/particles';
import { PARTICLE_FRAGMENT, PARTICLE_VERTEX } from './atmosphere/particlesShader';

/**
 * Atmosphere — GPU particles with depth.
 *
 * Replaces the previous `Particles.tsx`, which moved a fixed buffer on the CPU
 * with a uniform upward drift and no parallax. Here the motion (drift,
 * turbulence, per-layer parallax) lives entirely in the vertex shader, so the
 * whole atmosphere is a single draw call and reacts to the camera and to the
 * Beat 2 spotlight.
 *
 * @see docs/specs/atmosphere-depth.md
 */
export function Atmosphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const camera = useThree((state) => state.camera);
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const profile = useQualityProfile();

  const count = particleCount(profile.tier);

  const attributes = useMemo(() => buildParticleAttributes(Math.max(count, 1)), [count]);

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
    }),
    [isMobile],
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current || count === 0) return;

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
