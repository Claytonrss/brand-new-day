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
 * when the narrative ARRIVES at a danger beat (evolution, arsenal, fullBody)
 * — never on mount, never on transition cards, never in the hero, and (§3
 * direction gate) never while scrolling up or on a scroll-less beat flip:
 * chapter2→evolution sits exactly under the card that covers the viewport,
 * so a backward re-entry would spend the fire where nobody can see it.
 *
 * `velocity` is normalized scroll velocity (progress/s, positive down).
 */

/** Decay helper: same beat, no scroll — pure envelope decay frames. */
function decay(frames = 120): void {
  for (let i = 0; i < frames; i++) spiderSenseStep(1 / 60, spiderSense.beat ?? 'hero', 0);
}

describe('spiderSenseStep trigger discipline', () => {
  it('never fires on the first step (mount), even straight into a danger beat', () => {
    spiderSenseResetForTest();
    expect(spiderSenseStep(1 / 60, 'hero', 0.4)).toBe(0);
    spiderSenseResetForTest();
    expect(spiderSenseStep(1 / 60, 'evolution', 0.4)).toBe(0);
    expect(spiderSense.count).toBe(0);
  });

  it('fires when scrolling forward into each danger beat', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    for (const beat of ['evolution', 'arsenal', 'fullBody'] as const) {
      expect(spiderSenseStep(1 / 60, beat, 0.4)).toBe(1);
      expect(spiderSense.count).toBeGreaterThan(0);
      decay();
    }
    expect(spiderSense.count).toBe(3);
  });

  it('does NOT fire on transition cards, colophon or the hero', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    const crossings = [
      ['hero', 'chapter1'],
      ['evolution', 'chapter2'],
      ['arsenal', 'colophon'],
      ['chapter1', 'hero'],
    ] as const;
    for (const [from, to] of crossings) {
      spiderSense.beat = from; // simulate arriving mid-timeline
      for (let i = 0; i < 120; i++) spiderSenseStep(1 / 60, from, 0.4);
      expect(spiderSenseStep(1 / 60, to, 0.4)).toBe(0);
    }
    expect(spiderSense.count).toBe(0);
  });

  it('does NOT fire re-entering a danger beat while scrolling up', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    expect(spiderSenseStep(1 / 60, 'evolution', 0.4)).toBe(1);
    decay();

    // the reported bug: flipping back into evolution lands exactly under the
    // REVELAÇÃO card — the re-entry must stay silent
    expect(spiderSenseStep(1 / 60, 'chapter2', -0.4)).toBe(0);
    expect(spiderSenseStep(1 / 60, 'evolution', -0.4)).toBe(0);
    expect(spiderSense.count).toBe(1);
    expect(spiderSense.envelope).toBe(0);

    // same discipline for the other two danger beats, entered from below
    expect(spiderSenseStep(1 / 60, 'arsenal', -0.4)).toBe(0);
    decay(10);
    expect(spiderSenseStep(1 / 60, 'fullBody', -0.4)).toBe(0);
    decay(10);
    expect(spiderSenseStep(1 / 60, 'colophon', -0.4)).toBe(0);
    expect(spiderSenseStep(1 / 60, 'fullBody', -0.4)).toBe(0);
    expect(spiderSense.count).toBe(1);
    expect(spiderSense.envelope).toBe(0);
  });

  it('does NOT fire on a beat flip with zero velocity (refresh jitter)', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0);
    spiderSenseStep(1 / 60, 'chapter1', 0);
    expect(spiderSenseStep(1 / 60, 'evolution', 0)).toBe(0);
    expect(spiderSense.count).toBe(0);
    expect(spiderSense.envelope).toBe(0);
  });

  it('scrolling away and returning forward re-arms and fires again', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    expect(spiderSenseStep(1 / 60, 'evolution', 0.4)).toBe(1);
    decay();

    // up into chapter1 (silent), back down into evolution (fires again)
    expect(spiderSenseStep(1 / 60, 'chapter1', -0.4)).toBe(0);
    expect(spiderSenseStep(1 / 60, 'evolution', 0.4)).toBe(1);
    expect(spiderSense.count).toBe(2);
  });

  it('first possible fire is the evolution entry — nothing before it', () => {
    spiderSenseResetForTest();
    // walk the whole opening: hero → chapter1
    spiderSenseStep(1 / 60, 'hero', 0.4);
    spiderSenseStep(1 / 60, 'chapter1', 0.4);
    expect(spiderSense.count).toBe(0);
    expect(spiderSenseStep(1 / 60, 'evolution', 0.4)).toBe(1);
  });
});

describe('spiderSenseStep envelope', () => {
  it('decays to a hard zero — visibly gone by ~500ms, silent by ~1s', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    spiderSenseStep(1 / 60, 'evolution', 0.4);

    // visible life: below the halo's perceptual floor (~0.15 envelope) at 500ms
    decay(30);
    expect(spiderSense.envelope).toBeLessThanOrEqual(0.15);

    // hard zero shortly after — one comparison per frame costs nothing, but
    // downstream systems must see a clean 0
    let t = 0.5;
    while (spiderSense.envelope > 0 && t < 5) {
      spiderSenseStep(1 / 60, 'evolution', 0);
      t += 1 / 60;
    }
    expect(t).toBeLessThan(1.2);
    expect(spiderSense.envelope).toBe(0);
  });

  it('alternates the alert tilt side between fires', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    spiderSenseStep(1 / 60, 'evolution', 0.4);
    expect(spiderSenseTilt()).toBeLessThan(0);

    decay();
    spiderSenseStep(1 / 60, 'arsenal', 0.4);
    expect(spiderSenseTilt()).toBeGreaterThan(0);
  });

  it('resets completely, including the fire count', () => {
    spiderSenseResetForTest();
    spiderSenseStep(1 / 60, 'hero', 0.4);
    spiderSenseStep(1 / 60, 'arsenal', 0.4);
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
