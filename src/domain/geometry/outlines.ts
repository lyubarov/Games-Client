import { randomBetween, randomInt, type RandomSource } from '../random';
import type { Vec2 } from './types';

const FULL_TURN = 2 * Math.PI;
const UPWARD = -Math.PI / 2;

const IRREGULAR_VERTICES = { min: 6, max: 10 } as const;
const IRREGULAR_MIN_RADIUS_RATIO = 0.45;
const IRREGULAR_ANGLE_JITTER = { min: 0.15, max: 0.85 } as const;

function polar(radius: number, angle: number): Vec2 {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

function evenlySpacedAngle(index: number, count: number): number {
  return UPWARD + (index * FULL_TURN) / count;
}

export function regularPolygonOutline(sides: number): readonly Vec2[] {
  return Array.from({ length: sides }, (_, index) => polar(1, evenlySpacedAngle(index, sides)));
}

export function starOutline(tips: number, innerRatio: number): readonly Vec2[] {
  const count = tips * 2;
  return Array.from({ length: count }, (_, index) =>
    polar(index % 2 === 0 ? 1 : innerRatio, evenlySpacedAngle(index, count)),
  );
}

export function rectangleOutline(aspectRatio: number): readonly Vec2[] {
  const halfHeight = 1 / Math.hypot(aspectRatio, 1);
  const halfWidth = aspectRatio * halfHeight;
  return [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ];
}

export function randomIrregularOutline(random: RandomSource): readonly Vec2[] {
  const count = randomInt(random, IRREGULAR_VERTICES.min, IRREGULAR_VERTICES.max);
  const sector = FULL_TURN / count;
  const samples = Array.from({ length: count }, (_, index) => {
    const radius = randomBetween(random, IRREGULAR_MIN_RADIUS_RATIO, 1);
    const jitter = randomBetween(random, IRREGULAR_ANGLE_JITTER.min, IRREGULAR_ANGLE_JITTER.max);
    return { radius, angle: (index + jitter) * sector };
  });
  const largest = Math.max(...samples.map(({ radius }) => radius));
  return samples.map(({ radius, angle }) => polar(radius / largest, angle));
}
