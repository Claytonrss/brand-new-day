import { describe, expect, it } from 'vitest';
import { LIGHT_SLOTS } from '@/components/3d/lighting/lightCues';
import { BEAT_TIMELINE } from '@/components/3d/beat/beats';

/**
 * Guardrails for docs/specs/headroom-lighting.md §5 — these rules are what
 * makes the draw-call budget hold.
 */
describe('light slots', () => {
  it('has unique ids', () => {
    const ids = LIGHT_SLOTS.map((slot) => slot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has exactly one shadow caster', () => {
    expect(LIGHT_SLOTS.filter((slot) => slot.castShadow)).toHaveLength(1);
  });

  it('only overrides known beats', () => {
    const known = new Set(BEAT_TIMELINE.map((beat) => beat.id));
    for (const slot of LIGHT_SLOTS) {
      for (const beat of Object.keys(slot.beats)) {
        expect(known.has(beat as (typeof BEAT_TIMELINE)[number]['id'])).toBe(true);
      }
    }
  });
});
