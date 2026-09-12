/**
 * True while the cinematic loader covers the viewport.
 *
 * Module-level on purpose: the only reader is the PerformanceMonitor
 * degradation tick, which runs outside the loader's React subtree at 1 Hz and
 * must never trigger a render. `CinematicLoader` sets it while mounted —
 * its unmount (load complete) clears it.
 */
export const loaderCover = { covering: true };
