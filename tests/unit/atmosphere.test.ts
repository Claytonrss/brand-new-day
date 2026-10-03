import { describe, expect, it } from 'vitest';
import { ATMOSPHERE, LAYERS, buildParticleAttributes } from '@/components/3d/atmosphere/particles';

describe('atmosphere particles', () => {
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
