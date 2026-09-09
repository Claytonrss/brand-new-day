import { useEffect, useState } from 'react';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * ProgressBar — fixed scroll progress indicator.
 *
 * Thin 1px vertical bar on the right edge of the viewport.
 * Fills with signal color (#c23b34) based on total page scroll progress.
 * Smooth micro-transition (150ms) for fluid feel.
 *
 * Accessible: role="progressbar" with ARIA value attributes.
 * Respects `prefers-reduced-motion` — disables transition duration.
 *
 * @see docs/design/design-bible.md
 */
export function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const transitionDuration = prefersReducedMotion ? 0 : MOTION.duration.micro;

  return (
    <div
      className="fixed right-0 top-0 z-50 h-screen w-1 bg-concrete/20"
      aria-hidden="true"
    >
      <div
        className="bg-signal"
        role="progressbar"
        aria-label={`Progresso: ${Math.round(progress)}%`}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          height: `${progress}%`,
          transitionProperty: 'height',
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: MOTION.ease.decelerate,
        }}
      />
    </div>
  );
}
