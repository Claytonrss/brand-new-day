import * as THREE from 'three';
import { FX } from './fxUniforms';

const FRAGMENT_ANCHOR = '#include <dithering_fragment>';
const VERTEX_ANCHOR = '#include <project_vertex>';
const VERTEX_BEGIN = '#include <begin_vertex>';

/** Vertical bounds of a lens mesh, in its own local space. */
export interface LidBounds {
  minY: number;
  maxY: number;
  centerY: number;
}

/**
 * Measure the vertical bounds of the lens geometry.
 *
 * Measured from the real bounding box instead of UV: if any lens mesh has a
 * rotated UV layout (they do not share one), a UV-based slit would come out
 * sideways. The bounding box always gives the true vertical axis.
 */
export function measureLidBounds(geometry: THREE.BufferGeometry): LidBounds {
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const box = geometry.boundingBox ?? new THREE.Box3();

  return {
    minY: box.min.y,
    maxY: box.max.y,
    centerY: (box.min.y + box.max.y) / 2,
  };
}

/**
 * Mask lens treatment.
 *
 * Eyelids do not exist in the asset, so the blink is a **shutter**: a lid in
 * the suit colour closes over the lens from the top and bottom (E) while the
 * lens compresses vertically toward its centre (D), which reads as the eye
 * closing instead of just dimming.
 *
 * @see docs/specs/model-interaction.md §7.5 and docs/memory/tech-debt.md TD-001
 */
export function patchLensMaterial(
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  bounds?: LidBounds,
  lidColor = '#8f2226',
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = FX.uTime;
    shader.uniforms.uLensPulse = FX.uLensPulse;
    shader.uniforms.uBlink = FX.uBlink;
    shader.uniforms.uLidMinY = { value: bounds?.minY ?? 0 };
    shader.uniforms.uLidMaxY = { value: bounds?.maxY ?? 1 };
    shader.uniforms.uLidCenterY = { value: bounds?.centerY ?? 0.5 };
    shader.uniforms.uLidColor = { value: new THREE.Color(lidColor) };
    /** How much the lens compresses at full closure (D). */
    shader.uniforms.uSquash = { value: 0.3 };

    if (
      !shader.vertexShader.includes(VERTEX_ANCHOR) ||
      !shader.vertexShader.includes(VERTEX_BEGIN)
    ) {
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
varying float vLensLocalY;
uniform float uBlink;
uniform float uLidMinY;
uniform float uLidMaxY;
uniform float uLidCenterY;
uniform float uSquash;
void main() {`,
      )
      .replace(
        VERTEX_BEGIN,
        `${VERTEX_BEGIN}
  // vertical coordinate of the original lens (lid edge reference)
  vLensLocalY = clamp(
    (position.y - uLidMinY) / max(uLidMaxY - uLidMinY, 0.0001),
    0.0,
    1.0
  );
  // D: compress the lens toward its centre as the lids close
  transformed.y = mix(transformed.y, uLidCenterY, clamp(uBlink, 0.0, 1.0) * uSquash);`,
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
varying float vLensLocalY;
uniform float uTime;
uniform float uLensPulse;
uniform float uBlink;
uniform vec3 uLidColor;
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

        // E: upper and lower lids close until they meet in the middle
        float blink = clamp(uBlink, 0.0, 1.0);
        float upperLid = 1.0 - blink * 0.6;   // edge descends from 1.0
        float lowerLid = blink * 0.6;         // edge rises from 0.0
        float lidMask = step(upperLid, vLensLocalY) + step(vLensLocalY, lowerLid);

        // the lid takes the suit colour, shaded by the lens normal so it does
        // not read as a flat sticker
        vec3 lidShade = uLidColor * (0.45 + 0.55 * lensFacing);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, lidShade, clamp(lidMask, 0.0, 1.0));
      }`,
      );

    material.userData.fxPatched = true;
  };

  material.needsUpdate = true;
}
