export interface Disposable {
  dispose(): void;
}

export class CleanupStack {
  private readonly cleanups: (() => void)[] = [];

  defer(cleanup: () => void): void {
    this.cleanups.push(cleanup);
  }

  own<T extends Disposable>(resource: T): T {
    this.defer(() => {
      resource.dispose();
    });
    return resource;
  }

  releaseAll(): void {
    const cleanup = this.cleanups.pop();
    if (cleanup === undefined) {
      return;
    }
    try {
      cleanup();
    } finally {
      this.releaseAll();
    }
  }
}
