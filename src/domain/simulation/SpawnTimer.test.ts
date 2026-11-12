import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '@/testing/random';
import { randomBetween } from '../random';
import { SpawnTimer } from './SpawnTimer';

function totalSpawns(timer: SpawnTimer, steps: number, dtSeconds: number, rate: number): number {
  let total = 0;
  for (let step = 0; step < steps; step += 1) {
    total += timer.consume(dtSeconds, rate);
  }
  return total;
}

describe('SpawnTimer', () => {
  it('releases one spawn after one second at one per second', () => {
    expect(new SpawnTimer().consume(1, 1)).toBe(1);
  });

  it('releases nothing before a whole spawn has accumulated', () => {
    const timer = new SpawnTimer();

    expect(timer.consume(0.4, 1)).toBe(0);
    expect(timer.consume(0.4, 1)).toBe(0);
    expect(timer.consume(0.4, 1)).toBe(1);
  });

  it('releases exactly 3 spawns over 60 frames at 3 per second', () => {
    expect(totalSpawns(new SpawnTimer(), 60, 1 / 60, 3)).toBe(3);
  });

  it.each([
    [1, 120],
    [1, 144],
    [2, 20],
    [2, 60],
    [3, 30],
    [10, 60],
    [20, 120],
    [20, 240],
  ])('releases exactly %i spawns in one second at %i steps per second', (rate, stepsPerSecond) => {
    expect(totalSpawns(new SpawnTimer(), stepsPerSecond, 1 / stepsPerSecond, rate)).toBe(rate);
  });

  it('releases one spawn per second over 60 frames at 1 per second, in the last frame', () => {
    const timer = new SpawnTimer();

    expect(totalSpawns(timer, 59, 1 / 60, 1)).toBe(0);
    expect(timer.consume(1 / 60, 1)).toBe(1);
  });

  it('carries fractional remainders between frames', () => {
    expect(totalSpawns(new SpawnTimer(), 4, 0.5, 2.5)).toBe(5);
  });

  it('releases several spawns when one step covers several intervals', () => {
    expect(new SpawnTimer().consume(1, 10)).toBe(10);
  });

  it('never accumulates while the rate is zero', () => {
    const timer = new SpawnTimer();

    expect(timer.consume(100, 0)).toBe(0);

    expect(timer.consume(0.5, 1)).toBe(0);
    expect(timer.consume(0.5, 1)).toBe(1);
  });

  it('picks up a rate change on the next step', () => {
    const timer = new SpawnTimer();

    expect(timer.consume(1, 1)).toBe(1);

    expect(timer.consume(1, 4)).toBe(4);
  });

  it('ignores zero, negative and NaN time steps', () => {
    const timer = new SpawnTimer();

    expect(timer.consume(0, 5)).toBe(0);
    expect(timer.consume(-1, 5)).toBe(0);
    expect(timer.consume(Number.NaN, 5)).toBe(0);
    expect(timer.consume(0.2, 5)).toBe(1);
  });

  it('ignores negative and NaN rates', () => {
    const timer = new SpawnTimer();

    expect(timer.consume(10, -3)).toBe(0);
    expect(timer.consume(10, Number.NaN)).toBe(0);
  });

  it('spawns at the requested average rate for irregular step times', () => {
    const random = createSeededRandom(21);
    const timer = new SpawnTimer();
    let elapsed = 0;
    let spawns = 0;

    for (let frame = 0; frame < 2_000; frame += 1) {
      const dt = randomBetween(random, 0.005, 0.045);
      elapsed += dt;
      spawns += timer.consume(dt, 7);
    }

    expect(Math.abs(spawns - 7 * elapsed)).toBeLessThan(1);
  });
});
