import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '../beat/beatContext';
import type { BeatId } from '../beat/beats';
import { CHEST_Y, WRIST_POSITION } from '../beat/beats';
import { ANCHORS } from '../rig/anchorStore';
import { FX } from './fxUniforms';
import { FX_MODE, FX_STRENGTH } from '../../../design/fxFlags';
import { BLINK_AMOUNT, BLINK_MODE, blinkClosure, nextBlinkAt, rand } from './blink';
import { SPIDER_SENSE, spiderSense } from '../rig/spiderSense';

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
  colophon: { rim: 0.12, web: 0.02, lens: 0.85, bokeh: 1.5 },
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
      return ANCHORS.ready
        ? out.copy(ANCHORS.chest)
        : out.set(0, CHEST_Y[isMobile ? 'mobile' : 'desktop'], 0);
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
export interface FxBlinkDebug {
  /** Scheduled time of the next blink (seconds since load). */
  at: number;
  /** Start time of the blink currently playing, or -1. */
  start: number;
  /** How many blinks have played — robust signal for tests. */
  count: number;
}

export interface FxDebugState {
  rim: number;
  web: number;
  lens: number;
  sweep: number;
  bokeh: number;
  blink: number;
  blinkState: FxBlinkDebug;
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
  const blinkRef = useRef({ at: 0, start: -1, seed: 0, count: 0 });
  const debug = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'),
    [],
  );

  const publish = (visible: boolean, web: number, sweep: number, rim: number, lens: number) => {
    if (!debug || typeof window === 'undefined') return;
    window.__fx = {
      rim,
      web,
      sweep,
      lens,
      bokeh: bokehRef.current,
      blink: visible ? FX.uBlink.value : 0,
      blinkState: {
        at: blinkRef.current.at,
        start: blinkRef.current.start,
        count: blinkRef.current.count,
      },
      beat,
    };
  };

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
      FX.uBlink.value = 0;
      // still publish, otherwise the debug probe disappears under reduced motion
      publish(true, 0, 0, 0, 1);
      return;
    }

    // --- stylised blink (mask lenses have no eyelids) ----------------------
    if (BLINK_MODE === 'hold') {
      // pinned closed for visual review
      FX.uBlink.value = 1;
    } else if (BLINK_MODE === 'off') {
      FX.uBlink.value = 0;
    } else {
      const blink = blinkRef.current;
      const now = clock.elapsedTime;

      if (blink.at === 0) {
        blink.seed = rand(now + 3.1);
        blink.at = nextBlinkAt(now + 1.2, blink.seed);
      }

      // Start on the scheduled time, not on the frame time: at very low frame
      // rates the frame can land anywhere inside the window.
      if (blink.start < 0 && now >= blink.at) blink.start = blink.at;
      if (blink.start >= 0) {
        const closure = blinkClosure(now - blink.start, BLINK_AMOUNT[BLINK_MODE]);
        FX.uBlink.value = closure;
        if (now - blink.start > 0.2) {
          blink.start = -1;
          blink.count += 1;
          blink.seed += 1;
          blink.at = nextBlinkAt(now, blink.seed);
        }
      }
    }

    const strength = FX_STRENGTH[FX_MODE];

    FX.uTime.value = clock.elapsedTime;
    FX.uRimStrength.value = THREE.MathUtils.lerp(
      FX.uRimStrength.value,
      targets.rim * strength,
      alpha,
    );
    FX.uWebStrength.value = THREE.MathUtils.lerp(
      FX.uWebStrength.value,
      targets.web * strength,
      alpha,
    );
    // Lens pulse is a multiplier: keep it centred on 1 so `subtle` never
    // brightens the mask, it only modulates it.
    const lensTarget = FX_MODE === 'off' ? 1 : 1 + (targets.lens - 1) * strength;
    let lens = THREE.MathUtils.lerp(FX.uLensPulse.value, lensTarget, alpha);
    // Spider-sense (spec §2): the lenses flare while the sense rings — the
    // eyes go wide — on top of the beat's own target.
    lens += SPIDER_SENSE.LENS_BOOST * spiderSense.envelope * strength;
    FX.uLensPulse.value = lens;
    FX.uBeat.value = stateRef.current?.t ?? 0;

    // Beat 2 band: active between 50% and 70% of the evolution beat
    const t = stateRef.current?.t ?? 0;
    const inBeat = beat === 'evolution';
    const sweep = inBeat
      ? Math.max(0, Math.sin(Math.min(Math.max((t - 0.5) / 0.2, 0), 1) * Math.PI))
      : 0;
    FX.uSweep.value = THREE.MathUtils.lerp(FX.uSweep.value, sweep * strength, alpha);
    FX.uSweepY.value = ANCHORS.ready ? ANCHORS.chest.y : CHEST_Y[isMobile ? 'mobile' : 'desktop'];

    bokehRef.current = THREE.MathUtils.lerp(
      bokehRef.current,
      FX_MODE === 'full' ? targets.bokeh : 2,
      alpha,
    );
    dofAnchor(beat, isMobile, anchor);

    publish(
      true,
      FX.uWebStrength.value,
      FX.uSweep.value,
      FX.uRimStrength.value,
      FX.uLensPulse.value,
    );
  });

  return { anchor, bokehRef };
}
