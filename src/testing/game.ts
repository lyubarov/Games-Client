import {
  createGame,
  type AdjustDirection,
  type GameServices,
  type GameStore,
  type ParameterId,
  type Simulation,
} from '@/app';
import type { FallingShape } from '@/domain';
import { createSeededRandom } from './random';

export function createSeededGame(seed = 1): GameServices {
  return createGame(createSeededRandom(seed));
}

export function onlyShape(simulation: Simulation): Readonly<FallingShape> {
  const [first, ...others] = simulation.shapes.values();
  if (first === undefined || others.length > 0) {
    throw new Error(`Expected exactly one shape but found ${String(simulation.shapes.size)}`);
  }
  return first;
}

export function allShapes(simulation: Simulation): Readonly<FallingShape>[] {
  return [...simulation.shapes.values()];
}

export function runFrames(simulation: Simulation, frames: number, frameMs = 50): void {
  for (let frame = 0; frame < frames; frame += 1) {
    simulation.advance(frameMs);
  }
}

export function adjustTimes(
  store: GameStore,
  parameter: ParameterId,
  direction: AdjustDirection,
  times: number,
): void {
  for (let count = 0; count < times; count += 1) {
    store.adjust(parameter, direction);
  }
}

export function setSpawnRate(store: GameStore, rate: number): void {
  const current = store.getSnapshot().parameters.spawnRate.value;
  adjustTimes(
    store,
    'spawnRate',
    rate > current ? 'increase' : 'decrease',
    Math.abs(rate - current),
  );
}
