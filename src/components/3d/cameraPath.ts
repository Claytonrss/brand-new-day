import { CAMERA_KEYFRAMES } from './cameraKeyframes';

/**
 * Master camera path — piecewise segments covering 0-100% of total page scroll.
 * Each segment defines a scroll range and the keyframes to interpolate between.
 * This eliminates "dead zones" where the camera doesn't move.
 *
 * @see docs/design/mobile-first.md
 */
export interface CameraPathSegment {
  scrollStart: number; // 0-1
  scrollEnd: number; // 0-1
  from: {
    position: readonly [number, number, number];
    lookAt: readonly [number, number, number];
    fov: number;
  };
  to: {
    position: readonly [number, number, number];
    lookAt: readonly [number, number, number];
    fov: number;
  };
}

export const CAMERA_PATH: Record<'mobile' | 'desktop', CameraPathSegment[]> = {
  mobile: [
    // Hero (0-15%): static close-up
    {
      scrollStart: 0,
      scrollEnd: 0.15,
      from: CAMERA_KEYFRAMES.hero.mobile,
      to: CAMERA_KEYFRAMES.hero.mobile,
    },
    // Hero → Evolution transition (15-30%)
    {
      scrollStart: 0.15,
      scrollEnd: 0.3,
      from: CAMERA_KEYFRAMES.hero.mobile,
      to: CAMERA_KEYFRAMES.evolutionStart.mobile,
    },
    // Evolution push-in (30-50%)
    {
      scrollStart: 0.3,
      scrollEnd: 0.5,
      from: CAMERA_KEYFRAMES.evolutionStart.mobile,
      to: CAMERA_KEYFRAMES.evolutionEnd.mobile,
    },
    // Evolution → Arsenal transition (50-65%)
    {
      scrollStart: 0.5,
      scrollEnd: 0.65,
      from: CAMERA_KEYFRAMES.evolutionEnd.mobile,
      to: CAMERA_KEYFRAMES.arsenalStart.mobile,
    },
    // Arsenal orbit (65-85%)
    {
      scrollStart: 0.65,
      scrollEnd: 0.85,
      from: CAMERA_KEYFRAMES.arsenalStart.mobile,
      to: CAMERA_KEYFRAMES.arsenalEnd.mobile,
    },
    // Arsenal → FullBody transition (85-95%)
    {
      scrollStart: 0.85,
      scrollEnd: 0.95,
      from: CAMERA_KEYFRAMES.arsenalEnd.mobile,
      to: CAMERA_KEYFRAMES.fullBody.mobile,
    },
    // FullBody static (95-100%)
    {
      scrollStart: 0.95,
      scrollEnd: 1.0,
      from: CAMERA_KEYFRAMES.fullBody.mobile,
      to: CAMERA_KEYFRAMES.fullBody.mobile,
    },
  ],
  desktop: [
    // Hero (0-15%): static close-up
    {
      scrollStart: 0,
      scrollEnd: 0.15,
      from: CAMERA_KEYFRAMES.hero.desktop,
      to: CAMERA_KEYFRAMES.hero.desktop,
    },
    // Hero → Evolution transition (15-30%)
    {
      scrollStart: 0.15,
      scrollEnd: 0.3,
      from: CAMERA_KEYFRAMES.hero.desktop,
      to: CAMERA_KEYFRAMES.evolutionStart.desktop,
    },
    // Evolution push-in (30-50%)
    {
      scrollStart: 0.3,
      scrollEnd: 0.5,
      from: CAMERA_KEYFRAMES.evolutionStart.desktop,
      to: CAMERA_KEYFRAMES.evolutionEnd.desktop,
    },
    // Evolution → Arsenal transition (50-65%)
    {
      scrollStart: 0.5,
      scrollEnd: 0.65,
      from: CAMERA_KEYFRAMES.evolutionEnd.desktop,
      to: CAMERA_KEYFRAMES.arsenalStart.desktop,
    },
    // Arsenal orbit (65-85%)
    {
      scrollStart: 0.65,
      scrollEnd: 0.85,
      from: CAMERA_KEYFRAMES.arsenalStart.desktop,
      to: CAMERA_KEYFRAMES.arsenalEnd.desktop,
    },
    // Arsenal → FullBody transition (85-95%)
    {
      scrollStart: 0.85,
      scrollEnd: 0.95,
      from: CAMERA_KEYFRAMES.arsenalEnd.desktop,
      to: CAMERA_KEYFRAMES.fullBody.desktop,
    },
    // FullBody static (95-100%)
    {
      scrollStart: 0.95,
      scrollEnd: 1.0,
      from: CAMERA_KEYFRAMES.fullBody.desktop,
      to: CAMERA_KEYFRAMES.fullBody.desktop,
    },
  ],
};
