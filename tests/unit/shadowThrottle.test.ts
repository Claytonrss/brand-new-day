import { describe, expect, it } from 'vitest';
import {
  createShadowThrottleState,
  shouldRefreshShadow,
  SHADOW_IDLE_VELOCITY,
  SHADOW_INTERVAL_S,
  SHADOW_MOVE_EPSILON,
  type ShadowInputs,
} from '@/components/3d/perf/shadowThrottle';

const REST: ShadowInputs = {
  beat: 'hero',
  dragging: false,
  yaw: 0,
  pitch: 0,
  velocity: 0,
};

function throttle() {
  return createShadowThrottleState('hero');
}

/**
 * FALHA-04 guardrails — the shadow pass is skipped per frame on medium, so
 * the refresh triggers must be exhaustive: anything that moves the pose or
 * the framing has to produce an immediate refresh, and rest decays to the
 * 10 Hz heartbeat.
 */
describe('shouldRefreshShadow', () => {
  it('does not refresh before the heartbeat elapses on rest', () => {
    const state = throttle();
    const half = SHADOW_INTERVAL_S / 2;
    expect(shouldRefreshShadow(state, REST, half)).toBe(false);
    expect(shouldRefreshShadow(state, REST, half)).toBe(true);
  });

  it('refreshes immediately on a beat change, once', () => {
    const state = throttle();
    expect(shouldRefreshShadow(state, { ...REST, beat: 'evolution' }, 0.001)).toBe(true);
    expect(shouldRefreshShadow(state, { ...REST, beat: 'evolution' }, 0.001)).toBe(false);
  });

  it('refreshes every frame while dragging and once on release', () => {
    const state = throttle();
    const dragging = { ...REST, dragging: true };
    expect(shouldRefreshShadow(state, dragging, 0.001)).toBe(true);
    expect(shouldRefreshShadow(state, dragging, 0.001)).toBe(true);
    // Release: one final refresh even with the pose frozen.
    expect(shouldRefreshShadow(state, REST, 0.001)).toBe(true);
    expect(shouldRefreshShadow(state, REST, 0.001)).toBe(false);
  });

  it('refreshes when rotation exceeds the epsilon from the last-refresh pose (hysteresis)', () => {
    const state = throttle();
    expect(shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON * 2 }, 0.001)).toBe(true);
    // The baseline advanced to 2ε on the refresh: another +1ε is sub-epsilon.
    expect(shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON * 3 }, 0.001)).toBe(
      false,
    );
    expect(shouldRefreshShadow(state, { ...REST, pitch: SHADOW_MOVE_EPSILON * 2 }, 0.001)).toBe(
      true,
    );
  });

  it('does not refresh on consecutive sub-epsilon drift (gyro noise keeps the valley)', () => {
    // The honest invariant: bounded noise costs exactly the heartbeat-only
    // count of a resting model — compared against the same frame count so no
    // floating-point cadence assumption sneaks in.
    const runFrames = (yawAt: (frame: number) => number) => {
      const state = throttle();
      let refreshes = 0;
      for (let frame = 0; frame < 120; frame++) {
        if (shouldRefreshShadow(state, { ...REST, yaw: yawAt(frame) }, 1 / 120)) refreshes += 1;
      }
      return refreshes;
    };
    const resting = runFrames(() => 0);
    const noisy = runFrames((frame) => (frame % 2 === 0 ? SHADOW_MOVE_EPSILON * 0.8 : 0));
    expect(noisy).toBe(resting);
  });

  it('advances the hysteresis baseline on heartbeat refresh', () => {
    const state = throttle();
    // Run past the first heartbeat (14 × 1/120 s clears 0.1 s even with
    // float accumulation) at pose 0.8ε.
    for (let frame = 0; frame < 14; frame++) {
      shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON * 0.8 }, 1 / 120);
    }
    // From the advanced baseline (0.8ε), +0.5ε more is sub-epsilon — a stale
    // baseline at 0 would read 1.3ε and refresh.
    expect(shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON * 1.3 }, 0.001)).toBe(
      false,
    );
  });

  it('uses the hysteresis epsilon of 0.005 rad (ADR-031)', () => {
    expect(SHADOW_MOVE_EPSILON).toBe(0.005);
  });

  it('refreshes once when the scroll velocity crosses into idle (fling end)', () => {
    const state = throttle();
    const moving = { ...REST, velocity: 0.5 };
    expect(shouldRefreshShadow(state, moving, 0.001)).toBe(false);

    const settling = { ...REST, velocity: SHADOW_IDLE_VELOCITY / 2 };
    expect(shouldRefreshShadow(state, settling, 0.001)).toBe(true);
    expect(shouldRefreshShadow(state, settling, 0.001)).toBe(false);
  });

  it('never mutates the inputs', () => {
    const state = throttle();
    const inputs: ShadowInputs = { beat: 'arsenal', dragging: true, yaw: 1, pitch: 1, velocity: 1 };
    const snapshot = { ...inputs };
    shouldRefreshShadow(state, inputs, 0.001);
    expect(inputs).toEqual(snapshot);
  });
});
