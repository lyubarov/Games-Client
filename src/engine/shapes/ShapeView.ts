import { Graphics, GraphicsContext, type DestroyOptions } from 'pixi.js';
import type { FallingShape, ShapeId } from '@/domain';
import { GEOMETRY_SCALE } from '../constants';
import type { ShapeContextCache } from './ShapeContextCache';

const NEUTRAL_TINT = 0xffffff;

export class ShapeView extends Graphics {
  private readonly ownContext: GraphicsContext;
  private falling: Readonly<FallingShape> | null = null;

  constructor(private readonly contexts: ShapeContextCache) {
    const ownContext = new GraphicsContext();
    super(ownContext);
    this.ownContext = ownContext;
    this.cursor = 'pointer';
  }

  get shapeId(): ShapeId | undefined {
    return this.falling?.id;
  }

  bind(falling: Readonly<FallingShape>): void {
    const { shape } = falling;
    this.falling = falling;
    this.context = this.contexts.contextFor(shape.definition, this.ownContext);
    this.scale.set(shape.size / GEOMETRY_SCALE);
    this.rotation = shape.rotation;
    this.tint = shape.color;
    this.eventMode = 'none';
    this.position.set(falling.x, falling.y);
  }

  update(): void {
    const { falling } = this;
    if (falling !== null) {
      this.position.set(falling.x, falling.y);
      this.eventMode = 'static';
    }
  }

  unbind(): void {
    this.removeFromParent();
    this.falling = null;
    this.tint = NEUTRAL_TINT;
    this.position.set(0, 0);
    this.rotation = 0;
    this.scale.set(1);
  }

  override destroy(options?: DestroyOptions): void {
    super.destroy(options);
    this.ownContext.destroy();
    this.falling = null;
  }
}
