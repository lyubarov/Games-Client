import { describe, expect, it } from 'vitest';
import { irregularOutlines, L_SHAPE, UNIT_SQUARE } from '@/testing/geometry';
import { polygonArea } from './measure';
import { regularPolygonOutline, starOutline } from './outlines';
import type { Vec2 } from './types';

describe('polygonArea', () => {
  it('measures the unit square', () => {
    expect(polygonArea(UNIT_SQUARE)).toBeCloseTo(1, 12);
  });

  it('does not depend on the winding direction', () => {
    expect(polygonArea([...UNIT_SQUARE].reverse())).toBeCloseTo(1, 12);
  });

  it('measures a right triangle', () => {
    const triangle: readonly Vec2[] = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ];

    expect(polygonArea(triangle)).toBeCloseTo(6, 12);
  });

  it('measures a concave L shape', () => {
    expect(polygonArea(L_SHAPE)).toBeCloseTo(3, 12);
  });

  it('measures the regular hexagon with circumradius 1 as 3√3/2', () => {
    expect(polygonArea(regularPolygonOutline(6))).toBeCloseTo((3 * Math.sqrt(3)) / 2, 12);
  });

  it('measures the regular triangle with circumradius 1 as 3√3/4', () => {
    expect(polygonArea(regularPolygonOutline(3))).toBeCloseTo((3 * Math.sqrt(3)) / 4, 12);
  });

  it('measures a five-tip star with inner ratio 0.5 as 5·R·r·sin(π/5)', () => {
    expect(polygonArea(starOutline(5, 0.5))).toBeCloseTo(5 * 0.5 * Math.sin(Math.PI / 5), 12);
  });

  it('is zero without vertices', () => {
    expect(polygonArea([])).toBe(0);
  });

  it('gives every irregular outline a positive area', () => {
    for (const outline of irregularOutlines(50)) {
      expect(polygonArea(outline)).toBeGreaterThan(0);
    }
  });
});
