import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { beatAt, beatLocalProgress } from './beats';
import { BeatContext } from './beatContext';
import { INITIAL_BEAT_STATE, type BeatState } from './beatState';

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
  const stateRef = useRef<BeatState>({ ...INITIAL_BEAT_STATE });
  const [beat, setBeat] = useState<BeatState['beat']>('hero');

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

    return () => trigger.kill();
  }, []);

  return (
    <BeatContext.Provider value={{ beat, stateRef }}>{children}</BeatContext.Provider>
  );
}
