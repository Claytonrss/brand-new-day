/**
 * Hero mouse cue — the ambient light ping near the lenses that invites a first
 * cursor move (docs/specs/hero-mouse-cue.md).
 *
 * Pure logic so the component stays thin: a schedule predicate, two movement
 * detectors and a best-effort session flag. The cue is discovery, not content —
 * every constant here is calibration surface for "how subtle is subtle".
 */

/** Calibratable constants — spec §7. */
export const HERO_CUE = {
  /** sessionStorage flag — one cue per tab session. */
  storageKey: 'spiderman-landing:heroMouseHintShown',
  /** Poll of the `landing` store while waiting for the arrival to settle (ms). */
  settlePollMs: 150,
  /** Quiet time between "arrival settled + hero window" and the ping (ms). */
  cueDelayMs: 1500,
  fadeInMs: 500,
  /** Drift starts shortly after the fade-in begins (ms into the cycle). */
  driftStartMs: 250,
  driftMs: 2200,
  /** Fade-out overlaps the tail of the drift so opacity never pops (ms). */
  driftFadeOverlapMs: 300,
  fadeOutMs: 600,
  /** Horizontal drift — the same axis the head tracking responds to (px). */
  driftPx: 48,
  /** Peak opacity: peripheral vision only, never a beacon. */
  peakOpacity: 0.35,
  /** Fade when the user beats the cycle (ms). */
  cancelFadeMs: 250,
} as const;

/** Scroll window and noise floor — spec §7 (fractions of viewport height). */
export const HERO_CUE_SCROLL = {
  /** Deltas below this are Lenis/momentum tails, not a scroll decision (px). */
  epsPx: 8,
  /** Opening card mostly lifted, hero copy readable. */
  windowStartVh: 0.55,
  /** Still inside the hero's first viewport. */
  windowEndVh: 1.8,
} as const;

/** Pointer displacement from baseline that counts as "the user moved" (px). */
export const HERO_CUE_POINTER_EPS_PX = 12;

export interface HeroCueScheduleInput {
  finePointer: boolean;
  reducedMotion: boolean;
  shownThisSession: boolean;
  landingFired: boolean;
  landingSettled: boolean;
  scrollY: number;
  viewportHeight: number;
}

/** True when every guard passes and the cue delay timer may start. */
export function canSchedule(input: HeroCueScheduleInput): boolean {
  const {
    finePointer,
    reducedMotion,
    shownThisSession,
    landingFired,
    landingSettled,
    scrollY,
    viewportHeight,
  } = input;
  if (!finePointer || reducedMotion || shownThisSession || !landingFired || !landingSettled) {
    return false;
  }
  return (
    scrollY >= viewportHeight * HERO_CUE_SCROLL.windowStartVh &&
    scrollY <= viewportHeight * HERO_CUE_SCROLL.windowEndVh
  );
}

/**
 * First move sets the baseline (a pointer entering the viewport is not
 * "moving"); any later position further than `epsPx` from it is a real move.
 */
export function createPointerMovementDetector(epsPx: number = HERO_CUE_POINTER_EPS_PX) {
  let baselineX = 0;
  let baselineY = 0;
  let primed = false;
  return {
    move(x: number, y: number): boolean {
      if (!primed) {
        primed = true;
        baselineX = x;
        baselineY = y;
        return false;
      }
      return Math.hypot(x - baselineX, y - baselineY) > epsPx;
    },
  };
}

/**
 * Scroll quiescence tracker: `rebase` re-arms the baseline (the component does
 * it when scheduling), then any delta beyond `epsPx` is a deliberate scroll.
 */
export function createScrollTracker(epsPx: number = HERO_CUE_SCROLL.epsPx) {
  let baseline = 0;
  let primed = false;
  const rebase = (scrollY: number) => {
    baseline = scrollY;
    primed = true;
  };
  return {
    rebase,
    moved(scrollY: number): boolean {
      if (!primed) rebase(scrollY);
      return primed && Math.abs(scrollY - baseline) > epsPx;
    },
  };
}

export interface HeroCueStorage {
  wasShown(): boolean;
  markShown(): void;
}

/**
 * Best-effort session flag (DI for tests). Storage errors (private mode)
 * degrade to "never shown" — an extra ping on reload beats a broken guard.
 */
export function createHeroCueStorage(
  storage?: Pick<Storage, 'getItem' | 'setItem'>,
): HeroCueStorage {
  const resolve = () =>
    storage ?? (typeof window === 'undefined' ? undefined : window.sessionStorage);
  return {
    wasShown(): boolean {
      try {
        return resolve()?.getItem(HERO_CUE.storageKey) != null;
      } catch {
        return false;
      }
    },
    markShown(): void {
      try {
        resolve()?.setItem(HERO_CUE.storageKey, '1');
      } catch {
        /* best-effort by design */
      }
    },
  };
}
