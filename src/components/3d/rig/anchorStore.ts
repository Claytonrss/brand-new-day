import * as THREE from 'three';
import type { BoneRole, RigBones } from './rigBones';

/**
 * World-space anchors published by the rig and consumed by camera, lighting
 * and post-processing.
 *
 * Before this store existed, each consumer hardcoded its own guess
 * (`CHEST_Y`, `WRIST_POSITION`, keyframe `lookAt`), and they disagreed: the
 * desktop model sits at x ≈ 1.02 while the camera aimed at x = 0, so the
 * Evolution close-up framed the armpit instead of the chest symbol and the
 * Arsenal shot missed the web-shooter entirely.
 *
 * Values are measured from the skeleton every frame; the literals below are
 * only a first-frame fallback (desktop values) so the initial frames are not
 * framed against the origin.
 */
interface WorldAnchors {
  head: THREE.Vector3;
  chest: THREE.Vector3;
  wrist: THREE.Vector3;
  hips: THREE.Vector3;
  ready: boolean;
}

export const ANCHORS: WorldAnchors = {
  head: new THREE.Vector3(1.02, -0.95, 0),
  chest: new THREE.Vector3(1.02, -2.25, 0),
  wrist: new THREE.Vector3(-1.6, -2.3, 1.2),
  hips: new THREE.Vector3(0.97, -4.35, 0),
  ready: false,
};

const HEAD_ROLES: BoneRole[] = ['head'];
const CHEST_ROLES: BoneRole[] = ['spine2', 'spine1'];
const WRIST_ROLES: BoneRole[] = ['handR', 'foreArmR'];
const HIPS_ROLES: BoneRole[] = ['hips'];

const scratch = new THREE.Vector3();

function readGroup(bones: RigBones, roles: BoneRole[], out: THREE.Vector3): boolean {
  let count = 0;
  out.set(0, 0, 0);
  for (const role of roles) {
    const bone = bones[role];
    if (!bone) continue;
    bone.getWorldPosition(scratch);
    out.add(scratch);
    count++;
  }
  if (count === 0) return false;
  out.divideScalar(count);
  return true;
}

/**
 * Refresh the anchors from the live skeleton. Cheap: 4-6 `getWorldPosition`
 * calls per frame and no allocation.
 */
export function updateAnchors(bones: RigBones): void {
  const okChest = readGroup(bones, CHEST_ROLES, ANCHORS.chest);
  const okHead = readGroup(bones, HEAD_ROLES, ANCHORS.head);
  const okWrist = readGroup(bones, WRIST_ROLES, ANCHORS.wrist);
  const okHips = readGroup(bones, HIPS_ROLES, ANCHORS.hips);

  ANCHORS.ready = okChest && okHead && okWrist && okHips;
}
