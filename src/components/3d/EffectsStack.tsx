import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, type ChromaticAberrationEffect, type DepthOfFieldEffect } from 'postprocessing';
import * as THREE from 'three';
import { useBeat } from './beat/beatContext';
import { useQualityProfile } from './qualityContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../design/breakpoints';
import { useMaterialFx } from './materials/MaterialFxDriver';
import { FX_POST_ENABLED } from '../../design/fxFlags';

/** Chromatic aberration limits (NDC offset). */
const CA_MAX = 0.0015;
const CA_K = 0.0006;

/**
 * EffectsStack — post-processing with beat-aware, authorial passes.
 *
 * Tier policy (spec §8): mobile keeps at most two active effects, so
 * DepthOfField and ChromaticAberration are `high` only. The depth of field
 * focus follows the beat anchor (head → chest → wrist → full body) and the
 * chromatic aberration reacts to scroll velocity.
 *
 * @see docs/specs/authorial-shaders-fx.md §7.3
 */
export function EffectsStack() {
  const profile = useQualityProfile();
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { stateRef } = useBeat();
  const { anchor, bokehRef } = useMaterialFx(isMobile, prefersReducedMotion);

  const dofRef = useRef<DepthOfFieldEffect>(null);
  const caRef = useRef<ChromaticAberrationEffect>(null);
  const offset = useRef(new THREE.Vector2());

  // Blur was the visible regression: DOF only in `?fx=full`, always with an
  // explicit focus range (the default is far too shallow for this scene).
  const depthOfField = FX_POST_ENABLED && profile.tier === 'high' && !prefersReducedMotion;
  const aberration = FX_POST_ENABLED && profile.tier === 'high' && !prefersReducedMotion;

  useFrame(() => {
    if (depthOfField && dofRef.current) {
      dofRef.current.target = anchor;
      dofRef.current.bokehScale = bokehRef.current;
    }

    if (aberration && caRef.current) {
      const velocity = Math.abs(stateRef.current?.velocity ?? 0);
      const magnitude = Math.min(velocity * CA_K, CA_MAX);
      offset.current.set(magnitude, magnitude * 0.6);
      caRef.current.offset = offset.current;
    }
  });

  return (
    <EffectComposer multisampling={profile.multisampling}>
      {depthOfField ? (
        <DepthOfField
          ref={dofRef}
          target={anchor}
          worldFocusRange={4}
          focusRange={0.25}
          bokehScale={bokehRef.current}
          height={480}
        />
      ) : (
        <></>
      )}

      {profile.bloom.enabled && (
        <Bloom
          intensity={profile.bloom.intensity}
          luminanceThreshold={profile.bloom.luminanceThreshold}
          luminanceSmoothing={0.15}
          mipmapBlur
        />
      )}

      {aberration ? (
        <ChromaticAberration
          ref={caRef}
          blendFunction={BlendFunction.NORMAL}
          offset={offset.current}
          radialModulation
          modulationOffset={0.35}
        />
      ) : (
        <></>
      )}

      {profile.vignette.enabled && (
        <Vignette
          offset={0.3}
          darkness={profile.vignette.darkness}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {profile.noise.enabled && (
        <Noise premultiply blendFunction={BlendFunction.ADD} opacity={profile.noise.opacity} />
      )}
    </EffectComposer>
  );
}
