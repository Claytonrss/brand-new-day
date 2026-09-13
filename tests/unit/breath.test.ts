import { describe, expect, it } from 'vitest';
import {
  BREATH_BEATS,
  breathResetForTest,
  breathRuntime,
  breathStep,
} from '@/components/3d/rig/breath';

/**
 * Beat-directed breathing guardrails — docs/specs/spider-sense.md §2: the
 * chest never jumps when the rate target changes, samples stay bounded, and
 * fullBody really breathes slower/deeper than the hero.
 */
describe('breathStep', () => {
  it('stays within the current amplitude', () => {
    breathResetForTest();
    for (let i = 0; i < 600; i++) {
      const sample = breathStep(1 / 60, 'arsenal');
      expect(Math.abs(sample)).toBeLessThanOrEqual(BREATH_BEATS.arsenal.amp + 1e-9);
    }
  });

  it('never jumps when the beat (and rate target) changes', () => {
    breathResetForTest();
    let previous = breathStep(1 / 60, 'hero');
    // cross every boundary back to back at 60fps
    const beats = ['hero', 'chapter1', 'evolution', 'chapter2', 'arsenal'] as const;
    for (const beat of beats) {
      for (let i = 0; i < 60; i++) {
        const sample = breathStep(1 / 60, beat);
        expect(Math.abs(sample - previous)).toBeLessThan(0.2);
        previous = sample;
      }
    }
  });

  it('fullBody breathes slower than the hero', () => {
    breathResetForTest();
    for (let i = 0; i < 360; i++) breathStep(1 / 60, 'hero');
    const heroPhase = breathRuntime.phase;

    breathResetForTest();
    for (let i = 0; i < 360; i++) breathStep(1 / 60, 'fullBody');
    expect(breathRuntime.phase).toBeLessThan(heroPhase);
  });

  it('eases amplitude toward the beat target (fullBody exhales deeper)', () => {
    breathResetForTest();
    for (let i = 0; i < 600; i++) breathStep(1 / 60, 'fullBody');
    expect(breathRuntime.amp).toBeCloseTo(BREATH_BEATS.fullBody.amp, 1);
    expect(breathRuntime.rate).toBeCloseTo(BREATH_BEATS.fullBody.rate, 2);
  });

  it('catches — holds the breath — while the spider-sense rings', () => {
    breathResetForTest();
    let maxHeld = 0;
    for (let i = 0; i < 600; i++) {
      const sample = breathStep(1 / 60, 'fullBody', 1);
      maxHeld = Math.max(maxHeld, Math.abs(sample));
    }
    // amplitude collapses to ~10% — a held breath, not a frozen pose
    expect(maxHeld).toBeLessThanOrEqual(BREATH_BEATS.fullBody.amp * 0.1 + 1e-9);
    expect(maxHeld).toBeGreaterThan(0);
  });
});
