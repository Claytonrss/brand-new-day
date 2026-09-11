import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '../beat/beatContext';
import { WRIST_POSITION } from '../beat/beats';
import { ANCHORS } from '../rig/anchorStore';
import { useQualityProfile } from '../qualityContext';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../../design/breakpoints';
import { COLORS } from '../../../design/tokens';

/** Total hint duration (seconds) — two soft pulses. */
const HINT_DURATION = 1.6;

/** Once per page session, not per scroll pass. */
let hintPlayed = false;

/**
 * WebShootHint — a single, diegetic pulse over the web-shooter when Beat 3
 * enters, so the hidden click interaction becomes discoverable without adding
 * game UI.
 *
 * Direction A from `docs/specs/web-shoot-discovery.md §3`: a ring of light
 * breathes twice over the wrist and disappears. Never in reduced motion, never
 * on the `low` tier, once per session.
 */
export function WebShootHint() {
  const { beat } = useBeat();
  const profile = useQualityProfile();
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const progress = useRef(1);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const fallback = useMemo(() => new THREE.Vector3(), []);

  const enabled = !prefersReducedMotion && profile.tier !== 'low';

  useEffect(() => {
    if (!enabled) return;
    if (beat === 'arsenal' && !hintPlayed) {
      hintPlayed = true;
      progress.current = 0;
    }
  }, [beat, enabled]);

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    if (progress.current >= 1) {
      mesh.visible = false;
      return;
    }

    progress.current = Math.min(progress.current + delta / HINT_DURATION, 1);
    const t = progress.current;

    const wrist = isMobile ? WRIST_POSITION.mobile : WRIST_POSITION.desktop;
    if (ANCHORS.ready) {
      mesh.position.copy(ANCHORS.wrist);
    } else {
      fallback.set(wrist[0], wrist[1], wrist[2]);
      mesh.position.copy(fallback);
    }
    // Face the camera and grow softly; two pulses over the lifetime.
    mesh.quaternion.copy(camera.quaternion);
    const scale = 1 + t * 1.6;
    mesh.scale.setScalar(scale);
    material.opacity = Math.abs(Math.sin(t * Math.PI * 2)) * (1 - 0.6 * t);
    mesh.visible = true;
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
