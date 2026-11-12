import type { GraphicsContext } from 'pixi.js';
import type { ShapeSink, Vec2 } from '@/domain';
import { GEOMETRY_SCALE, SHAPE_FILL_STYLE, SHAPE_OUTLINE_STYLE } from '../constants';

function scaledCoordinates(points: readonly Vec2[]): number[] {
  const coordinates: number[] = [];
  for (const { x, y } of points) {
    coordinates.push(x * GEOMETRY_SCALE, y * GEOMETRY_SCALE);
  }
  return coordinates;
}

export class GraphicsShapeSink implements ShapeSink {
  constructor(private readonly context: GraphicsContext) {}

  polygon(points: readonly Vec2[]): void {
    this.context.poly(scaledCoordinates(points));
    this.paint();
  }

  circle(radius: number): void {
    this.context.circle(0, 0, radius * GEOMETRY_SCALE);
    this.paint();
  }

  ellipse(radiusX: number, radiusY: number): void {
    this.context.ellipse(0, 0, radiusX * GEOMETRY_SCALE, radiusY * GEOMETRY_SCALE);
    this.paint();
  }

  private paint(): void {
    this.context.fill(SHAPE_FILL_STYLE).stroke(SHAPE_OUTLINE_STYLE);
  }
}
