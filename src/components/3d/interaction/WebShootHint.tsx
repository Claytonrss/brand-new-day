import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '@/components/3d/beat/beatContext';
import { WRIST_POSITION } from '@/components/3d/beat/beats';
import { ANCHORS } from '@/components/3d/rig/anchorStore';
import { useQualityProfile } from '@/components/3d/perf/qualityContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { BREAKPOINTS } from '@/design/breakpoints';
import { COLORS } from '@/design/tokens';
import { MOTION } from '@/design/motion';
import { arsenalReveal } from './arsenalReveal';

/** Breathing cycle (seconds) — one full inhale/exhale of the ring. */
const BREATH_CYCLE = 2.4;

/** Ring opacity range while breathing (subtle — diegetic, not game UI). */
const BREATH_OPACITY = { min: 0.2, max: 0.55 } as const;

/** Ring scale range while breathing. */
const BREATH_SCALE = { min: 1, max: 1.35 } as const;

/** Fade-out time (seconds) once the HUD is revealed or the beat ends. */
const FADE_OUT = MOTION.duration.fast / 1000;

/**
 * WebShootHint — a breathing ring of light over the web-shooter for as long
 * as Beat 3 is active and the annotation HUD is still hidden.
 *
 * Direction A from `docs/specs/web-shoot-discovery.md §3`, revised: instead of
 * a one-shot pulse that plays before the HUD ever appears (out of sync with
 * it), the ring keeps breathing until the visitor taps — the same gesture
 * fires the web shot and reveals the HUD — then fades out. Session-scoped:
 * once revealed, the ring never comes back. Never in reduced motion, never on
 * the `low` tier; those profiles keep the scroll-driven HUD reveal.
 *
 * @see docs/specs/web-shoot-discovery.md §3
 * @see docs/specs/arsenal-macro-hud.md §5
 */
export function WebShootHint() {
  const { beat } = useBeat();
  const profile = useQualityProfile();
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = usePrefersReducedMotion();

  const breathPhase = useRef(0);
  const fadeRef = useRef(0);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const fallback = useMemo(() => new THREE.Vector3(), []);

  const enabled = !prefersReducedMotion && profile.tier !== 'low';

  // Publish the hint's own gate so the DOM overlay knows whether the HUD is
  // gesture-gated (QualityContext does not exist outside the canvas).
  useEffect(() => {
    arsenalReveal.setGestureCapable(enabled);
    return () => arsenalReveal.setGestureCapable(false);
  }, [enabled]);

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const wantsRing = enabled && beat === 'arsenal' && !arsenalReveal.revealed;

    if (wantsRing) {
      fadeRef.current = 0;
      breathPhase.current = (breathPhase.current + delta) % BREATH_CYCLE;
      const breath = (1 - Math.cos((breathPhase.current / BREATH_CYCLE) * Math.PI * 2)) / 2;

      const wrist = isMobile ? WRIST_POSITION.mobile : WRIST_POSITION.desktop;
      if (ANCHORS.ready) {
        mesh.position.copy(ANCHORS.wrist);
      } else {
        fallback.set(wrist[0], wrist[1], wrist[2]);
        mesh.position.copy(fallback);
      }
      // Face the camera and breathe.
      mesh.quaternion.copy(camera.quaternion);
      mesh.scale.setScalar(BREATH_SCALE.min + breath * (BREATH_SCALE.max - BREATH_SCALE.min));
      material.opacity = BREATH_OPACITY.min + breath * (BREATH_OPACITY.max - BREATH_OPACITY.min);
      mesh.visible = true;
      return;
    }

    if (!mesh.visible) return;

    // Release: fade the current opacity out quickly, then hide for good.
    fadeRef.current += delta / FADE_OUT;
    if (fadeRef.current >= 1) {
      mesh.visible = false;
      material.opacity = 0;
      return;
    }
    material.opacity *= 1 - delta / FADE_OUT;
  });

  return (
    <mesh ref={meshRef} visible={false} renderOrder={2}>
      <ringGeometry args={[0.08, 0.1, 40]} />
      <meshBasicMaterial
        ref={materialRef}
        color={COLORS.signal}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
