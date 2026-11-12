import { clamp } from '@/shared/clamp';
import { SHAPE_SIZING } from '../constants';
import { randomIrregularOutline } from '../geometry/outlines';
import type { Size } from '../geometry/types';
import { randomColor } from '../color';
import { pickOne, randomBetween, type RandomSource } from '../random';
import { SHAPE_CATALOG, type ShapeKind } from './catalog';
import { PolygonDefinition } from './PolygonDefinition';
import { Shape } from './Shape';
import type { ShapeDefinition } from './ShapeDefinition';

const FULL_TURN = 2 * Math.PI;

export class ShapeFactory {
  constructor(private readonly random: RandomSource) {}

  createFromCatalog(playfield: Size): Shape {
    const { kind, definition } = pickOne(this.random, SHAPE_CATALOG);
    return this.build(definition, kind, playfield);
  }

  createIrregular(playfield: Size): Shape {
    const definition = new PolygonDefinition(randomIrregularOutline(this.random), false);
    return this.build(definition, 'irregular', playfield);
  }

  private build(definition: ShapeDefinition, kind: ShapeKind, playfield: Size): Shape {
    const size = this.randomSize(playfield);
    const rotation = this.random.next() * FULL_TURN;
    return new Shape(definition, kind, size, rotation, randomColor(this.random));
  }

  private randomSize(playfield: Size): number {
    const { minRatio, maxRatio, minPx, maxPx } = SHAPE_SIZING;
    const reference = Math.min(playfield.width, playfield.height);
    return randomBetween(
      this.random,
      clamp(minRatio * reference, minPx, maxPx),
      clamp(maxRatio * reference, minPx, maxPx),
    );
  }
}
