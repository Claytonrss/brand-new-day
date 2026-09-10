import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  DRAG_LIMITS,
  GYRO_LIMITS,
  dragTarget,
  gyroTarget,
  rimOffset,
  webStrandPoints,
} from '../../src/components/3d/interaction/pointerMath';

describe('drag orbit', () => {
  it('is linear near the origin (no dead zone)', () => {
    const target = dragTarget(40, 20);
    expect(target.yaw).toBeGreaterThan(0);
    expect(target.pitch).toBeGreaterThan(0);
  });

  it('turns toward the drag direction', () => {
    expect(dragTarget(200, 0).yaw).toBeGreaterThan(0);
    expect(dragTarget(-200, 0).yaw).toBeLessThan(0);
  });

  it('never exceeds the limits, however far the pointer travels', () => {
    for (const dx of [-5000, -400, 0, 400, 5000]) {
      const target = dragTarget(dx, dx);
      expect(Math.abs(target.yaw)).toBeLessThanOrEqual(DRAG_LIMITS.yaw);
      expect(Math.abs(target.pitch)).toBeLessThanOrEqual(DRAG_LIMITS.pitch);
    }
  });

  it('is symmetric for symmetric drags', () => {
    expect(dragTarget(120, 60).yaw).toBeCloseTo(-dragTarget(-120, -60).yaw, 6);
  });
});

describe('gyro target', () => {
  it('is zero at the calibration origin', () => {
    const target = gyroTarget(35, 12, { gamma: 35, beta: 12 });
    expect(target.yaw).toBeCloseTo(0, 6);
    expect(target.pitch).toBeCloseTo(0, 6);
  });

  it('maps tilt to a clamped offset', () => {
    const target = gyroTarget(35, 12, { gamma: 0, beta: 0 });
    expect(target.yaw).toBeLessThan(0);
    expect(Math.abs(target.yaw)).toBeLessThanOrEqual(GYRO_LIMITS.yaw);
    expect(Math.abs(target.pitch)).toBeLessThanOrEqual(GYRO_LIMITS.pitch);
  });

  it('stays clamped for extreme tilts', () => {
    const target = gyroTarget(180, 180, { gamma: 0, beta: 0 });
    expect(Math.abs(target.yaw)).toBeLessThanOrEqual(GYRO_LIMITS.yaw);
    expect(Math.abs(target.pitch)).toBeLessThanOrEqual(GYRO_LIMITS.pitch);
  });
});

describe('rim offset', () => {
  it('follows the cursor and stays bounded', () => {
    const left = rimOffset(-1, 0);
    const right = rimOffset(1, 0);
    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
    expect(Math.abs(rimOffset(1, 1, 0.35).y)).toBeLessThanOrEqual(0.35);
  });

  it('is zero at the centre', () => {
    expect(rimOffset(0, 0).length()).toBe(0);
  });
});

describe('web strand', () => {
  const from = new THREE.Vector3(0, 0, 0);
  const to = new THREE.Vector3(4, 0, 0);

  it('starts and ends exactly at the supplied points', () => {
    const points = webStrandPoints(from, to, 12, 0.25);
    expect(points[0].distanceTo(from)).toBeLessThan(1e-6);
    expect(points[points.length - 1].distanceTo(to)).toBeLessThan(1e-6);
  });

  it('sags in the middle, never at the ends', () => {
    const points = webStrandPoints(from, to, 12, 0.25);
    const middle = points[Math.floor(points.length / 2)];
    expect(middle.y).toBeLessThan(-0.2);
    expect(Math.abs(points[1].y)).toBeLessThan(Math.abs(middle.y));
  });

  it('returns segments + 1 points', () => {
    expect(webStrandPoints(from, to, 8)).toHaveLength(9);
  });
});
