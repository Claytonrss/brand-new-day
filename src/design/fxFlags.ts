/**
 * Authorial FX intensity modes (Wave C).
 *
 * `?fx=off`    — no shader layer, no DOF/CA (Wave B baseline)
 * `?fx=subtle` — conservative layer, no DOF (default until visual review)
 * `?fx=full`   — full layer + depth of field + chromatic aberration
 *
 * Exists because the material/DOF layer changes the read of the silhouette and
 * needs a human A/B before it becomes the default.
 */
export type FxMode = 'off' | 'subtle' | 'full';

function readMode(): FxMode {
  if (typeof window === 'undefined') return 'subtle';
  const value = new URLSearchParams(window.location.search).get('fx');
  return value === 'off' || value === 'full' ? value : 'subtle';
}

export const FX_MODE: FxMode = readMode();

/** Multiplier applied to every per-beat material target. */
export const FX_STRENGTH: Record<FxMode, number> = {
  off: 0,
  // Lowered after visual review: the first pass read as too bright / too metallic
  subtle: 0.22,
  full: 0.6,
};

/** Depth of field and chromatic aberration only exist in `full`. */
export const FX_POST_ENABLED = FX_MODE === 'full';
