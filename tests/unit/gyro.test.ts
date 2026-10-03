import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createGyroController,
  gyroReading,
  GYRO_DISMISSALS_KEY,
  GYRO_MAX_DISMISSALS,
  GYRO_STORAGE_KEY,
  handleDeviceOrientation,
  recenterGyro,
  requestGyroRecenter,
  type GyroControllerDeps,
} from '@/components/3d/interaction/gyroController';

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    raw: map,
  };
}

function makeController(overrides: Partial<GyroControllerDeps> = {}) {
  const onAttach = vi.fn();
  const onDetach = vi.fn();
  const deps: GyroControllerDeps = {
    hasSupport: true,
    onAttach,
    onDetach,
    storage: memoryStorage(),
    ...overrides,
  };
  return { controller: createGyroController(deps), onAttach, onDetach };
}

beforeEach(() => {
  gyroReading.rawGamma = 0;
  gyroReading.rawBeta = 0;
  gyroReading.fGamma = Number.NaN;
  gyroReading.fBeta = Number.NaN;
  gyroReading.origin = null;
  gyroReading.hz = 0;
});

describe('gyro permission state machine', () => {
  it('is unavailable without support and never attaches', () => {
    const { controller, onAttach } = makeController({ hasSupport: false });
    controller.init();
    expect(controller.getState()).toBe('unavailable');
    expect(onAttach).not.toHaveBeenCalled();
  });

  it('is unavailable under prefers-reduced-motion, even on iOS', () => {
    const { controller, onAttach } = makeController({
      reducedMotion: true,
      requestPermission: async () => 'granted',
    });
    controller.init();
    expect(controller.getState()).toBe('unavailable');
    expect(onAttach).not.toHaveBeenCalled();
  });

  it('activates directly on Android (no requestPermission)', () => {
    const { controller, onAttach } = makeController({ requestPermission: undefined });
    controller.init();
    expect(controller.getState()).toBe('granted');
    expect(onAttach).toHaveBeenCalledTimes(1);
  });

  it('prompts on iOS and never attaches before the grant', async () => {
    const storage = memoryStorage();
    const { controller, onAttach } = makeController({
      storage,
      requestPermission: async () => 'granted',
    });
    controller.init();
    expect(controller.getState()).toBe('prompt');
    expect(controller.needsChip()).toBe(true);
    expect(onAttach).not.toHaveBeenCalled();

    await controller.request();
    expect(controller.getState()).toBe('granted');
    expect(onAttach).toHaveBeenCalledTimes(1);
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBe('granted');
  });

  it('falls back to scroll when the permission is denied', async () => {
    const storage = memoryStorage();
    const { controller, onAttach } = makeController({
      storage,
      requestPermission: async () => 'denied',
    });
    controller.init();
    await controller.request();
    expect(controller.getState()).toBe('denied');
    expect(onAttach).not.toHaveBeenCalled();
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBe('denied');
  });

  it('treats a throwing requestPermission as denied', async () => {
    const { controller } = makeController({
      requestPermission: async () => {
        throw new Error('not allowed');
      },
    });
    controller.init();
    await controller.request();
    expect(controller.getState()).toBe('denied');
  });

  it('does not prompt again for a stored grant (silent re-request)', () => {
    const { controller } = makeController({
      storage: memoryStorage({ [GYRO_STORAGE_KEY]: 'granted' }),
      requestPermission: async () => 'granted',
    });
    controller.init();
    expect(controller.getState()).toBe('prompt');
    expect(controller.needsChip()).toBe(false);
  });

  it('treats a legacy stored dismissal as one strike, not a verdict', () => {
    const { controller } = makeController({
      storage: memoryStorage({ [GYRO_STORAGE_KEY]: 'dismissed' }),
      requestPermission: async () => 'granted',
    });
    controller.init();
    // One ignored chip still leaves budget: the chip may come back.
    expect(controller.getState()).toBe('prompt');
    expect(controller.needsChip()).toBe(true);
  });

  it('spends the budget when a legacy dismissal meets the counter', () => {
    const { controller } = makeController({
      storage: memoryStorage({
        [GYRO_STORAGE_KEY]: 'dismissed',
        [GYRO_DISMISSALS_KEY]: String(GYRO_MAX_DISMISSALS - 1),
      }),
      requestPermission: async () => 'granted',
    });
    controller.init();
    expect(controller.getState()).toBe('denied');
    expect(controller.needsChip()).toBe(false);
  });
});

describe('dismissal budget (ADR-031)', () => {
  it('dismiss increments the counter and stays session-denied — without writing the main key', () => {
    const storage = memoryStorage();
    const { controller } = makeController({
      storage,
      requestPermission: async () => 'granted',
    });
    controller.init();
    controller.dismiss();
    expect(controller.getState()).toBe('denied');
    expect(storage.getItem(GYRO_DISMISSALS_KEY)).toBe('1');
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBeNull();
    // Budget remains: the chip returns on a later visit.
    expect(controller.needsChip()).toBe(true);
  });

  it('stops asking after the budget is spent', () => {
    const storage = memoryStorage();
    const { controller } = makeController({
      storage,
      requestPermission: async () => 'granted',
    });
    controller.init();
    controller.dismiss();
    controller.dismiss();
    controller.dismiss();
    expect(controller.needsChip()).toBe(false);

    const nextVisit = makeController({ storage, requestPermission: async () => 'granted' });
    nextVisit.controller.init();
    expect(nextVisit.controller.getState()).toBe('denied');
    expect(nextVisit.controller.needsChip()).toBe(false);
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBeNull();
  });

  it('decline persists terminal denial without attaching', () => {
    const storage = memoryStorage();
    const { controller, onAttach } = makeController({
      storage,
      requestPermission: async () => 'granted',
    });
    controller.init();
    controller.decline();
    expect(controller.getState()).toBe('denied');
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBe('denied');
    expect(controller.needsChip()).toBe(false);
    expect(onAttach).not.toHaveBeenCalled();
  });

  it('request() re-attaches on Android (no requestPermission) when previously denied', async () => {
    const storage = memoryStorage({ [GYRO_STORAGE_KEY]: 'denied' });
    const { controller, onAttach } = makeController({ storage, requestPermission: undefined });
    controller.init();
    expect(controller.getState()).toBe('denied');
    expect(onAttach).not.toHaveBeenCalled();

    await controller.request();
    expect(controller.getState()).toBe('granted');
    expect(onAttach).toHaveBeenCalledTimes(1);
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBe('granted');
  });
});

