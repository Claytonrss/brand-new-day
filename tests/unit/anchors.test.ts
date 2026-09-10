import { describe, expect, it, beforeEach } from 'vitest';
import * as THREE from 'three';
import { ANCHORS, updateAnchors } from '../../src/components/3d/rig/anchorStore';
import { BONE_NAMES, type RigBones } from '../../src/components/3d/rig/rigBones';
import { headYawTarget, HEAD_LIMIT } from '../../src/components/3d/rig/rigBones';
import { CameraTrack, createCameraSample } from '../../src/components/3d/camera/cameraPath';

/** Build a fake skeleton whose bones sit at given world positions. */
function fakeBones(positions: Partial<Record<keyof typeof BONE_NAMES, [number, number, number]>>) {
  const root = new THREE.Object3D();
  const bones: RigBones = {};

  for (const [role, position] of Object.entries(positions) as [
    keyof typeof BONE_NAMES,
    [number, number, number],
  ][]) {
    const bone = new THREE.Object3D();
    bone.position.set(...position);
    root.add(bone);
    bones[role] = bone;
  }

  root.updateMatrixWorld(true);
  return bones;
}

beforeEach(() => {
  ANCHORS.ready = false;
});

describe('anchor store', () => {
  it('reads the chest, head, wrist and hips from the skeleton', () => {
    const bones = fakeBones({
      spine2: [1, -2.25, 0],
      head: [1, -0.95, 0],
      handR: [-1.9, -2.3, 1.8],
      foreArmR: [-1.2, -2.3, 0.6],
      hips: [1, -4.35, 0],
    });

    updateAnchors(bones);

    expect(ANCHORS.ready).toBe(true);
    expect(ANCHORS.chest.y).toBeCloseTo(-2.25, 4);
    expect(ANCHORS.head.y).toBeCloseTo(-0.95, 4);
    // wrist averages hand + forearm
    expect(ANCHORS.wrist.x).toBeCloseTo(-1.55, 4);
    expect(ANCHORS.hips.y).toBeCloseTo(-4.35, 4);
  });

  it('stays not-ready when the skeleton is incomplete', () => {
    const bones = fakeBones({ spine2: [0, -2, 0] });
    updateAnchors(bones);
    expect(ANCHORS.ready).toBe(false);
  });

  it('drives the camera correction for the Evolution beat', () => {
    const track = new CameraTrack('desktop');
    const authored = new THREE.Vector3(0, -2.0, 0);

    ANCHORS.ready = false;
    const before = track.sample('evolution', 0.5, createCameraSample()).lookAt.clone();

    updateAnchors(
      fakeBones({
        spine2: [1, -2.25, 0],
        head: [1, -0.95, 0],
        handR: [-1.9, -2.3, 1.8],
        foreArmR: [-1.2, -2.3, 0.6],
        hips: [1, -4.35, 0],
      }),
    );

    const after = track.sample('evolution', 0.5, createCameraSample());
    const expected = new THREE.Vector3().copy(ANCHORS.chest).sub(authored);

    // the lookAt is shifted by (measured - authored), centring the chest
    expect(after.lookAt.x).toBeCloseTo(before.x + expected.x, 3);
    expect(after.lookAt.y).toBeCloseTo(before.y + expected.y, 3);
  });

  it('does not shift beats with an intentional composition offset', () => {
    const track = new CameraTrack('desktop');
    const before = track.sample('hero', 0, createCameraSample()).lookAt.clone();

    updateAnchors(
      fakeBones({
        spine2: [1, -2.25, 0],
        head: [1, -0.95, 0],
        handR: [-1.9, -2.3, 1.8],
        foreArmR: [-1.2, -2.3, 0.6],
        hips: [1, -4.35, 0],
      }),
    );

    const after = track.sample('hero', 0, createCameraSample()).lookAt;
    expect(after.equals(before)).toBe(true);
  });
});

describe('head yaw targeting', () => {
  it('stays linear near neutral (no dead zone around the centre)', () => {
    expect(headYawTarget(0.05, 0)).toBeCloseTo(0.05, 2);
    expect(headYawTarget(-0.05, 0)).toBeCloseTo(-0.05, 2);
  });

  it('turns less to the left than to the right (review feedback)', () => {
    const left = Math.abs(headYawTarget(-1, 0));
    const right = Math.abs(headYawTarget(1, 0));

    expect(left).toBeLessThan(right);
    // both approach their limit asymptotically (softClamp never cuts hard)
    expect(left).toBeGreaterThan(HEAD_LIMIT.yawLeft * 0.9);
    expect(left).toBeLessThanOrEqual(HEAD_LIMIT.yawLeft);
    expect(right).toBeGreaterThan(HEAD_LIMIT.yawRight * 0.9);
    expect(right).toBeLessThanOrEqual(HEAD_LIMIT.yawRight);
  });

  it('recentres the neutral pose on the camera for the desktop model', () => {
    // desktop model group carries a -0.25 rad yaw
    expect(headYawTarget(0, -0.25)).toBeCloseTo(0.15, 6);
  });

  it('never exceeds the configured limits', () => {
    for (const x of [-5, -1, 0, 1, 5]) {
      const yaw = headYawTarget(x, 0);
      expect(yaw).toBeLessThanOrEqual(HEAD_LIMIT.yawRight + 1e-6);
      expect(yaw).toBeGreaterThanOrEqual(-HEAD_LIMIT.yawLeft - 1e-6);
    }
  });
});
