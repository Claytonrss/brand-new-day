import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { fbm } from '../../src/design/noise';
import { Spring } from '../../src/components/3d/rig/spring';
import { BEAT_POSES, POSE_AMPLITUDE, POSE_ROLES } from '../../src/components/3d/rig/poses';
import { BONE_NAMES, softClamp, MOTION } from '../../src/components/3d/rig/rigBones';
import { BEAT_TIMELINE } from '../../src/components/3d/beat/beats';

describe('procedural rig', () => {
  it('uses the loader-sanitized Mixamo joint names', () => {
    // THREE.PropertyBinding.sanitizeNodeName strips reserved characters, so
    // ':' is gone from every node key (verified in the browser).
    for (const name of Object.values(BONE_NAMES)) {
      expect(name.startsWith('mixamorig')).toBe(true);
      expect(name).not.toContain(':');
    }
  });

  it('declares a pose for every beat', () => {
    for (const beat of BEAT_TIMELINE) {
      expect(BEAT_POSES[beat.id]).toBeDefined();
    }
  });

  it('keeps pose amplitudes conservative (spec §7.3)', () => {
    for (const pose of Object.values(BEAT_POSES)) {
      for (const offsets of Object.values(pose)) {
        for (const value of offsets ?? []) {
          expect(Math.abs(value)).toBeLessThanOrEqual(0.25);
        }
      }
    }
  });

  it('exposes a single amplitude multiplier that can disable the layer', () => {
    expect(POSE_AMPLITUDE).toBeGreaterThan(0);
    expect(POSE_AMPLITUDE).toBeLessThanOrEqual(1);
  });

  it('covers every posed role in POSE_ROLES', () => {
    for (const pose of Object.values(BEAT_POSES)) {
      for (const role of Object.keys(pose)) {
        expect(POSE_ROLES).toContain(role as (typeof POSE_ROLES)[number]);
      }
    }
  });

  it('keeps breathing within the subtle range of the spec', () => {
    expect(MOTION.breath.spine2).toBeLessThanOrEqual(0.01);
    expect(MOTION.breath.rate).toBeCloseTo(0.25, 5);
  });
});

describe('soft clamp', () => {
  it('is linear near zero', () => {
    expect(softClamp(0.01, 0.48)).toBeCloseTo(0.01, 3);
  });

  it('never exceeds the limit', () => {
    for (const value of [-10, -2, -0.5, 0.5, 2, 10]) {
      expect(Math.abs(softClamp(value, 0.48))).toBeLessThanOrEqual(0.48);
    }
  });

  it('bends the extremes instead of cutting them hard', () => {
    expect(Math.abs(softClamp(1, 0.48))).toBeLessThan(0.48);
    expect(Math.abs(softClamp(1, 0.48))).toBeGreaterThan(0.4);
  });
});

describe('spring', () => {
  it('converges to the target without overshoot when critically damped', () => {
    const spring = new Spring(0, 9, 1);
    spring.target = 1;

    let overshoot = 0;
    for (let i = 0; i < 600; i++) {
      spring.step(1 / 60);
      overshoot = Math.max(overshoot, spring.value - 1);
    }

    expect(spring.value).toBeCloseTo(1, 3);
    expect(overshoot).toBeLessThan(0.02);
  });

  it('is stable on long frames', () => {
    const spring = new Spring(0, 9, 1);
    spring.target = 1;
    spring.step(5);

    expect(Number.isFinite(spring.value)).toBe(true);
    expect(Math.abs(spring.value)).toBeLessThanOrEqual(1.5);
  });

  it('lags proportionally to stiffness — the basis of follow-through', () => {
    const head = new Spring(0, 6, 1);
    const neck = new Spring(0, 3.2, 1);
    const spine = new Spring(0, 1.8, 1);
    head.target = 1;
    neck.target = 1;
    spine.target = 1;

    for (let i = 0; i < 6; i++) {
      head.step(1 / 60);
      neck.step(1 / 60);
      spine.step(1 / 60);
    }

    expect(head.value).toBeGreaterThan(neck.value);
    expect(neck.value).toBeGreaterThan(spine.value);
  });
});

describe('fbm noise', () => {
  it('stays within [-1, 1]', () => {
    for (let x = 0; x < 200; x += 0.37) {
      expect(Math.abs(fbm(x))).toBeLessThanOrEqual(1.0001);
    }
  });

  it('is continuous between nearby samples', () => {
    for (let x = 0; x < 100; x += 0.5) {
      expect(Math.abs(fbm(x) - fbm(x + 0.01))).toBeLessThan(0.2);
    }
  });
});

describe('additive composition', () => {
  it('applies offsets in local space (rest * offset)', () => {
    const rest = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.3, 0.1));
    const offset = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.01, 0, 0));
    const composed = rest.clone().multiply(offset);

    // small offsets must stay close to the authored pose
    expect(rest.angleTo(composed)).toBeLessThan(0.05);
  });
});
