import type { BeatId } from '../beat/beats';
import type { COLORS } from '../../../design/tokens';

export type LightKind = 'ambient' | 'directional' | 'point' | 'spot';

export interface LightTarget {
  /** Intensity per breakpoint. Point/spot use candela-like units. */
  intensity: { mobile: number; desktop: number };
  /** Design token key — never a raw hex (spec-driven contract §2.2). */
  color: keyof typeof COLORS;
  position?: readonly [number, number, number];
  /** Aim point for spot lights. */
  aim?: readonly [number, number, number];
  distance?: number;
  decay?: number;
}

/** Per-beat override — every field is optional, merged over `base`. */
export type LightOverride = Partial<LightTarget>;

/**
 * A light slot exists for the entire session.
 *
 * Adding/removing lights at runtime changes `NUM_POINT_LIGHTS`-style defines
 * and forces Three.js to compile a new program — measured at 200–600ms stalls
 * during scroll. Slots are therefore permanent; beats only move intensity,
 * position and colour.
 */
export interface LightSlot {
  id: string;
  kind: LightKind;
  /** Only one slot may cast shadow (each caster = one extra render pass). */
  castShadow?: boolean;
  shadowMapSize?: number;
  angle?: number;
  penumbra?: number;
  animation?: 'evolutionSweep';
  /** Always-on values. */
  base: LightTarget;
  /** Per-beat overrides merged over `base`. */
  beats: Partial<Record<BeatId, LightOverride>>;
}

/**
 * The approved look (Look Dev v2) came from the Hero rig staying lit across
 * every section, with each section adding an accent on top. Slots reproduce
 * that composite: a constant base plus per-beat accents.
 *
 * Light *count* is not what drives draw calls — shadow passes are. So the
 * headroom comes from a single shadow caster, not from dimming the scene.
 */
export const LIGHT_SLOTS: readonly LightSlot[] = [
  {
    id: 'ambient',
    kind: 'ambient',
    base: { intensity: { mobile: 0.35, desktop: 0.35 }, color: 'steel' },
    beats: {},
  },
  {
    id: 'key',
    kind: 'directional',
    castShadow: true,
    shadowMapSize: 1024,
    base: { intensity: { mobile: 3.0, desktop: 3.0 }, color: 'paper', position: [5, 8, 3] },
    beats: {
      fullBody: { position: [3, 6, 4] },
    },
  },
  {
    id: 'rim',
    kind: 'point',
    base: {
      intensity: { mobile: 30, desktop: 30 },
      color: 'oxide',
      position: [3, 1, 4],
      distance: 10,
      decay: 2,
    },
    beats: {
      fullBody: { intensity: { mobile: 15, desktop: 15 }, position: [3, -1, -4], distance: 18 },
    },
  },
  {
    id: 'accent',
    kind: 'point',
    base: {
      intensity: { mobile: 15, desktop: 15 },
      color: 'signal',
      position: [-2, 3, 5],
      distance: 8,
      decay: 2,
    },
    beats: {},
  },
  {
    id: 'fill',
    kind: 'point',
    base: {
      intensity: { mobile: 14, desktop: 14 },
      color: 'steel',
      position: [-4, 2, -2],
      distance: 12,
      decay: 2,
    },
    beats: {
      arsenal: {
        intensity: { mobile: 6, desktop: 8 },
        color: 'steel',
        position: [-0.6, -2.0, 0.9],
        distance: 4,
        decay: 1.8,
      },
      fullBody: {
        intensity: { mobile: 8, desktop: 12 },
        color: 'steel',
        position: [-4, 0, 3],
        distance: 20,
        decay: 2,
      },
    },
  },
  {
    id: 'sweep',
    kind: 'spot',
    angle: 0.5,
    penumbra: 0.6,
    animation: 'evolutionSweep',
    base: { intensity: { mobile: 0, desktop: 0 }, color: 'signal', position: [-0.4, -0.7, 0.8] },
    beats: {
      // Intensity is fully driven by the Beat 2 sweep curve.
      evolution: { aim: [0, -1.5, 0], distance: 3, decay: 1.5 },
    },
  },
];

/** Beat 2 timing — fractions of the evolution beat (unchanged behaviour). */
export const SWEEP = {
  start: 0.5,
  apex: 0.6,
  end: 0.7,
  maxIntensity: 18,
  residualIntensity: 2,
} as const;
