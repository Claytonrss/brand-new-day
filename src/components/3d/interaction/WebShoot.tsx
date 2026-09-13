import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../../../design/tokens';
import { INTERACTION } from './interactionStore';
import { webStrandPoints } from './pointerMath';

/** Lifetime of a strand (seconds). */
const SHOT_LIFE = 0.7;

/** How much of the lifetime is spent extending. */
const EXTEND_FRACTION = 0.35;

/**
 * WebShoot — a web strand fired from the wrist during the Arsenal beat.
 *
 * A single reusable `THREE.Line` (one draw call) instead of an object pool:
 * only one strand is ever alive, and the geometry is rewritten in place.
 *
 * @see docs/specs/model-interaction.md §7.4
 */
export function WebShoot() {
  const progressRef = useRef(0);
  const lastShotRef = useRef(0);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const tip = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    // 12 segments + the moving tip
    buffer.setAttribute('position', new THREE.BufferAttribute(new Float32Array(13 * 3), 3));
    return buffer;
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(COLORS.paper),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );

  // Created imperatively: the JSX <line> tag is typed as the SVG element.
  const line = useMemo(() => {
    const object = new THREE.Line(geometry, material);
    object.visible = false;
    object.frustumCulled = false;
    return object;
  }, [geometry, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    // a new shot restarts the animation
    if (INTERACTION.shotId !== lastShotRef.current) {
      lastShotRef.current = INTERACTION.shotId;
      progressRef.current = 0;
      origin.copy(INTERACTION.shotFrom);
      tip.copy(INTERACTION.shotTo);
    }

    if (progressRef.current >= 1) {
      material.opacity = 0;
      line.visible = false;
      return;
    }

    progressRef.current = Math.min(progressRef.current + delta / SHOT_LIFE, 1);
    const progress = progressRef.current;

    // extension is fast, retraction is instant after the fade starts
    const reach = Math.min(progress / EXTEND_FRACTION, 1);
    tip.copy(origin).lerp(INTERACTION.shotTo, reach);

    const points = webStrandPoints(origin, tip, 12, 0.22);

    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < points.length; i++) {
      attribute.setXYZ(i, points[i].x, points[i].y, points[i].z);
    }
    attribute.needsUpdate = true;
    geometry.computeBoundingSphere();

    // fade out over the second half of the lifetime
    material.opacity =
      progress < EXTEND_FRACTION
        ? 0.9
        : 0.9 * (1 - (progress - EXTEND_FRACTION) / (1 - EXTEND_FRACTION));
    line.visible = true;
  });

  return <primitive object={line} />;
}
