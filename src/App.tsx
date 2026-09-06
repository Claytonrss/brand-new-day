import { Component, type ReactNode } from 'react';

import { CanvasContainer } from './components/3d/CanvasContainer';
import { CameraRig } from './components/3d/CameraRig';
import { HeroScene } from './components/3d/HeroScene';
import { EvolutionScene } from './components/3d/EvolutionScene';
import { HeroOverlay } from './components/ui/HeroOverlay';
import { EvolutionOverlay } from './components/ui/EvolutionOverlay';

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
 * - Hero: 100vh, Evolution: 150vh
 *
 * @see docs/specs/evolution-chest-symbol.md
 * @see docs/design/storyboard.md
 */
export function App() {
  return (
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
          <CameraRig />
          <HeroScene />
          <EvolutionScene />
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
      </div>
    </main>
  );
}
