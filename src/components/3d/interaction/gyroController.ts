import { REDUCED_MOTION_QUERY } from '@/hooks/usePrefersReducedMotion';
import { adaptiveLowPass, remapForOrientation } from './pointerMath';

export type GyroState = 'unavailable' | 'prompt' | 'granted' | 'denied';

export const GYRO_STORAGE_KEY = 'spiderman-landing:gyro';
export const GYRO_DISMISSALS_KEY = 'spiderman-landing:gyro-dismissals';

/**
 * Ignoring the chip is NOT an answer — it re-asks on later visits until it
 * has been ignored this many times. An explicit "não" (or an OS denial) is
 * what closes the topic for good (ADR-031).
 */
export const GYRO_MAX_DISMISSALS = 3;

export interface GyroControllerDeps {
  /** `typeof DeviceOrientationEvent !== 'undefined'`. */
  hasSupport: boolean;
  /** iOS 13+ gate; absent on Android/desktop. */
  requestPermission?: () => Promise<'granted' | 'denied'>;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Registers the deviceorientation listener. */
  onAttach: () => void;
  /** Removes the deviceorientation listener (suspend/resume lifecycle). */
  onDetach?: () => void;
  /** `prefers-reduced-motion`: never prompt, never attach. */
  reducedMotion?: boolean;
}

/** Who asked for the pause — the tab going hidden or the scene (colophon). */
export type GyroSuspendSource = 'tab' | 'scene';

export interface GyroController {
  getState: () => GyroState;
  subscribe: (listener: () => void) => () => void;
  /** Detect support + stored choice; Android attaches immediately. */
  init: () => void;
  /** Call from a user gesture (chip tap, colophon opt-in, stored-grant re-ask). */
  request: () => Promise<void>;
  /** Explicit "não" — terminal, like an OS denial. */
  decline: () => void;
  /** Ignored chip: +1 dismissal, silent for the session, re-asks later. */
  dismiss: () => void;
  /** Pause the sensor for a named consumer; resumes when all pauses lift. */
  suspend: (source: GyroSuspendSource) => void;
  resume: (source: GyroSuspendSource) => void;
  isAttached: () => boolean;
  /** False with a stored grant/denial or after the dismissal budget is spent. */
  needsChip: () => boolean;
}

/**
 * createGyroController — the permission state machine from ADR-018, extended
 * with the lifecycle of ADR-031 (suspend/resume, dismissal counter, decline).
 *
 * Kept as a factory (no globals) so the transitions — especially "never attach
 * before grant" — can be unit tested without a browser.
 */
export function createGyroController(deps: GyroControllerDeps): GyroController {
  let state: GyroState = 'unavailable';
  let attached = false;
  let initialized = false;
  const suspended = new Set<GyroSuspendSource>();
  const listeners = new Set<() => void>();

  // The listener runs only while granted AND with no open pause. Detaching
  // always drops the baseline: the next event re-calibrates, so the model
  // never snaps after a resume.
  const syncAttachment = () => {
    const shouldAttach = state === 'granted' && suspended.size === 0;
    if (shouldAttach && !attached) {
      attached = true;
      deps.onAttach();
    } else if (!shouldAttach && attached) {
      attached = false;
      deps.onDetach?.();
      gyroReading.origin = null;
    }
  };

  const set = (next: GyroState) => {
    if (next === state) return;
    state = next;
    syncAttachment();
    for (const listener of listeners) listener();
  };

  const persist = (value: 'granted' | 'denied') => {
    deps.storage?.setItem(GYRO_STORAGE_KEY, value);
  };

  const readDismissals = (): number => {
    const raw = deps.storage?.getItem(GYRO_DISMISSALS_KEY) ?? null;
    const count = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isNaN(count) ? 0 : count;
  };

  /** Legacy `'dismissed'` entries count as one ignored chip, not a verdict. */
  const effectiveDismissals = (): number =>
    readDismissals() + ((deps.storage?.getItem(GYRO_STORAGE_KEY) ?? null) === 'dismissed' ? 1 : 0);

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isAttached: () => attached,
    needsChip: () => {
      const stored = deps.storage?.getItem(GYRO_STORAGE_KEY) ?? null;
      if (stored === 'granted' || stored === 'denied') return false;
      return effectiveDismissals() < GYRO_MAX_DISMISSALS;
    },
    init: () => {
      if (initialized) return;
      initialized = true;

      if (deps.reducedMotion || !deps.hasSupport) {
        set('unavailable');
        return;
      }

      const stored = deps.storage?.getItem(GYRO_STORAGE_KEY) ?? null;
      if (stored === 'denied') {
        // An explicit opt-out (decline / OS denial) outlives the session —
        // even on Android, where activation is otherwise automatic.
        set('denied');
        return;
      }
      if (stored === 'granted' && !deps.requestPermission) {
        // Returning Android visitor: no gate to call, attach right away.
        set('granted');
        return;
      }
      // Android / no requestPermission: activate directly, no prompt.
      if (!deps.requestPermission) {
        set('granted');
        return;
      }
      if (stored === 'granted') {
        // Returning iOS visitor: the chip is not shown again; the first
        // gesture silently re-requests (Safari requires one) via `request()`.
        set('prompt');
        return;
      }
      if (effectiveDismissals() >= GYRO_MAX_DISMISSALS) {
        set('denied');
        return;
      }
      set('prompt');
    },
    request: async () => {
      if (!deps.requestPermission) {
        // Android re-activation path (colophon opt-in): there is no gate to
        // call, so the explicit request IS the consent gesture.
        persist('granted');
        set('granted');
        return;
      }
      try {
        const result = await deps.requestPermission();
        if (result === 'granted') {
          persist('granted');
          set('granted');
        } else {
          persist('denied');
          set('denied');
        }
      } catch {
        persist('denied');
        set('denied');
      }
    },
    decline: () => {
      persist('denied');
      set('denied');
    },
    dismiss: () => {
      // Session-silent only — never writes the main key, so a later visit
      // with budget left asks again.
      deps.storage?.setItem(GYRO_DISMISSALS_KEY, String(readDismissals() + 1));
      set('denied');
    },
    suspend: (source) => {
      suspended.add(source);
      syncAttachment();
    },
    resume: (source) => {
      suspended.delete(source);
      syncAttachment();
    },
  };
}

