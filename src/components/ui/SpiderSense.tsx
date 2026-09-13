import { useEffect, useRef, useState } from 'react';
import { spiderSense } from '@/components/3d/rig/spiderSense';
import { SENSE_ARCS, senseSquigglePath } from '@/design/senseArcs';

/** Halo box (viewBox units; CSS scales it per breakpoint). */
const HALO = 320;
/** Poll rate while idle — a fire lasts ~500ms, 90ms cannot miss it. */
const WATCH_MS = 90;

/**
 * SpiderSense — the comic halo around the head (IDEIA-3D-10 redesign).
 *
 * Six wavy hairline strokes that draw on around the projected head position
 * (`--sense-x/y`, published by `SenseAnchor`) and fade with the envelope.
 * The trigger discipline lives in `spiderSense.ts`: it only fires when the
 * narrative enters a danger beat, never in the hero — so nothing is
 * "pre-activated" and every fire is an event.
 *
 * Cost follows the ProgressBar pattern: a 90ms watcher while idle, one rAF
 * loop only while the halo is alive, opacity written directly (no re-renders
 * per frame). The draw-on re-triggers via `key={fire}` — one re-render per
 * fire. Under reduced motion the strokes appear fully drawn, no animation.
 *
 * @see docs/specs/spider-sense.md §1
 * @see src/design/senseArcs.ts
 */
export function SpiderSense() {
  const haloRef = useRef<SVGSVGElement>(null);
  const [fire, setFire] = useState(0);

  useEffect(() => {
    let watchId = 0;
    let rafId = 0;
    let deadFrames = 0;
    let lastCount = spiderSense.count;

    const syncCount = () => {
      if (spiderSense.count !== lastCount) {
        lastCount = spiderSense.count;
        setFire(lastCount);
      }
    };

    const raf = () => {
      const envelope = spiderSense.envelope;
      syncCount();
      if (haloRef.current) {
        haloRef.current.style.opacity = String(Math.min(1, envelope * 1.5));
      }
      if (envelope > 0.001) {
        deadFrames = 0;
        rafId = requestAnimationFrame(raf);
      } else if (++deadFrames < 3) {
        rafId = requestAnimationFrame(raf);
      } else {
        rafId = 0;
        watch();
      }
    };

    const watch = () => {
      watchId = window.setInterval(() => {
        if (spiderSense.envelope > 0.001) {
          window.clearInterval(watchId);
          rafId = requestAnimationFrame(raf);
        }
      }, WATCH_MS);
    };

    watch();
    return () => {
      window.clearInterval(watchId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <svg
      ref={haloRef}
      key={fire}
      data-spider-sense
      aria-hidden="true"
      viewBox={`0 0 ${HALO} ${HALO}`}
      className="sense-halo pointer-events-none fixed z-30"
      style={{ opacity: 0 }}
    >
      {SENSE_ARCS.map((arc, index) => (
        <path
          key={index}
          d={senseSquigglePath(HALO, arc)}
          pathLength={1}
          className="sense-squiggle"
          style={{ animationDelay: `${arc.delay}ms` }}
        />
      ))}
    </svg>
  );
}
