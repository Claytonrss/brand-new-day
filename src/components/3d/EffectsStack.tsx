import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * Post-processing effects stack — cinematic premium pipeline.
 *
 * Pipeline order matters:
 * 1. Bloom — emissive glow on bright surfaces (luminance threshold 0.8)
 * 2. Vignette — darkened edges for focus and cinematic framing
 * 3. Noise — subtle film grain to break banding and add analog texture
 *
 * @see docs/design/design-bible.md
 */
export function EffectsStack() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.15}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.032}
      />
    </EffectComposer>
  );
}
