import { describe, expect, it, vi } from 'vitest';
import {
  createGyroController,
  GYRO_STORAGE_KEY,
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
  const deps: GyroControllerDeps = {
    hasSupport: true,
    onAttach,
    storage: memoryStorage(),
    ...overrides,
  };
  return { controller: createGyroController(deps), onAttach };
}

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

  it('stays in fallback after a stored dismissal', () => {
    const { controller, onAttach } = makeController({
      storage: memoryStorage({ [GYRO_STORAGE_KEY]: 'dismissed' }),
      requestPermission: async () => 'granted',
    });
    controller.init();
    expect(controller.getState()).toBe('denied');
    expect(onAttach).not.toHaveBeenCalled();
  });

  it('dismiss persists the choice', () => {
    const storage = memoryStorage();
    const { controller } = makeController({
      storage,
      requestPermission: async () => 'granted',
    });
    controller.init();
    controller.dismiss();
    expect(controller.getState()).toBe('denied');
    expect(storage.getItem(GYRO_STORAGE_KEY)).toBe('dismissed');
  });
});
