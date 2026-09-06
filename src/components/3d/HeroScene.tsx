import { useThree } from '@react-three/fiber';
import { HeroCamera } from './HeroCamera';
import { heroModelPosition, TARGET_HEAD_Y } from './heroModelLayout';
import { SpiderManModel } from './SpiderManModel';
import { COLORS } from '../../design/tokens';
import { BREAKPOINTS } from '../../design/breakpoints';

export function HeroScene() {
  const { size } = useThree();

  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const modelScale = isMobile ? 0.9 : 1.1;
  const targetHeadY = isMobile ? TARGET_HEAD_Y.mobile : TARGET_HEAD_Y.desktop;
  const modelPosition = heroModelPosition(modelScale, targetHeadY, isMobile ? 0 : 1.0);

  return (
    <>
      <HeroCamera />

      <color attach="background" args={[COLORS.ink]} />

      {/* Bright ambient light to ensure visibility */}
      <ambientLight color={COLORS.paper} intensity={2.2} />

      {/* Main Front Key Light */}
      <directionalLight position={[2, 4, 5]} color={COLORS.paper} intensity={4.0} />

      {/* Cool Steel Fill Light */}
      <directionalLight position={[-4, 2, 3]} color={COLORS.steel} intensity={3.0} />

      {/* Dramatic Warm Rim Light */}
      <directionalLight position={[-4, 5, -4]} color={COLORS.oxide} intensity={8.0} />

      {/* Red Eye Accent Light */}
      <pointLight position={[0, 2, 2.5]} color={COLORS.signal} intensity={5.0} distance={8} />

      <SpiderManModel
        scale={modelScale}
        position={modelPosition}
        rotation={[0, isMobile ? 0 : -0.25, 0]}
        pointerTracking
      />
    </>
  );
}