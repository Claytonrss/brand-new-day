/** Head joint Y in model space (from GLB bounding box max Y). */
export const MODEL_HEAD_Y = 9.66;

/** Target world-space Y for the head bone, per breakpoint. */
export const TARGET_HEAD_Y = {
  mobile: 0.45,
  desktop: 0.4,
} as const;

export function heroModelPosition(
  scale: number,
  targetHeadY: number,
  x = 0,
): [number, number, number] {
  return [x, targetHeadY - MODEL_HEAD_Y * scale, 0];
}
