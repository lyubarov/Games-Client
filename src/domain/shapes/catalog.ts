import { rectangleOutline, regularPolygonOutline, starOutline } from '../geometry/outlines';
import { CircleDefinition } from './CircleDefinition';
import { EllipseDefinition } from './EllipseDefinition';
import { PolygonDefinition } from './PolygonDefinition';

export const SHAPE_CATALOG = [
  { kind: 'triangle', definition: new PolygonDefinition(regularPolygonOutline(3)) },
  { kind: 'quad', definition: new PolygonDefinition(rectangleOutline(1.6)) },
  { kind: 'pentagon', definition: new PolygonDefinition(regularPolygonOutline(5)) },
  { kind: 'hexagon', definition: new PolygonDefinition(regularPolygonOutline(6)) },
  { kind: 'circle', definition: new CircleDefinition() },
  { kind: 'ellipse', definition: new EllipseDefinition(0.6) },
  { kind: 'star', definition: new PolygonDefinition(starOutline(5, 0.5)) },
] as const;

export type CatalogKind = (typeof SHAPE_CATALOG)[number]['kind'];
export type ShapeKind = CatalogKind | 'irregular';
