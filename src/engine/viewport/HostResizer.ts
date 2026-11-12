import type { Application } from 'pixi.js';
import type { Size } from '@/domain';
import { CleanupStack, type Disposable } from '@/shared/lifecycle';
import { MAX_RESOLUTION } from '../constants';

export function renderResolution(): number {
  return Math.min(globalThis.devicePixelRatio, MAX_RESOLUTION);
}

export class HostResizer implements Disposable {
  private readonly cleanups = new CleanupStack();

  constructor(
    private readonly app: Application,
    private readonly host: HTMLElement,
    private readonly listener: (size: Size) => void,
  ) {
    const observer = new ResizeObserver(this.refresh);
    this.cleanups.defer(() => {
      observer.disconnect();
    });
    observer.observe(host);

    const { renderer } = app;
    renderer.on('resize', this.notifySize);
    this.cleanups.defer(() => {
      renderer.off('resize', this.notifySize);
    });
  }

  reportSize(): void {
    this.notifySize(this.app.screen.width, this.app.screen.height);
  }

  dispose(): void {
    this.cleanups.releaseAll();
  }

  private forceResize(resolution: number): void {
    const { renderer } = this.app;
    renderer.resolution = resolution;
    renderer.resize(this.host.clientWidth, this.host.clientHeight, resolution);
    this.app.render();
  }

  private readonly notifySize = (width: number, height: number): void => {
    this.listener({ width, height });
  };

  private readonly refresh = (): void => {
    const resolution = renderResolution();
    if (resolution === this.app.renderer.resolution) {
      this.app.queueResize();
    } else {
      this.forceResize(resolution);
    }
  };
}
