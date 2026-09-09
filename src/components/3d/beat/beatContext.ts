import { createContext, useContext, type RefObject } from 'react';
import { INITIAL_BEAT_STATE, type BeatState } from './beatState';
import type { BeatId } from './beats';

export interface BeatContextValue {
  /** Current beat id — triggers a React render only when the beat changes. */
  beat: BeatId;
  /**
   * Mutable per-frame state. Read it inside `useFrame`; never drive renders
   * from it.
   */
  stateRef: RefObject<BeatState>;
}

export const BeatContext = createContext<BeatContextValue>({
  beat: 'hero',
  stateRef: { current: INITIAL_BEAT_STATE },
});

/** Subscribe to beat changes (re-renders only when the beat id changes). */
export function useBeat(): BeatContextValue {
  return useContext(BeatContext);
}
