import type { ShapeKind } from './catalog';
import type { ShapeDefinition } from './ShapeDefinition';

export class Shape {
  readonly area: number;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;

  constructor(
    readonly definition: ShapeDefinition,
    readonly kind: ShapeKind,
    readonly size: number,
    readonly rotation: number,
    readonly color: number,
  ) {
    const bounds = definition.boundsAt(size, rotation);
    this.area = definition.areaAt(size);
    this.minX = bounds.minX;
    this.maxX = bounds.maxX;
    this.minY = bounds.minY;
    this.maxY = bounds.maxY;
  }
}
