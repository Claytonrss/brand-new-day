import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from './beat/beatContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import { useQualityProfile } from './qualityContext';
import { CameraTrack, createCameraSample, type Breakpoint } from './camera/cameraPath';
import { fbm } from './camera/handheld';
import { INTERACTION } from './interaction/interactionStore';

const LERP_K = 2;

/** Handheld noise amplitude (world units) and rate (Hz). */
const HANDHELD_POSITION = 0.028;
const HANDHELD_LOOK = 0.02;
const HANDHELD_RATE = 0.15;

/** Velocity coupling — lens inertia. */
const FOV_PUNCH_MAX = 2;
const FOV_PUNCH_K = 6;
const DOLLY_LAG_MAX = 0.12;
const DOLLY_LAG_K = 0.04;
const VELOCITY_SMOOTH_K = 6;

/**
 * CameraRig — scroll-driven camera on a single Catmull-Rom track.
 *
 * Replaces the piecewise linear interpolation of the previous version, which
 * produced constant velocity and a direction discontinuity at every beat
 * boundary. Reads the shared beat state instead of owning a ScrollTrigger.
 *
 * @see docs/specs/cinematic-camera-path.md
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const { beat, stateRef } = useBeat();
  const profile = useQualityProfile();
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const breakpoint: Breakpoint = isMobile ? 'mobile' : 'desktop';
  const track = useMemo(() => new CameraTrack(breakpoint), [breakpoint]);

  const target = useMemo(createCameraSample, []);
  const current = useMemo(createCameraSample, []);
  const targetLookAt = useMemo(() => new THREE.Vector3(), []);
  const dollyDirection = useMemo(() => new THREE.Vector3(), []);
  const velocityRef = useRef(0);
  const initializedRef = useRef(false);
  const debugRef = useRef(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'),
  );

  // Re-seed the current pose when the breakpoint changes (no teleport)
  useEffect(() => {
    if (initializedRef.current) return;
    track.sample('hero', 0, target);
    current.position.copy(target.position);
    current.lookAt.copy(target.lookAt);
    current.fov = target.fov;
    initializedRef.current = true;
  }, [track, target, current]);

  useFrame(({ clock }, delta) => {
    const alpha = 1 - Math.exp(-LERP_K * delta);

    if (prefersReducedMotion) {
      // Static framing per section — fixes the old "fullBody everywhere" bug
      track.framingFor(beat, target);
      current.position.copy(target.position);
      current.lookAt.copy(target.lookAt);
      current.fov = target.fov;
    } else {
      const state = stateRef.current;
      track.sample(state.beat, state.t, target);

      const effectsEnabled = profile.tier !== 'low';

      if (effectsEnabled) {
        velocityRef.current = THREE.MathUtils.lerp(
          velocityRef.current,
          state.velocity,
          1 - Math.exp(-VELOCITY_SMOOTH_K * delta),
        );

        const time = clock.elapsedTime * HANDHELD_RATE;
        target.position.x += fbm(time) * HANDHELD_POSITION;
        target.position.y += fbm(time + 37.7) * HANDHELD_POSITION;
        targetLookAt.set(
          target.lookAt.x + fbm(time + 11.3) * HANDHELD_LOOK,
          target.lookAt.y + fbm(time + 53.1) * HANDHELD_LOOK,
          target.lookAt.z,
        );

        const punch = THREE.MathUtils.clamp(
          velocityRef.current * FOV_PUNCH_K,
          -FOV_PUNCH_MAX,
          FOV_PUNCH_MAX,
        );
        target.fov += punch + INTERACTION.cameraKick * 1.5;

        dollyDirection.copy(target.lookAt).sub(target.position).normalize();
        const lag = THREE.MathUtils.clamp(
          velocityRef.current * DOLLY_LAG_K,
          -DOLLY_LAG_MAX,
          DOLLY_LAG_MAX,
        );
        target.position.addScaledVector(dollyDirection, lag);
      } else {
        targetLookAt.copy(target.lookAt);
      }

      current.position.lerp(target.position, alpha);
      current.lookAt.lerp(effectsEnabled ? targetLookAt : target.lookAt, alpha);
      current.fov = THREE.MathUtils.lerp(current.fov, target.fov, alpha);
    }

    camera.position.copy(current.position);
    camera.lookAt(current.lookAt);

    if (debugRef.current && typeof window !== 'undefined') {
      const world = ((window as unknown as Record<string, unknown>).__world ?? {}) as Record<string, unknown>;
      world.camera = [+camera.position.x.toFixed(3), +camera.position.y.toFixed(3), +camera.position.z.toFixed(3)];
      world.cameraLookAt = [+current.lookAt.x.toFixed(3), +current.lookAt.y.toFixed(3), +current.lookAt.z.toFixed(3)];
      (window as unknown as Record<string, unknown>).__world = world;
    }

    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = current.fov;
    perspective.updateProjectionMatrix();
  });

  return null;
}
