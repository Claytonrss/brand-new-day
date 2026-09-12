import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBeat } from '../beat/beatContext';
import { CHEST_Y } from '../beat/beats';
import { ANCHORS } from '../rig/anchorStore';
import type { BeatState } from '../beat/beatState';
import type { BeatId } from '../beat/beats';
import { useQualityProfile } from '../qualityContext';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../../design/breakpoints';
import { COLORS } from '../../../design/tokens';
import { LIGHT_SLOTS, SWEEP, type LightSlot, type LightTarget } from './lightCues';
import { INTERACTION } from '../interaction/interactionStore';

/** Cross-fade rate between beats (exponential, frame-rate independent). */
const FADE_K = 6;

function smooth(delta: number): number {
  return 1 - Math.exp(-FADE_K * delta);
}

/**
 * Merge the slot base with the current beat's override.
 *
 * Pure over static slot/beat data, but called per slot per frame — the spread
 * used to allocate ~360 objects/s across the rig (FALHA-07a). One cache entry
 * per (slot, beat) pair, computed once.
 */
const targetCache = new Map<string, LightTarget>();

function targetFor(slot: LightSlot, beat: BeatId): LightTarget {
  const key = `${slot.id}:${beat}`;
  const cached = targetCache.get(key);
  if (cached) return cached;

  const override = slot.beats[beat];
  const target = override ? { ...slot.base, ...override } : slot.base;
  targetCache.set(key, target);
  return target;
}

/**
 * Beat 2 — "a luz atravessa o símbolo".
 * Preserves the behaviour of the previous `EvolutionScene`, now driven by
 * beat-local progress instead of a private ScrollTrigger.
 */
function evolutionSweep(t: number) {
  let intensity: number;

  if (t < SWEEP.start) {
    intensity = 0;
  } else if (t <= SWEEP.apex) {
    intensity = ((t - SWEEP.start) / (SWEEP.apex - SWEEP.start)) * SWEEP.maxIntensity;
  } else if (t <= SWEEP.end) {
    const k = (t - SWEEP.apex) / (SWEEP.end - SWEEP.apex);
    intensity = (1 - k) * SWEEP.maxIntensity + k * SWEEP.residualIntensity;
  } else {
    intensity = SWEEP.residualIntensity;
  }

  const sweepT = t <= SWEEP.start ? 0 : t >= SWEEP.end ? 1 : (t - SWEEP.start) / (SWEEP.end - SWEEP.start);

  return {
    intensity,
    x: THREE.MathUtils.lerp(-0.4, 0.4, sweepT),
    y: THREE.MathUtils.lerp(0.8, 0.6, sweepT),
    z: THREE.MathUtils.lerp(0.8, 0.7, sweepT),
    sweeping: t > SWEEP.start && t < SWEEP.end,
  };
}

interface SlotProps {
  slot: LightSlot;
  beat: BeatId;
  instant: boolean;
  shadows: boolean;
  isMobile: boolean;
  stateRef: RefObject<BeatState>;
}

function useFadedIntensity(
  ref: RefObject<THREE.Light | null>,
  slot: LightSlot,
  { beat, instant, isMobile }: Pick<SlotProps, 'beat' | 'instant' | 'isMobile'>,
  override?: number,
) {
  const targetColor = useMemo(() => new THREE.Color(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const light = ref.current;
    if (!light) return;

    const cue = targetFor(slot, beat);
    const goal = override ?? (isMobile ? cue.intensity.mobile : cue.intensity.desktop);
    const alpha = instant ? 1 : smooth(delta);

    light.intensity = THREE.MathUtils.lerp(light.intensity, goal, alpha);

    targetColor.set(COLORS[cue.color]);
    light.color.lerp(targetColor, alpha);

    if (cue.position) {
      // the accent slot follows the cursor a little (Wave D)
      const rimX = slot.id === 'accent' ? INTERACTION.rimX : 0;
      const rimY = slot.id === 'accent' ? INTERACTION.rimY : 0;
      targetPosition.set(cue.position[0] + rimX, cue.position[1] + rimY, cue.position[2]);
      light.position.lerp(targetPosition, alpha);
    }
  });
}

