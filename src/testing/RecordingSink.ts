import type { ShapeSink, Vec2 } from '@/domain';

interface RecordedEllipse {
  readonly radiusX: number;
  readonly radiusY: number;
}

export class RecordingSink implements ShapeSink {
  readonly polygons: (readonly Vec2[])[] = [];
  readonly circles: number[] = [];
  readonly ellipses: RecordedEllipse[] = [];

  polygon(points: readonly Vec2[]): void {
    this.polygons.push(points);
  }

  circle(radius: number): void {
    this.circles.push(radius);
  }

  ellipse(radiusX: number, radiusY: number): void {
    this.ellipses.push({ radiusX, radiusY });
  }
}
