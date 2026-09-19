import { useEffect, useState } from 'react';

import type { BeatId } from '@/components/3d/beat/beats';

import { ModelAttribution } from './ModelAttribution';

/**
 * AttributionBadge — the single CC-BY attribution channel for the live scene.
 *
 * License §3(a) requires the credit visible without hover wherever the model
 * shows; rendering it per-section made it float over the character at key
 * moments and collide with section copy (audit 2026-09-18). As fixed chrome it
 * satisfies the license everywhere at once and never competes with the render.
 *
 * Hidden on the Colophon beat, where the permanent legal footer
 * (`ColophonSection`) owns the attribution (ADR-019) — a second copy would
 * duplicate it on screen. The static fallback keeps its own inline attribution
 * and never mounts this badge (`App` returns `<StaticFallback />` wholesale).
 *
 * @see docs/specs/first-frame-legibility.md §11 (criterion 2)
 * @see NOTICE.md
 */
export function AttributionBadge() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const main = document.querySelector('main');

    const sync = () => {
      const beat = main?.getAttribute('data-beat') as BeatId | null;
      setVisible(beat !== 'colophon');
    };

    sync();
    const observer = new MutationObserver(sync);
    if (main) observer.observe(main, { attributes: true, attributeFilter: ['data-beat'] });

    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      data-testid="attribution-badge"
      className="beat-accent-border-soft pointer-events-none fixed right-4 bottom-4 z-30 rounded-full border bg-ink/70 backdrop-blur-sm md:right-auto md:left-4"
    >
      <ModelAttribution className="pointer-events-none px-3 py-1.5 font-mono text-[10px] uppercase leading-tight tracking-[0.15em] whitespace-nowrap text-dim" />
    </div>
  );
}
