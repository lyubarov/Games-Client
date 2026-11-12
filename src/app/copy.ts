import type { MetricId } from '@/domain';
import type { ParameterId } from './parameters';

interface LabelledUnit {
  readonly label: string;
  readonly unit: string;
}

const metrics: Readonly<Record<MetricId, LabelledUnit>> = {
  shapeCount: { label: 'Shapes', unit: '' },
  totalArea: { label: 'Area', unit: 'px²' },
};

const parameters: Readonly<Record<ParameterId, LabelledUnit>> = {
  spawnRate: { label: 'Shapes per second', unit: '/ s' },
  gravity: { label: 'Gravity', unit: 'px/s²' },
};

export const COPY = {
  metrics,
  parameters,
  pageTitle: 'Falling Shapes',
  playfieldLabel: 'Falling shapes playfield',
  rendererError: 'Could not start the renderer. WebGL may be unavailable.',
  hint: 'Click the field to add a shape, click a shape to remove it.',
  canvasCounters: 'Draw the counters on the canvas',
  decrease: (label: string): string => `Decrease ${label.toLowerCase()}`,
  increase: (label: string): string => `Increase ${label.toLowerCase()}`,
};

const numberFormat = new Intl.NumberFormat('en-US');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}
