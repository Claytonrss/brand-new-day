import { useEffect, useState } from 'react';
import type { BeatId } from '@/components/3d/beat/beats';
import { arsenalReveal } from '@/components/3d/interaction/arsenalReveal';

/**
 * ArsenalClickHint — DOM affordance for the click-gated macro HUD.
 *
 * The breathing ring (`WebShootHint`) is diegetic and easy to miss on mobile
 * glare/motion; this label states the expected action. Visible only while all
 * of: the Arsenal beat is active (the `data-beat` contract on `<main>`, the
 * same channel `BeatStamp` observes), the canvas published its gesture gate
 * (`gestureCapable === true`, never the indeterminate `null`) and the HUD is
 * still unrevealed — the same tap that fires the shot removes it.
 *
 * @see docs/specs/web-shoot-discovery.md §3
 * @see docs/specs/arsenal-macro-hud.md §5
 * @see docs/memory/decisions.md (ADR-028)
 */
export function ArsenalClickHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');

    const sync = () => {
      const beat = main?.getAttribute('data-beat') as BeatId | null;
      setVisible(
        beat === 'arsenal' && arsenalReveal.gestureCapable === true && !arsenalReveal.revealed,
      );
    };

    sync();
    const unsubscribe = arsenalReveal.subscribe(sync);
    const observer = new MutationObserver(sync);
    if (main) observer.observe(main, { attributes: true, attributeFilter: ['data-beat'] });

    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="arsenal-click-hint"
      className="pointer-events-none fixed bottom-20 left-1/2 z-20 -translate-x-1/2"
    >
      <span className="animate-pulse font-mono text-[10px] uppercase tracking-[0.25em] text-signal motion-reduce:animate-none [text-shadow:0_1px_10px_rgba(10,10,12,0.9)]">
        clique no anel ·
      </span>
    </div>
  );
}
