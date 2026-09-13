import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, type ReactNode } from 'react';
import { PerformanceMonitor } from '@/components/3d/perf/PerformanceMonitor';

interface CanvasContainerProps {
  children: ReactNode;
}

/**
 * CanvasContainer — premium R3F canvas with cinematic pipeline.
 *
 * Canvas is fixed (never unmounts); only the camera moves via CameraRig.
 *
 * Pipeline:
 * - dpr [1,2] adaptive for retina sharpness without fixed 2x cost
 * - ACES Filmic tone mapping (exposure 1.15) for cinematic dynamic range
 * - Antialias true + highp precision for sharp edges
 * - Shadows enabled for grounded lighting
 * - Environment map (city preset) for PBR metallic reflections
 * - Post-processing: Bloom → Vignette → Noise (EffectsStack)
 * - Atmospheric particles (Particles) for cinematic depth
 * - Adaptive quality (PerformanceMonitor) for consistent FPS
 *
 * @see docs/design/design-bible.md
 * @see docs/design/quality-matrix.md
 */
export function CanvasContainer({ children }: CanvasContainerProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-ink">
      {/* Fallback null: the CinematicLoader overlays the viewport while the
          GLB loads — a spinner here would never be visible. */}
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
          }}
          shadows
          camera={{ position: [0, 0.45, 18], fov: 35, near: 0.1, far: 100 }}
          style={{ position: 'fixed', inset: 0, background: '#0a0a0c' }}
          onCreated={(state) => {
            const canvas = state.gl.domElement;
            canvas.addEventListener('webglcontextlost', (event) => {
              event.preventDefault();
              console.warn('WebGL context lost. Restoring context...');
            });
          }}
        >
          {/* PerformanceMonitor wraps children to provide QualityContext */}
          <PerformanceMonitor>
            {children}
            {/* Post-processing lives inside BeatProvider (App) — it consumes beat state */}
          </PerformanceMonitor>
          {/* Environment loads async — own Suspense prevents blocking canvas.
              Self-hosted (FALHA-08): the loader must never depend on a CDN.
              Potsdamer Platz, Poly Haven, CC0 — see ADR-021. */}
          <Suspense fallback={null}>
            <Environment files="/env/city_1k.hdr" background={false} />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  );
}
