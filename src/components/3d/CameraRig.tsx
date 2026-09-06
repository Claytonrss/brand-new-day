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
const ARSENAL_SECTION_ID = '#arsenal-section';

/** Arsenal scroll phases — fraction of arsenal section scroll */
const ARSENAL_PHASE1_END = 0.4; // evolutionEnd → arsenalStart (axis crossing)

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
  const evolutionTriggerRef = useRef<ScrollTrigger | null>(null);
  const arsenalTriggerRef = useRef<ScrollTrigger | null>(null);
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

  // Helper: set target from keyframe values
  const setTargetFromKeyframe = (kf: { position: readonly [number, number, number]; lookAt: readonly [number, number, number]; fov: number }) => {
    target.current.px = kf.position[0];
    target.current.py = kf.position[1];
    target.current.pz = kf.position[2];
    target.current.lx = kf.lookAt[0];
    target.current.ly = kf.lookAt[1];
    target.current.lz = kf.lookAt[2];
    target.current.fov = kf.fov;
  };

  // Helper: lerp target between two keyframes
  const lerpBetween = (
    from: { position: readonly [number, number, number]; lookAt: readonly [number, number, number]; fov: number },
    to: { position: readonly [number, number, number]; lookAt: readonly [number, number, number]; fov: number },
    t: number,
  ) => {
    target.current.px = THREE.MathUtils.lerp(from.position[0], to.position[0], t);
    target.current.py = THREE.MathUtils.lerp(from.position[1], to.position[1], t);
    target.current.pz = THREE.MathUtils.lerp(from.position[2], to.position[2], t);
    target.current.lx = THREE.MathUtils.lerp(from.lookAt[0], to.lookAt[0], t);
    target.current.ly = THREE.MathUtils.lerp(from.lookAt[1], to.lookAt[1], t);
    target.current.lz = THREE.MathUtils.lerp(from.lookAt[2], to.lookAt[2], t);
    target.current.fov = THREE.MathUtils.lerp(from.fov, to.fov, t);
  };

  // Build ScrollTriggers for evolution and arsenal sections
  useEffect(() => {
    const bp = isMobile ? 'mobile' : 'desktop';

    // Kill previous triggers (cleanup on breakpoint change)
    evolutionTriggerRef.current?.kill();
    evolutionTriggerRef.current = null;
    arsenalTriggerRef.current?.kill();
    arsenalTriggerRef.current = null;

    // Reduced motion: stay at arsenal final keyframe (static fallback)
    if (prefersReducedMotion) {
      const arsenalEnd = CAMERA_KEYFRAMES.arsenalEnd[bp];
      setTargetFromKeyframe(arsenalEnd);
      return;
    }

    const evolutionSection = document.querySelector(EVOLUTION_SECTION_ID);
    const arsenalSection = document.querySelector(ARSENAL_SECTION_ID);

    const hero = CAMERA_KEYFRAMES.hero[bp];
    const evoStart = CAMERA_KEYFRAMES.evolutionStart[bp];
    const evoEnd = CAMERA_KEYFRAMES.evolutionEnd[bp];
    const arsenalStart = CAMERA_KEYFRAMES.arsenalStart[bp];
    const arsenalEnd = CAMERA_KEYFRAMES.arsenalEnd[bp];

    // Evolution ScrollTrigger
    if (evolutionSection) {
      const evoTrigger = ScrollTrigger.create({
        trigger: evolutionSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress; // 0 → 1

          if (p <= 0.3) {
            // Phase 1: Hero → Evolution start (0% → 30%)
            const t = p / 0.3;
            lerpBetween(hero, evoStart, t);
          } else {
            // Phase 2: Evolution start → Evolution end (30% → 100%)
            const t = (p - 0.3) / 0.7;
            lerpBetween(evoStart, evoEnd, t);
          }
        },
      });
      evolutionTriggerRef.current = evoTrigger;
    }

    // Arsenal ScrollTrigger — lateral orbit axis crossing
    if (arsenalSection) {
      const arsenalTrigger = ScrollTrigger.create({
        trigger: arsenalSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress; // 0 → 1

          if (p <= ARSENAL_PHASE1_END) {
            // Phase 1: Evolution end → Arsenal start (axis crossing, 0% → 40%)
            const t = p / ARSENAL_PHASE1_END;
            lerpBetween(evoEnd, arsenalStart, t);
          } else {
            // Phase 2: Arsenal start → Arsenal end (close-up refinement, 40% → 100%)
            const t = (p - ARSENAL_PHASE1_END) / (1 - ARSENAL_PHASE1_END);
            lerpBetween(arsenalStart, arsenalEnd, t);
          }
        },
      });
      arsenalTriggerRef.current = arsenalTrigger;
    }

    return () => {
      evolutionTriggerRef.current?.kill();
      evolutionTriggerRef.current = null;
      arsenalTriggerRef.current?.kill();
      arsenalTriggerRef.current = null;
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
