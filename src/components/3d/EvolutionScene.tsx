import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COLORS } from '../../design/tokens';
import { BREAKPOINTS } from '../../design/breakpoints';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const EVOLUTION_SECTION_ID = '#evolution-section';

/** Beat 2 timing — fraction of evolution scroll */
const BEAT2_START = 0.5;
const BEAT2_APEX = 0.6;
const BEAT2_END = 0.7;
const BEAT2_MAX_INTENSITY = 18;
const BEAT2_RESIDUAL_INTENSITY = 2;

/** Chest symbol world-space Y (approximate, per breakpoint) */
const CHEST_Y = {
  mobile: -1.5,
  desktop: -2.0,
} as const;

/**
 * Evolution scene — Beat 2 "a luz atravessa o símbolo".
 *
 * Adds a SpotLight (COLORS.signal) that sweeps the chest symbol
 * between 50-70% of the evolution scroll, peaking at 60%.
 * After the beat, a residual shadow pattern persists.
 *
 * Does NOT render its own model — the model is shared from HeroScene.
 *
 * @see docs/specs/evolution-chest-symbol.md §5
 */
export function EvolutionScene() {
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const targetHelperRef = useRef<THREE.Object3D>(null);
  const progressRef = useRef(0);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const chestY = isMobile ? CHEST_Y.mobile : CHEST_Y.desktop;

  // Track scroll progress for Beat 2
  useEffect(() => {
    const evolutionSection = document.querySelector(EVOLUTION_SECTION_ID);
    if (!evolutionSection) return;

    const trigger = ScrollTrigger.create({
      trigger: evolutionSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, []);

  // Reduced motion: static at final state (spotlight at residual)
  useEffect(() => {
    if (prefersReducedMotion && spotlightRef.current) {
      spotlightRef.current.intensity = BEAT2_RESIDUAL_INTENSITY;
    }
  }, [prefersReducedMotion]);

  // Animate spotlight in useFrame based on scroll progress
  useFrame(() => {
    if (!spotlightRef.current || prefersReducedMotion) return;

    const p = progressRef.current;
    let intensity = 0;

    if (p < BEAT2_START) {
      // Before Beat 2: off
      intensity = 0;
    } else if (p <= BEAT2_APEX) {
      // Ramp up: start → apex
      const t = (p - BEAT2_START) / (BEAT2_APEX - BEAT2_START);
      intensity = t * BEAT2_MAX_INTENSITY;
    } else if (p <= BEAT2_END) {
      // Ramp down: apex → end
      const t = (p - BEAT2_APEX) / (BEAT2_END - BEAT2_APEX);
      intensity = (1 - t) * BEAT2_MAX_INTENSITY + t * BEAT2_RESIDUAL_INTENSITY;
    } else {
      // After Beat 2: residual shadow pattern persists
      intensity = BEAT2_RESIDUAL_INTENSITY;
    }

    spotlightRef.current.intensity = intensity;

    // Sweep position: moves across the chest symbol during Beat 2
    // Chest symbol is approximately at chestY in world space
    if (p >= BEAT2_START && p <= BEAT2_END) {
      const sweepT = (p - BEAT2_START) / (BEAT2_END - BEAT2_START);
      // Sweep from left to right across the chest
      spotlightRef.current.position.x = THREE.MathUtils.lerp(-0.4, 0.4, sweepT);
      spotlightRef.current.position.y = chestY + THREE.MathUtils.lerp(0.8, 0.6, sweepT);
      spotlightRef.current.position.z = THREE.MathUtils.lerp(0.8, 0.7, sweepT);
    }

    // Keep target helper at chest symbol for spotlight to aim at
    if (targetHelperRef.current) {
      targetHelperRef.current.position.set(0, chestY, 0);
    }
  });

  return (
    <>
      {/* Spotlight target — aims at the chest symbol */}
      <object3D ref={targetHelperRef} position={[0, chestY, 0]} />

      {/* Beat 2 — "a luz atravessa o símbolo" */}
      <spotLight
        ref={spotlightRef}
        color={COLORS.signal}
        intensity={0}
        position={[-0.4, chestY + 0.8, 0.8]}
        target={targetHelperRef.current ?? undefined}
        angle={0.5}
        penumbra={0.6}
        distance={3}
        decay={1.5}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />
    </>
  );
}
