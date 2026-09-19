import { describe, expect, it } from 'vitest';
import {
  HERO_CUE,
  HERO_CUE_POINTER_EPS_PX,
  HERO_CUE_SCROLL,
  canSchedule,
  createHeroCueStorage,
  createPointerMovementDetector,
  createScrollTracker,
} from '@/design/heroCue';

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

const BASE = {
  finePointer: true,
  reducedMotion: false,
  shownThisSession: false,
  landingFired: true,
  landingSettled: true,
  scrollY: 700,
  viewportHeight: 900,
};

describe('canSchedule', () => {
  it('schedules on the happy path: fine pointer, settled arrival, hero window', () => {
    expect(canSchedule(BASE)).toBe(true);
  });

  it('never schedules on touch, reduced motion, shown session or unsettled arrival', () => {
    expect(canSchedule({ ...BASE, finePointer: false })).toBe(false);
    expect(canSchedule({ ...BASE, reducedMotion: true })).toBe(false);
    expect(canSchedule({ ...BASE, shownThisSession: true })).toBe(false);
    expect(canSchedule({ ...BASE, landingFired: false })).toBe(false);
    expect(canSchedule({ ...BASE, landingSettled: false })).toBe(false);
  });

  it('holds behind the opening card and past the hero first viewport', () => {
    const { viewportHeight } = BASE;
    const start = viewportHeight * HERO_CUE_SCROLL.windowStartVh;
    const end = viewportHeight * HERO_CUE_SCROLL.windowEndVh;
    expect(canSchedule({ ...BASE, scrollY: start - 100 })).toBe(false);
    expect(canSchedule({ ...BASE, scrollY: start })).toBe(true);
    expect(canSchedule({ ...BASE, scrollY: end })).toBe(true);
    expect(canSchedule({ ...BASE, scrollY: end + 100 })).toBe(false);
  });
});

describe('createPointerMovementDetector', () => {
  it('treats the first move as the baseline (viewport entry is not movement)', () => {
    const detector = createPointerMovementDetector();
    expect(detector.move(400, 300)).toBe(false);
  });

  it('ignores jitter within the epsilon but flags a real move beyond it', () => {
    const detector = createPointerMovementDetector(HERO_CUE_POINTER_EPS_PX);
    detector.move(400, 300);
    expect(detector.move(405, 305)).toBe(false);
    expect(detector.move(400, 300)).toBe(false);
    expect(detector.move(411.9, 300)).toBe(false); // just inside 12px
    expect(detector.move(412.1, 300)).toBe(true); // just beyond
  });

  it('measures the diagonal distance, not per-axis', () => {
    const detector = createPointerMovementDetector(HERO_CUE_POINTER_EPS_PX);
    detector.move(0, 0);
    expect(detector.move(9, 9)).toBe(true); // hypot ≈ 12.7 > 12
  });
});

describe('createScrollTracker', () => {
  it('primes on first read and ignores deltas inside the epsilon', () => {
    const tracker = createScrollTracker(HERO_CUE_SCROLL.epsPx);
    expect(tracker.moved(600)).toBe(false);
    expect(tracker.moved(605)).toBe(false);
    expect(tracker.moved(607)).toBe(false);
    expect(tracker.moved(609)).toBe(true); // |609-600| > 8
  });

  it('rebases so a deferral window restarts cleanly', () => {
    const tracker = createScrollTracker(HERO_CUE_SCROLL.epsPx);
    tracker.moved(600);
    tracker.rebase(700);
    expect(tracker.moved(704)).toBe(false);
    expect(tracker.moved(720)).toBe(true);
  });
});

describe('createHeroCueStorage', () => {
  it('is empty until marked, then reads as shown (once per session)', () => {
    const storage = memoryStorage();
    const cue = createHeroCueStorage(storage);
    expect(cue.wasShown()).toBe(false);
    cue.markShown();
    expect(cue.wasShown()).toBe(true);
    expect(storage.raw.get(HERO_CUE.storageKey)).toBe('1');
  });

  it('honors a pre-existing session flag', () => {
    const cue = createHeroCueStorage(memoryStorage({ [HERO_CUE.storageKey]: '1' }));
    expect(cue.wasShown()).toBe(true);
  });

  it('degrades silently when storage throws (private mode)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('quota');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    const cue = createHeroCueStorage(throwing);
    expect(() => {
      expect(cue.wasShown()).toBe(false);
      cue.markShown();
    }).not.toThrow();
  });
});
