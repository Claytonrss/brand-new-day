/**
 * Window probe globals consumed by the visual specs (`?debug` instrumentation
 * published by the 3D layer). The runtime declarations live next to their
 * publishers; this file makes them visible to the tests typecheck project,
 * which compiles independently of `src`.
 */
import type { RigDebugState } from '@/components/3d/rig/useProceduralRig';
import type { FxDebugState } from '@/components/3d/materials/MaterialFxDriver';
import type { InteractionDebugState } from '@/components/3d/interaction/useInteraction';
import type { PerfSnapshot } from '@/components/3d/perf/PerfProbe';

declare global {
  interface Window {
    __rig?: RigDebugState;
    __landing?: { fired: boolean; fireCount: number; offset: number; flex: number; kick: number };
    __fx?: FxDebugState;
    __interaction?: InteractionDebugState;
    __perf?: PerfSnapshot;
  }
}

export {};
