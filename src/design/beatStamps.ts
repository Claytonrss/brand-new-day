import type { BeatId } from '@/components/3d/beat/beats';

/**
 * Editorial stamp per beat (IDEIA-AMB-08, docs/specs/dom-micro-craft.md §2).
 *
 * A field log running down the left spine — place · time · weather. The
 * times progress 04:37 → 05:00, so the whole page reads as one rainy NYC
 * night; `fullBody` carries the film date from the storyboard kicker
 * (31 de julho). Decorative chrome (rendered aria-hidden) and must never
 * repeat section headlines (storyboard copy is closed).
 */
export const BEAT_STAMPS: Record<BeatId, string> = {
  hero: 'NYC · 04:37 · chuva fina',
  chapter1: 'Queens · 04:41 · vento sul',
  evolution: '04:44 · pressão baixando',
  chapter2: '04:47 · a cidade segura o fôlego',
  arsenal: '04:52 · céu abrindo',
  fullBody: '31 de julho · 04:58',
  colophon: '05:00 · fim da ronda',
};
