import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fbm } from '../../../design/noise';
import type { BeatId } from '../beat/beats';
import type { QualityTier } from '../qualityContext';
import {
  headYawTarget,
  HEAD_BIAS_FACTOR,
  idleDrift,
  HEAD_LIMIT,
  MOTION,
  offsetQuaternion,
  softClamp,
  type BoneRole,
  type RestPose,
  type RigBones,
} from './rigBones';
import { BEAT_POSES, POSE_AMPLITUDE, POSE_ROLES } from './poses';
import { Spring } from './spring';
import { updateAnchors } from './anchorStore';
import { landing, landingDebug, landingStep, LANDING_POSE } from '../landing';
import { lean, leanShoulderLift, leanStep, LEAN_SPINE2_WEIGHT } from './lean';
import { spiderSense, spiderSenseStep, spiderSenseTilt } from './spiderSense';
import { breathStep } from './breath';
import { beatRuntime } from '../beat/beatState';

/** Head chain — the head leads, neck and upper spine follow. See spec §7.2. */
const HEAD_CHAIN = [
  { role: 'head' as BoneRole, k: 6, weight: 1 },
  { role: 'neck' as BoneRole, k: 3.2, weight: 0.35 },
  { role: 'spine2' as BoneRole, k: 1.8, weight: 0.15 },
];

export interface RigDebugState {
  head: [number, number, number, number];
  neck: [number, number, number, number];
  spine2: [number, number, number, number];
  /** World positions (x, y, z) of the joints used to calibrate anchors. */
  world: Partial<Record<BoneRole, [number, number, number]>>;
  breath: number;
  time: number;
  joints: number;
  pointer: [number, number];
  target: [number, number];
  hover: boolean;
  lean: number;
  /** Spider-sense envelope (0..1) — spikes when the narrative beat changes. */
  sense: number;
}

declare global {
  interface Window {
    __rig?: RigDebugState;
  }
}

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
  const poseSprings = useMemo(() => {
    const map = new Map<string, Spring>();
    for (const role of POSE_ROLES) {
      for (let axis = 0; axis < 3; axis++) {
        map.set(`${role}:${axis}`, new Spring(0, 5.5, 1));
      }
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

  const scratch = useMemo(
    () => ({
      pose: new THREE.Quaternion(),
      procedural: new THREE.Quaternion(),
      head: new THREE.Quaternion(),
      composed: new THREE.Quaternion(),
      sense: new THREE.Quaternion(),
    }),
    [],
  );

  const timeRef = useRef(0);
  const idleRef = useRef(0);
  const worldScratch = useMemo(() => new THREE.Vector3(), []);

  // Reset springs on mount so the rig starts from the authored pose
  useEffect(() => {
    for (const spring of poseSprings.values()) spring.set(0);
    for (const entry of headSprings) {
      entry.yaw.set(0);
      entry.pitch.set(0);
    }
  }, [poseSprings, headSprings]);

  useFrame((_, delta) => {
    // Anchors first: camera, lighting and post-processing read them every frame
    updateAnchors(bones);

    // Beat-response envelopes step before any early return so they decay even
    // while the pose is frozen (reduced motion) or the model is still loading.
    // LightRig reads spiderSense for the rim flash; the spine reads the breath.
    spiderSenseStep(delta, beat);
    const breathSample = breathStep(delta, beat);

    if (debug && typeof window !== 'undefined') {
      const read = (role: BoneRole): [number, number, number, number] => {
        const bone = bones[role];
        return bone
          ? [bone.quaternion.x, bone.quaternion.y, bone.quaternion.z, bone.quaternion.w]
          : [0, 0, 0, 1];
      };
      const world: Partial<Record<BoneRole, [number, number, number]>> = {};
      for (const role of [
        'head',
        'neck',
        'spine2',
        'spine1',
        'hips',
        'armR',
        'foreArmR',
        'handR',
        'armL',
        'foreArmL',
        'handL',
      ] as BoneRole[]) {
        const bone = bones[role];
        if (!bone) continue;
        bone.getWorldPosition(worldScratch);
        world[role] = [
          +worldScratch.x.toFixed(3),
          +worldScratch.y.toFixed(3),
          +worldScratch.z.toFixed(3),
        ];
      }

      window.__rig = {
        head: read('head'),
        neck: read('neck'),
        spine2: read('spine2'),
        world,
        breath: breathSample,
        time: timeRef.current,
        joints: rest.size,
        pointer: [pointerRef.current?.x ?? 0, pointerRef.current?.y ?? 0],
        target: [headSprings[0].yaw.target, headSprings[0].pitch.target],
        hover: hasHover,
        lean: lean.value,
        sense: spiderSense.envelope,
      };
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

    // --- pointer / idle target -------------------------------------------
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

    // --- pose layer -------------------------------------------------------
    const pose = BEAT_POSES[beat] ?? {};
    for (const role of POSE_ROLES) {
      const target = pose[role];
      const landingOffset = LANDING_POSE[role];
      for (let axis = 0; axis < 3; axis++) {
        const spring = poseSprings.get(`${role}:${axis}`);
        if (!spring) continue;
        spring.target =
          POSE_AMPLITUDE * ((target?.[axis] ?? 0) + (landingOffset?.[axis] ?? 0) * landing.flex);
        spring.step(delta);
      }
    }

    // --- compose per bone -------------------------------------------------
    for (const [role, bone] of Object.entries(bones) as [BoneRole, THREE.Object3D][]) {
      const base = rest.get(role);
      if (!base) continue;

      // pose offsets
      const sx = poseSprings.get(`${role}:0`)?.value ?? 0;
      const sy = poseSprings.get(`${role}:1`)?.value ?? 0;
      const sz = poseSprings.get(`${role}:2`)?.value ?? 0;
      offsetQuaternion(scratch.pose, sx, sy, sz);

      // procedural layers
      let px = 0;
      let py = 0;
      let pz = 0;

      if (role === 'spine1') {
        px = breathSample * MOTION.breath.spine1 + lean.value;
      } else if (role === 'spine2') {
        px = breathSample * MOTION.breath.spine2 + lean.value * LEAN_SPINE2_WEIGHT;
      } else if (role === 'shoulderL' || role === 'shoulderR') {
        pz = leanShoulderLift(role);
      } else if (role === 'hips') {
        py = fbm(time * MOTION.sway.rate) * MOTION.sway.yaw;
        px = fbm(time * MOTION.sway.rate + 5.3) * MOTION.sway.pitch;
        pz = fbm(time * MOTION.weightShift.rate + 21.1) * MOTION.weightShift.roll;
      } else if (role === 'handL' || role === 'handR') {
        if (detailed) {
          const phase = time * Math.PI * 2 * MOTION.tremor.rate;
          px = Math.sin(phase) * MOTION.tremor.amount + fbm(time * 0.8) * MOTION.tremor.amount;
          pz = Math.cos(phase * 0.7) * MOTION.tremor.amount * 0.6;
        }
      } else if (role === 'upLegL' || role === 'upLegR') {
        px = fbm(time * MOTION.legs.rate + (role === 'upLegL' ? 0 : 9.4)) * MOTION.legs.amount;
      }

      offsetQuaternion(scratch.procedural, px, py, pz);

      scratch.composed.copy(base.quaternion).multiply(scratch.pose).multiply(scratch.procedural);

      // head chain: slerp toward the tracked orientation with per-bone weight
      const chain = headSprings.find((entry) => entry.role === role);
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
