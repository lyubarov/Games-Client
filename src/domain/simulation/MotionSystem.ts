import type { SimulationSettings, System } from './System';
import type { World } from './World';

export class MotionSystem implements System {
  constructor(
    private readonly world: World,
    private readonly settings: Readonly<Pick<SimulationSettings, 'gravity'>>,
  ) {}

  update(dtSeconds: number): void {
    const { gravity } = this.settings;
    for (const falling of this.world.shapes.values()) {
      falling.y += falling.velocityY * dtSeconds + (gravity * dtSeconds * dtSeconds) / 2;
      falling.velocityY += gravity * dtSeconds;
    }
  }
}
