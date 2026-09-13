import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { BREAKPOINTS } from '@/design/breakpoints';
import { loaderCover } from '@/components/ui/loaderCover';
import { beatRuntime } from '../beat/beatState';
import { detectInitialTier } from './initialTier';
import { QualityContext, QUALITY_PROFILES, type QualityTier } from './qualityContext';
import { PerfProbe } from './PerfProbe';
import { QualityAdapter } from './QualityAdapter';

/** FPS thresholds for quality degradation (1-second window) */
const FPS_THRESHOLD_MEDIUM = 45;
const FPS_THRESHOLD_LOW = 30;

/** Minimum frames before degradation kicks in (avoid false positives) */
const WARMUP_FRAMES = 120;

/**
 * Scroll velocity (progress-units/s) below which a tier change is allowed to
 * apply — FALHA-09: a tier pop mid-motion reads as a visible glitch, so the
 * change waits for scroll idle (or the loader, which covers the viewport).
 */
const IDLE_VELOCITY = 0.02;

/**
 * PerformanceMonitor — adaptive quality controller.
 *
 * The initial tier is detected synchronously (`detectInitialTier`, FALHA-01):
 * the first painted frame already carries the device's real cost, so mobile
 * starts on `medium` — never on `high` (dpr 1.75 + MSAA 4×). The
 * `useMediaQuery` hooks stay for reactive changes (resize, reduced-motion).
 *
 * Measures FPS over a 1-second sliding window and degrades the quality
 * profile when performance drops. Aligns with docs/design/quality-matrix.md:
 *
 * - Desktop High: viewport ≥ 768px + FPS ≥ 45
 * - Mobile Good: viewport < 768px + FPS ≥ 45
 * - Mobile Low: FPS < 30 OR prefers-reduced-motion
 *
 * Tier changes only apply while the scroll is idle or the loader still covers
 * the viewport (FALHA-09) — a tier pop mid-motion reads as a glitch.
 *
 * Degradation order follows docs/design/performance-design.md:
 * 1. Post-processing (bloom/grain first)
 * 2. Resolution/shadow quality
 * 3. Particle density
 *
 * The profile is shared via QualityContext so Particles, EffectsStack,
 * LightRig and QualityAdapter can react without prop drilling.
 *
 * @see docs/design/quality-matrix.md
 * @see docs/design/performance-design.md
 * @see docs/memory/decisions.md — ADR-022
 */
export function PerformanceMonitor({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`);
  const prefersReducedMotion = usePrefersReducedMotion();

  const fpsRef = useRef(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const totalFramesRef = useRef(0);

  // Initial tier: synchronous matchMedia read (FALHA-01) — no first-frame
  // window where the hooks' default would put a phone on `high`.
  const [profile, setProfile] = useState(() => QUALITY_PROFILES[detectInitialTier()]);
  const currentTierRef = useRef<QualityTier>(profile.tier);

  const applyTier = useCallback(
    (tier: QualityTier, fps: number, kind: 'degrade' | 'force' | 'upgrade') => {
      currentTierRef.current = tier;
      setProfile(QUALITY_PROFILES[tier]);
      const log = kind === 'upgrade' ? console.info : console.warn;
      const label = kind === 'force' ? 'Forced' : kind === 'upgrade' ? 'Upgraded' : 'Degraded';
      log(`[PerformanceMonitor] ${label} ${tier} tier (FPS: ${fps.toFixed(1)})`);
    },
    [],
  );

  // Force low tier if prefers-reduced-motion
  useEffect(() => {
    if (prefersReducedMotion && currentTierRef.current !== 'low') {
      applyTier('low', fpsRef.current, 'force');
    }
  }, [prefersReducedMotion, applyTier]);

  // Keep the spec invariant across resizes: a mobile viewport is never `high`.
  useEffect(() => {
    if (isMobile && currentTierRef.current === 'high') {
      applyTier('medium', fpsRef.current, 'force');
    }
  }, [isMobile, applyTier]);

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

      // FALHA-09: defer tier changes while the page is in motion — the pop
      // is invisible once the scroll settles (or while the loader covers).
      const scrollIdle = Math.abs(beatRuntime.velocity) < IDLE_VELOCITY;
      if (!loaderCover.covering && !scrollIdle) return;

      const currentTier = currentTierRef.current;

      // Degrade: high → medium (FPS < 45)
      if (fps < FPS_THRESHOLD_MEDIUM && currentTier === 'high') {
        applyTier('medium', fps, 'degrade');
      }

      // Degrade: medium → low (FPS < 30)
      if (fps < FPS_THRESHOLD_LOW && currentTier === 'medium') {
        applyTier('low', fps, 'degrade');
      }

      // Upgrade: low → medium (FPS recovered > 45)
      if (fps > FPS_THRESHOLD_MEDIUM && currentTier === 'low') {
        applyTier('medium', fps, 'upgrade');
      }

      // Upgrade: medium → high (FPS recovered > 55, hysteresis)
      if (fps > 55 && currentTier === 'medium' && !isMobile) {
        applyTier('high', fps, 'upgrade');
      }
    }
  });

  return (
    <QualityContext.Provider value={profile}>
      <QualityAdapter profile={profile} />
      <PerfProbe tier={profile.tier} />
      {children}
    </QualityContext.Provider>
  );
}
