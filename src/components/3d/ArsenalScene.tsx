import { useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '../../design/tokens';
import { BREAKPOINTS } from '../../design/breakpoints';

/**
 * Wrist/web-shooter world-space position (approximate, per breakpoint).
 * Based on mixamorig:RightHand_029 joint in the Mixamo rig.
 * Validated against the spec's lookAt keyframes.
 */
const WRIST_POSITION = {
  mobile: [-0.9, -2.6, 0.1] as const,
  desktop: [-0.5, -3.3, 0] as const,
};

/**
 * Arsenal scene — Beat 3 "a câmera cruza o eixo".
 *
 * Adds a launcher accent PointLight (COLORS.steel) near the wrist/web-shooter
 * to illuminate it in close-up. Shadows enabled for depth.
 *
 * Does NOT render its own model — the model is shared from HeroScene.
 * Does NOT duplicate the 5-light rig — that's in HeroScene (always active).
 *
 * @see docs/specs/arsenal-web-shooters.md §5
 */
export function ArsenalScene() {
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const lightRef = useRef<THREE.PointLight>(null);

  const wrist = isMobile ? WRIST_POSITION.mobile : WRIST_POSITION.desktop;

  // Accent light positioned slightly above and in front of the wrist
  const lightPosition: [number, number, number] = [
    wrist[0] + (isMobile ? 0.3 : 0.2),
    wrist[1] + 0.6,
    wrist[2] + (isMobile ? 0.8 : 0.6),
  ];

  return (
    <>
      {/* Launcher accent — illuminates the web-shooter in close-up */}
      <pointLight
        ref={lightRef}
        color={COLORS.steel}
        intensity={isMobile ? 6 : 8}
        position={lightPosition}
        distance={4}
        decay={1.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />
    </>
  );
}
