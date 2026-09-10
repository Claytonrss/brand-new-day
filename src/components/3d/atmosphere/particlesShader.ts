/**
 * GPU particle shader — atmosphere motes.
 *
 * All motion happens in the vertex shader: upward drift, turbulence and a
 * per-layer parallax offset relative to the camera. The CPU only uploads the
 * static attributes once, so the whole layer costs a single draw call.
 *
 * @see docs/specs/atmosphere-depth.md §7
 */
export const PARTICLE_VERTEX = /* glsl */ `
attribute float aLayer;
attribute float aPhase;
attribute float aSeed;
attribute float aSize;

uniform float uTime;
uniform vec3 uCameraPos;
uniform float uSpread;
uniform float uHeight;
uniform vec3 uDrift;
uniform vec3 uParallax;
/** Beat 2 spotlight: world Y of the sweep and its intensity. */
uniform float uSpotY;
uniform float uSpot;

varying float vOpacity;
varying float vGlow;

void main() {
  vec3 pos = position;

  // upward drift, wrapped inside the volume
  pos.y += uTime * uDrift[int(aLayer)];
  pos.y = mod(pos.y + uHeight * 0.5, uHeight) - uHeight * 0.5;

  // turbulence: two cheap sines per axis, phase-shifted per particle
  float t = uTime * 0.35 + aPhase;
  pos.x += sin(t * 0.9 + aSeed * 6.283) * 0.35;
  pos.z += cos(t * 0.7 + aSeed * 4.712) * 0.35;

  // parallax: nearer layers follow the camera more closely
  float p = uParallax[int(aLayer)];
  vec3 parallaxOffset = (uCameraPos - vec3(0.0, -2.0, 0.0)) * p;
  parallaxOffset.y = 0.0;
  pos += parallaxOffset;

  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  // fade with distance so motes never pop at the volume edge
  float depth = -viewPosition.z;
  float distanceFade = smoothstep(28.0, 6.0, depth) * smoothstep(0.5, 3.0, depth);

  // Beat 2: motes inside the light band glow
  float band = 1.0 - smoothstep(0.0, 1.4, abs(pos.y - uSpotY));
  vGlow = band * uSpot;

  vOpacity = distanceFade * (0.4 + 0.6 * aSeed);
  gl_PointSize = aSize * (300.0 / max(depth, 0.1));
}
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uBaseOpacity;

varying float vOpacity;
varying float vGlow;

void main() {
  // soft round mote
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.1, d) * vOpacity * uBaseOpacity;
  vec3 color = uColor + uGlowColor * vGlow;

  gl_FragColor = vec4(color, alpha);
}
`;
