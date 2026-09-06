import { useThree } from '@react-three/fiber';
import { SpiderManModel } from './SpiderManModel';

export function HeroScene() {
  const { viewport } = useThree();

  const isMobile = viewport.width < 5.5;
  const modelScale = isMobile ? 0.9 : 1.1;
  const modelPosition: [number, number, number] = isMobile ? [0, -1.2, 0] : [1.0, -1.2, 0];

  return (
    <>
      <color attach="background" args={['#0a0a0c']} />

      {/* Bright ambient light to ensure visibility */}
      <ambientLight color="#ffffff" intensity={2.2} />

      {/* Main Front Key Light */}
      <directionalLight position={[2, 4, 5]} color="#ffffff" intensity={4.0} />

      {/* Cool Steel Fill Light */}
      <directionalLight position={[-4, 2, 3]} color="#2c3b4c" intensity={3.0} />

      {/* Dramatic Warm Rim Light */}
      <directionalLight position={[-4, 5, -4]} color="#7a1f24" intensity={8.0} />

      {/* Red Eye Accent Light */}
      <pointLight position={[0, 2, 2.5]} color="#c23b34" intensity={5.0} distance={8} />

      <SpiderManModel
        scale={modelScale}
        position={modelPosition}
        rotation={[0, isMobile ? 0 : -0.25, 0]}
        pointerTracking
      />
    </>
  );
}