/**
 * The live gyro reading, consumed per frame by `useInteraction`.
 *
 * Raw and filtered values live in portrait-relative degrees (already through
 * `remapForOrientation`); `fGamma`/`fBeta` are `NaN` until the first event.
 * The origin is captured from the FILTERED stream, so the model starts at
 * rest no matter how the phone was held at attach time.
 */
export const gyroReading: {
  rawGamma: number;
  rawBeta: number;
  fGamma: number;
  fBeta: number;
  origin: null | { gamma: number; beta: number };
  /** Events per second, refreshed once per 1 s window — HUD/field-tool only. */
  hz: number;
} = { rawGamma: 0, rawBeta: 0, fGamma: NaN, fBeta: NaN, origin: null, hz: 0 };

let singleton: GyroController | null = null;

let hzCount = 0;
let hzWindowStart = 0;
let pendingRecenter = false;

/**
 * The single sensor handler — exported so the stream (remap → filter →
 * baseline → recenter flag → hz) can be unit tested without a browser.
 */
export function handleDeviceOrientation(event: DeviceOrientationEvent): void {
  if (event.gamma == null || event.beta == null) return;
  const angle = typeof screen !== 'undefined' ? (screen.orientation?.angle ?? 0) : 0;
  const { x, y } = remapForOrientation(event.gamma, event.beta, angle);

  gyroReading.rawGamma = x;
  gyroReading.rawBeta = y;
  gyroReading.fGamma = adaptiveLowPass(gyroReading.fGamma, x);
  gyroReading.fBeta = adaptiveLowPass(gyroReading.fBeta, y);

  if (!gyroReading.origin) {
    gyroReading.origin = { gamma: gyroReading.fGamma, beta: gyroReading.fBeta };
  } else if (pendingRecenter) {
    // Screen rotated: the old baseline lost its meaning — rebaseline on the
    // first post-rotation sample instead of chasing the seam live.
    pendingRecenter = false;
    gyroReading.origin = { gamma: gyroReading.fGamma, beta: gyroReading.fBeta };
  }

  hzCount += 1;
  const now = performance.now();
  if (now - hzWindowStart >= 1000) {
    gyroReading.hz = hzCount;
    hzCount = 0;
    hzWindowStart = now;
  }
}

/** Rebaselines the calibration origin onto the current filtered reading. */
export function recenterGyro(): void {
  if (Number.isNaN(gyroReading.fGamma)) return;
  gyroReading.origin = { gamma: gyroReading.fGamma, beta: gyroReading.fBeta };
}

/** Flag the next sensor event to rebaseline (screen rotation path). */
export function requestGyroRecenter(): void {
  pendingRecenter = true;
}

/** Lazily build the browser-backed controller. */
export function getGyroController(): GyroController {
  if (singleton) return singleton;

  if (typeof window === 'undefined') {
    singleton = createGyroController({ hasSupport: false, onAttach: () => {} });
    return singleton;
  }

  const DeviceOrientation = (
    window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<'granted' | 'denied'> };
    }
  ).DeviceOrientationEvent;

  // Gyro is a mobile-only affordance: a desktop with a mouse uses pointer
  // parallax. `maxTouchPoints` (not `hover`) is the reliable signal — headless
  // Chromium reports `hover: none` even for desktop viewports.
  const isTouch = (window.navigator.maxTouchPoints ?? 0) > 0;

  singleton = createGyroController({
    hasSupport: Boolean(DeviceOrientation) && isTouch,
    requestPermission: DeviceOrientation?.requestPermission
      ? () => DeviceOrientation.requestPermission!()
      : undefined,
    storage: window.localStorage,
    reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
    onAttach: () => window.addEventListener('deviceorientation', handleDeviceOrientation),
    onDetach: () => window.removeEventListener('deviceorientation', handleDeviceOrientation),
  });

  // The sensor sleeps with the tab (battery), and a screen rotation
  // invalidates the portrait-relative baseline.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) singleton?.suspend('tab');
    else singleton?.resume('tab');
  });
  window.addEventListener('orientationchange', requestGyroRecenter);

  return singleton;
}
