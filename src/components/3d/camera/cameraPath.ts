import * as THREE from 'three';
import { CAMERA_KEYFRAMES } from '../cameraKeyframes';
import { WRIST_POSITION, type BeatId } from '../beat/beats';

export type Breakpoint = 'mobile' | 'desktop';

const DEG = Math.PI / 180;

/**
 * Beat 3 orbit — generated in spherical coordinates around the wrist.
 *
 * The authored keyframes move 0.2° in azimuth relative to the wrist, i.e. a
 * straight dolly, not the "crossing the axis" the beat requires
 * (docs/specs/cinematic-camera-path.md §1).
 */
const ARC = {
  /** Control points, including start and end. */
  samples: 4,
  startAzimuth: -32 * DEG,
  endAzimuth: 43 * DEG,
  startRadius: 5.4,
  endRadius: 3.9,
  startHeight: 0.2,
  endHeight: 0.0,
  /** Sinusoidal elevation so the arc is not flat. */
  lift: 0.35,
} as const;

/**
 * Release point after the arc.
 *
 * Without it the arc ends moving sideways (+x, −z) and the FullBody pull-back
 * wants (−x, +z) — a ~97° reversal measured at the boundary. The release point
 * makes the curve start retreating before the pull-back takes over.
 */
const RELEASE = {
  azimuthOffset: -8 * DEG,
  radiusGain: 3.2,
  height: 0.8,
} as const;

/**
 * Overshoot after the chest close-up.
 *
 * The camera keeps pushing in past `evolutionEnd` before withdrawing, so the
 * reversal at the end of Beat 2 is spread over more scroll instead of
 * happening in place.
 */
const OVERSHOOT = {
  distance: 0.6,
  drop: 0.05,
} as const;

/**
 * Approach point before the arc: the camera swings wide (larger radius, higher)
 * before closing in on the wrist, instead of cutting straight across.
 */
const APPROACH = {
  azimuthOffset: -10 * DEG,
  radiusGain: 1.6,
  height: 1.4,
} as const;

export const EASING = {
  linear: (t: number) => t,
  smoothstep: (t: number) => t * t * (3 - 2 * t),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
} as const;

export type EasingName = keyof typeof EASING;

export interface CameraSpan {
  beat: BeatId;
  fromIndex: number;
  toIndex: number;
  ease: EasingName;
}

/** Control-point index → beat mapping. See spec §6.3. */
export const CAMERA_SPANS: readonly CameraSpan[] = [
  { beat: 'hero', fromIndex: 0, toIndex: 0, ease: 'linear' },
  { beat: 'chapter1', fromIndex: 0, toIndex: 1, ease: 'smoothstep' },
  { beat: 'evolution', fromIndex: 1, toIndex: 3, ease: 'easeInOutCubic' },
  { beat: 'chapter2', fromIndex: 3, toIndex: 4, ease: 'smoothstep' },
  { beat: 'arsenal', fromIndex: 4, toIndex: 8, ease: 'smoothstep' },
  { beat: 'fullBody', fromIndex: 8, toIndex: 10, ease: 'easeOutCubic' },
] as const;

const SPAN_BY_BEAT = new Map(CAMERA_SPANS.map((span) => [span.beat, span]));

export interface CameraSample {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
}

export function createCameraSample(): CameraSample {
  return { position: new THREE.Vector3(), lookAt: new THREE.Vector3(), fov: 30 };
}

/** Orbit points around the wrist anchor, for Beat 3. */
function arsenalArc(bp: Breakpoint): {
  approach: THREE.Vector3;
  points: THREE.Vector3[];
  release: THREE.Vector3;
  lookAt: THREE.Vector3;
} {
  const wrist = WRIST_POSITION[bp];
  const anchor = new THREE.Vector3(wrist[0], wrist[1], wrist[2]);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < ARC.samples; i++) {
    const t = i / (ARC.samples - 1);
    const azimuth = THREE.MathUtils.lerp(ARC.startAzimuth, ARC.endAzimuth, t);
    const radius = THREE.MathUtils.lerp(ARC.startRadius, ARC.endRadius, t);
    const height =
      THREE.MathUtils.lerp(ARC.startHeight, ARC.endHeight, t) + Math.sin(t * Math.PI) * ARC.lift;

    points.push(
      new THREE.Vector3(
        anchor.x + Math.sin(azimuth) * radius,
        anchor.y + height,
        anchor.z + Math.cos(azimuth) * radius,
      ),
    );
  }

  const releaseAzimuth = ARC.endAzimuth + RELEASE.azimuthOffset;
  const releaseRadius = ARC.endRadius + RELEASE.radiusGain;
  const release = new THREE.Vector3(
    anchor.x + Math.sin(releaseAzimuth) * releaseRadius,
    anchor.y + RELEASE.height,
    anchor.z + Math.cos(releaseAzimuth) * releaseRadius,
  );

  const approachAzimuth = ARC.startAzimuth + APPROACH.azimuthOffset;
  const approach = new THREE.Vector3(
    anchor.x + Math.sin(approachAzimuth) * (ARC.startRadius + APPROACH.radiusGain),
    anchor.y + APPROACH.height,
    anchor.z + Math.cos(approachAzimuth) * (ARC.startRadius + APPROACH.radiusGain),
  );

  return { approach, points, release, lookAt: anchor };
}

