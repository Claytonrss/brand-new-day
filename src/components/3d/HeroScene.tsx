import { useThree } from '@react-three/fiber';
import { SpiderManModel } from './SpiderManModel';

export function HeroScene() {
  const { viewport } = useThree();

  // Responsive scale & placement based on viewport aspect ratio
  const isMobile = viewport.width < 5.5;
  const modelScale = isMobile ? 0.95 : 1.15;
  const modelPosition: [number, number, number] = isMobile ? [0, -3.8, 0] : [1.2, -4.5, 0];

  return (
    <>
      {/* Background color matching design token --color-ink */}
      <color attach="background" args={['#0a0a0c']} />

      {/* Atmospheric lighting setup — Design Bible */}
      {/* 1. Ambient Light for shadow detail */}
      <ambientLight color="#141417" intensity={1.2} />

      {/* 2. Key Light — Cool steel directional light */}
      <directionalLight
        position={[4, 6, 4]}
        color="#2c3b4c"
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* 3. Rim Light — Dramatic warm oxide light sculpting silhouette */}
      <directionalLight position={[-5, 4, -4]} color="#7a1f24" intensity={6.5} />

      {/* 4. Subtle Eye/Front Accent Light — Signal red hint */}
      <pointLight position={[0, 2, 3]} color="#c23b34" intensity={1.5} distance={6} />

      {/* 3D Spider-Man Character */}
      <SpiderManModel
        scale={modelScale}
        position={modelPosition}
        rotation={[0, isMobile ? 0 : -0.25, 0]}
        pointerTracking
      />
    </>
  );
}
