import * as THREE from 'three';
import { FX } from './fxUniforms';

const FRAGMENT_ANCHOR = '#include <dithering_fragment>';
const VERTEX_ANCHOR = '#include <project_vertex>';

/**
 * Mask lens treatment: view-dependent iridescence plus an emissive pulse tied
 * to the same clock as the rig's breathing.
 *
 * @see docs/specs/authorial-shaders-fx.md §7.1
 */
export function patchLensMaterial(
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = FX.uTime;
    shader.uniforms.uLensPulse = FX.uLensPulse;

    if (!shader.vertexShader.includes(VERTEX_ANCHOR)) {
      console.warn('[lensShader] vertex anchor not found — layer skipped');
      return;
    }
    if (!shader.fragmentShader.includes(FRAGMENT_ANCHOR)) {
      console.warn('[lensShader] fragment anchor not found — layer skipped');
      return;
    }

    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `varying vec3 vLensWorldPosition;\nvarying vec3 vLensWorldNormal;\nvoid main() {`,
      )
      .replace(
        VERTEX_ANCHOR,
        `${VERTEX_ANCHOR}
  vec4 lensWorld = modelMatrix * vec4(transformed, 1.0);
  vLensWorldPosition = lensWorld.xyz;
  vLensWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        `varying vec3 vLensWorldPosition;
varying vec3 vLensWorldNormal;
uniform float uTime;
uniform float uLensPulse;
void main() {`,
      )
      .replace(
        FRAGMENT_ANCHOR,
        `${FRAGMENT_ANCHOR}
      {
        vec3 lensNormal = normalize(vLensWorldNormal);
        vec3 lensView = normalize(cameraPosition - vLensWorldPosition);
        float lensFacing = max(dot(lensNormal, lensView), 0.0);

        // iridescence: hue shifts with the viewing angle
        vec3 lensIridescence = vec3(
          0.5 + 0.5 * cos(6.28318 * (lensFacing + 0.0)),
          0.5 + 0.5 * cos(6.28318 * (lensFacing + 0.33)),
          0.5 + 0.5 * cos(6.28318 * (lensFacing + 0.66))
        );

        float lensPulse = 0.65 + 0.35 * sin(uTime * 2.0);
        gl_FragColor.rgb += lensIridescence * (1.0 - lensFacing) * 0.06 * uLensPulse;
        gl_FragColor.rgb += vec3(0.92, 0.96, 1.0) * lensPulse * 0.05 * uLensPulse;
      }`,
      );

    material.userData.fxPatched = true;
  };

  material.needsUpdate = true;
}
