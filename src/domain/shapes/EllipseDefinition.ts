import type { Bounds } from '../geometry/types';
import { ShapeDefinition, type ShapeSink } from './ShapeDefinition';

export class EllipseDefinition extends ShapeDefinition {
  readonly isShared = true;
  readonly unitArea: number;

  constructor(private readonly radiusY: number) {
    super();
    this.unitArea = Math.PI * radiusY;
  }

  unitBounds(rotation: number): Bounds {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const halfWidth = Math.hypot(cos, this.radiusY * sin);
    const halfHeight = Math.hypot(sin, this.radiusY * cos);
    return { minX: -halfWidth, maxX: halfWidth, minY: -halfHeight, maxY: halfHeight };
  }

  describe(sink: ShapeSink): void {
    sink.ellipse(1, this.radiusY);
  }
}
