import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fbm } from '@/design/noise';
import type { BeatId } from '@/components/3d/beat/beats';
import type { QualityTier } from '../perf/qualityContext';
import {
  headYawTarget,
  HEAD_BIAS_FACTOR,
  idleDrift,
  HEAD_LIMIT,
  RIG_AMPLITUDE,
  offsetQuaternion,
  softClamp,
  type BoneRole,
  type RestPose,
  type RigBones,
} from './rigBones';
import { BEAT_POSES, POSE_AMPLITUDE, POSE_ROLES } from './poses';
import { Spring } from './spring';
import { ANCHORS, updateAnchors } from './anchorStore';
import { landing, landingDebug, landingStep, LANDING_POSE } from '../landing';
import { lean, leanShoulderLift, leanStep, LEAN_SPINE2_WEIGHT } from './lean';
import { spiderSense, spiderSenseStep, spiderSenseTilt } from './spiderSense';
import { breathStep } from './breath';
import { beatRuntime } from '../beat/beatState';
import { publishRigDebug } from './rigDebug';

/** Head chain — the head leads, neck and upper spine follow. See spec §7.2. */
const HEAD_CHAIN = [
  { role: 'head' as BoneRole, k: 6, weight: 1 },
  { role: 'neck' as BoneRole, k: 3.2, weight: 0.35 },
  { role: 'spine2' as BoneRole, k: 1.8, weight: 0.15 },
];

/**
 * Procedural offset layers, one entry per bone role that carries extra motion
 * beyond the beat pose. Each writes its rotation offset (radians) into `out`
 * — no allocation per bone per frame.
 */
interface LayerContext {
  time: number;
  breath: number;
  leanValue: number;
  detailed: boolean;
}

type LayerFn = (role: BoneRole, ctx: LayerContext, out: THREE.Vector3) => void;

const tremorLayer: LayerFn = (_role, { time, detailed }, out) => {
  if (!detailed) {
    out.set(0, 0, 0);
    return;
  }
  const phase = time * Math.PI * 2 * RIG_AMPLITUDE.tremor.rate;
  out.set(
    Math.sin(phase) * RIG_AMPLITUDE.tremor.amount + fbm(time * 0.8) * RIG_AMPLITUDE.tremor.amount,
    0,
    Math.cos(phase * 0.7) * RIG_AMPLITUDE.tremor.amount * 0.6,
  );
};

const shoulderLayer: LayerFn = (role, _ctx, out) => {
  // Only registered for the two shoulder roles (see PROCEDURAL_LAYERS).
  out.set(0, 0, leanShoulderLift(role as 'shoulderL' | 'shoulderR'));
};

const hipsLayer: LayerFn = (_role, { time }, out) => {
  out.set(
    fbm(time * RIG_AMPLITUDE.sway.rate + 5.3) * RIG_AMPLITUDE.sway.pitch,
    fbm(time * RIG_AMPLITUDE.sway.rate) * RIG_AMPLITUDE.sway.yaw,
    fbm(time * RIG_AMPLITUDE.weightShift.rate + 21.1) * RIG_AMPLITUDE.weightShift.roll,
  );
};

const legLayer: LayerFn = (role, { time }, out) => {
  out.set(
    fbm(time * RIG_AMPLITUDE.legs.rate + (role === 'upLegL' ? 0 : 9.4)) * RIG_AMPLITUDE.legs.amount,
    0,
    0,
  );
};

const PROCEDURAL_LAYERS: Partial<Record<BoneRole, LayerFn>> = {
  spine1: (_role, { breath, leanValue }, out) =>
    out.set(breath * RIG_AMPLITUDE.breath.spine1 + leanValue, 0, 0),
  spine2: (_role, { breath, leanValue }, out) =>
    out.set(breath * RIG_AMPLITUDE.breath.spine2 + leanValue * LEAN_SPINE2_WEIGHT, 0, 0),
  shoulderL: shoulderLayer,
  shoulderR: shoulderLayer,
  hips: hipsLayer,
  handL: tremorLayer,
  handR: tremorLayer,
  upLegL: legLayer,
  upLegR: legLayer,
};

export interface ProceduralRigOptions {
  bones: RigBones;
  rest: Map<BoneRole, RestPose>;
  beat: BeatId;
  pointerRef: RefObject<{ x: number; y: number }>;
  headTracking: boolean;
  hasHover: boolean;
  /** Model group rotation (Y) — the neutral head yaw compensates for it. */
  baseYaw?: number;
  tier: QualityTier;
  prefersReducedMotion: boolean;
  debug?: boolean;
}

