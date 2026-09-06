import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BREAKPOINTS } from '../../design/breakpoints';
import { CAMERA_KEYFRAMES } from './cameraKeyframes';
import { useMediaQuery } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

const LERP_K = 3;
const EVOLUTION_SECTION_ID = '#evolution-section';

/**
 * Scroll-driven camera rig with lerp smoothing.
 * Shared across Hero, Evolution, and future sections.
 *
 * Architecture:
 * - GSAP ScrollTrigger updates a mutable target object
 * - useFrame lerps the actual camera toward the target (k=3, frame-rate independent)
 * - Breakpoint changes trigger smooth re-targeting (no teleport)
 * - Resize debounced at ~150ms with ScrollTrigger.refresh()
 *
 * @see docs/specs/evolution-chest-symbol.md §6
 * @see docs/design/mobile-first.md
 */
export function CameraRig() {
  const { camera, size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Mutable target updated by ScrollTrigger, read by useFrame
  const target = useRef({
    px: 0,
    py: 0.45,
    pz: 18,
    lx: 0,
    ly: 0.45,
    lz: 0,
    fov: 35,
  });

  // Current lookAt (lerped separately to avoid quaternion issues)
  const currentLookAt = useRef(new THREE.Vector3(0, 0.45, 0));
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const resizeTimerRef = useRef<number>(0);

  // Set initial camera state from keyframes
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const bp = isMobile ? 'mobile' : 'desktop';
    const hero = CAMERA_KEYFRAMES.hero[bp];

    // Initialize target at hero keyframe
    target.current.px = hero.position[0];
    target.current.py = hero.position[1];
    target.current.pz = hero.position[2];
    target.current.lx = hero.lookAt[0];
    target.current.ly = hero.lookAt[1];
    target.current.lz = hero.lookAt[2];
    target.current.fov = hero.fov;

    // Snap camera to target immediately (no lerp on first mount)
    cam.position.set(target.current.px, target.current.py, target.current.pz);
    cam.fov = target.current.fov;
    currentLookAt.current.set(target.current.lx, target.current.ly, target.current.lz);
    cam.lookAt(currentLookAt.current);
    cam.updateProjectionMatrix();
  }, [camera, isMobile]);

  // Build ScrollTrigger for evolution section
  useEffect(() => {
    const bp = isMobile ? 'mobile' : 'desktop';

    // Kill previous trigger (cleanup on breakpoint change)
    scrollTriggerRef.current?.kill();
    scrollTriggerRef.current = null;

    // Reduced motion: stay at hero keyframe, no scroll animation
    if (prefersReducedMotion) return;

    const evolutionSection = document.querySelector(EVOLUTION_SECTION_ID);
    if (!evolutionSection) return;

    const hero = CAMERA_KEYFRAMES.hero[bp];
    const evoStart = CAMERA_KEYFRAMES.evolutionStart[bp];
    const evoEnd = CAMERA_KEYFRAMES.evolutionEnd[bp];

    const trigger = ScrollTrigger.create({
      trigger: evolutionSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1

        if (p <= 0.3) {
          // Phase 1: Hero → Evolution start (0% → 30%)
          const t = p / 0.3;
          target.current.px = THREE.MathUtils.lerp(hero.position[0], evoStart.position[0], t);
          target.current.py = THREE.MathUtils.lerp(hero.position[1], evoStart.position[1], t);
          target.current.pz = THREE.MathUtils.lerp(hero.position[2], evoStart.position[2], t);
          target.current.lx = THREE.MathUtils.lerp(hero.lookAt[0], evoStart.lookAt[0], t);
          target.current.ly = THREE.MathUtils.lerp(hero.lookAt[1], evoStart.lookAt[1], t);
          target.current.lz = THREE.MathUtils.lerp(hero.lookAt[2], evoStart.lookAt[2], t);
          target.current.fov = THREE.MathUtils.lerp(hero.fov, evoStart.fov, t);
        } else {
          // Phase 2: Evolution start → Evolution end (30% → 100%)
          const t = (p - 0.3) / 0.7;
          target.current.px = THREE.MathUtils.lerp(evoStart.position[0], evoEnd.position[0], t);
          target.current.py = THREE.MathUtils.lerp(evoStart.position[1], evoEnd.position[1], t);
          target.current.pz = THREE.MathUtils.lerp(evoStart.position[2], evoEnd.position[2], t);
          target.current.lx = THREE.MathUtils.lerp(evoStart.lookAt[0], evoEnd.lookAt[0], t);
          target.current.ly = THREE.MathUtils.lerp(evoStart.lookAt[1], evoEnd.lookAt[1], t);
          target.current.lz = THREE.MathUtils.lerp(evoStart.lookAt[2], evoEnd.lookAt[2], t);
          target.current.fov = THREE.MathUtils.lerp(evoStart.fov, evoEnd.fov, t);
        }
      },
    });

    scrollTriggerRef.current = trigger;

    return () => {
      trigger.kill();
      scrollTriggerRef.current = null;
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
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, target.current.px, alpha);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, target.current.py, alpha);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, target.current.pz, alpha);

    // Lerp lookAt target
    currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, target.current.lx, alpha);
    currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, target.current.ly, alpha);
    currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, target.current.lz, alpha);
    cam.lookAt(currentLookAt.current);

    // Lerp FOV
    cam.fov = THREE.MathUtils.lerp(cam.fov, target.current.fov, alpha);
    cam.updateProjectionMatrix();
  });

  return null;
}
