import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '@/components/3d/beat/beatContext';
import { ANCHORS } from '@/components/3d/rig/anchorStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { isDebugMode } from '@/lib/debugFlag';
import { smooth } from '@/lib/math';
import { useQualityProfile } from '@/components/3d/perf/qualityContext';
import { INTERACTION } from './interactionStore';
import { arsenalReveal } from './arsenalReveal';
import {
  accumulateSaturation,
  dragTarget,
  gyroTarget,
  isTap,
  rimOffset,
  GYRO_LIMITS,
  GYRO_SATURATION_RATIO,
  GYRO_SATURATION_S,
  type PointerSample,
} from './pointerMath';
import { getGyroController, gyroReading, recenterGyro, type GyroState } from './gyroController';
import { windowPointer } from '@/components/3d/rig/windowPointer';

/** `window.__interaction.gyro` — the full sensor chain for the `?debug` HUD. */
export interface GyroDebugState {
  state: GyroState;
  eventsHz: number;
  rawGamma: number;
  rawBeta: number;
  fGamma: number;
  fBeta: number;
  originGamma: number | null;
  originBeta: number | null;
  targetYaw: number;
  targetPitch: number;
}

export interface InteractionDebugState {
  yaw: number;
  pitch: number;
  dragging: boolean;
  cameraKick: number;
  shotId: number;
  rimX: number;
  rimY: number;
  arsenalHudRevealed: boolean;
  gyro: GyroDebugState;
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
  const { beat, stateRef } = useBeat();
  const prefersReducedMotion = usePrefersReducedMotion();
  // Drag-orbit is hover-only (same input-class gate as head tracking and the
  // camera/CSS parallax): on touch, every scroll swipe starts with a
  // `pointerdown`, so an ungated drag fights the page's primary gesture and
  // jitters the model. Touch keeps gyro + tap-to-shoot + idle drift.
  const hasHover = useMediaQuery('(hover: hover)');

