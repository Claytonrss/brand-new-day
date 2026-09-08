import { useProgress } from '@react-three/drei';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface CinematicLoaderProps {
  onLoaded: () => void;
}

/**
 * CinematicLoader — premium full-screen loading overlay.
 *
 * Tracks THREE.js asset loading via drei's useProgress (module-level zustand
 * store backed by DefaultLoadingManager). Fades out after all assets finish
 * loading, then calls onLoaded to unmount itself.
 *
 * Respects prefers-reduced-motion: skips transitions when active.
 *
 * @see docs/design/design-bible.md
 */
export function CinematicLoader({ onLoaded }: CinematicLoaderProps) {
  const { progress, active } = useProgress();
  const [fadeOut, setFadeOut] = useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const hasStartedLoading = useRef(false);

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
      {/* Brand mark */}
      <div className="mb-10 select-none text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          Carregando
        </p>
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

      {/* Progress bar */}
      <div className="w-52 overflow-hidden rounded-full bg-concrete sm:w-64">
        <div
          className="h-1 rounded-full bg-signal"
          style={{
            width: `${progress}%`,
            transitionProperty: 'width',
            transitionDuration: reduceMotion
              ? '0ms'
              : `${MOTION.duration.fast}ms`,
            transitionTimingFunction: MOTION.ease.decelerate,
          }}
        />
      </div>

      {/* Progress text */}
      <p className="mt-4 font-mono text-xs text-dim">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
