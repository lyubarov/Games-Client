import { Emitter } from './Emitter';

export class Store<T> {
  private readonly changes = new Emitter<void>();

  constructor(private state: T) {}

  readonly getSnapshot = (): T => this.state;

  readonly subscribe = (listener: () => void): (() => void) => this.changes.subscribe(listener);

  set(next: T): void {
    this.state = next;
    this.changes.emit();
  }
}
