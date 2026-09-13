import { REDUCED_MOTION_QUERY } from '../../../hooks/usePrefersReducedMotion';
export type GyroState = 'unavailable' | 'prompt' | 'granted' | 'denied';

export const GYRO_STORAGE_KEY = 'spiderman-landing:gyro';

export interface GyroControllerDeps {
  /** `typeof DeviceOrientationEvent !== 'undefined'`. */
  hasSupport: boolean;
  /** iOS 13+ gate; absent on Android/desktop. */
  requestPermission?: () => Promise<'granted' | 'denied'>;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Registers the deviceorientation listener. */
  onAttach: () => void;
  /** `prefers-reduced-motion`: never prompt, never attach. */
  reducedMotion?: boolean;
}

export interface GyroController {
  getState: () => GyroState;
  subscribe: (listener: () => void) => () => void;
  /** Detect support + stored choice; Android attaches immediately. */
  init: () => void;
  /** Call from a user gesture (chip tap or first gesture for a stored grant). */
  request: () => Promise<void>;
  /** User ignored the chip — persist and fall back to scroll. */
  dismiss: () => void;
  isAttached: () => boolean;
  /** False for a returning visitor whose grant is stored (no chip). */
  needsChip: () => boolean;
}

/**
 * createGyroController — the iOS permission state machine from
 * `docs/specs/mobile-gyro-permission.md §3`.
 *
 * Kept as a factory (no globals) so the transitions — especially "never attach
 * before grant" — can be unit tested without a browser.
 */
export function createGyroController(deps: GyroControllerDeps): GyroController {
  let state: GyroState = 'unavailable';
  let attached = false;
  let initialized = false;
  const listeners = new Set<() => void>();

  const set = (next: GyroState) => {
    if (next === state) return;
    state = next;
    for (const listener of listeners) listener();
  };

  const persist = (value: 'granted' | 'denied' | 'dismissed') => {
    deps.storage?.setItem(GYRO_STORAGE_KEY, value);
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    deps.onAttach();
    set('granted');
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isAttached: () => attached,
    needsChip: () => (deps.storage?.getItem(GYRO_STORAGE_KEY) ?? null) !== 'granted',
    init: () => {
      if (initialized) return;
      initialized = true;

      if (deps.reducedMotion || !deps.hasSupport) {
        set('unavailable');
        return;
      }

      // Android / no requestPermission: activate directly, no prompt.
      if (!deps.requestPermission) {
        attach();
        return;
      }

      const stored = deps.storage?.getItem(GYRO_STORAGE_KEY) ?? null;
      if (stored === 'granted') {
        // Returning visitor: the chip is not shown again; the first gesture
        // silently re-requests (usually no system prompt) via `request()`.
        set('prompt');
        return;
      }
      if (stored === 'denied' || stored === 'dismissed') {
        set('denied');
        return;
      }
      set('prompt');
    },
    request: async () => {
      if (!deps.requestPermission) return;
      try {
        const result = await deps.requestPermission();
        if (result === 'granted') {
          persist('granted');
          attach();
        } else {
          persist('denied');
          set('denied');
        }
      } catch {
        persist('denied');
        set('denied');
      }
    },
    dismiss: () => {
      persist('dismissed');
      set('denied');
    },
  };
}

/** The live gyro reading, consumed per frame by `useInteraction`. */
export const gyroReading: {
  gamma: number;
  beta: number;
  origin: null | { gamma: number; beta: number };
} = { gamma: 0, beta: 0, origin: null };

let singleton: GyroController | null = null;

function handleOrientation(event: DeviceOrientationEvent): void {
  if (event.gamma == null || event.beta == null) return;
  gyroReading.gamma = event.gamma;
  gyroReading.beta = event.beta;
  if (!gyroReading.origin) {
    gyroReading.origin = { gamma: event.gamma, beta: event.beta };
  }
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
    onAttach: () => window.addEventListener('deviceorientation', handleOrientation),
  });

  return singleton;
}
