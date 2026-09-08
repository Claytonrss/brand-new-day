import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CAMERA_PATH } from './cameraPath';
import { CAMERA_KEYFRAMES } from './cameraKeyframes';
import { BREAKPOINTS } from '../../design/breakpoints';

const LERP_K = 2; // Retuned from 3 to 2 for smoother feel with Lenis

/**
 * Scroll-driven camera rig with lerp smoothing.
 * Uses a single master ScrollTrigger covering the entire page,
 * with piecewise segments from cameraPath.ts — no dead zones by construction.
 *
 * Architecture:
 * - GSAP ScrollTrigger (master) updates a mutable target object
 * - useFrame lerps the actual camera toward the target (k=2, frame-rate independent)
 * - Breakpoint changes trigger smooth re-targeting (no teleport)
 * - Resize debounced at ~150ms with ScrollTrigger.refresh()
 *
 * @see docs/design/mobile-first.md
 * @see docs/design/composition-rules.md
 */
export function CameraRig() {
  const { camera, size } = useThree();
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const target = useRef({
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    fov: 30,
  });

  const current = useRef({
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    fov: 30,
  });

  const masterTriggerRef = useRef<ScrollTrigger | null>(null);
  const resizeTimerRef = useRef<number>(0);

  // Master scroll timeline — single trigger covering entire page
  useEffect(() => {
    const bp = isMobile ? 'mobile' : 'desktop';
    const path = CAMERA_PATH[bp];

    // Reduced motion: stay at final keyframe (static fallback)
    if (prefersReducedMotion) {
      const fullBody = CAMERA_KEYFRAMES.fullBody[bp];
      target.current.position.set(...fullBody.position);
      target.current.lookAt.set(...fullBody.lookAt);
      target.current.fov = fullBody.fov;
      current.current.position.copy(target.current.position);
      current.current.lookAt.copy(target.current.lookAt);
      current.current.fov = target.current.fov;
      return;
    }

    // Initialize from first keyframe
    const firstKf = path[0].from;
    target.current.position.set(...firstKf.position);
    target.current.lookAt.set(...firstKf.lookAt);
    target.current.fov = firstKf.fov;

    current.current.position.copy(target.current.position);
    current.current.lookAt.copy(target.current.lookAt);
    current.current.fov = target.current.fov;

    // Kill previous master trigger (cleanup on breakpoint change)
    masterTriggerRef.current?.kill();
    masterTriggerRef.current = null;

    // Single master ScrollTrigger for entire page
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress; // 0-1 for entire page

        // Find which segment we're in
        const segment = path.find(
          (s) => progress >= s.scrollStart && progress <= s.scrollEnd,
        );

        if (segment) {
          // Calculate local progress within segment (0-1)
          const segmentRange = segment.scrollEnd - segment.scrollStart;
          const localProgress =
            segmentRange > 0 ? (progress - segment.scrollStart) / segmentRange : 0;

          // Interpolate between from and to
          target.current.position.set(
            THREE.MathUtils.lerp(segment.from.position[0], segment.to.position[0], localProgress),
            THREE.MathUtils.lerp(segment.from.position[1], segment.to.position[1], localProgress),
            THREE.MathUtils.lerp(segment.from.position[2], segment.to.position[2], localProgress),
          );
          target.current.lookAt.set(
            THREE.MathUtils.lerp(segment.from.lookAt[0], segment.to.lookAt[0], localProgress),
            THREE.MathUtils.lerp(segment.from.lookAt[1], segment.to.lookAt[1], localProgress),
            THREE.MathUtils.lerp(segment.from.lookAt[2], segment.to.lookAt[2], localProgress),
          );
          target.current.fov = THREE.MathUtils.lerp(
            segment.from.fov,
            segment.to.fov,
            localProgress,
          );
        }
      },
    });
    masterTriggerRef.current = st;

    return () => {
      masterTriggerRef.current?.kill();
      masterTriggerRef.current = null;
    };
  }, [camera, isMobile, prefersReducedMotion]);

  // Debounced resize handling (~150ms)
  useEffect(() => {
    window.clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.clearTimeout(resizeTimerRef.current);
    };
  }, [size.width, size.height]);

  // Lerp smoothing in useFrame (frame-rate independent)
  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const alpha = 1 - Math.exp(-LERP_K * delta);

    // Lerp position
    current.current.position.lerp(target.current.position, alpha);

    // Lerp lookAt target
    current.current.lookAt.lerp(target.current.lookAt, alpha);

    // Lerp FOV
    current.current.fov = THREE.MathUtils.lerp(current.current.fov, target.current.fov, alpha);

    // Apply to camera
    cam.position.copy(current.current.position);
    cam.lookAt(current.current.lookAt);
    cam.fov = current.current.fov;
    cam.updateProjectionMatrix();
  });

  return null;
}
