import { describe, expect, it, vi } from 'vitest';
import { arsenalReveal } from '@/components/3d/interaction/arsenalReveal';

// Module singleton, so the assertions run in one deterministic sequence:
// each expectation depends on the state left by the previous one.
describe('arsenalReveal', () => {
  it('starts indeterminate, notifies on changes only, and reveals once per session', () => {
    const listener = vi.fn();
    const unsubscribe = arsenalReveal.subscribe(listener);

    expect(arsenalReveal.revealed).toBe(false);
    // ADR-028: null until WebShootHint mounts. Consumers must read it as
    // indeterminate — `false` would route the overlay to the scroll-driven
    // reveal while the canvas (and the gate) is still loading.
    expect(arsenalReveal.gestureCapable).toBeNull();

    arsenalReveal.setGestureCapable(true);
    expect(listener).toHaveBeenCalledTimes(1);
    arsenalReveal.setGestureCapable(true);
    expect(listener).toHaveBeenCalledTimes(1);

    arsenalReveal.reveal();
    expect(arsenalReveal.revealed).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    arsenalReveal.reveal();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    arsenalReveal.setGestureCapable(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
