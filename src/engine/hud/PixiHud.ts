import { Container, Graphics, Text, type TextStyleOptions } from 'pixi.js';
import { COPY, formatNumber, METRIC_IDS, type GameStore } from '@/app';
import type { Disposable } from '@/shared/lifecycle';
import { DESTROY_WITH_CHILDREN } from '../constants';

const MARGIN_PX = 12;
const PADDING_PX = 12;
const CORNER_RADIUS_PX = 10;
const PLATE_STYLE = { color: 0x0f172a, alpha: 0.72 } as const;
const TEXT_STYLE: TextStyleOptions = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 15,
  fontWeight: '600',
  lineHeight: 24,
  fill: 0xffffff,
};

export class PixiHud implements Disposable {
  private readonly root = new Container();
  private readonly plate = new Graphics();
  private readonly text = new Text({
    style: TEXT_STYLE,
    x: PADDING_PX,
    y: PADDING_PX,
    roundPixels: true,
  });
  private readonly unsubscribe: () => void;
  private changed = true;

  constructor(
    stage: Container,
    private readonly store: Pick<GameStore, 'getSnapshot' | 'subscribe'>,
    visible: boolean,
  ) {
    this.root.position.set(MARGIN_PX, MARGIN_PX);
    this.root.eventMode = 'none';
    this.root.visible = visible;
    this.root.addChild(this.plate, this.text);
    stage.addChild(this.root);
    this.unsubscribe = store.subscribe(() => {
      this.changed = true;
    });
    this.update();
  }

  setVisible(visible: boolean): void {
    this.root.visible = visible;
  }

  update(): void {
    if (!this.changed || !this.root.visible) {
      return;
    }
    this.changed = false;
    const { metrics } = this.store.getSnapshot();
    this.text.text = METRIC_IDS.map((id) => {
      const { label, unit } = COPY.metrics[id];
      return `${label}  ${formatNumber(metrics[id])} ${unit}`.trim();
    }).join('\n');
    this.plate
      .clear()
      .roundRect(
        0,
        0,
        this.text.width + 2 * PADDING_PX,
        this.text.height + 2 * PADDING_PX,
        CORNER_RADIUS_PX,
      )
      .fill(PLATE_STYLE);
  }

  dispose(): void {
    this.unsubscribe();
    this.root.destroy(DESTROY_WITH_CHILDREN);
  }
}
