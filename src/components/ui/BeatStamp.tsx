import { useEffect, useRef, useState } from 'react';
import { BEAT_STAMPS } from '../../design/beatStamps';
import type { BeatId } from '../3d/beat/beats';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** The text swap happens while the label is transparent. */
const FADE_MS = 180;

/**
 * BeatStamp — editorial field log on the left spine (IDEIA-AMB-08).
 *
 * A fixed vertical label that crossfades whenever `BeatProvider` publishes a
 * new `data-beat` on `<main>`. A MutationObserver keeps this decoupled from
 * the 3D React tree and fires only ~6× per full scroll. aria-hidden:
 * decorative chrome. Sits on the far-left edge, balancing the ProgressBar on
 * the right, outside every text safe zone (composition-rules).
 *
 * @see src/design/beatStamps.ts
 */
export function BeatStamp() {
  const [stamp, setStamp] = useState(BEAT_STAMPS.hero);
  const [visible, setVisible] = useState(true);
  const currentRef = useRef<BeatId>('hero');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    let timer = 0;
    const observer = new MutationObserver(() => {
      const beat = main.getAttribute('data-beat') as BeatId | null;
      if (!beat || beat === currentRef.current || !(beat in BEAT_STAMPS)) return;
      currentRef.current = beat;
      setVisible(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => {
          setStamp(BEAT_STAMPS[beat]);
          setVisible(true);
        },
        reduceMotion ? 0 : FADE_MS,
      );
    });

    observer.observe(main, { attributes: true, attributeFilter: ['data-beat'] });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      data-beat-stamp
      className="beat-stamp pointer-events-none fixed left-2.5 top-1/2 z-30 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.24em] text-dim md:left-4"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {stamp}
    </div>
  );
}
