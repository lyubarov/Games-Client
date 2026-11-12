import type { Bounds, Vec2 } from '../geometry/types';

export interface ShapeSink {
  polygon(points: readonly Vec2[]): void;
  circle(radius: number): void;
  ellipse(radiusX: number, radiusY: number): void;
}

export abstract class ShapeDefinition {
  abstract readonly isShared: boolean;
  abstract readonly unitArea: number;
  abstract unitBounds(rotation: number): Bounds;
  abstract describe(sink: ShapeSink): void;

  areaAt(size: number): number {
    return this.unitArea * size * size;
  }

  boundsAt(size: number, rotation: number): Bounds {
    const unit = this.unitBounds(rotation);
    return {
      minX: unit.minX * size,
      maxX: unit.maxX * size,
      minY: unit.minY * size,
      maxY: unit.maxY * size,
    };
  }
}
