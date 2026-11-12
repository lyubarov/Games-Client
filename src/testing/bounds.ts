import type { Bounds, Vec2 } from '@/domain';

export function bruteForceBounds(outline: readonly Vec2[], rotation: number): Bounds {
  const rotated = outline.map(({ x, y }) => {
    const radius = Math.hypot(x, y);
    const angle = Math.atan2(y, x) + rotation;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
  const xs = rotated.map((point) => point.x);
  const ys = rotated.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}
