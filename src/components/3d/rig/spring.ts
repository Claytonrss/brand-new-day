/**
 * Critically damped spring (semi-implicit Euler).
 *
 * Used for pose transitions: unlike exponential smoothing, a spring carries
 * velocity, so a beat change reads as the body settling into a new posture
 * instead of sliding linearly.
 */
export class Spring {
  value: number;
  target: number;
  velocity = 0;

  constructor(
    initial = 0,
    private readonly stiffness = 12,
    /** 1 = critically damped (no overshoot). */
    private readonly damping = 1,
  ) {
    this.value = initial;
    this.target = initial;
  }

  /**
   * `delta` is clamped to 1/10 s: enough to keep the integrator stable for the
   * stiffness used here (semi-implicit Euler needs dt < 2/ω), while still
   * letting the pose settle on very slow devices instead of crawling.
   */
  step(delta: number): number {
    const dt = Math.min(delta, 1 / 10);
    const omega = this.stiffness;
    const acceleration =
      (this.target - this.value) * omega * omega - 2 * this.damping * omega * this.velocity;

    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;
    return this.value;
  }

  set(value: number): void {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }
}
