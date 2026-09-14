import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { extendGltfLoaderWithKtx2 } from './gltfKtx2Loader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useBeat } from './beat/beatContext';
import { useQualityProfile } from '@/components/3d/perf/qualityContext';
import { collectRigBones, captureRestPose, type RestPose, type BoneRole } from './rig/rigBones';
import { curateMaterials } from './materials/curateMaterials';
import { useProceduralRig } from './rig/useProceduralRig';
import { useWindowPointer, windowPointer } from './rig/windowPointer';
import { useInteraction } from './interaction/useInteraction';
import { INTERACTION } from './interaction/interactionStore';
import { landingOffset } from './landing';

const MODEL_PATH = '/models/spider-man_brand_new_day-v3-meshopt.glb';

interface SpiderManModelProps {
  pointerTracking?: boolean;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Publishes `window.__rig` with the head quaternion (used by motion tests). */
  debug?: boolean;
}

/**
 * SpiderManModel — the shared character.
 *
 * The GLB has no animation clips (`animations: 0`), so all movement is
 * procedural and applied as additive offsets over the captured rest pose
 * (`rig/`). Camera and lighting live elsewhere (`CameraRig`, `LightRig`).
 *
 * @see docs/specs/procedural-rig-motion.md
 */
export function SpiderManModel({
  pointerTracking = true,
  scale = 1,
  position = [0, -3.8, 0],
  rotation = [0, 0, 0],
  debug = false,
}: SpiderManModelProps) {
  const gl = useThree((state) => state.gl);
  const extendLoader = useMemo(() => extendGltfLoaderWithKtx2(gl), [gl]);
  const { scene, nodes } = useGLTF(MODEL_PATH, false, true, extendLoader);
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasHover = useMediaQuery('(hover: hover)');
  const { beat } = useBeat();
  const profile = useQualityProfile();

  // Track pointer at window level (works with pointer-events:none Canvas)
  useWindowPointer();
  const pointerRef = useRef(windowPointer);

  useEffect(() => {
    useGLTF.preload(MODEL_PATH, false, true, extendLoader);
  }, [extendLoader]);

  const bones = useMemo(() => collectRigBones(nodes as Record<string, THREE.Object3D>), [nodes]);
  // State, not a ref: the first render would otherwise hand `useProceduralRig`
  // an empty Map inside its useFrame closure, and the rig would stay frozen
  // (rest.size === 0) until some unrelated re-render happened to occur.
  const [rest, setRest] = useState<Map<BoneRole, RestPose>>(() => new Map());

  // Material curation — physical intent + authorial shader layer (Wave C)
  useEffect(() => {
    curateMaterials(scene);
  }, [scene]);

  // Capture the authored pose before any layer touches it
  useEffect(() => {
    setRest(captureRestPose(bones));
  }, [bones]);

  useInteraction();

  useProceduralRig({
    bones,
    rest,
    beat,
    pointerRef,
    // The colophon hands the frame to the text: the model stops tracking.
    headTracking: pointerTracking && beat !== 'colophon',
    hasHover,
    baseYaw: rotation[1],
    tier: profile.tier,
    prefersReducedMotion,
    debug,
  });

  // Keep the pointer ref pointing at the live window state and apply the
  // drag / gyro offset to the whole character (never to individual bones).
  // The arrival landing offsets the group vertically (docs/specs/arrival-landing.md):
  // held above rest until fired, then springs down — reduced motion rests.
  useFrame(() => {
    pointerRef.current = windowPointer;

    const group = groupRef.current;
    if (!group) return;
    group.rotation.y = rotation[1] + INTERACTION.yaw;
    group.rotation.x = INTERACTION.pitch;
    group.position.y = position[1] + (prefersReducedMotion ? 0 : landingOffset());
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      userData={{ modelReady: true }}
    >
      <primitive object={scene} />
    </group>
  );
}
