import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useQualityProfile } from './qualityContext';

/**
 * Post-processing effects stack — cinematic premium pipeline.
 *
 * Pipeline order matters:
 * 1. Bloom — emissive glow on bright surfaces (luminance threshold varies by tier)
 * 2. Vignette — darkened edges for focus and cinematic framing
 * 3. Noise — subtle film grain to break banding and add analog texture
 *
 * Each effect is conditionally rendered based on the current quality profile,
 * allowing adaptive degradation per device capability.
 *
 * @see docs/design/design-bible.md
 * @see docs/design/quality-matrix.md
 */
export function EffectsStack() {
  const profile = useQualityProfile();

  return (
    <EffectComposer multisampling={profile.multisampling}>
      {profile.bloom.enabled && (
        <Bloom
          intensity={profile.bloom.intensity}
          luminanceThreshold={profile.bloom.luminanceThreshold}
          luminanceSmoothing={0.15}
          mipmapBlur
        />
      )}
      {profile.vignette.enabled && (
        <Vignette
          offset={0.3}
          darkness={profile.vignette.darkness}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
      {profile.noise.enabled && (
        <Noise
          premultiply
          blendFunction={BlendFunction.ADD}
          opacity={profile.noise.opacity}
        />
      )}
    </EffectComposer>
  );
}
