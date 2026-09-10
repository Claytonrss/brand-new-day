import { useThree } from '@react-three/fiber';
import { heroModelPosition, TARGET_HEAD_Y } from './heroModelLayout';
import { SpiderManModel } from './SpiderManModel';
import { COLORS } from '../../design/tokens';
import { BREAKPOINTS } from '../../design/breakpoints';

/**
 * Stage — background + the shared model (no lights).
 *
 * Lighting is beat-scoped and lives in `LightRig`; the camera lives in
 * `CameraRig`. This component only owns what is constant across the whole
 * page: the ink background and the character.
 *
 * @see docs/specs/headroom-lighting.md §3
 */
export function Stage() {
  const { size } = useThree();
  const debug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const modelScale = isMobile ? 0.9 : 1.1;
  const targetHeadY = isMobile ? TARGET_HEAD_Y.mobile : TARGET_HEAD_Y.desktop;
  const modelPosition = heroModelPosition(modelScale, targetHeadY, isMobile ? 0 : 1.0);

  return (
    <>
      <color attach="background" args={[COLORS.ink]} />

      <SpiderManModel
        scale={modelScale}
        position={modelPosition}
        rotation={[0, isMobile ? 0 : -0.25, 0]}
        pointerTracking
        debug={debug}
      />
    </>
  );
}
