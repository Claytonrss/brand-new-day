import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { extendGltfLoaderWithKtx2 } from './gltfKtx2Loader';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const MODEL_PATH = '/models/spider-man_brand_new_day-v2.glb';

interface SpiderManModelProps {
  pointerTracking?: boolean;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Window-level pointer tracking.
 * Normalized to [-1, 1] range. Works even when Canvas is pointer-events:none
 * (required for scroll storytelling where Canvas is behind scrollable content).
 */
const windowPointer = { x: 0, y: 0 };

function useWindowPointer() {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      windowPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      windowPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);
}

export function SpiderManModel({
  pointerTracking = true,
  scale = 1,
  position = [0, -3.8, 0],
  rotation = [0, 0, 0],
}: SpiderManModelProps) {
  const gl = useThree((state) => state.gl);
  const extendLoader = useMemo(() => extendGltfLoaderWithKtx2(gl), [gl]);
  const { scene, nodes } = useGLTF(MODEL_PATH, false, true, extendLoader);
  const groupRef = useRef<THREE.Group>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Track pointer at window level (works with pointer-events:none Canvas)
  useWindowPointer();

  useEffect(() => {
    useGLTF.preload(MODEL_PATH, false, true, extendLoader);
  }, [extendLoader]);

  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if (
              mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial
            ) {
              mat.roughness = Math.max(mat.roughness, 0.4);
              mat.metalness = Math.min(mat.metalness, 0.6);
              mat.needsUpdate = true;
            }
          }
        }
      }
    });

    if (nodes['mixamorig:Head_06']) {
      headBoneRef.current = nodes['mixamorig:Head_06'];
    }
  }, [scene, nodes]);

  useFrame((_, delta) => {
    if (!pointerTracking || prefersReducedMotion) return;

    const pointerX = windowPointer.x; // -1 to 1
    const pointerY = windowPointer.y; // -1 to 1

    targetRotation.current.y = THREE.MathUtils.lerp(
      targetRotation.current.y,
      pointerX * 0.15,
      1 - Math.exp(-4 * delta),
    );
    targetRotation.current.x = THREE.MathUtils.lerp(
      targetRotation.current.x,
      -pointerY * 0.3,
      1 - Math.exp(-4 * delta),
    );

    if (headBoneRef.current) {
      headBoneRef.current.rotation.y = targetRotation.current.y;
      headBoneRef.current.rotation.x = targetRotation.current.x;
    } else if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1] + targetRotation.current.y * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
