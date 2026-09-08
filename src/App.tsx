import { Component, Suspense, useState, type ReactNode } from 'react';

import { LenisProvider } from './components/LenisProvider';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { CameraRig } from './components/3d/CameraRig';
import { HeroScene } from './components/3d/HeroScene';
import { EvolutionScene } from './components/3d/EvolutionScene';
import { ArsenalScene } from './components/3d/ArsenalScene';
import { FullBodyScene } from './components/3d/FullBodyScene';
import { HeroOverlay } from './components/ui/HeroOverlay';
import { EvolutionOverlay } from './components/ui/EvolutionOverlay';
import { ArsenalOverlay } from './components/ui/ArsenalOverlay';
import { FullBodyOverlay } from './components/ui/FullBodyOverlay';
import { CinematicLoader } from './components/ui/CinematicLoader';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * App — scroll storytelling with a single fixed Canvas.
 *
 * Architecture:
 * - Canvas is fixed (never unmounts), contains all 3D content
 * - CameraRig drives camera through scroll-driven keyframes
 * - HTML sections define scroll height and contain overlays
 * - Hero: 100vh, Evolution: 150vh, Arsenal: 150vh, FullBody: 100vh
 *
 * @see docs/specs/evolution-chest-symbol.md
 * @see docs/design/storyboard.md
 */
export function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <LenisProvider>
      {/* Cinematic loader — shows during GLB asset loading */}
      {!loaded && <CinematicLoader onLoaded={() => setLoaded(true)} />}

    <main className="relative w-full overflow-x-hidden bg-ink text-paper">
      {/* 3D R3F Canvas Layer — fixed, never unmounts */}
      <ErrorBoundary
        fallback={
          <div className="fixed inset-0 z-0 flex items-center justify-center bg-ink">
            <p className="font-mono text-sm text-dim">3D unavailable</p>
          </div>
        }
      >
        <CanvasContainer>
          <Suspense fallback={null}>
            <CameraRig />
            <HeroScene />
            <EvolutionScene />
            <ArsenalScene />
            <FullBodyScene />
          </Suspense>
        </CanvasContainer>
      </ErrorBoundary>

      {/* Scrollable content overlay */}
      <div className="relative z-10">
        {/* Hero — 100vh */}
        <section className="relative h-dvh" aria-label="Hero">
          <HeroOverlay />
        </section>

        {/* Evolution — 150vh scroll-driven */}
        <section
          id="evolution-section"
          className="relative h-[150vh]"
          aria-label="Evolution"
        >
          <EvolutionOverlay />
        </section>

        {/* Arsenal — 150vh scroll-driven, lateral orbit axis crossing */}
        <section
          id="arsenal-section"
          className="relative h-[150vh]"
          aria-label="Arsenal"
        >
          <ArsenalOverlay />
        </section>

        {/* FullBody — 100vh, final reveal */}
        <section
          id="fullbody-section"
          className="relative h-dvh"
          aria-label="FullBody"
        >
          <FullBodyOverlay />
        </section>
      </div>
    </main>
    </LenisProvider>
  );
}
