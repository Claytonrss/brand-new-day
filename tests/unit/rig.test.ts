import { describe, expect, it } from 'vitest';
import { Spring } from '@/components/3d/rig/spring';
import { BEAT_POSES } from '@/components/3d/rig/poses';
import { softClamp } from '@/components/3d/rig/rigBones';

describe('procedural rig', () => {
  it('keeps torso amplitudes conservative (spec §7.3)', () => {
    const spine = ['spine', 'spine1', 'spine2', 'neck', 'hips'] as const;
    for (const pose of Object.values(BEAT_POSES)) {
      for (const role of spine) {
        for (const value of pose[role] ?? []) {
          expect(Math.abs(value)).toBeLessThanOrEqual(0.1);
        }
      }
      // the head turns to follow the wrist during the Arsenal beat
      for (const value of pose.head ?? []) {
        expect(Math.abs(value)).toBeLessThanOrEqual(0.15);
      }
    }
  });

  it('allows the Arsenal arm pose to bend the elbow (presentation of the shooter)', () => {
    // measured: the forearm needs ~63 deg of flexion to bring the web-shooter
    // underside toward a camera placed below the wrist
    expect(Math.abs(BEAT_POSES.arsenal.foreArmR?.[0] ?? 0)).toBeGreaterThan(0.5);
  });
});

describe('soft clamp', () => {
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
});
