import { useProgress } from '@react-three/drei';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { loaderCover } from './loaderCover';

interface CinematicLoaderProps {
  onLoaded: () => void;
}

/**
 * CinematicLoader — the first beat, not a wait screen.
 *
 * Direction A from `docs/specs/loader-teaser.md`: a 2D SVG pair of mask lenses
 * wakes up with the load. At 0% the lenses are a faint outline; as progress
 * rises they gain fill and a `signal` glow, so the reveal itself is the
 * progress (the conventional bar is gone; the `%` stays as a minimal readout).
 *
 * Tracks THREE.js asset loading via drei's `useProgress` (module-level zustand
 * store backed by DefaultLoadingManager). Fades out after all assets finish,
 * then calls onLoaded to unmount itself.
 *
 * Respects `prefers-reduced-motion`: no reveal transition; unmounts as soon as
 * loading completes.
 *
 * @see docs/specs/loader-teaser.md
 * @see docs/design/design-bible.md
 */
export function CinematicLoader({ onLoaded }: CinematicLoaderProps) {
  const { progress, active } = useProgress();
  const [fadeOut, setFadeOut] = useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const hasStartedLoading = useRef(false);

  // Publish "loader covers the viewport" for the tier idle-gate (FALHA-09).
  // Unmount (load complete) is the single source of truth for clearing it.
  useEffect(() => {
    loaderCover.covering = true;
    return () => {
      loaderCover.covering = false;
    };
  }, []);

  // Track whether loading has actually started (to avoid false-positive
  // on the initial state where active=false and progress=0).
  useEffect(() => {
    if (active) {
      hasStartedLoading.current = true;
    }
  }, [active]);

  const handleComplete = useCallback(() => {
    if (reduceMotion) {
      // Skip animation — immediately unmount
      onLoadedRef.current();
    } else {
      setFadeOut(true);
      const timer = setTimeout(() => {
        onLoadedRef.current();
      }, MOTION.duration.slow);
      return () => clearTimeout(timer);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (!hasStartedLoading.current) return;
    if (progress >= 100 && !active) {
      // Small delay so the user sees 100% before fade
      const fadeTimer = setTimeout(() => {
        handleComplete();
      }, 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [progress, active, handleComplete]);

  const transitionDuration = reduceMotion ? 0 : MOTION.duration.slow;
  const revealMs = reduceMotion ? 0 : MOTION.duration.fast;

  const revealed = Math.min(Math.max(progress, 0), 100) / 100;
  // Lenses never fully disappear: a faint rim keeps the shape legible at 0%.
  const rim = 0.14 + revealed * 0.86;
  const glow = revealed * 0.9;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Carregando experiência 3D"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {/* Mask-lens teaser — pure 2D, independent of the 22 MB GLB. */}
      <svg
        viewBox="0 0 220 110"
        aria-hidden="true"
        className="mb-10 w-40 select-none overflow-visible sm:w-56"
        style={{
          // Glow no root do SVG: em elementos internos a região de filtro é a
          // bbox do grupo +10% e corta o blur em linha reta.
          filter: `drop-shadow(0 0 ${8 + glow * 14}px rgba(194, 59, 52, ${glow}))`,
          transitionProperty: 'filter',
          transitionDuration: `${revealMs}ms`,
          transitionTimingFunction: MOTION.ease.decelerate,
        }}
      >
        {/* Lit interior of each lens, scaled by load progress. */}
        <defs>
          <radialGradient id="lens-core" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#e9e5da" />
            <stop offset="70%" stopColor="#e9e5da" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>
        </defs>
        <g>
          <path
            d="M100 38C78 20 50 14 32 18C16 22 10 40 16 56C22 72 48 80 70 78C86 76 96 66 100 56C102 50 102 44 100 38Z"
            fill="url(#lens-core)"
            style={{
              opacity: 0.08 + revealed * 0.92,
              transitionProperty: 'opacity',
              transitionDuration: `${revealMs}ms`,
              transitionTimingFunction: MOTION.ease.decelerate,
            }}
          />
          <path
            d="M120 38C142 20 170 14 188 18C204 22 210 40 204 56C198 72 172 80 150 78C134 76 124 66 120 56C118 50 118 44 120 38Z"
            fill="url(#lens-core)"
            style={{
              opacity: 0.08 + revealed * 0.92,
              transitionProperty: 'opacity',
              transitionDuration: `${revealMs}ms`,
              transitionTimingFunction: MOTION.ease.decelerate,
            }}
          />
        </g>
        {/* Signal rim on top of the fill — the "LED" edge. */}
        <g
          fill="none"
          stroke="#c23b34"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            opacity: rim,
            transitionProperty: 'opacity',
            transitionDuration: `${revealMs}ms`,
            transitionTimingFunction: MOTION.ease.decelerate,
          }}
        >
          <path d="M100 38C78 20 50 14 32 18C16 22 10 40 16 56C22 72 48 80 70 78C86 76 96 66 100 56C102 50 102 44 100 38Z" />
          <path d="M120 38C142 20 170 14 188 18C204 22 210 40 204 56C198 72 172 80 150 78C134 76 124 66 120 56C118 50 118 44 120 38Z" />
        </g>
      </svg>

      {/* Brand mark */}
      <div className="select-none text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Carregando</p>
        <p
          aria-hidden="true"
          className="mt-2 font-display text-4xl font-bold tracking-tight text-signal sm:text-6xl"
        >
          SPIDER-MAN
        </p>
        <p className="mt-1 font-display text-sm tracking-widest text-paper/40 sm:text-base">
          BRAND NEW DAY
        </p>
      </div>

      {/* Minimal readout — the reveal is the progress bar. */}
      <p className="mt-6 font-mono text-xs tabular-nums text-dim">{Math.round(progress)}%</p>
    </div>
  );
}
