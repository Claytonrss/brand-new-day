import { describe, expect, it } from 'vitest';
import {
  SPIDER_SENSE,
  spiderSense,
  spiderSenseResetForTest,
  spiderSenseRim,
  spiderSenseStep,
  spiderSenseTilt,
} from '../../src/components/3d/rig/spiderSense';

/**
 * Spider-sense guardrails — docs/specs/spider-sense.md §1: no shiver on
 * mount, a fast-decaying spike per beat change, rim within 1×..3×, and the
 * head tick alternating sides.
 */
describe('spiderSenseStep', () => {
  it('never shivers on the first step (mount)', () => {
    spiderSenseResetForTest();
    const envelope = spiderSenseStep(1 / 60, 'hero');
    expect(envelope).toBe(0);
    expect(spiderSenseRim()).toBe(1);
  });

  it('spikes to full envelope when the beat changes', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    const envelope = spiderSenseStep(1 / 60, 'chapter1');
    expect(envelope).toBe(1);
    expect(spiderSenseRim()).toBeCloseTo(1 + SPIDER_SENSE.RIM_BOOST);
  });

  it('decays monotonically to a hard zero', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'evolution');

    let previous = 1;
    let envelope = 1;
    for (let i = 0; i < 120; i++) {
      envelope = spiderSenseStep(1 / 60, 'evolution');
      expect(envelope).toBeLessThanOrEqual(previous);
      previous = envelope;
    }
    expect(envelope).toBe(0);
    expect(spiderSenseRim()).toBe(1);
  });

  it('spike is gone in about a fifth of a second', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'arsenal');

    let t = 0;
    while (spiderSense.envelope > 0 && t < 5) {
      spiderSenseStep(1 / 60, 'arsenal');
      t += 1 / 60;
    }
    expect(t).toBeLessThan(0.75);
  });

  it('alternates the head tick side between boundaries', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'chapter1'); // sign flips to -1
    expect(spiderSenseTilt()).toBeLessThan(0);

    // let the envelope die, cross another boundary
    for (let i = 0; i < 120; i++) spiderSenseStep(1 / 60, 'chapter1');
    spiderSenseStep(1 / 60, 'chapter2'); // sign flips back to +1
    expect(spiderSenseTilt()).toBeGreaterThan(0);
  });

  it('resets completely', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'fullBody');
    spiderSenseResetForTest();
    expect(spiderSense.envelope).toBe(0);
    expect(spiderSense.beat).toBeNull();
    expect(spiderSense.started).toBe(false);
    expect(spiderSense.sign).toBe(1);
  });
});
