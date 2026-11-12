import type { Vec2 } from '@/domain';
import { randomIrregularOutline } from '@/domain/geometry/outlines';
import { createSeededRandom } from './random';

export const UNIT_SQUARE: readonly Vec2[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

export const L_SHAPE: readonly Vec2[] = [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
  { x: 2, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: 2 },
  { x: 0, y: 2 },
];

export function irregularOutlines(count: number): (readonly Vec2[])[] {
  return Array.from({ length: count }, (_, seed) =>
    randomIrregularOutline(createSeededRandom(seed + 1)),
  );
}
