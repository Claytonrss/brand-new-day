import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ANCHORS } from './rig/anchorStore';
import { spiderSense } from './rig/spiderSense';

/**
 * World-space rise from the `mixamorig:Head_06` bone centre: the bone sits
 * mid-skull, and the emanata fan lives ABOVE the head — anchoring the halo at
 * the bone centre reads as a misaligned ring.
 */
const SKULL_TOP_OFFSET = 0.12;
/** True crown (≈15cm above the skull-top anchor) — the radius measuring point. */
const CROWN_OFFSET = 0.27;
/** Projected head radius × fan factor: the arcs span 0.32–0.46 of the halo box. */
const RADIUS_FAN_FACTOR = 4.0;
/** Halo half-size bounds (px) — floor keeps it legible far, ceiling keeps
 * close-ups from covering the face (composition-rules). */
const RADIUS_PX = { min: 80, max: 180 } as const;

/**
 * SenseAnchor — projects the head anchor to screen space while the
 * spider-sense rings, publishing `--sense-x/--sense-y` for the DOM halo
 * (`SpiderSense.tsx`), plus `--sense-radius` (ADR-027): the halo half-size in
 * px, re-measured per frame from the crown projection so it scales with the
 * camera zoom instead of sitting at a fixed breakpoint size.
 *
 * The write only happens while the envelope is alive (~500ms per fire), so
 * the steady-state cost is one comparison per frame. Runs inside the canvas
 * tree because it needs the camera; the halo itself is DOM, in the same
 * editorial hairline language as the Arsenal HUD.
 *
 * @see docs/specs/spider-sense.md §1
 */
export function SenseAnchor() {
  const { size } = useThree();
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const crownScratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    if (spiderSense.envelope <= 0.001 || !ANCHORS.ready) return;

    scratch.copy(ANCHORS.head);
    scratch.y += SKULL_TOP_OFFSET;
    scratch.project(camera);
    // Comic convention: when the head is out of frame (Evolution chest
    // close-up, Arsenal wrist macro) the tingle pokes in from the nearest
    // edge instead of being invisible — clamp the halo centre to the viewport.
    const pad = 130;
    const x = THREE.MathUtils.clamp((scratch.x * 0.5 + 0.5) * size.width, pad, size.width - pad);
    const y = THREE.MathUtils.clamp((-scratch.y * 0.5 + 0.5) * size.height, pad, size.height - pad);

    crownScratch.copy(ANCHORS.head);
    crownScratch.y += CROWN_OFFSET;
    crownScratch.project(camera);
    const crownPx = (-crownScratch.y * 0.5 + 0.5) * size.height;
    const radiusPx = THREE.MathUtils.clamp(
      Math.abs(y - crownPx) * RADIUS_FAN_FACTOR,
      RADIUS_PX.min,
      RADIUS_PX.max,
    );

    const root = document.documentElement;
    root.style.setProperty('--sense-x', `${Math.round(x)}px`);
    root.style.setProperty('--sense-y', `${Math.round(y)}px`);
    root.style.setProperty('--sense-radius', `${Math.round(radiusPx)}px`);
  });

  return null;
}
