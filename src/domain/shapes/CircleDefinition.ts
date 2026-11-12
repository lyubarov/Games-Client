import type { Bounds } from '../geometry/types';
import { ShapeDefinition, type ShapeSink } from './ShapeDefinition';

const UNIT_BOUNDS: Bounds = { minX: -1, maxX: 1, minY: -1, maxY: 1 };

export class CircleDefinition extends ShapeDefinition {
  readonly isShared = true;
  readonly unitArea = Math.PI;

  unitBounds(): Bounds {
    return UNIT_BOUNDS;
  }

  describe(sink: ShapeSink): void {
    sink.circle(1);
  }
}
