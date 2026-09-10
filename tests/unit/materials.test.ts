import { describe, expect, it, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { patchSuitMaterial } from '../../src/components/3d/materials/suitShader';
import { patchLensMaterial } from '../../src/components/3d/materials/lensShader';
import { curateMaterials } from '../../src/components/3d/materials/curateMaterials';
import { FX_MODE, FX_STRENGTH, FX_POST_ENABLED } from '../../src/design/fxFlags';

/** Minimal stand-in for the object three hands to `onBeforeCompile`. */
function fakeShader() {
  return {
    uniforms: {} as Record<string, unknown>,
    vertexShader: 'void main() {\n  #include <project_vertex>\n}',
    fragmentShader: 'void main() {\n  #include <dithering_fragment>\n}',
  };
}

function compile(
  patch: (material: THREE.MeshStandardMaterial) => void,
  material = new THREE.MeshStandardMaterial(),
) {
  patch(material);
  const shader = fakeShader();
  material.onBeforeCompile?.(shader as never, null as never);
  return { material, shader };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('suit shader', () => {
  it('injects varyings, uniforms and the fresnel/web terms', () => {
    const { material, shader } = compile((m) =>
      patchSuitMaterial(m, { web: true, sweep: true, rim: 1.2 }),
    );

    expect(material.userData.fxPatched).toBe(true);
    expect(shader.vertexShader).toContain('vFxWorldPosition');
    expect(shader.vertexShader).toContain('vFxWorldNormal');
    expect(shader.fragmentShader).toContain('fxWebWeave');
    expect(shader.fragmentShader).toContain('fxFresnel');
    expect(shader.fragmentShader).toContain('fxBand');
    expect(shader.uniforms.uWebScale).toBeDefined();
  });

  it('shares the global FX uniform objects so one driver animates every material', () => {
    const { shader } = compile((m) => patchSuitMaterial(m));
    expect(shader.uniforms.uRimStrength).toBeDefined();
    expect(shader.uniforms.uWebStrength).toBeDefined();
  });

  it('skips the layer (with a warning) when an anchor is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const material = new THREE.MeshStandardMaterial();

    patchSuitMaterial(material);
    const shader = fakeShader();
    shader.fragmentShader = 'void main() {}';
    material.onBeforeCompile?.(shader as never, null as never);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('fragment anchor not found'));
    expect(material.userData.fxPatched).toBeUndefined();
  });

  it('disables the web weave via uWebScale when web is not requested', () => {
    const { shader } = compile((m) => patchSuitMaterial(m, { web: false }));
    expect((shader.uniforms.uWebScale as { value: number }).value).toBe(0);
  });
});

describe('lens shader', () => {
  it('injects iridescence and the pulse', () => {
    const { material, shader } = compile(patchLensMaterial);
    expect(material.userData.fxPatched).toBe(true);
    expect(shader.fragmentShader).toContain('lensIridescence');
    expect(shader.fragmentShader).toContain('lensPulse');
  });
});

describe('material curation', () => {
  function buildModel() {
    const group = new THREE.Group();
    const add = (name: string) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ name }),
      );
      group.add(mesh);
      return mesh;
    };
    add('Webs');
    add('Lense');
    add('Webshotter');
    add('material_4');
    return group;
  }

  it('patches every standard material and reports names', () => {
    const result = curateMaterials(buildModel());
    expect(result.patched).toBe(4);
    expect(result.names).toEqual([
      'Webs:web',
      'Lense:lens',
      'Webshotter:metal',
      'material_4:fabric',
    ]);
  });

  it('applies per-material intent (lens emissive, metal roughness)', () => {
    const group = buildModel();
    curateMaterials(group);

    const materials = group.children.map(
      (child) => (child as THREE.Mesh).material as THREE.MeshStandardMaterial,
    );
    const lens = materials.find((m) => m.name === 'Lense');
    const metal = materials.find((m) => m.name === 'Webshotter');

    expect(lens?.emissiveIntensity).toBeCloseTo(1.2, 5);
    expect(lens?.roughness).toBeCloseTo(0.08, 5);
    expect(metal?.metalness).toBeCloseTo(0.85, 5);
  });
});

describe('fx flags', () => {
  it('defaults to subtle with a conservative strength', () => {
    expect(FX_MODE).toBe('subtle');
    expect(FX_STRENGTH.subtle).toBeLessThan(0.3);
    expect(FX_STRENGTH.off).toBe(0);
  });

  it('gates depth of field behind full mode', () => {
    expect(FX_POST_ENABLED).toBe(false);
  });
});
