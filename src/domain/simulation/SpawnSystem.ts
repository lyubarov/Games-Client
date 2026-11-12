import { EDGE_CLEARANCE_PX } from '../constants';
import { randomBetween, type RandomSource } from '../random';
import type { Shape } from '../shapes/Shape';
import type { ShapeFactory } from '../shapes/ShapeFactory';
import { SpawnTimer } from './SpawnTimer';
import type { SimulationSettings, System } from './System';
import type { World } from './World';

export class SpawnSystem implements System {
  private readonly timer = new SpawnTimer();

  constructor(
    private readonly world: World,
    private readonly factory: ShapeFactory,
    private readonly random: RandomSource,
    private readonly settings: Readonly<Pick<SimulationSettings, 'spawnRate'>>,
  ) {}

  update(dtSeconds: number): void {
    const due = this.timer.consume(dtSeconds, this.settings.spawnRate);
    for (let spawned = 0; spawned < due && !this.world.isFull; spawned += 1) {
      const shape = this.factory.createFromCatalog(this.world.size);
      this.world.spawn(shape, this.randomX(shape), -shape.maxY - EDGE_CLEARANCE_PX);
    }
  }

  private randomX(shape: Shape): number {
    const lowest = -shape.minX;
    const highest = this.world.size.width - shape.maxX;
    if (highest > lowest) {
      return randomBetween(this.random, lowest, highest);
    }
    return (this.world.size.width - (shape.minX + shape.maxX)) / 2;
  }
}
