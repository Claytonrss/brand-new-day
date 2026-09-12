import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectInitialTier } from '../../src/components/3d/initialTier';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const MOBILE = '(max-width: 767px)';

/** Stub `window.matchMedia` so only the listed queries report `matches`. */
function stubMatchMedia(matches: string[]) {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({ matches: matches.includes(query) }),
  });
}

/**
 * FALHA-01 — the first painted frame carries the device's real cost, so the
 * tier must be known synchronously: mobile reads `medium` on the very first
 * render (never `high`), reduced-motion locks to `low`.
 */
describe('detectInitialTier', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts desktop on high', () => {
    stubMatchMedia([]);
    expect(detectInitialTier()).toBe('high');
  });

  it('starts a mobile viewport on medium — never high', () => {
    stubMatchMedia([MOBILE]);
    expect(detectInitialTier()).toBe('medium');
    expect(detectInitialTier()).not.toBe('high');
  });

  it('reduced-motion wins over mobile (locked to low)', () => {
    stubMatchMedia([REDUCED_MOTION, MOBILE]);
    expect(detectInitialTier()).toBe('low');
  });

  it('falls back to high without a window (SSR/tests)', () => {
    vi.stubGlobal('window', undefined);
    expect(detectInitialTier()).toBe('high');
  });
});
