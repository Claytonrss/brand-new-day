/**
 * Handheld camera noise.
 *
 * The implementation lives in `design/noise.ts` because the procedural rig
 * uses the same fbm; this module only documents the camera intent.
 *
 * @see docs/specs/cinematic-camera-path.md §6.5
 */
export { fbm } from '../../../design/noise';
