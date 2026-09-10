import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '../beat/beatContext';
import { ANCHORS } from '../rig/anchorStore';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useQualityProfile } from '../qualityContext';
import { INTERACTION } from './interactionStore';
import { dragTarget, gyroTarget, rimOffset } from './pointerMath';
import { windowPointer } from '../rig/windowPointer';

export interface InteractionDebugState {
  yaw: number;
  pitch: number;
  dragging: boolean;
  cameraKick: number;
  shotId: number;
  rimX: number;
  rimY: number;
}

declare global {
  interface Window {
    __interaction?: InteractionDebugState;
  }
}

/** Spring rate for the drag → rest transition. */
const RETURN_K = 4;

/**
 * useInteraction — pointer drag, device orientation and the web-shot trigger.
 *
 * The canvas is `pointer-events: none` (scroll storytelling needs the HTML
 * sections above it), so every listener is registered on the window.
 *
 * @see docs/specs/model-interaction.md
 */
export function useInteraction() {
  const camera = useThree((state) => state.camera);
  const profile = useQualityProfile();
  const { stateRef } = useBeat();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const dragRef = useRef({ active: false, x: 0, y: 0, yaw: 0, pitch: 0 });
  const gyroRef = useRef({ gamma: 0, beta: 0, origin: null as null | { gamma: number; beta: number } });
  const target = useMemo(() => ({ yaw: 0, pitch: 0 }), []);
  const debug = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('debug'),
    [],
  );
  const direction = useMemo(() => new THREE.Vector3(), []);

  // --- pointer drag --------------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion) return;

    const onDown = (event: PointerEvent) => {
      dragRef.current.active = true;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;
      INTERACTION.dragging = true;
    };

    const onMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;
      const drag = dragRef.current;
      const desired = dragTarget(event.clientX - drag.x, event.clientY - drag.y);
      drag.yaw = desired.yaw;
      drag.pitch = desired.pitch;
    };

    const onUp = () => {
      dragRef.current.active = false;
      INTERACTION.dragging = false;
    };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      INTERACTION.dragging = false;
    };
  }, [prefersReducedMotion]);

  // --- device orientation (mobile parallax) --------------------------------
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;
    if (!('DeviceOrientationEvent' in window)) return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      const gyro = gyroRef.current;
      gyro.gamma = event.gamma;
      gyro.beta = event.beta;
      if (!gyro.origin) gyro.origin = { gamma: event.gamma, beta: event.beta };
    };

    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [prefersReducedMotion]);

  // --- web-shot trigger (Beat 3, high tier) --------------------------------
  useEffect(() => {
    if (prefersReducedMotion || profile.tier !== 'high') return;

    const onDown = () => {
      if (stateRef.current?.beat !== 'arsenal') return;

      INTERACTION.shotId += 1;
      INTERACTION.shotFrom.copy(ANCHORS.ready ? ANCHORS.wrist : new THREE.Vector3(-1.6, -2.3, 1.2));
      INTERACTION.shotTo.copy(INTERACTION.shotFrom).addScaledVector(cameraForward(), 6);
      INTERACTION.cameraKick = 1;
    };

    const cameraForward = () => {
      camera.getWorldDirection(direction);
      return direction;
    };

    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [camera, direction, prefersReducedMotion, profile.tier, stateRef]);

  // --- per-frame integration ----------------------------------------------
  useFrame((_, delta) => {
    const drag = dragRef.current;

    if (prefersReducedMotion) {
      INTERACTION.yaw = 0;
      INTERACTION.pitch = 0;
      INTERACTION.cameraKick = 0;
      return;
    }

    // drag and gyro add up, then release returns to rest with a spring
    const gyroState = gyroRef.current;
    const gyro = gyroState.origin
      ? gyroTarget(gyroState.gamma, gyroState.beta, gyroState.origin)
      : { yaw: 0, pitch: 0 };

    target.yaw = (drag.active ? drag.yaw : 0) + gyro.yaw;
    target.pitch = (drag.active ? drag.pitch : 0) + gyro.pitch;

    const alpha = drag.active ? 1 : 1 - Math.exp(-RETURN_K * delta);
    INTERACTION.yaw = THREE.MathUtils.lerp(INTERACTION.yaw, target.yaw, alpha);
    INTERACTION.pitch = THREE.MathUtils.lerp(INTERACTION.pitch, target.pitch, alpha);

    // camera kick decays after a shot
    INTERACTION.cameraKick = THREE.MathUtils.lerp(INTERACTION.cameraKick, 0, 1 - Math.exp(-6 * delta));

    // rim light reacts to the cursor
    const rim = rimOffset(windowPointer.x, windowPointer.y);
    INTERACTION.rimX = rim.x;
    INTERACTION.rimY = rim.y;

    if (debug) {
      window.__interaction = {
        yaw: INTERACTION.yaw,
        pitch: INTERACTION.pitch,
        dragging: INTERACTION.dragging,
        cameraKick: INTERACTION.cameraKick,
        shotId: INTERACTION.shotId,
        rimX: INTERACTION.rimX,
        rimY: INTERACTION.rimY,
      };
    }
  });

  return INTERACTION;
}
