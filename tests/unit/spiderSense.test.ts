import { describe, expect, it } from 'vitest';
import {
  SPIDER_SENSE,
  isDangerBeat,
  spiderSense,
  spiderSenseResetForTest,
  spiderSenseStep,
  spiderSenseTilt,
} from '@/components/3d/rig/spiderSense';

/**
 * Spider-sense guardrails — docs/specs/spider-sense.md: the sense fires ONLY
 * when the narrative enters a danger beat (evolution, arsenal, fullBody) —
 * never on mount, never on transition cards, never in the hero — and the
 * envelope decays to a hard zero in ~500ms.
 */
describe('spiderSenseStep trigger discipline', () => {
  it('never fires on the first step (mount), even straight into a danger beat', () => {
    spiderSenseResetForTest();
    expect(spiderSenseStep(1 / 60, 'hero')).toBe(0);
    spiderSenseResetForTest();
    expect(spiderSenseStep(1 / 60, 'evolution')).toBe(0);
    expect(spiderSense.count).toBe(0);
  });

  it('fires when entering each danger beat', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    for (const beat of ['evolution', 'arsenal', 'fullBody'] as const) {
      expect(spiderSenseStep(1 / 60, beat)).toBe(1);
      expect(spiderSense.count).toBeGreaterThan(0);
      // let it die before the next entry
      for (let i = 0; i < 120; i++) spiderSenseStep(1 / 60, beat);
    }
    expect(spiderSense.count).toBe(3);
  });

  it('does NOT fire on transition cards, colophon or the hero', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    const crossings = [
      ['hero', 'chapter1'],
      ['evolution', 'chapter2'],
      ['arsenal', 'colophon'],
      ['chapter1', 'hero'],
    ] as const;
    for (const [from, to] of crossings) {
      spiderSense.beat = from; // simulate arriving mid-timeline
      for (let i = 0; i < 120; i++) spiderSenseStep(1 / 60, from);
      expect(spiderSenseStep(1 / 60, to)).toBe(0);
    }
    expect(spiderSense.count).toBe(0);
  });

  it('first possible fire is the evolution entry — nothing before it', () => {
    spiderSenseResetForTest();
    // walk the whole opening: hero → chapter1
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'chapter1');
    expect(spiderSense.count).toBe(0);
    expect(spiderSenseStep(1 / 60, 'evolution')).toBe(1);
  });
});

describe('spiderSenseStep envelope', () => {
  it('decays to a hard zero — visibly gone by ~500ms, silent by ~1s', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'evolution');

    // visible life: below the halo's perceptual floor (~0.15 envelope) at 500ms
    for (let i = 0; i < 30; i++) spiderSenseStep(1 / 60, 'evolution');
    expect(spiderSense.envelope).toBeLessThanOrEqual(0.15);

    // hard zero shortly after — one comparison per frame costs nothing, but
    // downstream systems must see a clean 0
    let t = 0.5;
    while (spiderSense.envelope > 0 && t < 5) {
      spiderSenseStep(1 / 60, 'evolution');
      t += 1 / 60;
    }
    expect(t).toBeLessThan(1.2);
    expect(spiderSense.envelope).toBe(0);
  });

  it('alternates the alert tilt side between fires', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'evolution');
    expect(spiderSenseTilt()).toBeLessThan(0);

    for (let i = 0; i < 120; i++) spiderSenseStep(1 / 60, 'evolution');
    spiderSenseStep(1 / 60, 'arsenal');
    expect(spiderSenseTilt()).toBeGreaterThan(0);
  });

  it('resets completely, including the fire count', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero');
    spiderSenseStep(1 / 60, 'arsenal');
    spiderSenseResetForTest();
    expect(spiderSense.envelope).toBe(0);
    expect(spiderSense.beat).toBeNull();
    expect(spiderSense.started).toBe(false);
    expect(spiderSense.sign).toBe(1);
    expect(spiderSense.count).toBe(0);
  });

  it('classifies exactly the three danger beats', () => {
    expect(isDangerBeat('evolution')).toBe(true);
    expect(isDangerBeat('arsenal')).toBe(true);
    expect(isDangerBeat('fullBody')).toBe(true);
    expect(SPIDER_SENSE.DANGER_BEATS).toHaveLength(3);
  });
});
