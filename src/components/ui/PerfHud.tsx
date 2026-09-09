import { useEffect, useState } from 'react';
import type { PerfSnapshot } from '../3d/PerformanceMonitor';

const POLL_MS = 500;

/**
 * PerfHud — developer overlay with real per-frame metrics.
 *
 * Renders only with `?debug=1`. Reads `window.__perf`, published by
 * `PerfProbe` inside the canvas.
 *
 * @see docs/specs/headroom-lighting.md §8
 */
export function PerfHud() {
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1',
  );
  const [stats, setStats] = useState<PerfSnapshot | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      const snapshot = window.__perf;
      setStats(snapshot ? { ...snapshot } : null);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || !stats) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-50 rounded-sm border border-steel/60 bg-ink/80 px-3 py-2 font-mono text-[10px] leading-relaxed text-dim"
      data-testid="perf-hud"
    >
      <div className="text-paper">
        {stats.fps.toFixed(0)} fps · {stats.ms.toFixed(1)} ms
      </div>
      <div>draw calls {stats.calls}</div>
      <div>tris {(stats.triangles / 1000).toFixed(0)}k</div>
      <div>
        programs {stats.programs} · geo {stats.geometries} · tex {stats.textures}
      </div>
    </div>
  );
}
