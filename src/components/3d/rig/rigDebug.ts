import type * as THREE from 'three';
import type { BoneRole, RigBones } from './rigBones';
import { spiderSense } from './spiderSense';

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
  /** Latched fire count — survives the envelope decay (evidence/tests). */
  senseCount: number;
}

declare global {
  interface Window {
    __rig?: RigDebugState;
  }
}

export interface RigDebugInput {
  bones: RigBones;
  restSize: number;
  time: number;
  breathSample: number;
  pointer: { x: number; y: number } | null;
  headTarget: [number, number];
  hasHover: boolean;
  leanValue: number;
  worldScratch: THREE.Vector3;
}

/**
 * Publishes `window.__rig` — the calibration surface read by the motion specs
 * and by manual review with `?debug`. Read-only view; no rig state mutates.
 */
export function publishRigDebug(input: RigDebugInput): void {
  if (typeof window === 'undefined') return;

  const { bones } = input;
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
    bone.getWorldPosition(input.worldScratch);
    world[role] = [
      +input.worldScratch.x.toFixed(3),
      +input.worldScratch.y.toFixed(3),
      +input.worldScratch.z.toFixed(3),
    ];
  }

  window.__rig = {
    head: read('head'),
    neck: read('neck'),
    spine2: read('spine2'),
    world,
    breath: input.breathSample,
    time: input.time,
    joints: input.restSize,
    pointer: [input.pointer?.x ?? 0, input.pointer?.y ?? 0],
    target: input.headTarget,
    hover: input.hasHover,
    lean: input.leanValue,
    sense: spiderSense.envelope,
    senseCount: spiderSense.count,
  };
}
