import { EDGE_CLEARANCE_PX } from '../constants';
import type { System } from './System';
import type { World } from './World';

export class CullSystem implements System {
  constructor(private readonly world: World) {}

  update(): void {
    const removalLine = this.world.size.height + EDGE_CLEARANCE_PX;
    for (const falling of this.world.shapes.values()) {
      if (falling.y + falling.shape.minY >= removalLine) {
        this.world.remove(falling.id);
      }
    }
  }
}
