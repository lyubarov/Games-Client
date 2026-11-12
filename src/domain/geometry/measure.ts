import type { Bounds, Vec2 } from './types';

export function polygonArea(points: readonly Vec2[]): number {
  let previous = points.at(-1);
  if (previous === undefined) {
    return 0;
  }
  let twiceSignedArea = 0;
  for (const current of points) {
    twiceSignedArea += previous.x * current.y - current.x * previous.y;
    previous = current;
  }
  return Math.abs(twiceSignedArea) / 2;
}

export function outlineBounds(outline: readonly Vec2[], rotation: number): Bounds {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const { x, y } of outline) {
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    minX = Math.min(minX, rotatedX);
    maxX = Math.max(maxX, rotatedX);
    minY = Math.min(minY, rotatedY);
    maxY = Math.max(maxY, rotatedY);
  }
  return { minX, maxX, minY, maxY };
}
