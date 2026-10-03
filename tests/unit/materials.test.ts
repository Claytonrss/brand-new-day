import { describe, expect, it, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { patchSuitMaterial } from '@/components/3d/materials/suitShader';
import { measureLidBounds, patchLensMaterial } from '@/components/3d/materials/lensShader';
import { curateMaterials } from '@/components/3d/materials/curateMaterials';

/** Minimal stand-in for the object three hands to `onBeforeCompile`. */
function fakeShader() {
  return {
    uniforms: {} as Record<string, unknown>,
    vertexShader: 'void main() {\n  #include <begin_vertex>\n  #include <project_vertex>\n}',
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

  it('disables the web weave via uWebScale when web is not requested', () => {
    const { shader } = compile((m) => patchSuitMaterial(m, { web: false }));
    expect((shader.uniforms.uWebScale as { value: number }).value).toBe(0);
  });
});

describe('lens shader', () => {
  it('injects iridescence, the pulse and the shutter lids', () => {
    const { material, shader } = compile(patchLensMaterial);
    expect(material.userData.fxPatched).toBe(true);
    expect(shader.fragmentShader).toContain('lensIridescence');
    expect(shader.fragmentShader).toContain('lensPulse');
    expect(shader.fragmentShader).toContain('lidMask');
    expect(shader.vertexShader).toContain('vLensLocalY');
  });
});

describe('lid bounds', () => {
  it('measures the vertical extent of the real geometry (not the UVs)', () => {
    const geometry = new THREE.BoxGeometry(1, 2.4, 1);
    const bounds = measureLidBounds(geometry);

    expect(bounds.minY).toBeCloseTo(-1.2, 5);
    expect(bounds.maxY).toBeCloseTo(1.2, 5);
    expect(bounds.centerY).toBeCloseTo(0, 5);
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
