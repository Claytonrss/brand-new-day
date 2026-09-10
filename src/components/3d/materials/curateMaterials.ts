import * as THREE from 'three';
import { COLORS } from '../../../design/tokens';
import { patchSuitMaterial } from './suitShader';
import { measureLidBounds, patchLensMaterial } from './lensShader';
import { FX_MODE } from '../../../design/fxFlags';

/**
 * Material intents keyed by the real material names in the GLB
 * (`pnpm inspect:glb` → Frame, Lense, Shoe, Webs, Webshotter, material_4..8).
 */
const MATERIAL_INTENT: Record<string, 'eye' | 'chest' | 'metal' | 'fabric' | 'web' | 'lens'> = {
  // Order matters: 'webshotter' contains 'webs' (and 'led' inside '...') so the
  // most specific key wins. The LED meshes are the glowing mask eyes - they
  // carry the blink lids, just like the lens glass over them.
  lense: 'lens',
  led: 'lens',
  webshotter: 'metal',
  webs: 'web',
  frame: 'metal',
  shoe: 'fabric',
};

function intentFor(name: string): 'eye' | 'chest' | 'metal' | 'fabric' | 'web' | 'lens' {
  const lower = name.toLowerCase();
  for (const [key, intent] of Object.entries(MATERIAL_INTENT)) {
    if (lower.includes(key)) return intent;
  }
  if (lower.includes('eye') || lower.includes('lens')) return 'eye';
  if (lower.includes('chest') || lower.includes('symbol')) return 'chest';
  return 'fabric';
}

export interface CuratedMaterials {
  patched: number;
  names: string[];
}

/**
 * Curate every material of the loaded model: physical intent (roughness,
 * metalness, emissive) plus the authorial shader layer (Wave C).
 *
 * Replaces the inline curation that used to live in `SpiderManModel`.
 *
 * @see docs/specs/authorial-shaders-fx.md §4
 */
export function curateMaterials(root: THREE.Object3D): CuratedMaterials {
  // `?fx=off` keeps the Wave B look — physical intent only, no shader layer.
  const patch = FX_MODE !== 'off';

  const names: string[] = [];
  let patched = 0;

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    for (const material of materials) {
      if (
        !material ||
        !(
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        )
      ) {
        continue;
      }

      const name = material.name ?? '';
      const intent = intentFor(name);
      const isMetal = material.metalness > 0.5;

      switch (intent) {
        case 'lens':
          material.emissive = new THREE.Color(COLORS.glow);
          material.emissiveIntensity = 1.2;
          material.roughness = 0.08;
          // E+D: the lid axis comes from the real bounding box of each lens
          if (patch) patchLensMaterial(material, measureLidBounds(mesh.geometry));
          patched++;
          break;
        case 'eye':
          material.emissive = new THREE.Color(COLORS.glow);
          material.emissiveIntensity = 1.2;
          material.roughness = 0.1;
          if (patch) patchSuitMaterial(material, { rim: 0.6, rimColor: '#eaf4ff' });
          patched++;
          break;
        case 'chest':
          material.emissive = new THREE.Color(COLORS.glow);
          material.emissiveIntensity = 0.6;
          material.roughness = 0.3;
          if (patch) patchSuitMaterial(material, { web: true, sweep: true, rim: 1.1 });
          patched++;
          break;
        case 'web':
          material.roughness = 0.5;
          material.metalness = 0.28;
          // The web weave lives here, plus the Beat 2 band on the chest height
          if (patch) patchSuitMaterial(material, { web: true, sweep: true, rim: 1 });
          patched++;
          break;
        case 'metal':
          material.roughness = 0.25;
          material.metalness = 0.85;
          if (patch) patchSuitMaterial(material, { rim: 0.5, rimColor: '#7a1f24' });
          patched++;
          break;
        default:
          if (isMetal) {
            material.roughness = 0.25;
            material.metalness = 0.85;
            if (patch) patchSuitMaterial(material, { rim: 0.5, rimColor: '#7a1f24' });
          } else {
            material.roughness = 0.55;
            material.metalness = 0.3;
            if (patch) patchSuitMaterial(material, { web: true, rim: 1 });
          }
          patched++;
          break;
      }

      material.needsUpdate = true;
      names.push(`${name || '(unnamed)'}:${intent}`);
    }
  });

  return { patched, names };
}
