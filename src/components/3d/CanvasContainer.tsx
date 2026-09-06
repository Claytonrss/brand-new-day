import { Canvas } from '@react-three/fiber';
import { ReactNode, Suspense, useEffect, useRef } from 'react';

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

export function CanvasContainer({ children }: CanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Restoring context...');
    };

    container.addEventListener('webglcontextlost', handleContextLost, false);
    return () => {
      container.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 h-dvh w-full overflow-hidden bg-ink">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          dpr={1}
          camera={{ near: 0.1, far: 50 }}
          gl={{
            antialias: false,
            precision: 'mediump',
            powerPreference: 'default',
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false,
          }}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
