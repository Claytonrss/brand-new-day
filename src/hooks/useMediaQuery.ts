import { useEffect, useState } from 'react';

/**
 * React hook that tracks a CSS media query.
 * Returns `true` when the query matches, `false` otherwise.
 * SSR-safe: defaults to `false` and syncs on mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
