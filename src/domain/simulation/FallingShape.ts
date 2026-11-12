import type { Shape } from '../shapes/Shape';

export type ShapeId = number;

export class FallingShape {
  velocityY = 0;

  constructor(
    readonly id: ShapeId,
    readonly shape: Shape,
    public x: number,
    public y: number,
  ) {}
}
