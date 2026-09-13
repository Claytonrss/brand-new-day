import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { beatAt, beatLocalProgress } from './beats';
import { BeatContext } from './beatContext';
import { beatRuntime, type BeatState } from './beatState';
import { BEAT_ACCENTS } from '../../../design/beatAccents';

/**
 * BeatProvider — single master ScrollTrigger publishing narrative state.
 *
 * Replaces the scattered per-section triggers (previously `EvolutionScene`
 * owned its own). One trigger, one progress value, one beat — every 3D
 * consumer (LightRig today, camera and effects next) reads the same source.
 *
 * The trigger is registered on `document.body`, so it keeps working with
 * `pointer-events: none` on the canvas.
 *
 * @see docs/specs/headroom-lighting.md §7
 */
export function BeatProvider({ children }: { children: ReactNode }) {
  // The context ref IS the module-level runtime, so readers outside the
  // React tree (PerformanceMonitor idle-gate) see the same values.
  const stateRef = useRef<BeatState>(beatRuntime);
  const [beat, setBeat] = useState<BeatState['beat']>('hero');

  // Publish the current beat to the DOM chrome (docs/specs/beat-chrome.md):
  // `data-beat` as a hook + `--beat-accent` for the allowed consumers. Runs
  // only on beat change (~6x per full scroll); CSS transitions do the rest.
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    main.setAttribute('data-beat', beat);
    main.style.setProperty('--beat-accent', BEAT_ACCENTS[beat]);
  }, [beat]);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const current = beatAt(progress);
        const state = stateRef.current;

        // getVelocity() is px/s; normalize by viewport height → progress/s
        state.velocity = self.getVelocity() / Math.max(window.innerHeight, 1);
        state.progress = progress;
        state.beat = current.id;
        state.t = beatLocalProgress(current, progress);

        // Rare (6 times per full scroll) — React bails out when unchanged.
        setBeat(current.id);
      },
    });

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      trigger.kill();
      // A stale velocity would keep the tier idle-gate closed after a remount.
      beatRuntime.velocity = 0;
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <BeatContext.Provider value={{ beat, stateRef }}>{children}</BeatContext.Provider>;
}
