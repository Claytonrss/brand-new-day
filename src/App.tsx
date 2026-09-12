import { Component, Suspense, useState, type ReactNode } from 'react';

import { LenisProvider } from './components/LenisProvider';
import { PointerParallax } from './components/PointerParallax';
import { LandingTrigger } from './components/3d/LandingTrigger';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { CameraRig } from './components/3d/CameraRig';
import { Stage } from './components/3d/Stage';
import { Atmosphere } from './components/3d/Atmosphere';
import { LightRig } from './components/3d/lighting/LightRig';
import { BeatProvider } from './components/3d/beat/BeatProvider';
import { PerfHud } from './components/ui/PerfHud';
import { EffectsStack } from './components/3d/EffectsStack';
import { WebShoot } from './components/3d/interaction/WebShoot';
import { WebShootHint } from './components/3d/interaction/WebShootHint';
import { HeroOverlay } from './components/ui/HeroOverlay';
import { EvolutionOverlay } from './components/ui/EvolutionOverlay';
import { ArsenalOverlay } from './components/ui/ArsenalOverlay';
import { FullBodyOverlay } from './components/ui/FullBodyOverlay';
import { CinematicLoader } from './components/ui/CinematicLoader';
import { ChapterCard } from './components/ui/ChapterCard';
import { OpeningTitleCard } from './components/ui/OpeningTitleCard';
import { ColophonSection } from './components/ui/ColophonSection';
import { GyroPrompt } from './components/ui/GyroPrompt';
import { StaticFallback } from './components/ui/StaticFallback';
import { ProgressBar } from './components/ui/ProgressBar';
import { hasWebGL } from './design/webgl';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
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
    this.props.onError?.();
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
 * - Chapter cards (100vh each) act as cinematic transitions between sections
 * - ProgressBar shows scroll progress on right edge
 *
 * Layout: Opening (100vh) → Hero (100vh) → Chapter1 (100vh) → Evolution
 *         (150vh) → Chapter2 (100vh) → Arsenal (150vh) → FullBody (100vh) →
 *         Colophon (100vh) = 900vh
 *
 * @see docs/specs/evolution-chest-symbol.md
 * @see docs/design/storyboard.md
 */
export function App() {
  const [loaded, setLoaded] = useState(false);
  // Proactive fallback: no WebGL means the poster version, not a broken page.
  const [webglUnavailable, setWebglUnavailable] = useState(() => !hasWebGL());

  if (webglUnavailable) return <StaticFallback />;

  return (
    <LenisProvider>
      {/* Desktop pointer parallax — publishes CSS vars for the .parallax-* layers */}
      <PointerParallax />

      {/* Arrival landing — fires once the Hero enters the viewport (Wave 4a) */}
      <LandingTrigger />

      {/* Mobile gyro permission chip (iOS) — renders only when needed */}
      <GyroPrompt />

      {/* Scroll progress indicator */}
      <ProgressBar />

      {/* Cinematic loader — shows during GLB asset loading */}
      {!loaded && <CinematicLoader onLoaded={() => setLoaded(true)} />}

      {/* Developer metrics overlay — only with ?debug=1 */}
      <PerfHud />

    <main className="relative w-full overflow-x-hidden bg-ink text-paper">
      {/* 3D R3F Canvas Layer — fixed, never unmounts */}
      <ErrorBoundary
        fallback={null}
        onError={() => setWebglUnavailable(true)}
      >
        <CanvasContainer>
          <Suspense fallback={null}>
            <BeatProvider>
              <CameraRig />
              <Stage />
              <Atmosphere />
              <LightRig />
              <EffectsStack />
              <WebShoot />
              <WebShootHint />
            </BeatProvider>
          </Suspense>
        </CanvasContainer>
      </ErrorBoundary>

      {/* Scrollable content overlay */}
      <div className="relative z-10">
        {/* Opening title card — Beat 0, 100vh, before the model appears */}
        <OpeningTitleCard />

        {/* Hero — 100vh */}
        <section className="relative h-dvh" aria-label="Hero">
          <HeroOverlay />
        </section>

        {/* Chapter 1: MUDANÇA — 100vh cinematic transition card */}
        <ChapterCard
          title="MUDANÇA"
          subtitle="Capítulo 2"
          position="before-evolution"
        />

        {/* Evolution — 150vh scroll-driven */}
        <section
          id="evolution-section"
          className="relative h-[150vh]"
          aria-label="Evolution"
        >
          <EvolutionOverlay />
        </section>

        {/* Chapter 2: REVELAÇÃO — 100vh cinematic transition card */}
        <ChapterCard
          title="REVELAÇÃO"
          subtitle="Capítulo 4"
          position="before-fullbody"
        />

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

        {/* Colophon — 100vh, editorial outro with authorship + CTA */}
        <ColophonSection />
      </div>
    </main>
    </LenisProvider>
  );
}
