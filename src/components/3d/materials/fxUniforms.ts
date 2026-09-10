import * as THREE from 'three';

/**
 * Shared uniforms for the authorial material layer.
 *
 * The same uniform objects are referenced by every patched material, so one
 * driver (`MaterialFxDriver`) animates the whole suit per frame.
 *
 * @see docs/specs/authorial-shaders-fx.md §7.1
 */
export const FX = {
  /** Seconds since load — drives the web weave and the lens pulse. */
  uTime: { value: 0 },
  /** Fresnel rim strength, modulated per beat. */
  uRimStrength: { value: 0.35 },
  /** Animated web-weave intensity, modulated per beat. */
  uWebStrength: { value: 0.1 },
  /** Lens emissive pulse multiplier. */
  uLensPulse: { value: 1 },
  /** Beat-local progress (0-1). */
  uBeat: { value: 0 },
  /** Vertical position of the Beat 2 light band (world Y). */
  uSweepY: { value: -2 },
  /** Beat 2 band strength (0 outside the beat). */
  uSweep: { value: 0 },
  uRimColor: { value: new THREE.Color('#c23b34') },
  uWebColor: { value: new THREE.Color('#eaf4ff') },
};

export type FxUniformName = keyof typeof FX;
