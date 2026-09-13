/**
 * Read a single-value query flag (`?name=value`).
 *
 * Returns `fallback` when the flag is absent, invalid, or `window` is
 * undefined (SSR/unit tests). Shared by `?fx` and `?blink`.
 */
export function readQueryMode<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof window === 'undefined') return fallback;
  const value = new URLSearchParams(window.location.search).get(name);
  return (allowed as readonly string[]).includes(value ?? '') ? (value as T) : fallback;
}
