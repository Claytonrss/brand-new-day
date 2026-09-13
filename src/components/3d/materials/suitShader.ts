import * as THREE from 'three';
import { FX } from './fxUniforms';

/** Fragment chunk used as the injection anchor (end of the fragment shader). */
const FRAGMENT_ANCHOR = '#include <dithering_fragment>';
/** Vertex chunk used to export world position/normal varyings. */
const VERTEX_ANCHOR = '#include <project_vertex>';

const VARYINGS = /* glsl */ `
varying vec3 vFxWorldPosition;
varying vec3 vFxWorldNormal;
`;

const VERTEX_BODY = /* glsl */ `
  vec4 fxWorldPosition = modelMatrix * vec4(transformed, 1.0);
  vFxWorldPosition = fxWorldPosition.xyz;
  vFxWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
`;

/**
 * Three sets of parallel lines at 0°, 60° and 120° — a stylised web weave.
 * Cheap (3 dots + 3 sin) and resolution independent.
 */
const WEB_WEAVE = /* glsl */ `
float fxWebLine(vec2 p, float angle, float t) {
  vec2 dir = vec2(cos(angle), sin(angle));
  float v = dot(p, dir) * 3.14159;
  return smoothstep(0.86, 1.0, abs(sin(v + t)));
}

float fxWebWeave(vec2 p, float t) {
  float a = fxWebLine(p, 0.0, t);
  float b = fxWebLine(p, 1.0472, t * 0.8);
  float c = fxWebLine(p, 2.0944, t * 0.6);
  return max(max(a, b), c);
}
`;

interface SuitShaderOptions {
  /** Enables the animated web weave (suit fabric / chest). */
  web?: boolean;
  /** Fresnel rim multiplier. */
  rim?: number;
  /** Rim colour — design token hex. */
  rimColor?: string;
  /** Beat 2 light band (chest). */
  sweep?: boolean;
}

/**
 * Patch a MeshStandard/MeshPhysical material with the authorial layer:
 * fresnel rim + animated web weave + (optionally) the Beat 2 light band.
 *
 * Everything is additive over the existing fragment output, so a failure in the
 * injection degrades to "no effect" — never to a broken shader.
 */
export function patchSuitMaterial(
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  options: SuitShaderOptions = {},
): void {
  const { web = false, rim = 1, rimColor = '#c23b34', sweep = false } = options;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = FX.uTime;
    shader.uniforms.uRimStrength = FX.uRimStrength;
    shader.uniforms.uWebStrength = FX.uWebStrength;
    shader.uniforms.uBeat = FX.uBeat;
    shader.uniforms.uRimColor = FX.uRimColor;
    shader.uniforms.uWebColor = FX.uWebColor;
    shader.uniforms.uSweep = FX.uSweep;
    shader.uniforms.uSweepY = FX.uSweepY;

    const rimColorUniform = new THREE.Color(rimColor);
    shader.uniforms.uRimTint = { value: rimColorUniform };
    shader.uniforms.uRimScale = { value: rim };
    shader.uniforms.uWebScale = { value: web ? 1 : 0 };

    if (!shader.vertexShader.includes(VERTEX_ANCHOR)) {
      console.warn('[suitShader] vertex anchor not found — layer skipped');
      return;
    }
    if (!shader.fragmentShader.includes(FRAGMENT_ANCHOR)) {
      console.warn('[suitShader] fragment anchor not found — layer skipped');
      return;
    }

    shader.vertexShader = shader.vertexShader
      .replace('void main() {', `${VARYINGS}\nvoid main() {`)
      .replace(VERTEX_ANCHOR, `${VERTEX_ANCHOR}\n${VERTEX_BODY}`);

    const body = /* glsl */ `
      #include <dithering_fragment>
      {
        vec3 fxNormal = normalize(vFxWorldNormal);
        vec3 fxView = normalize(cameraPosition - vFxWorldPosition);
        float fxFacing = max(dot(fxNormal, fxView), 0.0);
        float fxFresnel = pow(1.0 - fxFacing, 3.0);

        gl_FragColor.rgb += uRimColor * uRimTint * fxFresnel * uRimStrength * uRimScale;

        #ifdef USE_UV
          vec2 fxUv = vUv * 26.0;
        #else
          vec2 fxUv = vFxWorldPosition.xy * 6.0;
        #endif

        float fxWeb = fxWebWeave(fxUv, uTime * 0.6) * uWebStrength * uWebScale;
        float fxPulse = 0.75 + 0.25 * sin(uTime * 1.6 + uBeat * 6.28318);
        gl_FragColor.rgb += uWebColor * fxWeb * fxPulse;

        ${
          sweep
            ? `
        float fxBand = 1.0 - smoothstep(0.0, 0.55, abs(vFxWorldPosition.y - uSweepY));
        gl_FragColor.rgb += uRimColor * fxBand * uSweep * 0.4;
        `
            : ''
        }
      }
    `;

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        `${VARYINGS}\n${WEB_WEAVE}\nuniform float uTime;\nuniform float uRimStrength;\nuniform float uWebStrength;\nuniform float uBeat;\nuniform float uSweep;\nuniform float uSweepY;\nuniform vec3 uRimColor;\nuniform vec3 uWebColor;\nuniform vec3 uRimTint;\nuniform float uRimScale;\nuniform float uWebScale;\nvoid main() {`,
      )
      .replace(FRAGMENT_ANCHOR, body);

    material.userData.fxPatched = true;
  };

  material.needsUpdate = true;
}