/**
 * useProceduralRig — additive motion layers on top of the captured rest pose.
 *
 * The GLB has no animation clips (`animations: 0`), so every movement is
 * procedural: breathing, sway, weight shift, micro tremor, beat poses and
 * head follow-through. All of it is applied as local rotation offsets, so the
 * authored pose is never overwritten.
 *
 * @see docs/specs/procedural-rig-motion.md
 */
export function useProceduralRig({
  bones,
  rest,
  beat,
  pointerRef,
  headTracking,
  hasHover,
  baseYaw = 0,
  tier,
  prefersReducedMotion,
  debug = false,
}: ProceduralRigOptions) {
  // Three springs per pose role (x, y, z) — array indexing, no string keys.
  const poseSprings = useMemo(() => {
    const map = new Map<BoneRole, Spring[]>();
    for (const role of POSE_ROLES) {
      map.set(role, [new Spring(0, 5.5, 1), new Spring(0, 5.5, 1), new Spring(0, 5.5, 1)]);
    }
    return map;
  }, []);

  const headSprings = useMemo(
    () =>
      HEAD_CHAIN.map((entry) => ({
        ...entry,
        yaw: new Spring(0, entry.k, 1),
        pitch: new Spring(0, entry.k, 1),
      })),
    [],
  );
  const headChainByRole = useMemo(
    () => new Map(headSprings.map((entry) => [entry.role, entry])),
    [headSprings],
  );

  const scratch = useMemo(
    () => ({
      pose: new THREE.Quaternion(),
      procedural: new THREE.Quaternion(),
      head: new THREE.Quaternion(),
      composed: new THREE.Quaternion(),
      sense: new THREE.Quaternion(),
      layer: new THREE.Vector3(),
    }),
    [],
  );
  const layerCtx = useMemo<LayerContext>(
    () => ({ time: 0, breath: 0, leanValue: 0, detailed: false }),
    [],
  );

  const timeRef = useRef(0);
  const idleRef = useRef(0);
  const worldScratch = useMemo(() => new THREE.Vector3(), []);

  // Reset springs on mount so the rig starts from the authored pose
  useEffect(() => {
    for (const springs of poseSprings.values()) {
      for (const spring of springs) spring.set(0);
    }
    for (const entry of headSprings) {
      entry.yaw.set(0);
      entry.pitch.set(0);
    }
  }, [poseSprings, headSprings]);

  useFrame((state, delta) => {
    // Anchors first: camera, lighting and post-processing read them every frame
    updateAnchors(bones);

    // Beat-response envelopes step before any early return so they decay even
    // while the pose is frozen (reduced motion) or the model is still loading.
    // The halo overlay and the lens flare read spiderSense; the spine reads
    // the breath — which catches while the sense rings.
    spiderSenseStep(delta, beat, beatRuntime.velocity);
    // Breath freezes under reduced motion (statue by design): the sample is
    // what `window.__rig` publishes, and a still-integrating phase made the
    // freeze probe report motion on a visually frozen pose.
    const breathSample = prefersReducedMotion ? 0 : breathStep(delta, beat, spiderSense.envelope);

    if (debug) {
      publishRigDebug({
        bones,
        restSize: rest.size,
        time: timeRef.current,
        breathSample,
        pointer: pointerRef.current,
        headTarget: [headSprings[0].yaw.target, headSprings[0].pitch.target],
        hasHover,
        leanValue: lean.value,
        worldScratch,
      });
      window.__landing = landingDebug();
    }

    if (rest.size === 0) return;

    if (prefersReducedMotion) {
      // Statue by design — the static composition must stay beautiful
      for (const [role, bone] of Object.entries(bones) as [BoneRole, THREE.Bone][]) {
        const base = rest.get(role);
        if (base) bone.quaternion.copy(base.quaternion);
      }
      return;
    }

    // Only advances when motion is allowed — otherwise the breathing phase
    // would keep running behind a frozen pose.
    timeRef.current += delta;
    const time = timeRef.current;

    const detailed = tier === 'high';
    const idleOnly = !hasHover;

    let targetYaw = 0;
    let targetPitch = 0;

    if (headTracking) {
      if (idleOnly) {
        idleRef.current += delta;
        const drift = idleDrift(idleRef.current);
        targetYaw = baseYaw * HEAD_BIAS_FACTOR + drift.yaw;
        targetPitch = drift.pitch;
      } else {
        const pointer = pointerRef.current;
        targetYaw = headYawTarget(pointer?.x ?? 0, baseYaw);
        targetPitch = softClamp(-(pointer?.y ?? 0), HEAD_LIMIT.pitch);
      }
    }

    // --- spider-sense alert snap (docs/specs/spider-sense.md §2) -----------
    // While the sense rings, the head whips toward the camera — the alert
    // look — then blends back to tracking as the envelope decays. The stiff
    // head springs (k=6) turn the blend into a snap and the decay into a
    // release.
    if (spiderSense.envelope > 0.01 && ANCHORS.ready) {
      const dx = state.camera.position.x - ANCHORS.head.x;
      const dy = state.camera.position.y - ANCHORS.head.y;
      const dz = state.camera.position.z - ANCHORS.head.z;
      const rawYaw = Math.atan2(dx, dz) - baseYaw;
      const yawToCamera =
        rawYaw >= 0
          ? softClamp(rawYaw, HEAD_LIMIT.yawRight)
          : -softClamp(-rawYaw, HEAD_LIMIT.yawLeft);
      const pitchToCamera = softClamp(Math.atan2(dy, Math.hypot(dx, dz)), HEAD_LIMIT.pitch);
      targetYaw = THREE.MathUtils.lerp(targetYaw, yawToCamera, spiderSense.envelope);
      targetPitch = THREE.MathUtils.lerp(targetPitch, pitchToCamera, spiderSense.envelope);
    }

    for (const entry of headSprings) {
      entry.yaw.target = targetYaw;
      entry.pitch.target = targetPitch;
      entry.yaw.step(delta);
      entry.pitch.step(delta);
    }

    // --- arrival landing (docs/specs/arrival-landing.md) ------------------
    landingStep(delta);

    // --- velocity lean (docs/specs/velocity-lean.md) -----------------------
    leanStep(delta, beatRuntime.velocity);

    const pose = BEAT_POSES[beat] ?? {};
    for (const role of POSE_ROLES) {
      const springs = poseSprings.get(role);
      if (!springs) continue;
      const target = pose[role];
      const landingOffset = LANDING_POSE[role];
      for (let axis = 0; axis < 3; axis++) {
        const spring = springs[axis];
        spring.target =
          POSE_AMPLITUDE * ((target?.[axis] ?? 0) + (landingOffset?.[axis] ?? 0) * landing.flex);
        spring.step(delta);
      }
    }

    layerCtx.time = time;
    layerCtx.breath = breathSample;
    layerCtx.leanValue = lean.value;
    layerCtx.detailed = detailed;

    for (const [role, bone] of Object.entries(bones) as [BoneRole, THREE.Object3D][]) {
      const base = rest.get(role);
      if (!base) continue;

      const poseSpring = poseSprings.get(role);
      const sx = poseSpring?.[0].value ?? 0;
      const sy = poseSpring?.[1].value ?? 0;
      const sz = poseSpring?.[2].value ?? 0;
      offsetQuaternion(scratch.pose, sx, sy, sz);

      const layer = PROCEDURAL_LAYERS[role];
      if (layer) {
        layer(role, layerCtx, scratch.layer);
        offsetQuaternion(scratch.procedural, scratch.layer.x, scratch.layer.y, scratch.layer.z);
      } else {
        offsetQuaternion(scratch.procedural, 0, 0, 0);
      }

      scratch.composed.copy(base.quaternion).multiply(scratch.pose).multiply(scratch.procedural);

      const chain = headChainByRole.get(role);
      if (chain) {
        // final = rest * headOffset (offset applied in local space)
        offsetQuaternion(scratch.head, chain.pitch.value, chain.yaw.value, 0);
        scratch.head.premultiply(base.quaternion);
        scratch.composed.slerp(scratch.head, chain.weight);
      }

      // spider-sense tick: head leads the boundary shiver, neck follows.
      // Applied after the chain so the tracking spring cannot mask it.
      if ((role === 'head' || role === 'neck') && spiderSense.envelope > 0) {
        offsetQuaternion(scratch.sense, 0, 0, spiderSenseTilt() * (role === 'head' ? 1 : 0.4));
        scratch.composed.multiply(scratch.sense);
      }

      bone.quaternion.copy(scratch.composed);
    }
  });
}
