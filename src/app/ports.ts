import type { FallingShape, ShapeId, Size, Stats } from '@/domain';
import type { ParameterId } from './parameters';

export type AdjustDirection = 'increase' | 'decrease';

export interface ParameterState {
  readonly value: number;
  readonly canIncrease: boolean;
  readonly canDecrease: boolean;
}

export interface GameState {
  readonly metrics: Readonly<Stats>;
  readonly parameters: Readonly<Record<ParameterId, ParameterState>>;
}

export interface Simulation {
  readonly shapes: ReadonlyMap<ShapeId, Readonly<FallingShape>>;
  advance(elapsedMs: number): void;
  resize(size: Size): void;
  spawnAt(x: number, y: number): void;
  removeShape(id: ShapeId): void;
  onSpawned(listener: (falling: Readonly<FallingShape>) => void): () => void;
  onRemoved(listener: (falling: Readonly<FallingShape>) => void): () => void;
}

export interface GameStore {
  readonly getSnapshot: () => GameState;
  readonly subscribe: (listener: () => void) => () => void;
  readonly adjust: (parameter: ParameterId, direction: AdjustDirection) => void;
}

export interface GameServices {
  readonly simulation: Simulation;
  readonly store: GameStore;
}
