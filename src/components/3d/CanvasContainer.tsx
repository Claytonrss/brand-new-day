import { Canvas } from '@react-three/fiber';
import { ReactNode, Suspense } from 'react';

interface CanvasContainerProps {
  children: ReactNode;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink text-paper">
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

export function CanvasContainer({ children }: CanvasContainerProps) {
  return (
    <div className="absolute inset-0 h-full w-full bg-ink">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 1.2, 7.5], fov: 40, near: 0.1, far: 100 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
