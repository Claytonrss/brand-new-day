import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '../beat/beatContext';
import type { BeatId } from '../beat/beats';
import { CHEST_Y, WRIST_POSITION } from '../beat/beats';
import { ANCHORS } from '../rig/anchorStore';
import { FX } from './fxUniforms';
import { FX_MODE, FX_STRENGTH } from '../../../design/fxFlags';

/** Per-beat targets for the material layer. See spec §7.2. */
interface BeatTargets {
  rim: number;
  web: number;
  lens: number;
  bokeh: number;
}

const TARGETS: Record<BeatId, BeatTargets> = {
  hero: { rim: 0.22, web: 0.05, lens: 1.0, bokeh: 3.0 },
  chapter1: { rim: 0.15, web: 0.03, lens: 0.9, bokeh: 2.0 },
  chapter2: { rim: 0.15, web: 0.03, lens: 0.9, bokeh: 2.0 },
  evolution: { rim: 0.32, web: 0.16, lens: 1.25, bokeh: 4.0 },
  arsenal: { rim: 0.28, web: 0.09, lens: 1.1, bokeh: 3.5 },
  fullBody: { rim: 0.4, web: 0.11, lens: 1.15, bokeh: 2.5 },
};

/** Exponential smoothing rate for beat transitions. */
const K = 3;

/** World-space anchors for the depth-of-field target, per beat. */
export function dofAnchor(beat: BeatId, isMobile: boolean, out: THREE.Vector3): THREE.Vector3 {
  const wrist = isMobile ? WRIST_POSITION.mobile : WRIST_POSITION.desktop;

  switch (beat) {
    // Focus the measured joints, falling back to the authored anchors only
    // before the rig has published them.
    case 'evolution':
      return ANCHORS.ready ? out.copy(ANCHORS.chest) : out.set(0, CHEST_Y[isMobile ? 'mobile' : 'desktop'], 0);
    case 'arsenal':
      return ANCHORS.ready ? out.copy(ANCHORS.wrist) : out.set(wrist[0], wrist[1], wrist[2]);
    case 'fullBody':
      return out.copy(ANCHORS.hips).setY(ANCHORS.hips.y + 1.2);
    default:
      return out.copy(ANCHORS.head);
  }
}

/**
 * MaterialFxDriver — animates the shared material uniforms from beat state.
 *
 * Also exposes the current beat's bokeh scale and depth-of-field anchor for
 * the EffectsStack.
 *
 * @see docs/specs/authorial-shaders-fx.md §7.2
 */
export interface FxDebugState {
  rim: number;
  web: number;
  lens: number;
  sweep: number;
  bokeh: number;
  beat: BeatId;
}

declare global {
  interface Window {
    __fx?: FxDebugState;
  }
}

export function useMaterialFx(isMobile: boolean, prefersReducedMotion = false) {
  const { beat, stateRef } = useBeat();
  const anchor = useMemo(() => new THREE.Vector3(), []);
  const bokehRef = useRef(TARGETS.hero.bokeh);
  const debug = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'),
    [],
  );

  useFrame(({ clock }, delta) => {
    const targets = TARGETS[beat];
    const alpha = 1 - Math.exp(-K * delta);

    if (prefersReducedMotion) {
      // Frozen: the web weave is the only time-driven term, so holding uTime
      // and zeroing the weave keeps the frame byte-identical (spec §9).
      FX.uWebStrength.value = 0;
      FX.uSweep.value = 0;
      FX.uLensPulse.value = 1;
      FX.uRimStrength.value = 0;
      return;
    }

    const strength = FX_STRENGTH[FX_MODE];

    FX.uTime.value = clock.elapsedTime;
    FX.uRimStrength.value = THREE.MathUtils.lerp(FX.uRimStrength.value, targets.rim * strength, alpha);
    FX.uWebStrength.value = THREE.MathUtils.lerp(FX.uWebStrength.value, targets.web * strength, alpha);
    // Lens pulse is a multiplier: keep it centred on 1 so `subtle` never
    // brightens the mask, it only modulates it.
    const lensTarget = FX_MODE === 'off' ? 1 : 1 + (targets.lens - 1) * strength;
    FX.uLensPulse.value = THREE.MathUtils.lerp(FX.uLensPulse.value, lensTarget, alpha);
    FX.uBeat.value = stateRef.current?.t ?? 0;

    // Beat 2 band: active between 50% and 70% of the evolution beat
    const t = stateRef.current?.t ?? 0;
    const inBeat = beat === 'evolution';
    const sweep = inBeat ? Math.max(0, Math.sin(Math.min(Math.max((t - 0.5) / 0.2, 0), 1) * Math.PI)) : 0;
    FX.uSweep.value = THREE.MathUtils.lerp(FX.uSweep.value, sweep * strength, alpha);
    FX.uSweepY.value = ANCHORS.ready ? ANCHORS.chest.y : CHEST_Y[isMobile ? 'mobile' : 'desktop'];

    bokehRef.current = THREE.MathUtils.lerp(
      bokehRef.current,
      FX_MODE === 'full' ? targets.bokeh : 2,
      alpha,
    );
    dofAnchor(beat, isMobile, anchor);

    if (debug) {
      window.__fx = {
        rim: FX.uRimStrength.value,
        web: FX.uWebStrength.value,
        lens: FX.uLensPulse.value,
        sweep: FX.uSweep.value,
        bokeh: bokehRef.current,
        beat,
      };
    }
  });

  return { anchor, bokehRef };
}
