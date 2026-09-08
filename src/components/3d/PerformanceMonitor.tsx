import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import {
  QualityContext,
  QUALITY_PROFILES,
  type QualityProfile,
  type QualityTier,
} from './qualityContext';

/** FPS thresholds for quality degradation (1-second window) */
const FPS_THRESHOLD_MEDIUM = 45;
const FPS_THRESHOLD_LOW = 30;

/** Minimum frames before degradation kicks in (avoid false positives) */
const WARMUP_FRAMES = 120;

/**
 * PerformanceMonitor — adaptive quality controller.
 *
 * Measures FPS over a 1-second sliding window and degrades the quality
 * profile when performance drops. Aligns with docs/design/quality-matrix.md:
 *
 * - Desktop High: viewport ≥ 768px + FPS ≥ 45
 * - Mobile Good: viewport < 768px + FPS ≥ 45
 * - Mobile Low: FPS < 30 OR prefers-reduced-motion
 *
 * Degradation order follows docs/design/performance-design.md:
 * 1. Post-processing (bloom/grain first)
 * 2. Resolution/shadow quality
 * 3. Particle density
 *
 * The profile is shared via QualityContext so Particles, EffectsStack,
 * and CanvasContainer can react without prop drilling.
 *
 * @see docs/design/quality-matrix.md
 * @see docs/design/performance-design.md
 */
export function PerformanceMonitor({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const fpsRef = useRef(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const totalFramesRef = useRef(0);
  const currentTierRef = useRef<QualityTier>('high');

  // React state for context value (only updates on tier change)
  const [profile, setProfile] = useState<QualityProfile>(() => {
    if (prefersReducedMotion) return QUALITY_PROFILES.low;
    return QUALITY_PROFILES.high;
  });

  // Force low tier if prefers-reduced-motion
  useEffect(() => {
    if (prefersReducedMotion && currentTierRef.current !== 'low') {
      currentTierRef.current = 'low';
      setProfile(QUALITY_PROFILES.low);
      console.info('[PerformanceMonitor] prefers-reduced-motion → low tier');
    }
  }, [prefersReducedMotion]);

  // FPS measurement in useFrame (runs every frame)
  useFrame(() => {
    frameCountRef.current++;
    totalFramesRef.current++;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    // Update FPS every second
    if (elapsed >= 1000) {
      const fps = (frameCountRef.current * 1000) / elapsed;
      fpsRef.current = fps;
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Skip degradation logic during warmup (let GPU stabilize)
      if (totalFramesRef.current < WARMUP_FRAMES) return;

      // Skip if prefers-reduced-motion (already locked to low)
      if (prefersReducedMotion) return;

      const currentTier = currentTierRef.current;

      // Degrade: high → medium (FPS < 45)
      if (fps < FPS_THRESHOLD_MEDIUM && currentTier === 'high') {
        currentTierRef.current = 'medium';
        setProfile(QUALITY_PROFILES.medium);
        console.warn(`[PerformanceMonitor] Degraded to medium (FPS: ${fps.toFixed(1)})`);
      }

      // Degrade: medium → low (FPS < 30)
      if (fps < FPS_THRESHOLD_LOW && currentTier === 'medium') {
        currentTierRef.current = 'low';
        setProfile(QUALITY_PROFILES.low);
        console.warn(`[PerformanceMonitor] Degraded to low (FPS: ${fps.toFixed(1)})`);
      }

      // Upgrade: low → medium (FPS recovered > 45)
      if (fps > FPS_THRESHOLD_MEDIUM && currentTier === 'low') {
        currentTierRef.current = 'medium';
        setProfile(QUALITY_PROFILES.medium);
        console.info(`[PerformanceMonitor] Upgraded to medium (FPS: ${fps.toFixed(1)})`);
      }

      // Upgrade: medium → high (FPS recovered > 55, hysteresis)
      if (fps > 55 && currentTier === 'medium' && !isMobile) {
        currentTierRef.current = 'high';
        setProfile(QUALITY_PROFILES.high);
        console.info(`[PerformanceMonitor] Upgraded to high (FPS: ${fps.toFixed(1)})`);
      }
    }
  });

  return (
    <QualityContext.Provider value={profile}>
      {children}
    </QualityContext.Provider>
  );
}
