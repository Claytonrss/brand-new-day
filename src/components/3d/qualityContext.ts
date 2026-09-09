import { createContext, useContext } from 'react';

/**
 * Quality tier — aligns with docs/design/quality-matrix.md.
 *
 * - Desktop High: wide viewport + stable FPS → full pipeline
 * - Mobile Good: narrow viewport + FPS ≥ 45 → simplified but complete
 * - Mobile Low: FPS < 30 OR prefers-reduced-motion → minimal but beautiful
 */
export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityProfile {
  tier: QualityTier;
  dpr: number;
  shadows: boolean;
  particles: boolean;
  bloom: boolean;
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    tier: 'high',
    dpr: 2,
    shadows: true,
    particles: true,
    bloom: true,
  },
  medium: {
    tier: 'medium',
    dpr: 1.5,
    shadows: true,
    particles: true,
    bloom: true,
  },
  low: {
    tier: 'low',
    dpr: 1,
    shadows: false,
    particles: false,
    bloom: false,
  },
} as const;

export const QualityContext = createContext<QualityProfile>(QUALITY_PROFILES.high);

/**
 * Consume the current quality profile (set by PerformanceMonitor).
 * Falls back to 'high' if used outside the provider.
 */
export function useQualityProfile(): QualityProfile {
  return useContext(QualityContext);
}
