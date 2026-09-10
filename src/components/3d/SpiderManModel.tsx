import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { extendGltfLoaderWithKtx2 } from './gltfKtx2Loader';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useBeat } from './beat/beatContext';
import { useQualityProfile } from './qualityContext';
import { collectRigBones, captureRestPose, type RestPose, type BoneRole } from './rig/rigBones';
import { curateMaterials } from './materials/curateMaterials';
import { useProceduralRig } from './rig/useProceduralRig';
import { useWindowPointer, windowPointer } from './rig/windowPointer';

const MODEL_PATH = '/models/spider-man_brand_new_day-v2.glb';

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
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
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
  const restRef = useRef<Map<BoneRole, RestPose>>(new Map());

  // Material curation — physical intent + authorial shader layer (Wave C)
  useEffect(() => {
    curateMaterials(scene);
  }, [scene]);

  // Capture the authored pose before any layer touches it
  useEffect(() => {
    restRef.current = captureRestPose(bones);
  }, [bones]);

  useProceduralRig({
    bones,
    rest: restRef.current,
    beat,
    pointerRef,
    headTracking: pointerTracking,
    hasHover,
    tier: profile.tier,
    prefersReducedMotion,
    debug,
  });

  // Keep the pointer ref pointing at the live window state
  useFrame(() => {
    pointerRef.current = windowPointer;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} castShadow userData={{ modelReady: true }}>
      <primitive object={scene} />
    </group>
  );
}
