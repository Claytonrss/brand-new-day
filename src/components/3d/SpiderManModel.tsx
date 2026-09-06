import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/models/spider-man_brand_new_day-v2.glb';

// Pre-load model to avoid waterfall delays
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
  position = [0, -4.8, 0],
  rotation = [0, 0, 0],
}: SpiderManModelProps) {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const neckBoneRef = useRef<THREE.Object3D | null>(null);

  // Target rotation values for smooth lerp
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Traverse scene to enable shadows and find head/neck bones for tracking
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    if (nodes['mixamorig:Head_06']) {
      headBoneRef.current = nodes['mixamorig:Head_06'];
    }
    if (nodes['mixamorig:Neck_05']) {
      neckBoneRef.current = nodes['mixamorig:Neck_05'];
    }
  }, [scene, nodes]);

  useFrame((state, delta) => {
    if (!pointerTracking) return;

    // Smooth head-tracking towards pointer
    const pointerX = state.pointer.x; // -1 to 1
    const pointerY = state.pointer.y; // -1 to 1

    // Clamp tracking limits so it looks natural
    targetRotation.current.y = THREE.MathUtils.lerp(
      targetRotation.current.y,
      pointerX * 0.35,
      delta * 4,
    );
    targetRotation.current.x = THREE.MathUtils.lerp(
      targetRotation.current.x,
      -pointerY * 0.25,
      delta * 4,
    );

    if (headBoneRef.current) {
      headBoneRef.current.rotation.y = targetRotation.current.y;
      headBoneRef.current.rotation.x = targetRotation.current.x;
    } else if (groupRef.current) {
      // Fallback: subtle group rotation if bone is unskinned
      groupRef.current.rotation.y = rotation[1] + targetRotation.current.y * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
