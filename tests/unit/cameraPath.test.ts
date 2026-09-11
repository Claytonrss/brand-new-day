import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { BEAT_TIMELINE, beatAt, beatLocalProgress } from '../../src/components/3d/beat/beats';
import { CAMERA_SPANS, CameraTrack, createCameraSample } from '../../src/components/3d/camera/cameraPath';
import { CAMERA_KEYFRAMES } from '../../src/components/3d/cameraKeyframes';
import { fbm } from '../../src/components/3d/camera/handheld';

const BREAKPOINTS = ['mobile', 'desktop'] as const;

/** Sample the whole page at 1% steps, the way the spec's continuity metric does. */
function sampleTrack(track: CameraTrack) {
  const sample = createCameraSample();
  const points: THREE.Vector3[] = [];

  for (let p = 0; p <= 1.0001; p += 0.01) {
    const beat = beatAt(p);
    track.sample(beat.id, beatLocalProgress(beat, p), sample);
    points.push(sample.position.clone());
  }

  return points;
}

/** Angle (degrees) between consecutive displacement vectors of the path. */
function directionChanges(points: THREE.Vector3[]) {
  const changes: number[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i].clone().sub(points[i - 1]);
    const next = points[i + 1].clone().sub(points[i]);
    if (previous.length() < 1e-6 || next.length() < 1e-6) continue;
    changes.push(THREE.MathUtils.radToDeg(previous.angleTo(next)));
  }

  return changes.sort((a, b) => a - b);
}

function peak(changes: number[]) {
  return changes[changes.length - 1];
}

/** Direction change per unit of travelled distance (speed independent). */
function curvature(points: THREE.Vector3[]) {
  const curvatureValues: number[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i].clone().sub(points[i - 1]);
    const next = points[i + 1].clone().sub(points[i]);
    const step = (previous.length() + next.length()) / 2;
    if (previous.length() < 1e-6 || next.length() < 1e-6 || step < 1e-6) continue;
    curvatureValues.push(THREE.MathUtils.radToDeg(previous.angleTo(next)) / step);
  }

  return curvatureValues.sort((a, b) => a - b);
}

function median(values: number[]) {
  return values[Math.floor(values.length / 2)];
}

/**
 * Reproduction of the removed piecewise-linear camera path — kept as the
 * baseline for the continuity metric (docs/specs/cinematic-camera-path.md §10).
 */
function legacyPath(bp: 'mobile' | 'desktop') {
  const kf = CAMERA_KEYFRAMES;
  const segments: Array<[number, number, typeof kf.hero.mobile, typeof kf.hero.mobile]> = [
    [0, 0.25, kf.hero[bp], kf.hero[bp]],
    [0.25, 0.375, kf.hero[bp], kf.evolutionStart[bp]],
    [0.375, 0.5625, kf.evolutionStart[bp], kf.evolutionEnd[bp]],
    [0.5625, 0.6875, kf.evolutionEnd[bp], kf.arsenalStart[bp]],
    [0.6875, 0.86, kf.arsenalStart[bp], kf.arsenalEnd[bp]],
    [0.86, 0.95, kf.arsenalEnd[bp], kf.fullBody[bp]],
    [0.95, 1, kf.fullBody[bp], kf.fullBody[bp]],
  ];

  const points: THREE.Vector3[] = [];
  for (let p = 0; p <= 1.0001; p += 0.01) {
    const segment =
      segments.find(([start, end]) => p >= start && p <= end) ?? segments[segments.length - 1];
    const t = (p - segment[0]) / (segment[1] - segment[0] || 1);
    points.push(
      new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...segment[2].position),
        new THREE.Vector3(...segment[3].position),
        t,
      ),
    );
  }

  return points;
}

describe('camera track', () => {
  for (const bp of BREAKPOINTS) {
    it(`${bp}: covers every beat without gaps`, () => {
      const spans = [...CAMERA_SPANS].sort((a, b) => a.fromIndex - b.fromIndex);
      expect(spans[0].fromIndex).toBe(0);
      expect(spans[spans.length - 1].toIndex).toBe(new CameraTrack(bp).controlPointCount - 1);

      for (let i = 1; i < spans.length; i++) {
        expect(spans[i].fromIndex).toBe(spans[i - 1].toIndex);
      }
    });

    it(`${bp}: cuts the direction-change peak by at least 30% (spec §10)`, () => {
      const legacy = directionChanges(legacyPath(bp));
      const current = directionChanges(sampleTrack(new CameraTrack(bp)));

      expect(peak(current)).toBeLessThanOrEqual(peak(legacy) * 0.7);
    });

    it(`${bp}: keeps the whole path smooth (median curvature <= 30 deg/unit)`, () => {
      // Curvature is speed independent, so it survives easing changes; the
      // legacy path measured 0 deg/unit in the straight parts and a hard
      // corner of ~740 deg/unit at the beat boundaries.
      const values = curvature(sampleTrack(new CameraTrack(bp)));
      expect(median(values)).toBeLessThanOrEqual(30);
      expect(values[values.length - 1]).toBeLessThan(600);
    });

    it(`${bp}: ends the path at the fullBody keyframe`, () => {
      const track = new CameraTrack(bp);
      const sample = track.sample('fullBody', 1, createCameraSample());

      expect(sample.position.z).toBeCloseTo(bp === 'mobile' ? 11 : 16, 1);
      expect(sample.fov).toBeCloseTo(bp === 'mobile' ? 50 : 42, 5);
    });

    it(`${bp}: Beat 3 orbits at least 60 degrees around the wrist`, () => {
      const track = new CameraTrack(bp);
      const sample = createCameraSample();
      const wrist = bp === 'mobile'
        ? new THREE.Vector3(-0.9, -2.6, 0.1)
        : new THREE.Vector3(-0.5, -3.3, 0);

      const azimuths: number[] = [];
      for (let t = 0; t <= 1.0001; t += 0.05) {
        track.sample('arsenal', t, sample);
        const offset = sample.position.clone().sub(wrist);
        azimuths.push(Math.atan2(offset.x, offset.z));
      }

      const sweep = THREE.MathUtils.radToDeg(Math.max(...azimuths) - Math.min(...azimuths));
      expect(sweep).toBeGreaterThanOrEqual(60);
    });

    it(`${bp}: reaches every beat framing in order`, () => {
      const track = new CameraTrack(bp);
      const sample = createCameraSample();

      for (const beat of BEAT_TIMELINE) {
        track.sample(beat.id, 0, sample);
        expect(Number.isFinite(sample.position.x)).toBe(true);
        expect(Number.isFinite(sample.fov)).toBe(true);
      }
    });

    it(`${bp}: reduced-motion framing differs per section`, () => {
      const track = new CameraTrack(bp);
      const sample = createCameraSample();
      const framings = BEAT_TIMELINE.map((beat) => {
        track.framingFor(beat.id, sample);
        return sample.position.clone();
      });

      // hero framing must no longer be the fullBody framing (old bug)
      expect(framings[0].distanceTo(framings[framings.length - 1])).toBeGreaterThan(1);
    });
  }
});

describe('handheld noise', () => {
  it('stays within [-1, 1]', () => {
    for (let x = 0; x < 200; x += 0.37) {
      expect(Math.abs(fbm(x))).toBeLessThanOrEqual(1.0001);
    }
  });

  it('is continuous (no jumps between nearby samples)', () => {
    for (let x = 0; x < 100; x += 0.5) {
      expect(Math.abs(fbm(x) - fbm(x + 0.01))).toBeLessThan(0.2);
    }
  });
});
