/**
 * Camera keyframes for scroll-driven storytelling.
 * Mobile keyframes defined first (mobile-first), then desktop.
 *
 * NOTE: These are starting hypotheses from the spec. The model's chest symbol
 * is at approximately y=-2.0 (desktop) / y=-1.5 (mobile) in world space, based
 * on the head being at y=0.4/0.45 and model scale. Keyframes will be refined
 * in Look Dev v1.
 *
 * @see docs/design/mobile-first.md
 * @see docs/specs/evolution-chest-symbol.md
 */

export type Breakpoint = 'mobile' | 'desktop';
export type KeyframeName =
  | 'hero'
  | 'evolutionStart'
  | 'evolutionEnd'
  | 'arsenalStart'
  | 'arsenalEnd';

interface KeyframeValues {
  position: readonly [number, number, number];
  lookAt: readonly [number, number, number];
  fov: number;
}

export const CAMERA_KEYFRAMES: Record<KeyframeName, Record<Breakpoint, KeyframeValues>> = {
  hero: {
    mobile: { position: [0, 0.45, 18], lookAt: [0, 0.45, 0], fov: 35 },
    desktop: { position: [0, 0.45, 16], lookAt: [0, 0.45, 0], fov: 30 },
  },
  evolutionStart: {
    // Camera pushes in toward chest symbol. Chest is at ~y=-1.5 (mobile) / ~y=-2.0 (desktop)
    mobile: { position: [0.1, -0.8, 6.0], lookAt: [0, -1.5, 0], fov: 34 },
    desktop: { position: [0.15, -1.0, 5.0], lookAt: [0, -2.0, 0], fov: 28 },
  },
  evolutionEnd: {
    // Close-up on chest symbol
    mobile: { position: [0.1, -1.0, 3.5], lookAt: [0, -1.5, 0], fov: 32 },
    desktop: { position: [0.15, -1.2, 3.0], lookAt: [0, -2.0, 0], fov: 26 },
  },
  arsenalStart: {
    // Lateral orbit — camera crosses to left side, reveals wrist/web-shooter
    // Hypothesis from spec — refine in Look Dev after visual validation
    mobile: { position: [-3.4, -2.4, 5.0], lookAt: [-0.9, -2.6, 0.1], fov: 36 },
    desktop: { position: [-3.3, -3.1, 4.1], lookAt: [-0.5, -3.3, 0], fov: 30 },
  },
  arsenalEnd: {
    // Final close-up on wrist/web-shooter
    mobile: { position: [-2.7, -2.5, 3.6], lookAt: [-0.9, -2.6, 0.1], fov: 34 },
    desktop: { position: [-2.5, -3.2, 3.0], lookAt: [-0.5, -3.3, 0], fov: 28 },
  },
} as const;
