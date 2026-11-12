import { Emitter } from '@/shared/Emitter';
import { MAX_ACTIVE_SHAPES } from '../constants';
import type { Size } from '../geometry/types';
import type { Shape } from '../shapes/Shape';
import { FallingShape, type ShapeId } from './FallingShape';

export class World {
  private readonly entries = new Map<ShapeId, FallingShape>();
  private readonly spawned = new Emitter<FallingShape>();
  private readonly removed = new Emitter<FallingShape>();
  private nextId = 1;

  constructor(private playfield: Size) {}

  get size(): Size {
    return this.playfield;
  }

  get shapes(): ReadonlyMap<ShapeId, FallingShape> {
    return this.entries;
  }

  get isFull(): boolean {
    return this.entries.size >= MAX_ACTIVE_SHAPES;
  }

  resize(size: Size): void {
    this.playfield = size;
  }

  spawn(shape: Shape, x: number, y: number): FallingShape {
    const falling = new FallingShape(this.nextId, shape, x, y);
    this.nextId += 1;
    this.entries.set(falling.id, falling);
    this.spawned.emit(falling);
    return falling;
  }

  remove(id: ShapeId): boolean {
    const falling = this.entries.get(id);
    if (falling === undefined) {
      return false;
    }
    this.entries.delete(id);
    this.removed.emit(falling);
    return true;
  }

  onSpawned(listener: (falling: FallingShape) => void): () => void {
    return this.spawned.subscribe(listener);
  }

  onRemoved(listener: (falling: FallingShape) => void): () => void {
    return this.removed.subscribe(listener);
  }
}
