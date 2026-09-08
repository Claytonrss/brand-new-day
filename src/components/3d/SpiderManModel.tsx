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
  const hasHover = useMediaQuery('(hover: hover)');

  // Track pointer at window level (works with pointer-events:none Canvas)
  useWindowPointer();

  useEffect(() => {
    useGLTF.preload(MODEL_PATH, false, true, extendLoader);
  }, [extendLoader]);

  const targetRotation = useRef({ x: 0, y: 0 });
  const idleTime = useRef(0);
  const isIdle = useRef(false);
  const lastPointerMove = useRef(Date.now());

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if (
              mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial
            ) {
              const nameLower = (mat.name ?? '').toLowerCase();
              const isEye = nameLower.includes('eye') || nameLower.includes('lens');
              const isChestSymbol = nameLower.includes('chest') || nameLower.includes('symbol');
              const isMetal = mat.metalness > 0.5;

              if (isEye) {
                // Eyes: emissive glow for bloom to pick up
                mat.emissive = new THREE.Color('#eaf4ff'); // COLORS.glow
                mat.emissiveIntensity = 1.2;
                mat.roughness = 0.1;
              } else if (isChestSymbol) {
                // Chest symbol: subtle emissive glow
                mat.emissive = new THREE.Color('#eaf4ff'); // COLORS.glow
                mat.emissiveIntensity = 0.6;
                mat.roughness = 0.3;
              } else if (isMetal) {
                // Metallic parts (web-shooter, hardware): shiny metal
                mat.roughness = 0.25;
                mat.metalness = 0.85;
              } else {
                // Suit fabric: matte, low metalness
                mat.roughness = 0.55;
                mat.metalness = 0.3;
              }

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

    // Detect idle: no pointer movement for 3 seconds
    const pointerMagnitude = Math.abs(pointerX) + Math.abs(pointerY);
    if (pointerMagnitude > 0.01) {
      lastPointerMove.current = Date.now();
      isIdle.current = false;
    } else if (Date.now() - lastPointerMove.current > 3000) {
      isIdle.current = true;
    }

    // Touch devices (no hover) always use idle drift
    if (!hasHover) {
      isIdle.current = true;
    }

    let targetX: number;
    let targetY: number;

    if (isIdle.current) {
      // Autonomous idle drift — slow sine wave
      idleTime.current += delta * 0.3;
      targetX = Math.sin(idleTime.current * 0.7) * 0.08; // subtle pitch (±0.08 rad)
      targetY = Math.sin(idleTime.current) * 0.12; // subtle yaw (±0.12 rad)
    } else {
      // Mouse tracking — Beat 1 spec: yaw ±0.48 rad, pitch ±0.24 rad
      targetX = -pointerY * 0.24; // pitch
      targetY = pointerX * 0.48; // yaw
    }

    const t = 1 - Math.exp(-4 * delta);
    targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, targetX, t);
    targetRotation.current.y = THREE.MathUtils.lerp(targetRotation.current.y, targetY, t);

    if (headBoneRef.current) {
      headBoneRef.current.rotation.y = targetRotation.current.y;
      headBoneRef.current.rotation.x = targetRotation.current.x;
    } else if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1] + targetRotation.current.y * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} castShadow userData={{ modelReady: true }}>
      <primitive object={scene} />
    </group>
  );
}
