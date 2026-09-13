import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ANCHORS } from './rig/anchorStore';
import { spiderSense } from './rig/spiderSense';

/**
 * SenseAnchor — projects the head anchor to screen space while the
 * spider-sense rings, publishing `--sense-x/--sense-y` for the DOM halo
 * (`SpiderSense.tsx`).
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

  useFrame(({ camera }) => {
    if (spiderSense.envelope <= 0.001 || !ANCHORS.ready) return;

    scratch.copy(ANCHORS.head).project(camera);
    // Comic convention: when the head is out of frame (Evolution chest
    // close-up, Arsenal wrist macro) the tingle pokes in from the nearest
    // edge instead of being invisible — clamp the halo centre to the viewport.
    const pad = 130;
    const x = THREE.MathUtils.clamp((scratch.x * 0.5 + 0.5) * size.width, pad, size.width - pad);
    const y = THREE.MathUtils.clamp((-scratch.y * 0.5 + 0.5) * size.height, pad, size.height - pad);

    const root = document.documentElement;
    root.style.setProperty('--sense-x', `${Math.round(x)}px`);
    root.style.setProperty('--sense-y', `${Math.round(y)}px`);
  });

  return null;
}
