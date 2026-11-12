import {
  computeStats,
  MAX_FRAME_MS,
  METRIC_IDS,
  type FallingShape,
  type ShapeFactory,
  type ShapeId,
  type SimulationSettings,
  type Size,
  type Stats,
  type System,
  type World,
} from '@/domain';
import { clamp } from '@/shared/clamp';
import { Store } from '@/shared/Store';
import { PARAMETERS, type ParameterId } from './parameters';
import type { AdjustDirection, GameState, GameStore, ParameterState, Simulation } from './ports';

const MS_PER_SECOND = 1000;
const DIRECTION_SIGN = { increase: 1, decrease: -1 } as const;

function parameterState(id: ParameterId, value: number): ParameterState {
  const { min, max } = PARAMETERS[id];
  return { value, canIncrease: value < max, canDecrease: value > min };
}

function parameterStates(settings: SimulationSettings): GameState['parameters'] {
  return {
    spawnRate: parameterState('spawnRate', settings.spawnRate),
    gravity: parameterState('gravity', settings.gravity),
  };
}

export class GameSession implements Simulation, GameStore {
  readonly getSnapshot: () => GameState;
  readonly subscribe: (listener: () => void) => () => void;
  private readonly state: Store<GameState>;
  private readonly stats: Stats = { shapeCount: 0, totalArea: 0 };

  constructor(
    private readonly world: World,
    private readonly systems: readonly System[],
    private readonly settings: SimulationSettings,
    private readonly factory: ShapeFactory,
  ) {
    computeStats(world.shapes, world.size, this.stats);
    this.state = new Store({ metrics: { ...this.stats }, parameters: parameterStates(settings) });
    this.getSnapshot = this.state.getSnapshot;
    this.subscribe = this.state.subscribe;
  }

  get shapes(): ReadonlyMap<ShapeId, FallingShape> {
    return this.world.shapes;
  }

  advance(elapsedMs: number): void {
    if (!(elapsedMs > 0)) {
      return;
    }
    const dtSeconds = Math.min(elapsedMs, MAX_FRAME_MS) / MS_PER_SECOND;
    for (const system of this.systems) {
      system.update(dtSeconds);
    }
    this.publishMetrics();
  }

  resize(size: Size): void {
    if (size.width > 0 && size.height > 0) {
      this.world.resize(size);
      this.publishMetrics();
    }
  }

  spawnAt(x: number, y: number): void {
    if (!this.world.isFull) {
      this.world.spawn(this.factory.createIrregular(this.world.size), x, y);
      this.publishMetrics();
    }
  }

  removeShape(id: ShapeId): void {
    if (this.world.remove(id)) {
      this.publishMetrics();
    }
  }

  onSpawned(listener: (falling: Readonly<FallingShape>) => void): () => void {
    return this.world.onSpawned(listener);
  }

  onRemoved(listener: (falling: Readonly<FallingShape>) => void): () => void {
    return this.world.onRemoved(listener);
  }

  readonly adjust = (parameter: ParameterId, direction: AdjustDirection): void => {
    const { min, max, step } = PARAMETERS[parameter];
    const current = this.settings[parameter];
    const next = clamp(current + DIRECTION_SIGN[direction] * step, min, max);
    if (next !== current) {
      this.settings[parameter] = next;
      this.state.set({
        metrics: this.state.getSnapshot().metrics,
        parameters: parameterStates(this.settings),
      });
    }
  };

  private publishMetrics(): void {
    computeStats(this.world.shapes, this.world.size, this.stats);
    const { metrics, parameters } = this.state.getSnapshot();
    for (const id of METRIC_IDS) {
      if (metrics[id] !== this.stats[id]) {
        this.state.set({ metrics: { ...this.stats }, parameters });
        return;
      }
    }
  }
}
