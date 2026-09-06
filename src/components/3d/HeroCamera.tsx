import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { BREAKPOINTS } from '../../design/breakpoints';

const HERO_KEYFRAMES = {
  mobile: {
    position: new THREE.Vector3(0, 0.45, 18),
    lookAt: new THREE.Vector3(0, 0.45, 0),
    fov: 35,
  },
  desktop: {
    position: new THREE.Vector3(0, 0.45, 16),
    lookAt: new THREE.Vector3(0, 0.45, 0),
    fov: 30,
  },
} as const;

export function HeroCamera() {
  const { camera, size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const keyframe = isMobile ? HERO_KEYFRAMES.mobile : HERO_KEYFRAMES.desktop;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(keyframe.position);
    cam.fov = keyframe.fov;
    cam.lookAt(keyframe.lookAt);
    cam.updateProjectionMatrix();
  }, [camera, keyframe]);

  return null;
}
