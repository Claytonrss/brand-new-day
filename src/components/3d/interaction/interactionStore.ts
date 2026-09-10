import * as THREE from 'three';

/**
 * Mutable interaction state, read per frame by the consumers.
 *
 * Same pattern as `anchorStore` and the FX uniforms: writing React state at
 * pointer-move frequency would re-render the tree on every event.
 */
export interface InteractionState {
  /** Drag / gyro rotation offset applied to the model group. */
  yaw: number;
  pitch: number;
  /** Whether a drag gesture is currently active. */
  dragging: boolean;
  /** Web-shot impulses, consumed by the camera rig. */
  cameraKick: number;
  /** Incremented to request a new web strand. */
  shotId: number;
  /** Origin (world) and direction of the latest shot. */
  shotFrom: THREE.Vector3;
  shotTo: THREE.Vector3;
  /** Cursor-driven offset applied to the rim light. */
  rimX: number;
  rimY: number;
}

export const INTERACTION: InteractionState = {
  yaw: 0,
  pitch: 0,
  dragging: false,
  cameraKick: 0,
  shotId: 0,
  shotFrom: new THREE.Vector3(),
  shotTo: new THREE.Vector3(),
  rimX: 0,
  rimY: 0,
};
