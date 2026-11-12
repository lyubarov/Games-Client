import { outlineBounds, polygonArea } from '../geometry/measure';
import type { Bounds, Vec2 } from '../geometry/types';
import { ShapeDefinition, type ShapeSink } from './ShapeDefinition';

export class PolygonDefinition extends ShapeDefinition {
  readonly unitArea: number;

  constructor(
    private readonly outline: readonly Vec2[],
    readonly isShared = true,
  ) {
    super();
    this.unitArea = polygonArea(outline);
  }

  unitBounds(rotation: number): Bounds {
    return outlineBounds(this.outline, rotation);
  }

  describe(sink: ShapeSink): void {
    sink.polygon(this.outline);
  }
}
