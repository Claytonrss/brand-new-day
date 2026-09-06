import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/models/spider-man_brand_new_day-v2.glb';

useGLTF.preload(MODEL_PATH);

interface SpiderManModelProps {
  pointerTracking?: boolean;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function SpiderManModel({
  pointerTracking = true,
  scale = 1,
  position = [0, -3.8, 0],
  rotation = [0, 0, 0],
}: SpiderManModelProps) {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);

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

  useFrame((state, delta) => {
    if (!pointerTracking) return;

    const pointerX = state.pointer.x; // -1 to 1
    const pointerY = state.pointer.y; // -1 to 1

    targetRotation.current.y = THREE.MathUtils.lerp(
      targetRotation.current.y,
      pointerX * 0.3,
      delta * 4,
    );
    targetRotation.current.x = THREE.MathUtils.lerp(
      targetRotation.current.x,
      -pointerY * 0.2,
      delta * 4,
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
