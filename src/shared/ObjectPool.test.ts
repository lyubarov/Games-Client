import { describe, expect, it } from 'vitest';
import { ObjectPool, type PoolLifecycle } from './ObjectPool';

const MAX_IDLE = 8;

interface Item {
  readonly serial: number;
}

class TrackedLifecycle implements PoolLifecycle<Item> {
  created = 0;
  readonly resetItems: Item[] = [];
  readonly disposedItems: Item[] = [];

  create(): Item {
    this.created += 1;
    return { serial: this.created };
  }

  reset(item: Item): void {
    this.resetItems.push(item);
  }

  dispose(item: Item): void {
    this.disposedItems.push(item);
  }
}

describe('ObjectPool', () => {
  it('creates a fresh item for every acquire while nothing has been released', () => {
    const lifecycle = new TrackedLifecycle();
    const pool = new ObjectPool(lifecycle, MAX_IDLE);

    const first = pool.acquire();
    const second = pool.acquire();

    expect(first).not.toBe(second);
    expect(lifecycle.created).toBe(2);
  });

  it('resets a released item and hands the same instance out again instead of creating one', () => {
    const lifecycle = new TrackedLifecycle();
    const pool = new ObjectPool(lifecycle, MAX_IDLE);
    const item = pool.acquire();

    pool.release(item);
    const reused = pool.acquire();

    expect(lifecycle.resetItems).toEqual([item]);
    expect(reused).toBe(item);
    expect(lifecycle.created).toBe(1);
    expect(pool.idleCount).toBe(0);
  });

  it('keeps released items idle up to maxIdle', () => {
    const pool = new ObjectPool(new TrackedLifecycle(), 3);
    const items = [pool.acquire(), pool.acquire(), pool.acquire()];

    for (const item of items) {
      pool.release(item);
    }

    expect(pool.idleCount).toBe(3);
  });

  it('resets then disposes items released beyond maxIdle', () => {
    const lifecycle = new TrackedLifecycle();
    const pool = new ObjectPool(lifecycle, 2);
    const items = [pool.acquire(), pool.acquire(), pool.acquire()];

    for (const item of items) {
      pool.release(item);
    }

    expect(pool.idleCount).toBe(2);
    expect(lifecycle.disposedItems).toEqual([items[2]]);
    expect(lifecycle.resetItems).toEqual(items);
  });

  it('disposes every idle item on clear and leaves items in use alone', () => {
    const lifecycle = new TrackedLifecycle();
    const pool = new ObjectPool(lifecycle, MAX_IDLE);
    const inUse = pool.acquire();
    const idleA = pool.acquire();
    const idleB = pool.acquire();
    pool.release(idleA);
    pool.release(idleB);

    pool.clear();

    expect(pool.idleCount).toBe(0);
    expect(lifecycle.disposedItems).toHaveLength(2);
    expect(lifecycle.disposedItems).toContain(idleA);
    expect(lifecycle.disposedItems).toContain(idleB);
    expect(lifecycle.disposedItems).not.toContain(inUse);
  });

  it('creates new items again after clear', () => {
    const lifecycle = new TrackedLifecycle();
    const pool = new ObjectPool(lifecycle, MAX_IDLE);
    pool.release(pool.acquire());

    pool.clear();
    pool.acquire();

    expect(lifecycle.created).toBe(2);
  });
});
