import { describe, expect, it, vi } from 'vitest';
import { arsenalReveal } from '../../src/components/3d/interaction/arsenalReveal';

// Module singleton, so the assertions run in one deterministic sequence:
// each expectation depends on the state left by the previous one.
describe('arsenalReveal', () => {
  it('notifies subscribers on changes only, and reveals once per session', () => {
    const listener = vi.fn();
    const unsubscribe = arsenalReveal.subscribe(listener);

    expect(arsenalReveal.revealed).toBe(false);
    expect(arsenalReveal.gestureCapable).toBe(false);

    arsenalReveal.setGestureCapable(true);
    expect(listener).toHaveBeenCalledTimes(1);
    arsenalReveal.setGestureCapable(true);
    expect(listener).toHaveBeenCalledTimes(1); // no change → no notify

    arsenalReveal.reveal();
    expect(arsenalReveal.revealed).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    arsenalReveal.reveal();
    expect(listener).toHaveBeenCalledTimes(2); // idempotent — first reveal wins

    unsubscribe();
    arsenalReveal.setGestureCapable(false);
    expect(listener).toHaveBeenCalledTimes(2); // unsubscribed → silent
  });
});
