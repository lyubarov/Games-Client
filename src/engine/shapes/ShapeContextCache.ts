import { GraphicsContext } from 'pixi.js';
import type { ShapeDefinition } from '@/domain';
import type { Disposable } from '@/shared/lifecycle';
import { GraphicsShapeSink } from './GraphicsShapeSink';

function draw(definition: ShapeDefinition, context: GraphicsContext): void {
  context.clear();
  context.batchMode = 'batch';
  definition.describe(new GraphicsShapeSink(context));
}

export class ShapeContextCache implements Disposable {
  private readonly shared = new Map<ShapeDefinition, GraphicsContext>();

  contextFor(definition: ShapeDefinition, ownedContext: GraphicsContext): GraphicsContext {
    if (!definition.isShared) {
      draw(definition, ownedContext);
      return ownedContext;
    }
    let context = this.shared.get(definition);
    if (context === undefined) {
      context = new GraphicsContext();
      draw(definition, context);
      this.shared.set(definition, context);
    }
    return context;
  }

  dispose(): void {
    for (const context of this.shared.values()) {
      context.destroy();
    }
    this.shared.clear();
  }
}
