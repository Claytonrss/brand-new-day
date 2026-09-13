import type { ReactNode } from 'react';

/**
 * Copy primitives shared by the section overlays (hero, evolution, arsenal,
 * full body). The headline is intentionally NOT shared — each section sizes
 * its own display type.
 */

/** Mono kicker with the beat accent rule (lights up with the active beat). */
export function OverlayKicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
      <span aria-hidden="true" className="beat-accent-rule" />
      {children}
    </p>
  );
}

/** Body copy under the headline. */
export function OverlayBody({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 font-display text-sm leading-[1.55] text-paper/80 sm:text-base md:text-lg">
      {children}
    </p>
  );
}
