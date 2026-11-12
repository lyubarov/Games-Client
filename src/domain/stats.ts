import type { Size } from './geometry/types';
import type { FallingShape, ShapeId } from './simulation/FallingShape';

export const METRIC_IDS = ['shapeCount', 'totalArea'] as const;
export type MetricId = (typeof METRIC_IDS)[number];
export type Stats = Record<MetricId, number>;

function intersectsPlayfield(falling: FallingShape, playfield: Size): boolean {
  const { minX, maxX, minY, maxY } = falling.shape;
  return (
    falling.x + maxX > 0 &&
    falling.x + minX < playfield.width &&
    falling.y + maxY > 0 &&
    falling.y + minY < playfield.height
  );
}

export function computeStats(
  shapes: ReadonlyMap<ShapeId, FallingShape>,
  playfield: Size,
  out: Stats,
): void {
  let shapeCount = 0;
  let totalArea = 0;
  for (const falling of shapes.values()) {
    if (intersectsPlayfield(falling, playfield)) {
      shapeCount += 1;
      totalArea += falling.shape.area;
    }
  }
  out.shapeCount = shapeCount;
  out.totalArea = Math.round(totalArea);
}
