/**
 * Proactive WebGL detection.
 *
 * Cheaper and cleaner than letting the R3F canvas throw: the fallback poster
 * is chosen before any 3D is mounted (`docs/specs/webgl-static-fallback.md §4`).
 */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl'),
    );
  } catch {
    return false;
  }
}
