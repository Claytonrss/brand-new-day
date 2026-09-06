import { useThree } from '@react-three/fiber';
import { heroModelPosition, TARGET_HEAD_Y } from './heroModelLayout';
import { SpiderManModel } from './SpiderManModel';
import { COLORS } from '../../design/tokens';
import { BREAKPOINTS } from '../../design/breakpoints';

/**
 * Hero scene — base lighting rig + shared model.
 * Camera is handled by CameraRig (scroll-driven).
 * @see docs/specs/evolution-chest-symbol.md §5
 */
export function HeroScene() {
  const { size } = useThree();

  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const modelScale = isMobile ? 0.9 : 1.1;
  const targetHeadY = isMobile ? TARGET_HEAD_Y.mobile : TARGET_HEAD_Y.desktop;
  const modelPosition = heroModelPosition(modelScale, targetHeadY, isMobile ? 0 : 1.0);

  return (
    <>
      <color attach="background" args={[COLORS.ink]} />

      {/* Base fill — near-black ambient preserves chiaroscuro */}
      <ambientLight color={COLORS.ink} intensity={2.2} />

      {/* Key light — warm paper from upper-right */}
      <directionalLight position={[5, 8, 3]} color={COLORS.paper} intensity={2.2} />

      {/* Cool steel fill from left-behind */}
      <pointLight position={[-4, 2, -2]} color={COLORS.steel} intensity={4} />

      {/* Warm oxide rim — carves the silhouette */}
      <pointLight position={[3, 1, 4]} color={COLORS.oxide} intensity={8} />

      {/* Signal red accent — subtle eye/mask highlight */}
      <pointLight position={[-2, 3, 5]} color={COLORS.signal} intensity={5} />

      <SpiderManModel
        scale={modelScale}
        position={modelPosition}
        rotation={[0, isMobile ? 0 : -0.25, 0]}
        pointerTracking
      />
    </>
  );
}