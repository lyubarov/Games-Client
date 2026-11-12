import { Container, Graphics } from 'pixi.js';
import type { Size } from '@/domain';
import type { Disposable } from '@/shared/lifecycle';
import { DESTROY_WITH_CHILDREN } from '../constants';
import type { ShapeView } from '../shapes/ShapeView';

const MASK_FILL = 0xffffff;

export class Playfield implements Disposable {
  readonly shapesLayer = new Container<ShapeView>();
  private readonly root = new Container();
  private readonly clip = new Graphics().rect(0, 0, 1, 1).fill(MASK_FILL);

  constructor(stage: Container) {
    this.root.addChild(this.clip, this.shapesLayer);
    this.shapesLayer.mask = this.clip;
    stage.addChild(this.root);
  }

  resize({ width, height }: Size): void {
    this.clip.scale.set(width, height);
  }

  dispose(): void {
    this.shapesLayer.mask = null;
    this.clip.destroy();
    this.root.destroy(DESTROY_WITH_CHILDREN);
  }
}
