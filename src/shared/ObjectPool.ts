export interface PoolLifecycle<T> {
  create(): T;
  reset(item: T): void;
  dispose(item: T): void;
}

export class ObjectPool<T> {
  private readonly idle: T[] = [];

  constructor(
    private readonly lifecycle: PoolLifecycle<T>,
    private readonly maxIdle: number,
  ) {}

  get idleCount(): number {
    return this.idle.length;
  }

  acquire(): T {
    return this.idle.pop() ?? this.lifecycle.create();
  }

  release(item: T): void {
    this.lifecycle.reset(item);
    if (this.idle.length < this.maxIdle) {
      this.idle.push(item);
    } else {
      this.lifecycle.dispose(item);
    }
  }

  clear(): void {
    for (const item of this.idle) {
      this.lifecycle.dispose(item);
    }
    this.idle.length = 0;
  }
}
