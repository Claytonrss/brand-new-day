import { useEffect, useState } from 'react';
import type { PerfSnapshot } from '@/components/3d/perf/PerfProbe';
import type { InteractionDebugState } from '@/components/3d/interaction/useInteraction';
import { isDebugMode } from '@/lib/debugFlag';

const POLL_MS = 500;

const signedDeg = (value: number): string =>
  `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(0)}`;
const signedDeg1 = (value: number): string =>
  `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(1)}`;

/**
 * PerfHud — developer overlay with real per-frame metrics.
 *
 * Renders only with `?debug`. Reads `window.__perf`, published by
 * `PerfProbe`, and `window.__interaction`, published by `useInteraction` —
 * including the whole gyro chain (state, rate, raw → filtered → applied)
 * for field verification on real devices.
 *
 * @see docs/specs/headroom-lighting.md §8
 * @see docs/specs/mobile-gyro-sensor-polish.md §7.7
 */
export function PerfHud() {
  const [enabled] = useState(isDebugMode);
  const [stats, setStats] = useState<PerfSnapshot | null>(null);
  const [interaction, setInteraction] = useState<InteractionDebugState | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      const snapshot = window.__perf;
      setStats(snapshot ? { ...snapshot } : null);
      setInteraction(window.__interaction ?? null);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || !stats) return null;

  const gyro = interaction?.gyro;

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-50 rounded-sm border border-steel/60 bg-ink/80 px-3 py-2 font-mono text-[10px] leading-relaxed text-dim"
      data-testid="perf-hud"
    >
      <div className="text-paper">
        {stats.fps.toFixed(0)} fps · {stats.ms.toFixed(1)} ms
      </div>
      <div>
        tier {stats.tier} · draw calls {stats.calls}
      </div>
      <div>tris {(stats.triangles / 1000).toFixed(0)}k</div>
      <div>
        programs {stats.programs} · geo {stats.geometries} · tex {stats.textures}
      </div>
      {gyro && (
        <div>
          gyro {gyro.state} · {gyro.eventsHz} Hz · γ {signedDeg(gyro.rawGamma)}°→
          {signedDeg1(gyro.fGamma)}° · yaw {(interaction?.yaw ?? 0).toFixed(3)}
        </div>
      )}
    </div>
  );
}
