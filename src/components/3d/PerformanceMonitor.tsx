import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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

/** Per-frame metrics exposed for the debug HUD and automated budget tests. */
export interface PerfSnapshot {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  programs: number;
  geometries: number;
  textures: number;
}

declare global {
  interface Window {
    __perf?: PerfSnapshot;
  }
}

/** Smoothing factor for the FPS readout (raw 1/delta is too jittery). */
const FPS_SMOOTHING = 0.1;

/**
 * Publishes `window.__perf` every frame: FPS, ms/frame, draw calls, triangles.
 *
 * `gl.info` is read with `autoReset` disabled, so the numbers belong to the
 * previously rendered frame — which is exactly what a budget assertion wants.
 *
 * @see docs/specs/headroom-lighting.md §8
 */
function PerfProbe() {
  const gl = useThree((state) => state.gl);
  const snapshot = useRef<PerfSnapshot>({
    fps: 0,
    ms: 0,
    calls: 0,
    triangles: 0,
    programs: 0,
    geometries: 0,
    textures: 0,
  });

  useEffect(() => {
    gl.info.autoReset = false;
    window.__perf = snapshot.current;
    return () => {
      gl.info.autoReset = true;
      delete window.__perf;
    };
  }, [gl]);

  useFrame((_, delta) => {
    const stats = snapshot.current;
    const instant = 1 / Math.max(delta, 1e-4);

    stats.fps = stats.fps === 0 ? instant : stats.fps + (instant - stats.fps) * FPS_SMOOTHING;
    stats.ms = delta * 1000;
    stats.calls = gl.info.render.calls;
    stats.triangles = gl.info.render.triangles;
    stats.programs = gl.info.programs?.length ?? 0;
    stats.geometries = gl.info.memory.geometries;
    stats.textures = gl.info.memory.textures;

    gl.info.reset();
  });

  return null;
}

/**
 * Applies the profile to the renderer: device pixel ratio and shadow maps.
 *
 * Lives inside the Canvas because `dpr` is a renderer concern, while the
 * profile itself is produced by `PerformanceMonitor` (also inside the Canvas).
 */
function QualityAdapter({ profile }: { profile: QualityProfile }) {
  const setDpr = useThree((state) => state.setDpr);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    setDpr(profile.dpr);
  }, [profile.dpr, setDpr]);

  useEffect(() => {
    gl.shadowMap.enabled = profile.shadows;
    gl.shadowMap.needsUpdate = true;
    // Shadow defines are compiled into materials — invalidate them once.
    scene.traverse((object) => {
      const mesh = object as { material?: unknown };
      const material = mesh.material;
      if (!material) return;
      const materials = Array.isArray(material) ? material : [material];
      for (const entry of materials) {
        (entry as { needsUpdate?: boolean }).needsUpdate = true;
      }
    });
  }, [gl, profile.shadows, scene]);

  return null;
}

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
 * LightRig and QualityAdapter can react without prop drilling.
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

  // Initial tier detection: reduced-motion → low, mobile → medium, desktop → high
  const getInitialTier = (): QualityTier => {
    if (prefersReducedMotion) return 'low';
    if (isMobile) return 'medium';
    return 'high';
  };

  // React state for context value (only updates on tier change)
  const [profile, setProfile] = useState<QualityProfile>(
    QUALITY_PROFILES[getInitialTier()]
  );

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
      <QualityAdapter profile={profile} />
      <PerfProbe />
      {children}
    </QualityContext.Provider>
  );
}
