import { describe, expect, it } from 'vitest';
import { BEAT_TIMELINE } from '../../src/components/3d/beat/beats';
import { BEAT_ACCENTS } from '../../src/design/beatAccents';

/**
 * Beat chrome guardrails — docs/specs/beat-chrome.md §3: every beat has an
 * accent, values stay inside the design palette, and transition cards
 * anticipate the beat that follows.
 */
describe('BEAT_ACCENTS', () => {
  it('covers every beat in the timeline', () => {
    for (const beat of BEAT_TIMELINE) {
      expect(BEAT_ACCENTS[beat.id]).toBeDefined();
    }
    expect(Object.keys(BEAT_ACCENTS)).toHaveLength(BEAT_TIMELINE.length);
  });

  it('stays inside the design palette', () => {
    const palette = new Set([
      '#0a0a0c', // ink
      '#141417', // concrete
      '#2c3b4c', // steel
      '#7a1f24', // oxide
      '#c23b34', // signal
      '#e9e5da', // paper
      '#6b6a63', // dim
      'rgba(233, 229, 218, 0.6)', // paper/60
    ]);
    for (const accent of Object.values(BEAT_ACCENTS)) {
      expect(palette.has(accent), `accent ${accent} fora da paleta`).toBe(true);
    }
  });

  it('transition cards anticipate the following beat', () => {
    expect(BEAT_ACCENTS.chapter1).toBe(BEAT_ACCENTS.evolution);
    expect(BEAT_ACCENTS.chapter2).toBe(BEAT_ACCENTS.arsenal);
  });

  it('gives the arsenal the maximum accent and the colophon the dimmest', () => {
    expect(BEAT_ACCENTS.arsenal).toBe('#c23b34');
    expect(BEAT_ACCENTS.colophon).toBe('#6b6a63');
    expect(BEAT_ACCENTS.fullBody).toBe('rgba(233, 229, 218, 0.6)');
  });
});
