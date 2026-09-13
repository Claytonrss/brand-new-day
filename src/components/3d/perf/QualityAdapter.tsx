import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { QualityProfile } from './qualityContext';
import { beatRuntime } from '../beat/beatState';
import { INTERACTION } from '../interaction/interactionStore';
import { createShadowThrottleState, shouldRefreshShadow } from './shadowThrottle';

/**
 * Applies the profile to the renderer: device pixel ratio and shadow maps.
 *
 * Lives inside the Canvas because `dpr` is a renderer concern, while the
 * profile itself is produced by `PerformanceMonitor` (also inside the Canvas).
 *
 * FALHA-04: on the medium tier the shadow pass stops running per frame —
 * `autoUpdate` goes off and the map refreshes on demand (`shadowThrottle.ts`):
 * a 10 Hz heartbeat plus immediate refreshes on beat change, drag/gyro
 * movement, drag release and fling end. `high` keeps per-frame updates; `low`
 * has shadows disabled entirely.
 */
export function QualityAdapter({ profile }: { profile: QualityProfile }) {
  const setDpr = useThree((state) => state.setDpr);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const throttle = useRef(createShadowThrottleState(beatRuntime.beat));

  useEffect(() => {
    setDpr(profile.dpr);
  }, [profile.dpr, setDpr]);

  useEffect(() => {
    gl.shadowMap.enabled = profile.shadows;
    gl.shadowMap.autoUpdate = profile.shadows && profile.tier === 'high';
    // A tier switch must never leave a stale map behind.
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
  }, [gl, profile.shadows, profile.tier, scene]);

  useFrame((_, delta) => {
    if (!gl.shadowMap.enabled || gl.shadowMap.autoUpdate) return;
    const refresh = shouldRefreshShadow(
      throttle.current,
      {
        beat: beatRuntime.beat,
        dragging: INTERACTION.dragging,
        yaw: INTERACTION.yaw,
        pitch: INTERACTION.pitch,
        velocity: beatRuntime.velocity,
      },
      delta,
    );
    if (refresh) gl.shadowMap.needsUpdate = true;
  });

  return null;
}
