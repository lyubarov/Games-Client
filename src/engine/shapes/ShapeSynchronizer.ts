import type { Container } from 'pixi.js';
import type { Simulation } from '@/app';
import type { FallingShape, ShapeId } from '@/domain';
import { ObjectPool } from '@/shared/ObjectPool';
import { CleanupStack, type Disposable } from '@/shared/lifecycle';
import { MAX_IDLE_VIEWS } from '../constants';
import type { ShapeContextCache } from './ShapeContextCache';
import { ShapeView } from './ShapeView';

type ShapeFeed = Pick<Simulation, 'shapes' | 'onSpawned' | 'onRemoved'>;

export class ShapeSynchronizer implements Disposable {
  private readonly views = new Map<ShapeId, ShapeView>();
  private readonly pool: ObjectPool<ShapeView>;
  private readonly subscriptions = new CleanupStack();

  constructor(
    feed: ShapeFeed,
    private readonly layer: Container<ShapeView>,
    contexts: ShapeContextCache,
  ) {
    this.pool = new ObjectPool<ShapeView>(
      {
        create: () => new ShapeView(contexts),
        reset: (view) => {
          view.unbind();
        },
        dispose: (view) => {
          view.destroy();
        },
      },
      MAX_IDLE_VIEWS,
    );
    try {
      for (const falling of feed.shapes.values()) {
        this.add(falling);
      }
      this.subscriptions.defer(feed.onSpawned(this.add));
      this.subscriptions.defer(feed.onRemoved(this.remove));
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  update(): void {
    for (const view of this.views.values()) {
      view.update();
    }
  }

  dispose(): void {
    this.subscriptions.releaseAll();
    for (const view of this.views.values()) {
      this.pool.release(view);
    }
    this.views.clear();
    this.pool.clear();
  }

  private readonly add = (falling: Readonly<FallingShape>): void => {
    const view = this.pool.acquire();
    view.bind(falling);
    this.views.set(falling.id, view);
    this.layer.addChild(view);
  };

  private readonly remove = (falling: Readonly<FallingShape>): void => {
    const view = this.views.get(falling.id);
    if (view !== undefined) {
      this.views.delete(falling.id);
      this.pool.release(view);
    }
  };
}