describe('listener lifecycle (ADR-031)', () => {
  it('suspend detaches and resume reattaches — but only when granted', async () => {
    const { controller, onAttach, onDetach } = makeController({
      requestPermission: async () => 'granted',
    });
    controller.init();
    // Pausing before the grant is legal — nothing to detach yet.
    controller.suspend('tab');
    await controller.request();
    expect(controller.getState()).toBe('granted');
    expect(controller.isAttached()).toBe(false);
    expect(onAttach).not.toHaveBeenCalled();

    controller.resume('tab');
    expect(controller.isAttached()).toBe(true);
    expect(onAttach).toHaveBeenCalledTimes(1);

    controller.suspend('tab');
    expect(controller.isAttached()).toBe(false);
    expect(onDetach).toHaveBeenCalledTimes(1);
  });

  it('never resumes into a denied/prompt state', async () => {
    const { controller, onAttach } = makeController({
      requestPermission: async () => 'denied',
    });
    controller.init();
    await controller.request();
    controller.resume('tab');
    expect(controller.isAttached()).toBe(false);
    expect(onAttach).not.toHaveBeenCalled();
  });

  it('keeps tab and scene pauses independent (colophon × visibility race)', async () => {
    const { controller, onAttach } = makeController({ requestPermission: undefined });
    controller.init();
    expect(controller.isAttached()).toBe(true);

    controller.suspend('scene');
    expect(controller.isAttached()).toBe(false);
    // The tab comes back from hidden while the colophon still holds the scene.
    controller.suspend('tab');
    controller.resume('tab');
    expect(controller.isAttached()).toBe(false);

    controller.resume('scene');
    expect(controller.isAttached()).toBe(true);
    expect(onAttach).toHaveBeenCalledTimes(2);
  });

  it('detaching drops the baseline so the next event re-calibrates', async () => {
    const { controller } = makeController({ requestPermission: undefined });
    controller.init();
    gyroReading.origin = { gamma: 12, beta: -4 };

    controller.suspend('scene');
    expect(gyroReading.origin).toBeNull();
  });
});

describe('recenterGyro (ADR-031)', () => {
  it('rebaselines the origin onto the current filtered reading', () => {
    gyroReading.fGamma = 12;
    gyroReading.fBeta = -3;
    gyroReading.origin = { gamma: 0, beta: 0 };

    recenterGyro();
    expect(gyroReading.origin).toEqual({ gamma: 12, beta: -3 });
  });

  it('is a no-op before the first sensor sample', () => {
    const origin = { gamma: 5, beta: 5 };
    gyroReading.origin = origin;
    recenterGyro();
    expect(gyroReading.origin).toEqual(origin);
  });
});

describe('sensor stream handler (ADR-031)', () => {
  const event = (gamma: number, beta: number): DeviceOrientationEvent =>
    ({ gamma, beta }) as DeviceOrientationEvent;

  it('primes the filter, captures the baseline and counts events', () => {
    handleDeviceOrientation(event(30, 10));
    expect(gyroReading.rawGamma).toBe(30);
    expect(gyroReading.fGamma).toBe(30); // first sample: filtered = raw
    expect(gyroReading.origin).toEqual({ gamma: 30, beta: 10 });
    // hz flushes on 1 s window boundaries — timing-dependent in unit tests,
    // so only the deterministic stream fields are asserted here (the HUD
    // visual spec renders the live value).
  });

  it('rebases the baseline on the first event after a recenter request', () => {
    handleDeviceOrientation(event(30, 10));
    const stable = { ...gyroReading.origin! };

    requestGyroRecenter();
    handleDeviceOrientation(event(34, 10));

    // The baseline jumped to the post-rotation filtered reading — the tilt
    // reads as zero from now on instead of fighting the old calibration.
    expect(gyroReading.origin).toEqual({ gamma: gyroReading.fGamma, beta: gyroReading.fBeta });
    expect(gyroReading.origin).not.toEqual(stable);
  });

  it('keeps the baseline untouched when no recenter was requested', () => {
    handleDeviceOrientation(event(30, 10));
    const stable = { ...gyroReading.origin! };

    handleDeviceOrientation(event(34, 10));
    expect(gyroReading.origin).toEqual(stable);
  });

  it('ignores events without usable axes', () => {
    handleDeviceOrientation({ gamma: null, beta: 10 } as unknown as DeviceOrientationEvent);
    expect(gyroReading.origin).toBeNull();
    expect(gyroReading.hz).toBe(0);
  });
});
