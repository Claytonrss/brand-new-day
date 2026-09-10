import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ReactNode, Suspense } from 'react';
import { Atmosphere } from './Atmosphere';
import { PerformanceMonitor } from './PerformanceMonitor';

interface CanvasContainerProps {
  children: ReactNode;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink text-paper">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-steel border-t-signal" />
        <span className="absolute font-mono text-[10px] uppercase tracking-widest text-dim">
          3D
        </span>
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-dim">
        Carregando traje...
      </p>
    </div>
  );
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
      <Suspense fallback={<LoadingFallback />}>
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
            {/* Atmospheric depth — GPU motes with parallax (single draw call) */}
            <Atmosphere />
            {/* Post-processing lives inside BeatProvider (App) — it consumes beat state */}
          </PerformanceMonitor>
          {/* Environment loads async — own Suspense prevents blocking canvas */}
          <Suspense fallback={null}>
            <Environment preset="city" background={false} />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  );
}
