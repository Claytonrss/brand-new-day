import { Suspense, useState } from 'react';

import { LenisProvider } from './components/LenisProvider';
import { PointerParallax } from './components/PointerParallax';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingTrigger } from './components/3d/LandingTrigger';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { CameraRig } from './components/3d/CameraRig';
import { Stage } from './components/3d/Stage';
import { Atmosphere } from './components/3d/Atmosphere';
import { LightRig } from './components/3d/lighting/LightRig';
import { BeatProvider } from './components/3d/beat/BeatProvider';
import { SECTION_SPANS } from './components/3d/beat/sections';
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
import { SpiderSense } from './components/ui/SpiderSense';
import { SenseAnchor } from './components/3d/SenseAnchor';
import { VelocityType } from './components/ui/VelocityType';
import { BeatStamp } from './components/ui/BeatStamp';
import { hasWebGL } from './design/webgl';

/**
 * App — scroll storytelling with a single fixed Canvas.
 *
 * Architecture:
 * - Canvas is fixed (never unmounts), contains all 3D content
 * - CameraRig drives camera through scroll-driven keyframes
 * - HTML sections define scroll height and contain overlays
 * - Chapter cards act as cinematic transitions between sections
 * - ProgressBar shows scroll progress on right edge
 *
 * Layout — heights come from `SECTION_SPANS` (beat/sections.ts, ADR-024),
 * which is also the source of `BEAT_TIMELINE`:
 * Opening (100vh) → Hero (140vh) → Chapter1 (70vh) → Evolution (210vh) →
 * Chapter2 (70vh) → Arsenal (210vh) → FullBody (130vh) → Colophon (140vh)
 * = 1070vh
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

      {/* Spider-sense halo — comic emanata around the head (IDEIA-3D-10) */}
      <SpiderSense />

      {/* Headline weight follows scroll velocity (IDEIA-PAG-01) */}
      <VelocityType />

      {/* Editorial field log on the left spine (IDEIA-AMB-08) */}
      <BeatStamp />

      {/* Cinematic loader — shows during GLB asset loading */}
      {!loaded && <CinematicLoader onLoaded={() => setLoaded(true)} />}

      {/* Developer metrics overlay — only with ?debug=1 */}
      <PerfHud />

      <main className="relative w-full overflow-x-hidden bg-ink text-paper">
        {/* 3D R3F Canvas Layer — fixed, never unmounts */}
        <ErrorBoundary fallback={null} onError={() => setWebglUnavailable(true)}>
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
                <SenseAnchor />
              </BeatProvider>
            </Suspense>
          </CanvasContainer>
        </ErrorBoundary>

        {/* Scrollable content overlay */}
        <div className="relative z-10">
          {/* Opening title card — Beat 0, 100vh, before the model appears */}
          <OpeningTitleCard />

          {/* Hero — 140vh (SECTION_SPANS) */}
          <section
            aria-label="Hero"
            className="relative"
            style={{ height: `${SECTION_SPANS.hero}dvh` }}
          >
            <HeroOverlay />
          </section>

          {/* Chapter 1: MUDANÇA — 100vh cinematic transition card */}
          <ChapterCard title="MUDANÇA" subtitle="Capítulo 2" position="before-evolution" />

          {/* Evolution — 210vh scroll-driven (SECTION_SPANS) */}
          <section
            id="evolution-section"
            aria-label="Evolution"
            className="relative"
            style={{ height: `${SECTION_SPANS.evolution}vh` }}
          >
            <EvolutionOverlay />
          </section>

          {/* Chapter 2: REVELAÇÃO — 100vh cinematic transition card */}
          <ChapterCard title="REVELAÇÃO" subtitle="Capítulo 4" position="before-fullbody" />

          {/* Arsenal — 210vh scroll-driven, lateral orbit axis crossing (SECTION_SPANS) */}
          <section
            id="arsenal-section"
            aria-label="Arsenal"
            className="relative"
            style={{ height: `${SECTION_SPANS.arsenal}vh` }}
          >
            <ArsenalOverlay />
          </section>

          {/* FullBody — 130vh, final reveal (SECTION_SPANS) */}
          <section
            id="fullbody-section"
            aria-label="FullBody"
            className="relative"
            style={{ height: `${SECTION_SPANS.fullBody}dvh` }}
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
