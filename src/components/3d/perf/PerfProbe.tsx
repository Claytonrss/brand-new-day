import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { QualityTier } from './qualityContext';

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
export function PerfProbe({ tier }: { tier: QualityTier }) {
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
