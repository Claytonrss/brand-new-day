import { CanvasContainer } from './components/3d/CanvasContainer';
import { HeroScene } from './components/3d/HeroScene';
import { HeroOverlay } from './components/ui/HeroOverlay';

export function App() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-ink text-paper">
      {/* 3D R3F Canvas Layer */}
      <CanvasContainer>
        <HeroScene />
      </CanvasContainer>

      {/* Cinematic Hero UI Overlay */}
      <HeroOverlay />
    </main>
  );
}