/**
 * CameraTrack — a single Catmull-Rom curve per breakpoint.
 *
 * One curve (instead of independent straight segments) is what removes the
 * direction discontinuities at the beat boundaries: the tangent is shared by
 * construction. Easing is applied to the beat-local progress before sampling,
 * so each beat keeps its own rhythm without breaking continuity.
 */
export class CameraTrack {
  readonly breakpoint: Breakpoint;
  private readonly positionCurve: THREE.CatmullRomCurve3;
  private readonly lookAtCurve: THREE.CatmullRomCurve3;
  private readonly fovs: number[];
  private readonly count: number;

  constructor(breakpoint: Breakpoint) {
    this.breakpoint = breakpoint;
    const kf = CAMERA_KEYFRAMES;
    const arc = arsenalArc(breakpoint);
    const end = kf.evolutionEnd[breakpoint];
    const overshoot = new THREE.Vector3(
      end.position[0],
      end.position[1] - OVERSHOOT.drop,
      end.position[2] - OVERSHOOT.distance,
    );

    const positions: THREE.Vector3[] = [
      new THREE.Vector3(...kf.hero[breakpoint].position),
      new THREE.Vector3(...kf.evolutionStart[breakpoint].position),
      new THREE.Vector3(...kf.evolutionEnd[breakpoint].position),
      overshoot,
      arc.approach,
      ...arc.points,
      arc.release,
      new THREE.Vector3(...kf.fullBody[breakpoint].position),
    ];

    const lookAts: THREE.Vector3[] = [
      new THREE.Vector3(...kf.hero[breakpoint].lookAt),
      new THREE.Vector3(...kf.evolutionStart[breakpoint].lookAt),
      new THREE.Vector3(...kf.evolutionEnd[breakpoint].lookAt),
      new THREE.Vector3(...kf.evolutionEnd[breakpoint].lookAt),
      arc.lookAt.clone(),
      ...arc.points.map(() => arc.lookAt.clone()),
      arc.lookAt.clone(),
      new THREE.Vector3(...kf.fullBody[breakpoint].lookAt),
    ];

    const arcFov = Array.from({ length: arc.points.length }, (_, i) => {
      const t = i / (arc.points.length - 1);
      return THREE.MathUtils.lerp(kf.arsenalStart[breakpoint].fov, kf.arsenalEnd[breakpoint].fov, t);
    });

    this.fovs = [
      kf.hero[breakpoint].fov,
      kf.evolutionStart[breakpoint].fov,
      kf.evolutionEnd[breakpoint].fov,
      // overshoot keeps the close-up fov
      kf.evolutionEnd[breakpoint].fov,
      // approach starts opening the lens toward the arsenal framing
      kf.arsenalStart[breakpoint].fov,
      ...arcFov,
      // release holds the last arc fov
      arcFov[arcFov.length - 1],
      kf.fullBody[breakpoint].fov,
    ];

    if (positions.length !== this.fovs.length || lookAts.length !== this.fovs.length) {
      throw new Error(
        `CameraTrack: control point mismatch (positions=${positions.length}, lookAts=${lookAts.length}, fovs=${this.fovs.length})`,
      );
    }

    this.count = positions.length;
    this.positionCurve = new THREE.CatmullRomCurve3(positions, false, 'centripetal', 0.5);
    this.lookAtCurve = new THREE.CatmullRomCurve3(lookAts, false, 'centripetal', 0.5);
  }

  /** Control point count (exposed for tests). */
  get controlPointCount(): number {
    return this.count;
  }

  /** Sample the track for a beat and its local progress (0-1). */
  sample(beat: BeatId, t: number, out: CameraSample): CameraSample {
    const span = SPAN_BY_BEAT.get(beat) ?? CAMERA_SPANS[0];
    const eased = EASING[span.ease](THREE.MathUtils.clamp(t, 0, 1));
    const index = span.fromIndex + (span.toIndex - span.fromIndex) * eased;
    const u = THREE.MathUtils.clamp(index / (this.count - 1), 0, 1);

    this.positionCurve.getPoint(u, out.position);
    this.lookAtCurve.getPoint(u, out.lookAt);
    out.fov = this.sampleFov(u);

    return out;
  }

  /** Static framing for a beat — used by `prefers-reduced-motion`. */
  framingFor(beat: BeatId, out: CameraSample): CameraSample {
    return this.sample(beat, 1, out);
  }

  private sampleFov(u: number): number {
    const scaled = u * (this.count - 1);
    const i0 = Math.floor(scaled);
    const i1 = Math.min(i0 + 1, this.count - 1);
    return THREE.MathUtils.lerp(this.fovs[i0], this.fovs[i1], scaled - i0);
  }
}
