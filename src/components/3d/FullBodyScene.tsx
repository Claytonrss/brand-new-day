import { useThree } from '@react-three/fiber';
import { COLORS } from '../../design/tokens';
import { BREAKPOINTS } from '../../design/breakpoints';

/**
 * FullBody scene — Beat 4 "a revelação do herói qualquer".
 *
 * Adds brighter, more even lighting for the full-body reveal.
 * The camera pulls back to show the entire character, so lighting
 * needs to be more uniform than the dramatic close-up lighting.
 *
 * Does NOT render its own model — the model is shared from HeroScene.
 * Does NOT duplicate the base lighting rig — that's in HeroScene (always active).
 * These lights complement the existing rig for the full-body reveal.
 *
 * @see docs/design/design-bible.md
 * @see docs/design/composition-rules.md (§FullBody)
 */
export function FullBodyScene() {
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;

  return (
    <>
      {/* Key light boost — brighter for full-body visibility */}
      <directionalLight
        position={[3, 6, 4]}
        intensity={isMobile ? 1.5 : 2.0}
        color={COLORS.paper}
        castShadow={false}
      />

      {/* Fill light — soft, from opposite side for even illumination */}
      <pointLight
        position={[-4, 0, 3]}
        intensity={isMobile ? 8 : 12}
        color={COLORS.steel}
        distance={20}
        decay={2}
      />

      {/* Rim light — warm, from behind for silhouette separation */}
      <pointLight
        position={[3, -1, -4]}
        intensity={isMobile ? 10 : 15}
        color={COLORS.oxide}
        distance={18}
        decay={2}
      />

      {/* Ground bounce — subtle upward fill to illuminate legs/feet */}
      <pointLight
        position={[0, -4, 2]}
        intensity={isMobile ? 4 : 6}
        color={COLORS.concrete}
        distance={12}
        decay={2}
      />
    </>
  );
}
