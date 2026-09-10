import * as THREE from 'three';
import { fbm } from '../../../design/noise';

/** Semantic joints used by the procedural rig. */
export type BoneRole =
  | 'hips'
  | 'spine'
  | 'spine1'
  | 'spine2'
  | 'neck'
  | 'head'
  | 'shoulderL'
  | 'shoulderR'
  | 'armL'
  | 'armR'
  | 'foreArmL'
  | 'foreArmR'
  | 'handL'
  | 'handR'
  | 'upLegL'
  | 'upLegR';

/**
 * Mixamo joint names as they exist **after** the glTF loader sanitizes them.
 *
 * `pnpm inspect:glb` prints the raw glTF names (`mixamorig:Head_06`), but
 * `THREE.PropertyBinding.sanitizeNodeName` strips reserved characters —
 * including `:` — so the node map is keyed by `mixamorigHead_06`. The previous
 * head-tracking looked up the raw name, never found it, and silently fell back
 * to rotating the whole model group.
 *
 * Verified in the browser: 66 joints, `animations: 0`.
 */
export const BONE_NAMES: Record<BoneRole, string> = {
  hips: 'mixamorigHips_01',
  spine: 'mixamorigSpine_02',
  spine1: 'mixamorigSpine1_03',
  spine2: 'mixamorigSpine2_04',
  neck: 'mixamorigNeck_05',
  head: 'mixamorigHead_06',
  shoulderL: 'mixamorigLeftShoulder_07',
  shoulderR: 'mixamorigRightShoulder_026',
  armL: 'mixamorigLeftArm_08',
  armR: 'mixamorigRightArm_027',
  foreArmL: 'mixamorigLeftForeArm_09',
  foreArmR: 'mixamorigRightForeArm_028',
  handL: 'mixamorigLeftHand_010',
  handR: 'mixamorigRightHand_029',
  upLegL: 'mixamorigLeftUpLeg_045',
  upLegR: 'mixamorigRightUpLeg_049',
};

export type RigBones = Partial<Record<BoneRole, THREE.Object3D>>;

/**
 * Resolve the rig joints from the loaded glTF scene nodes.
 *
 * The glTF loader exposes skin joints through the node map; we only write
 * local rotations, so the concrete class does not matter — but every name is
 * verified against `pnpm inspect:glb` output.
 */
export function collectRigBones(nodes: Record<string, THREE.Object3D>): RigBones {
  const bones: RigBones = {};
  for (const role of Object.keys(BONE_NAMES) as BoneRole[]) {
    const node = nodes[BONE_NAMES[role]];
    if (node) bones[role] = node;
  }
  return bones;
}

/** Local rotation captured on load — the base every layer adds to. */
export interface RestPose {
  quaternion: THREE.Quaternion;
}

export function captureRestPose(bones: RigBones): Map<BoneRole, RestPose> {
  const rest = new Map<BoneRole, RestPose>();
  for (const [role, bone] of Object.entries(bones) as [BoneRole, THREE.Object3D][]) {
    rest.set(role, { quaternion: bone.quaternion.clone() });
  }
  return rest;
}

/**
 * Soft clamp with a knee — keeps small pointer movements linear and bends the
 * extremes instead of cutting them hard.
 */
export function softClamp(value: number, limit: number): number {
  if (limit <= 0) return 0;
  return limit * Math.tanh(value / limit);
}

/** Procedural layer amplitudes (radians) and rates (Hz). See spec §7.1. */
export const MOTION = {
  breath: { rate: 0.25, spine1: 0.005, spine2: 0.008 },
  sway: { rate: 0.05, yaw: 0.028, pitch: 0.011 },
  weightShift: { rate: 0.09, roll: 0.02 },
  tremor: { rate: 2.5, amount: 0.01 },
  legs: { rate: 0.05, amount: 0.004 },
} as const;

/** Frame-rate independent smoothing. */
export function smooth(delta: number, k: number): number {
  return 1 - Math.exp(-k * delta);
}

/** Reusable scratch objects — the rig must not allocate per frame. */
export const SCRATCH = {
  quaternion: new THREE.Quaternion(),
  euler: new THREE.Euler(),
} as const;

/** Build a rotation offset from axis angles, in place. */
export function offsetQuaternion(
  out: THREE.Quaternion,
  x: number,
  y: number,
  z: number,
): THREE.Quaternion {
  SCRATCH.euler.set(x, y, z);
  return out.setFromEuler(SCRATCH.euler);
}

/** Additive joint offset helper: `bone.quaternion = rest * offset`. */
export function applyOffset(
  bone: THREE.Object3D,
  rest: THREE.Quaternion,
  offset: THREE.Quaternion,
  weight = 1,
): void {
  if (weight >= 1) {
    bone.quaternion.copy(rest).multiply(offset);
    return;
  }
  SCRATCH.quaternion.copy(rest).multiply(offset);
  bone.quaternion.copy(rest).slerp(SCRATCH.quaternion, weight);
}

/**
 * Beat 1 limits (memorable-moments.md): yaw 25-30°, pitch 12-15°.
 *
 * Asymmetric on purpose: measured in review, the head overshot to the left
 * because the authored rest pose is turned (the desktop model carries a
 * -0.25 rad yaw). `headYawTarget` recentres the neutral pose on the camera.
 */
export const HEAD_LIMIT = { yawRight: 0.36, yawLeft: 0.3, pitch: 0.24 } as const;

/**
 * Total yaw authority, including the recentring bias (Beat 1 spec: 25-30°).
 * On desktop the bias is +0.15 rad, so the right pointer range is 0.36 to keep
 * the total at ~0.51 rad (~29°).
 */
export const HEAD_TOTAL_LIMIT = 0.52;

/** Neutral yaw compensation applied per unit of model rotation. */
export const HEAD_BIAS_FACTOR = -0.6;

/** Pointer x (-1..1) + model yaw -> head target yaw, biased and asymmetric. */
export function headYawTarget(pointerX: number, baseYaw = 0): number {
  const yaw =
    pointerX >= 0
      ? softClamp(pointerX, HEAD_LIMIT.yawRight)
      : -softClamp(-pointerX, HEAD_LIMIT.yawLeft);
  return baseYaw * HEAD_BIAS_FACTOR + yaw;
}

/** Idle drift used when the device has no hover (touch). */
export function idleDrift(time: number): { yaw: number; pitch: number } {
  return {
    yaw: fbm(time * 0.3) * 0.12,
    pitch: fbm(time * 0.21 + 13.7) * 0.08,
  };
}
