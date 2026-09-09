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
  bloom: {
    intensity: number;
    luminanceThreshold: number;
    enabled: boolean;
  };
  vignette: {
    darkness: number;
    enabled: boolean;
  };
  noise: {
    opacity: number;
    enabled: boolean;
  };
  multisampling: number;
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    tier: 'high',
    // 1.75 keeps retina sharpness while freeing ~23% of the pixels of dpr 2
    dpr: 1.75,
    shadows: true,
    particles: true,
    bloom: { intensity: 0.85, luminanceThreshold: 0.8, enabled: true },
    vignette: { darkness: 0.6, enabled: true },
    noise: { opacity: 0.032, enabled: true },
    multisampling: 4,
  },
  medium: {
    tier: 'medium',
    dpr: 1.25,
    shadows: true,
    particles: true,
    bloom: { intensity: 0.45, luminanceThreshold: 0.9, enabled: true },
    vignette: { darkness: 0.45, enabled: true },
    noise: { opacity: 0, enabled: false },
    multisampling: 0,
  },
  low: {
    tier: 'low',
    dpr: 1,
    shadows: false,
    particles: false,
    bloom: { intensity: 0, luminanceThreshold: 1, enabled: false },
    vignette: { darkness: 0.3, enabled: true },
    noise: { opacity: 0, enabled: false },
    multisampling: 0,
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