function AmbientSlot(props: SlotProps) {
  const ref = useRef<THREE.AmbientLight>(null);
  useFadedIntensity(ref, props.slot, props);
  return <ambientLight ref={ref} intensity={0} />;
}

function DirectionalSlot(props: SlotProps) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const { slot, shadows } = props;
  useFadedIntensity(ref, slot, props);

  return (
    <directionalLight
      ref={ref}
      intensity={0}
      castShadow={Boolean(slot.castShadow) && shadows}
      shadow-mapSize-width={slot.shadowMapSize ?? 512}
      shadow-mapSize-height={slot.shadowMapSize ?? 512}
      shadow-bias={-0.0005}
    />
  );
}

function PointSlot(props: SlotProps) {
  const ref = useRef<THREE.PointLight>(null);
  const { slot, beat } = props;
  useFadedIntensity(ref, slot, props);

  const cue = targetFor(slot, beat);

  return (
    <pointLight
      ref={ref}
      intensity={0}
      distance={cue.distance ?? 0}
      decay={cue.decay ?? 2}
      // Point-light shadows cost 6 render passes — forbidden by spec §5
      castShadow={false}
    />
  );
}

function SpotSlot(props: SlotProps) {
  const ref = useRef<THREE.SpotLight>(null);
  const { slot, beat, instant, isMobile, stateRef } = props;
  const aim = useMemo(() => new THREE.Object3D(), []);
  const chestY = ANCHORS.ready ? ANCHORS.chest.y : isMobile ? CHEST_Y.mobile : CHEST_Y.desktop;

  useEffect(() => {
    if (ref.current) ref.current.target = aim;
  }, [aim]);

  useFrame((_, delta) => {
    const light = ref.current;
    if (!light) return;

    const state = evolutionSweep(stateRef.current?.t ?? 0);
    const active = beat === 'evolution';
    const goal = active ? state.intensity : 0;

    light.intensity = instant ? goal : THREE.MathUtils.lerp(light.intensity, goal, smooth(delta));

    if (active && state.sweeping) {
      light.position.set(state.x, chestY + state.y, state.z);
    } else if (active) {
      light.position.set(-0.4, chestY + 0.8, 0.8);
    }

    aim.position.set(0, chestY, 0);
  });

  return (
    <>
      <primitive object={aim} />
      <spotLight
        ref={ref}
        intensity={0}
        position={[-0.4, chestY + 0.8, 0.8]}
        angle={slot.angle}
        penumbra={slot.penumbra}
        distance={3}
        decay={1.5}
        // Single shadow caster policy: the directional key owns shadows
        castShadow={false}
      />
    </>
  );
}

/**
 * LightRig — beat-scoped lighting on a fixed set of light slots.
 *
 * Replaces the four permanently mounted scenes (`HeroScene`, `EvolutionScene`,
 * `ArsenalScene`, `FullBodyScene`), which kept ~10 lights and 3 shadow casters
 * alive at every scroll position.
 *
 * Six slots exist for the whole session; beats only change intensity,
 * position and colour. Mounting/unmounting lights would recompile shader
 * programs (measured: 200–600ms stalls mid-scroll), so it is avoided by
 * design. Shadow casting is limited to the directional key — one extra render
 * pass instead of three.
 *
 * @see docs/specs/headroom-lighting.md §5
 */
export function LightRig() {
  const { beat, stateRef } = useBeat();
  const profile = useQualityProfile();
  const { size } = useThree();
  const isMobile = size.width < BREAKPOINTS.MOBILE;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const props: SlotProps = {
    beat,
    instant: prefersReducedMotion,
    shadows: profile.shadows,
    isMobile,
    stateRef,
    slot: LIGHT_SLOTS[0],
  };

  return (
    <>
      {LIGHT_SLOTS.map((slot) => {
        const slotProps = { ...props, slot };
        switch (slot.kind) {
          case 'ambient':
            return <AmbientSlot key={slot.id} {...slotProps} />;
          case 'directional':
            return <DirectionalSlot key={slot.id} {...slotProps} />;
          case 'point':
            return <PointSlot key={slot.id} {...slotProps} />;
          case 'spot':
            return <SpotSlot key={slot.id} {...slotProps} />;
          default:
            return null;
        }
      })}
    </>
  );
}