  const dragRef = useRef({ active: false, x: 0, y: 0, yaw: 0, pitch: 0 });
  const target = useMemo(() => ({ yaw: 0, pitch: 0 }), []);
  const debug = useMemo(isDebugMode, []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const saturationRef = useRef(0);

  // --- pointer drag --------------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion || !hasHover) return;

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
  }, [prefersReducedMotion, hasHover]);

  // --- device orientation (mobile parallax) --------------------------------
  // The permission gate lives in `gyroController` (ADR-018): on iOS the
  // listener is only attached after a gesture grants access. Nothing here
  // touches the sensor before that.
  useEffect(() => {
    if (prefersReducedMotion) return;
    getGyroController().init();
  }, [prefersReducedMotion]);

  // The colophon hands the frame to the text — the model is out of the shot,
  // so the sensor only burns battery there (ADR-031). The tab/scene sources
  // are independent pauses: the controller only listens with none open.
  useEffect(() => {
    const controller = getGyroController();
    if (prefersReducedMotion) return;
    if (beat === 'colophon') controller.suspend('scene');
    else controller.resume('scene');
    return () => controller.resume('scene');
  }, [beat, prefersReducedMotion]);

  // --- web-shot trigger (Beat 3) -------------------------------------------
  // Gate mirrors the hint (WebShootHint): the shot is one draw call and never
  // justified tier `high`. Was `high`-only (FALHA-12); aligned in Wave 1
  // because the correct mobile tier (`medium`) would otherwise leave the
  // advertised shot permanently dead on every phone.
  //
  // FALHA-13: the shot fires on `pointerup` through the isTap classifier —
  // a gesture that travels or lingers is a drag (orbit) and never shoots.
  useEffect(() => {
    if (prefersReducedMotion || profile.tier === 'low') return;

    let down: PointerSample | null = null;

    const onDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY, time: performance.now() };
    };

    const onUp = (event: PointerEvent) => {
      const start = down;
      down = null;
      if (!start) return;
      if (!isTap(start, { x: event.clientX, y: event.clientY, time: performance.now() })) {
        return;
      }
      if (stateRef.current?.beat !== 'arsenal') return;

      INTERACTION.shotId += 1;
      INTERACTION.shotFrom.copy(ANCHORS.ready ? ANCHORS.wrist : new THREE.Vector3(-1.6, -2.3, 1.2));
      INTERACTION.shotTo.copy(INTERACTION.shotFrom).addScaledVector(cameraForward(), 6);
      INTERACTION.cameraKick = 1;
      // Same gesture, one more effect: the shot IS the discovery beat — the
      // annotation HUD reveals with the strand (web-shoot-discovery.md §5).
      arsenalReveal.reveal();
    };

    const onCancel = () => {
      down = null;
    };

    const cameraForward = () => {
      camera.getWorldDirection(direction);
      return direction;
    };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [camera, direction, prefersReducedMotion, profile.tier, stateRef]);

  // --- per-frame integration ----------------------------------------------
  const publish = (gyroTargetOut: { yaw: number; pitch: number }) => {
    if (!debug || typeof window === 'undefined') return;
    const reading = gyroReading;
    const filtered = Number.isNaN(reading.fGamma);
    window.__interaction = {
      yaw: INTERACTION.yaw,
      pitch: INTERACTION.pitch,
      dragging: INTERACTION.dragging,
      cameraKick: INTERACTION.cameraKick,
      shotId: INTERACTION.shotId,
      rimX: INTERACTION.rimX,
      rimY: INTERACTION.rimY,
      arsenalHudRevealed: arsenalReveal.revealed,
      gyro: {
        state: getGyroController().getState(),
        eventsHz: reading.hz,
        rawGamma: reading.rawGamma,
        rawBeta: reading.rawBeta,
        fGamma: filtered ? reading.rawGamma : reading.fGamma,
        fBeta: filtered ? reading.rawBeta : reading.fBeta,
        originGamma: reading.origin?.gamma ?? null,
        originBeta: reading.origin?.beta ?? null,
        targetYaw: gyroTargetOut.yaw,
        targetPitch: gyroTargetOut.pitch,
      },
    };
  };

  useFrame((_, delta) => {
    const drag = dragRef.current;

    if (prefersReducedMotion) {
      INTERACTION.yaw = 0;
      INTERACTION.pitch = 0;
      INTERACTION.cameraKick = 0;
      INTERACTION.dragging = false;
      INTERACTION.rimX = 0;
      INTERACTION.rimY = 0;
      // still publish, otherwise the probe disappears under reduced motion
      publish({ yaw: 0, pitch: 0 });
      return;
    }

    // drag and gyro add up, then release returns to rest with a spring.
    // The gyro side reads the FILTERED stream — raw degrees would put the
    // sensor's quantization steps straight into the pose.
    const gyro = gyroReading.origin
      ? gyroTarget(gyroReading.fGamma, gyroReading.fBeta, gyroReading.origin)
      : { yaw: 0, pitch: 0 };

    // A target pinned near a clamp for a while means the user turned the
    // phone and the baseline is stale — rebaseline so the tilt recenters.
    const saturated =
      Math.abs(gyro.yaw) > GYRO_LIMITS.yaw * GYRO_SATURATION_RATIO ||
      Math.abs(gyro.pitch) > GYRO_LIMITS.pitch * GYRO_SATURATION_RATIO;
    saturationRef.current = accumulateSaturation(saturationRef.current, saturated, delta);
    if (saturationRef.current >= GYRO_SATURATION_S) {
      recenterGyro();
      saturationRef.current = 0;
    }

    target.yaw = (drag.active ? drag.yaw : 0) + gyro.yaw;
    target.pitch = (drag.active ? drag.pitch : 0) + gyro.pitch;

    const alpha = drag.active ? 1 : smooth(delta, RETURN_K);
    INTERACTION.yaw = THREE.MathUtils.lerp(INTERACTION.yaw, target.yaw, alpha);
    INTERACTION.pitch = THREE.MathUtils.lerp(INTERACTION.pitch, target.pitch, alpha);

    // camera kick decays after a shot
    INTERACTION.cameraKick = THREE.MathUtils.lerp(INTERACTION.cameraKick, 0, smooth(delta, 6));

    // rim light reacts to the cursor
    const rim = rimOffset(windowPointer.x, windowPointer.y);
    INTERACTION.rimX = rim.x;
    INTERACTION.rimY = rim.y;

    publish(gyro);
  });

  return INTERACTION;
}
