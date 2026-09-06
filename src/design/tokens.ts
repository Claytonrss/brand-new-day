import * as THREE from 'three';

/**
 * Design tokens as THREE.Color instances for use in Three.js scenes.
 * Mirrors the CSS custom properties defined in src/index.css.
 * @see docs/design/design-bible.md
 */
export const COLORS = {
  ink: new THREE.Color('#0a0a0c'),
  concrete: new THREE.Color('#141417'),
  steel: new THREE.Color('#2c3b4c'),
  oxide: new THREE.Color('#7a1f24'),
  signal: new THREE.Color('#c23b34'),
  paper: new THREE.Color('#e9e5da'),
  dim: new THREE.Color('#6b6a63'),
} as const;