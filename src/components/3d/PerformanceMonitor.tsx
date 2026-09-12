import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import { loaderCover } from '../ui/loaderCover';
import { beatRuntime } from './beat/beatState';
import { detectInitialTier } from './initialTier';
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
 * Scroll velocity (progress-units/s) below which a tier change is allowed to
 * apply — FALHA-09: a tier pop mid-motion reads as a visible glitch, so the
 * change waits for scroll idle (or the loader, which covers the viewport).
 */
const IDLE_VELOCITY = 0.02;

/** Per-frame metrics exposed for the debug HUD and automated budget tests. */
export interface PerfSnapshot {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  programs: number;
  geometries: number;
  textures: number;
  /** Active quality tier — Wave 0/1 device verification reads this. */
  tier: QualityTier;
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
function PerfProbe({ tier }: { tier: QualityTier }) {
  const gl = useThree((state) => state.gl);
  const snapshot = useRef<PerfSnapshot>({
    fps: 0,
    ms: 0,
    calls: 0,
    triangles: 0,
    programs: 0,
    geometries: 0,
    textures: 0,
    tier: 'high',
  });
  const tierRef = useRef(tier);
  tierRef.current = tier;

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
    stats.tier = tierRef.current;

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
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const fpsRef = useRef(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const totalFramesRef = useRef(0);

  // Initial tier: synchronous matchMedia read (FALHA-01) — no first-frame
  // window where the hooks' default would put a phone on `high`.
  const [profile, setProfile] = useState<QualityProfile>(() =>
    QUALITY_PROFILES[detectInitialTier()],
  );
  const currentTierRef = useRef<QualityTier>(profile.tier);

  const applyTier = (tier: QualityTier, fps: number, kind: 'degrade' | 'force' | 'upgrade') => {
    currentTierRef.current = tier;
    setProfile(QUALITY_PROFILES[tier]);
    const log = kind === 'upgrade' ? console.info : console.warn;
    const label = kind === 'force' ? 'Forced' : kind === 'upgrade' ? 'Upgraded' : 'Degraded';
    log(`[PerformanceMonitor] ${label} ${tier} tier (FPS: ${fps.toFixed(1)})`);
  };

  // Force low tier if prefers-reduced-motion
  useEffect(() => {
    if (prefersReducedMotion && currentTierRef.current !== 'low') {
      applyTier('low', fpsRef.current, 'force');
    }
  }, [prefersReducedMotion]);

  // Keep the spec invariant across resizes: a mobile viewport is never `high`.
  useEffect(() => {
    if (isMobile && currentTierRef.current === 'high') {
      applyTier('medium', fpsRef.current, 'force');
    }
  }, [isMobile]);

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
