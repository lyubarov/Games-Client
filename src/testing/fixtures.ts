import { Shape } from '@/domain';
import type { Bounds, Vec2 } from '@/domain';
import { CircleDefinition } from '@/domain/shapes/CircleDefinition';
import { PolygonDefinition } from '@/domain/shapes/PolygonDefinition';
import { SHAPE_CATALOG, type CatalogKind } from '@/domain/shapes/catalog';

const WHITE = 0xffffff;

export function circleShape(radius: number): Shape {
  return new Shape(new CircleDefinition(), 'circle', radius, 0, WHITE);
}

export function boxShape(bounds: Bounds): Shape {
  const outline: readonly Vec2[] = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ];
  return new Shape(new PolygonDefinition(outline), 'quad', 1, 0, WHITE);
}

export function catalogShape(kind: CatalogKind, size: number, rotation = 0): Shape {
  const entry = SHAPE_CATALOG.find((candidate) => candidate.kind === kind);
  if (entry === undefined) {
    throw new RangeError(`Unknown shape kind ${kind}`);
  }
  return new Shape(entry.definition, kind, size, rotation, WHITE);
}
