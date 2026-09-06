import { Component, type ReactNode } from 'react';

import { CanvasContainer } from './components/3d/CanvasContainer';
import { HeroScene } from './components/3d/HeroScene';
import { HeroOverlay } from './components/ui/HeroOverlay';

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

export function App() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-ink text-paper">
      {/* 3D R3F Canvas Layer */}
      <ErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-ink">
            <p className="font-mono text-sm text-dim">3D unavailable</p>
          </div>
        }
      >
        <CanvasContainer>
          <HeroScene />
        </CanvasContainer>
      </ErrorBoundary>

      {/* Cinematic Hero UI Overlay */}
      <HeroOverlay />
    </main>
  );
}
