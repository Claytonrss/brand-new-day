import { describe, expect, it } from 'vitest';
import {
  ATMOSPHERE,
  LAYERS,
  PARTICLE_BUDGET,
  buildParticleAttributes,
  particleCount,
} from '../../src/components/3d/atmosphere/particles';
import {
  PARTICLE_FRAGMENT,
  PARTICLE_VERTEX,
} from '../../src/components/3d/atmosphere/particlesShader';

describe('atmosphere particles', () => {
  it('scales the budget per tier and skips low entirely', () => {
    expect(particleCount('high')).toBe(420);
    expect(particleCount('medium')).toBe(180);
    expect(particleCount('low')).toBe(0);
  });

  it('keeps desktop heavier than mobile', () => {
    expect(PARTICLE_BUDGET.high).toBeGreaterThan(PARTICLE_BUDGET.medium);
  });

  it('defines one value per parallax layer', () => {
    expect(ATMOSPHERE.drift).toHaveLength(LAYERS);
    expect(ATMOSPHERE.parallax).toHaveLength(LAYERS);
    expect(ATMOSPHERE.size).toHaveLength(LAYERS);
    expect(ATMOSPHERE.opacity).toHaveLength(LAYERS);
  });

  it('makes nearer layers faster, larger and more opaque', () => {
    // nearest layer is index 0
    expect(ATMOSPHERE.drift[0]).toBeGreaterThan(ATMOSPHERE.drift[2]);
    expect(ATMOSPHERE.size[0]).toBeLessThan(ATMOSPHERE.size[2]);
    expect(ATMOSPHERE.opacity[0]).toBeGreaterThan(ATMOSPHERE.opacity[2]);
    expect(ATMOSPHERE.parallax[0]).toBeGreaterThan(ATMOSPHERE.parallax[2]);
  });

  it('builds one attribute entry per particle', () => {
    const count = 64;
    const attributes = buildParticleAttributes(count);

    expect(attributes.positions).toHaveLength(count * 3);
    expect(attributes.layers).toHaveLength(count);
    expect(attributes.phases).toHaveLength(count);
    expect(attributes.seeds).toHaveLength(count);
    expect(attributes.sizes).toHaveLength(count);
  });

  it('distributes particles across every layer', () => {
    const attributes = buildParticleAttributes(30);
    const seen = new Set(Array.from(attributes.layers));
    expect(seen.size).toBe(LAYERS);
  });

  it('keeps positions inside the declared volume', () => {
    const attributes = buildParticleAttributes(200);
    for (let i = 0; i < 200; i++) {
      expect(Math.abs(attributes.positions[i * 3])).toBeLessThanOrEqual(ATMOSPHERE.spread / 2);
      expect(Math.abs(attributes.positions[i * 3 + 1])).toBeLessThanOrEqual(ATMOSPHERE.height / 2);
    }
  });
});

describe('particle shader source', () => {
  it('declares the custom attributes and uniforms it relies on', () => {
    for (const token of ['aLayer', 'aPhase', 'aSeed', 'aSize', 'uTime', 'uCameraPos', 'uParallax', 'uDrift']) {
      expect(PARTICLE_VERTEX).toContain(token);
    }
  });

  it('drives the Beat 2 glow from the shared sweep uniforms', () => {
    expect(PARTICLE_VERTEX).toContain('uSpot');
    expect(PARTICLE_VERTEX).toContain('uSpotY');
  });

  it('discards outside the round sprite and is additive-friendly', () => {
    expect(PARTICLE_FRAGMENT).toContain('discard');
    expect(PARTICLE_FRAGMENT).toContain('gl_PointCoord');
  });
});
