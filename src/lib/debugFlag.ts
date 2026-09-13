/**
 * Shared read of the `?debug` probe flag.
 *
 * Presence-based on purpose (`?debug` and `?debug=1` both enable): PerfHud and
 * Stage used to require `=1` while every other probe used presence — one flag,
 * two behaviors. Presence wins as the simpler contract.
 */
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('debug');
}
