import type { BeatId } from '@/components/3d/beat/beats';

/**
 * Beat accent for the DOM chrome (docs/specs/beat-chrome.md, T5.1).
 *
 * `BeatProvider` publishes the current value as `--beat-accent` on `<main>`
 * (plus `data-beat`); the allowed consumers are exhaustive — Arsenal HUD
 * hairlines, kicker rules, the gyro chip border and `::selection`. No colored
 * backgrounds, no colored text (design-bible).
 */

/** paper at 60% — the fullBody poster accent. */
const PAPER_60 = 'rgba(233, 229, 218, 0.6)';

export const BEAT_ACCENTS: Record<BeatId, string> = {
  hero: '#2c3b4c', // steel — frio, contido
  chapter1: '#7a1f24', // oxide — antecipa o beat seguinte
  evolution: '#7a1f24', // oxide — quente do símbolo
  chapter2: '#c23b34', // signal — antecipa o beat seguinte
  arsenal: '#c23b34', // signal — acento máximo
  fullBody: PAPER_60, // poster neutro
  colophon: '#6b6a63', // dim — recolhimento
};
