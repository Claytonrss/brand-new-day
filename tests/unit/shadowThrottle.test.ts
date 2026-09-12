import { describe, expect, it } from 'vitest';
import {
  createShadowThrottleState,
  shouldRefreshShadow,
  SHADOW_IDLE_VELOCITY,
  SHADOW_INTERVAL_S,
  SHADOW_MOVE_EPSILON,
  type ShadowInputs,
} from '../../src/components/3d/shadowThrottle';

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

  it('refreshes when drag/gyro rotation exceeds the epsilon', () => {
    const state = throttle();
    expect(shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON * 2 }, 0.001)).toBe(true);
    expect(shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON * 3 }, 0.001)).toBe(false);
    expect(
      shouldRefreshShadow(state, { ...REST, pitch: SHADOW_MOVE_EPSILON * 2 }, 0.001),
    ).toBe(true);
  });

  it('ignores sub-epsilon jitter (gyro noise keeps the valley)', () => {
    const state = throttle();
    expect(shouldRefreshShadow(state, { ...REST, yaw: SHADOW_MOVE_EPSILON / 2 }, 0.001)).toBe(
      false,
    );
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
