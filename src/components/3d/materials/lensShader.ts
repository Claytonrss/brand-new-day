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
    shader.uniforms.uBlink = FX.uBlink;

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
        `varying vec3 vLensWorldPosition;
varying vec3 vLensWorldNormal;
#ifdef USE_UV
  varying vec2 vLensUv;
#endif
void main() {`,
      )
      .replace(
        VERTEX_ANCHOR,
        `${VERTEX_ANCHOR}
  #ifdef USE_UV
    vLensUv = vUv;
  #endif
  vec4 lensWorld = modelMatrix * vec4(transformed, 1.0);
  vLensWorldPosition = lensWorld.xyz;
  vLensWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        `varying vec3 vLensWorldPosition;
varying vec3 vLensWorldNormal;
#ifdef USE_UV
  varying vec2 vLensUv;
#endif
uniform float uTime;
uniform float uLensPulse;
uniform float uBlink;
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

        // Stylised blink: the lens light closes to a thin slit and reopens.
        // The asset has no eyelids, so this is a shutter, not anatomy.
        float lid = clamp(uBlink, 0.0, 1.0);
        float openness = 1.0 - lid;

        #ifdef USE_UV
          float slit = abs(vLensUv.y - 0.5) * 2.0;
        #else
          float slit = abs(fract(vLensWorldPosition.y * 3.0) - 0.5) * 2.0;
        #endif

        float visible = 1.0 - smoothstep(openness * 0.5, openness * 0.5 + 0.15, slit);

        gl_FragColor.rgb += lensIridescence * (1.0 - lensFacing) * 0.06 * uLensPulse * visible;
        gl_FragColor.rgb += vec3(0.92, 0.96, 1.0) * lensPulse * 0.05 * uLensPulse * visible;
        // close the aperture: the emissive core dims as the lids meet
        gl_FragColor.rgb *= mix(1.0, 0.35, lid * 0.8);
      }`,
      );

    material.userData.fxPatched = true;
  };

  material.needsUpdate = true;
}
