const ACCUMULATOR_TOLERANCE = 1e-9;

export class SpawnTimer {
  private accumulator = 0;

  consume(dtSeconds: number, ratePerSecond: number): number {
    if (!(ratePerSecond > 0 && dtSeconds > 0)) {
      return 0;
    }
    this.accumulator += dtSeconds * ratePerSecond;
    const whole = Math.floor(this.accumulator + ACCUMULATOR_TOLERANCE);
    this.accumulator = Math.max(0, this.accumulator - whole);
    return whole;
  }
}
