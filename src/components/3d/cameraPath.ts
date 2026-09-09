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

/**
 * Camera path with chapter cards (Wave 4).
 *
 * Layout: Hero (100vh) + Chapter1 (100vh) + Evolution (150vh) +
 *         Chapter2 (100vh) + Arsenal (150vh) + FullBody (100vh) = 700vh
 *
 * Percentages:
 * - Hero:     0.00–0.14  (100/700)
 * - Chapter1: 0.14–0.28  (100/700) — camera transitions hero → evolutionStart
 * - Evolution: 0.28–0.50 (150/700) — push-in evolutionStart → evolutionEnd
 * - Chapter2: 0.50–0.64  (100/700) — camera transitions evolutionEnd → arsenalStart
 * - Arsenal:  0.64–0.86  (150/700) — orbit arsenalStart → arsenalEnd
 * - FullBody: 0.86–1.00  (100/700) — transition arsenalEnd → fullBody
 */
export const CAMERA_PATH: Record<'mobile' | 'desktop', CameraPathSegment[]> = {
  mobile: [
    // Hero (0-14%): static close-up
    {
      scrollStart: 0,
      scrollEnd: 0.14,
      from: CAMERA_KEYFRAMES.hero.mobile,
      to: CAMERA_KEYFRAMES.hero.mobile,
    },
    // Chapter1 — MUDANÇA (14-28%): hero → evolutionStart transition
    {
      scrollStart: 0.14,
      scrollEnd: 0.28,
      from: CAMERA_KEYFRAMES.hero.mobile,
      to: CAMERA_KEYFRAMES.evolutionStart.mobile,
    },
    // Evolution push-in (28-50%)
    {
      scrollStart: 0.28,
      scrollEnd: 0.5,
      from: CAMERA_KEYFRAMES.evolutionStart.mobile,
      to: CAMERA_KEYFRAMES.evolutionEnd.mobile,
    },
    // Chapter2 — REVELAÇÃO (50-64%): evolutionEnd → arsenalStart transition
    {
      scrollStart: 0.5,
      scrollEnd: 0.64,
      from: CAMERA_KEYFRAMES.evolutionEnd.mobile,
      to: CAMERA_KEYFRAMES.arsenalStart.mobile,
    },
    // Arsenal orbit (64-86%)
    {
      scrollStart: 0.64,
      scrollEnd: 0.86,
      from: CAMERA_KEYFRAMES.arsenalStart.mobile,
      to: CAMERA_KEYFRAMES.arsenalEnd.mobile,
    },
    // FullBody transition (86-100%)
    {
      scrollStart: 0.86,
      scrollEnd: 1.0,
      from: CAMERA_KEYFRAMES.arsenalEnd.mobile,
      to: CAMERA_KEYFRAMES.fullBody.mobile,
    },
  ],
  desktop: [
    // Hero (0-14%): static close-up
    {
      scrollStart: 0,
      scrollEnd: 0.14,
      from: CAMERA_KEYFRAMES.hero.desktop,
      to: CAMERA_KEYFRAMES.hero.desktop,
    },
    // Chapter1 — MUDANÇA (14-28%): hero → evolutionStart transition
    {
      scrollStart: 0.14,
      scrollEnd: 0.28,
      from: CAMERA_KEYFRAMES.hero.desktop,
      to: CAMERA_KEYFRAMES.evolutionStart.desktop,
    },
    // Evolution push-in (28-50%)
    {
      scrollStart: 0.28,
      scrollEnd: 0.5,
      from: CAMERA_KEYFRAMES.evolutionStart.desktop,
      to: CAMERA_KEYFRAMES.evolutionEnd.desktop,
    },
    // Chapter2 — REVELAÇÃO (50-64%): evolutionEnd → arsenalStart transition
    {
      scrollStart: 0.5,
      scrollEnd: 0.64,
      from: CAMERA_KEYFRAMES.evolutionEnd.desktop,
      to: CAMERA_KEYFRAMES.arsenalStart.desktop,
    },
    // Arsenal orbit (64-86%)
    {
      scrollStart: 0.64,
      scrollEnd: 0.86,
      from: CAMERA_KEYFRAMES.arsenalStart.desktop,
      to: CAMERA_KEYFRAMES.arsenalEnd.desktop,
    },
    // FullBody transition (86-100%)
    {
      scrollStart: 0.86,
      scrollEnd: 1.0,
      from: CAMERA_KEYFRAMES.arsenalEnd.desktop,
      to: CAMERA_KEYFRAMES.fullBody.desktop,
    },
  ],
};
