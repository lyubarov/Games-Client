import { Application, type ApplicationOptions } from 'pixi.js';
import { DESTROY_WITH_CHILDREN, RENDERER_OPTIONS } from './constants';
import { EngineSession, type EngineOptions } from './EngineSession';
import { renderResolution } from './viewport/HostResizer';

function applicationOptions(host: HTMLElement): Partial<ApplicationOptions> {
  const { clientWidth, clientHeight } = host;
  const size =
    clientWidth > 0 && clientHeight > 0 ? { width: clientWidth, height: clientHeight } : {};
  return { ...RENDERER_OPTIONS, ...size, resizeTo: host, resolution: renderResolution() };
}

export class GameEngine {
  private readonly app = new Application();
  private session: EngineSession | null = null;
  private starting: Promise<void> | null = null;
  private ready = false;
  private disposed = false;
  private drawCounters = false;

  constructor(private readonly options: EngineOptions) {}

  setDrawCounters(enabled: boolean): void {
    this.drawCounters = enabled;
    this.session?.setDrawCounters(enabled);
  }

  start(): Promise<void> {
    this.starting ??= this.disposed ? Promise.resolve() : this.initialise();
    return this.starting;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    if (this.ready) {
      this.teardown();
    }
  }

  private async initialise(): Promise<void> {
    await this.app.init(applicationOptions(this.options.host));
    this.ready = true;
    if (this.disposed) {
      this.teardown();
      return;
    }
    try {
      this.mount();
    } catch (error) {
      this.disposed = true;
      this.teardown();
      throw error;
    }
  }

  private mount(): void {
    const { canvas } = this.app;
    canvas.style.display = 'block';
    this.options.host.appendChild(canvas);
    this.session = new EngineSession(this.app, this.options, this.drawCounters);
  }

  private teardown(): void {
    try {
      this.session?.dispose();
    } finally {
      this.session = null;
      this.app.destroy({ removeView: true }, DESTROY_WITH_CHILDREN);
    }
  }
}
