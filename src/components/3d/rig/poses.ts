import type { BeatId } from '../beat/beats';
import type { BoneRole } from './rigBones';
import { LANDING_POSE } from '../landing';

/**
 * Additive pose offsets per beat, in radians (x, y, z).
 *
 * Amplitudes are deliberately conservative: the asset's rest pose is unknown
 * until visual validation, and crossed geometry is much worse than a subtle
 * pose. `POSE_AMPLITUDE` can be dialled to 0 without touching the rest of the
 * rig if a look review rejects the layer.
 *
 * @see docs/specs/procedural-rig-motion.md §7.3
 */
export const POSE_AMPLITUDE = 1;

export const BEAT_POSES: Record<BeatId, Partial<Record<BoneRole, readonly [number, number, number]>>> =
  {
    // guarda neutra: ombros assentados, cotovelos levemente flexionados
    hero: {
      shoulderL: [0, 0, 0.03],
      shoulderR: [0, 0, -0.03],
      foreArmL: [0, 0.1, 0],
      foreArmR: [0, 0.1, 0],
      head: [0, 0.02, 0],
    },
    // peito aberto: a luz atravessa o símbolo
    evolution: {
      spine2: [-0.03, 0, 0],
      shoulderL: [-0.05, 0, 0.02],
      shoulderR: [-0.05, 0, -0.02],
      foreArmL: [0, 0.06, 0],
      foreArmR: [0, 0.06, 0],
    },
    // punho elevado rumo à câmera.
    // The camera sits below the wrist (the web-shooter is on the underside of
    // the forearm), so the elbow flexes ~63° (measured: raises the hand ~0.6
    // world units and leaves the forearm roughly horizontal).
    arsenal: {
      shoulderR: [-0.08, 0, -0.05],
      armR: [0, 0, -0.2],
      foreArmR: [-1.1, 0, 0],
      handR: [-0.3, 0, 0],
      foreArmL: [0, 0.08, 0],
      head: [0, 0.12, 0.03],
    },
    // poster: coluna ereta, braços soltos, cabeça nível
    fullBody: {
      spine2: [-0.02, 0, 0],
      shoulderL: [-0.04, 0, 0.06],
      shoulderR: [-0.04, 0, -0.06],
      foreArmL: [0, 0.05, 0],
      foreArmR: [0, 0.05, 0],
      head: [0, 0, 0],
    },
    // colofon: memória residual — pose relaxada, sem gesto
    colophon: {
      spine2: [-0.01, 0, 0],
      shoulderL: [0, 0, 0.04],
      shoulderR: [0, 0, -0.04],
      foreArmL: [0, 0.06, 0],
      foreArmR: [0, 0.06, 0],
      head: [0, 0, 0],
    },
    // chapter cards mantêm a pose do beat anterior (transição tipográfica)
    chapter1: {
      shoulderL: [0, 0, 0.03],
      shoulderR: [0, 0, -0.03],
      foreArmL: [0, 0.1, 0],
      foreArmR: [0, 0.1, 0],
    },
    chapter2: {
      spine2: [-0.03, 0, 0],
      shoulderL: [-0.05, 0, 0.02],
      shoulderR: [-0.05, 0, -0.02],
    },
  };

/** Union of every role used by any pose — used to size the spring set.
 *  Includes the arrival-landing roles (docs/specs/arrival-landing.md §5). */
export const POSE_ROLES: readonly BoneRole[] = Array.from(
  new Set([
    ...Object.values(BEAT_POSES).flatMap((pose) => Object.keys(pose) as BoneRole[]),
    ...(Object.keys(LANDING_POSE) as BoneRole[]),
  ]),
);
