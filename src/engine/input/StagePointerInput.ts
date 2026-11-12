import type { Container, FederatedPointerEvent, Rectangle } from 'pixi.js';
import type { Simulation } from '@/app';
import type { Disposable } from '@/shared/lifecycle';
import { ShapeView } from '../shapes/ShapeView';

const PRIMARY_BUTTON = 0;

type ShapeCommands = Pick<Simulation, 'spawnAt' | 'removeShape'>;

export class StagePointerInput implements Disposable {
  constructor(
    private readonly stage: Container,
    hitArea: Rectangle,
    private readonly commands: ShapeCommands,
  ) {
    stage.eventMode = 'static';
    stage.hitArea = hitArea;
    // Removing the target in pointerdown makes Pixi fire click on its parent, hence pointerdown for both actions.
    stage.on('pointerdown', this.onPointerDown);
  }

  dispose(): void {
    this.stage.off('pointerdown', this.onPointerDown);
  }

  private readonly onPointerDown = (event: FederatedPointerEvent): void => {
    if (event.button !== PRIMARY_BUTTON) {
      return;
    }
    const { target } = event;
    if (target === this.stage) {
      this.commands.spawnAt(event.global.x, event.global.y);
    } else if (target instanceof ShapeView) {
      const id = target.shapeId;
      if (id !== undefined) {
        this.commands.removeShape(id);
      }
    }
  };
}
