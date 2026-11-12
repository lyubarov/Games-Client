import type { Application, Ticker } from 'pixi.js';
import type { GameStore, Simulation } from '@/app';
import { CleanupStack, type Disposable } from '@/shared/lifecycle';
import { PixiHud } from './hud/PixiHud';
import { StagePointerInput } from './input/StagePointerInput';
import { Playfield } from './scene/Playfield';
import { ShapeContextCache } from './shapes/ShapeContextCache';
import { ShapeSynchronizer } from './shapes/ShapeSynchronizer';
import { HostResizer } from './viewport/HostResizer';

export interface EngineOptions {
  readonly host: HTMLElement;
  readonly simulation: Simulation;
  readonly store: GameStore;
}

export class EngineSession implements Disposable {
  private readonly cleanups = new CleanupStack();
  private hud: PixiHud | null = null;

  constructor(app: Application, options: EngineOptions, drawCounters: boolean) {
    try {
      this.assemble(app, options, drawCounters);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  setDrawCounters(enabled: boolean): void {
    this.hud?.setVisible(enabled);
  }

  dispose(): void {
    this.cleanups.releaseAll();
  }

  private assemble(app: Application, options: EngineOptions, drawCounters: boolean): void {
    const { host, simulation, store } = options;
    const playfield = this.cleanups.own(new Playfield(app.stage));
    const contexts = this.cleanups.own(new ShapeContextCache());
    this.cleanups.own(new StagePointerInput(app.stage, app.screen, simulation));
    const resizer = this.cleanups.own(
      new HostResizer(app, host, (size) => {
        playfield.resize(size);
        simulation.resize(size);
      }),
    );
    resizer.reportSize();
    const hud = this.cleanups.own(new PixiHud(app.stage, store, drawCounters));
    this.hud = hud;
    const shapes = this.cleanups.own(
      new ShapeSynchronizer(simulation, playfield.shapesLayer, contexts),
    );

    let resumed = false;
    const onVisibilityChange = (): void => {
      resumed ||= !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.cleanups.defer(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });

    const onTick = (ticker: Ticker): void => {
      simulation.advance(resumed ? 0 : ticker.elapsedMS);
      resumed = false;
      shapes.update();
      hud.update();
    };
    app.ticker.add(onTick);
    this.cleanups.defer(() => {
      app.ticker.remove(onTick);
    });
  }
}
