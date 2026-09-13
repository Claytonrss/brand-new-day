/**
 * Session-scoped state of the Arsenal annotation reveal.
 *
 * The macro HUD is gesture-gated: the first valid tap during Beat 3 fires the
 * web shot *and* reveals the HUD (cause → effect). Without a tap, the overlay
 * reveals it itself near the end of the section.
 *
 * Module-level on purpose, same pattern as `interactionStore`/`loaderCover`:
 * the writer (`useInteraction`) lives in the pointer pipeline and the readers
 * span the 3D/DOM boundary (`WebShootHint`, `ArsenalOverlay`), where React
 * state would either re-render per event or be unreachable across the canvas.
 *
 * `gestureCapable` mirrors the hint's own gate (`!reduceMotion && tier !==
 * 'low'`), published by `WebShootHint` — the only place where the quality
 * tier is known, since `QualityContext` is provided inside the canvas only.
 * Consumers outside (the DOM overlay) fall back to the scroll-driven reveal
 * when it is false.
 */
export interface ArsenalRevealState {
  /** True once the HUD has been revealed this session — first reveal wins. */
  revealed: boolean;
  /** True when the visitor can see the ring and fire the shot. */
  gestureCapable: boolean;
}

const state: ArsenalRevealState = {
  revealed: false,
  gestureCapable: false,
};

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export const arsenalReveal = {
  /** Idempotent: revealing twice in a session changes nothing. */
  reveal(): void {
    if (state.revealed) return;
    state.revealed = true;
    notify();
  },

  setGestureCapable(capable: boolean): void {
    if (state.gestureCapable === capable) return;
    state.gestureCapable = capable;
    notify();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  get revealed(): boolean {
    return state.revealed;
  },

  get gestureCapable(): boolean {
    return state.gestureCapable;
  },
};
