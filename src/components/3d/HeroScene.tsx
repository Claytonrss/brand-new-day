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

      {/* Ambient fill — subtle cool steel, not ink (preserves detail in shadows) */}
      <ambientLight color={COLORS.steel} intensity={0.35} />

      {/* Key light — warm paper from upper-right, casts shadows */}
      <directionalLight
        position={[5, 8, 3]}
        color={COLORS.paper}
        intensity={3.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />

      {/* Warm oxide rim — carves the silhouette (physical units: ~30cd) */}
      <pointLight
        position={[3, 1, 4]}
        color={COLORS.oxide}
        intensity={30}
        distance={10}
        decay={2}
      />

      {/* Signal red accent rim — eye/mask highlight (~15cd) */}
      <pointLight
        position={[-2, 3, 5]}
        color={COLORS.signal}
        intensity={15}
        distance={8}
        decay={2}
      />

      {/* Cool steel fill from left-behind (~14cd) */}
      <pointLight
        position={[-4, 2, -2]}
        color={COLORS.steel}
        intensity={14}
        distance={12}
        decay={2}
      />

      <SpiderManModel
        scale={modelScale}
        position={modelPosition}
        rotation={[0, isMobile ? 0 : -0.25, 0]}
        pointerTracking
      />
    </>
  );
}