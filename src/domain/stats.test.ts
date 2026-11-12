import { describe, expect, it } from 'vitest';
import { bruteForceBounds } from '@/testing/bounds';
import { boxShape, catalogShape, circleShape } from '@/testing/fixtures';
import { createSeededRandom } from '@/testing/random';
import { RecordingSink } from '@/testing/RecordingSink';
import { EDGE_CLEARANCE_PX } from './constants';
import { randomIrregularOutline } from './geometry/outlines';
import type { Bounds, Size } from './geometry/types';
import { PolygonDefinition } from './shapes/PolygonDefinition';
import { Shape } from './shapes/Shape';
import { CullSystem } from './simulation/CullSystem';
import { FallingShape, type ShapeId } from './simulation/FallingShape';
import { MotionSystem } from './simulation/MotionSystem';
import { World } from './simulation/World';
import { computeStats, type Stats } from './stats';

const FIELD: Size = { width: 200, height: 100 };

interface Placement {
  readonly radius: number;
  readonly x: number;
  readonly y: number;
}

interface Counted {
  readonly count: number;
  readonly area: number;
}

function calculate(shapes: ReadonlyMap<ShapeId, FallingShape>, size: Size = FIELD): Counted {
  const values: Stats = { shapeCount: -1, totalArea: -1 };
  computeStats(shapes, size, values);
  return { count: values.shapeCount, area: values.totalArea };
}

function measure(placements: readonly Placement[], size: Size = FIELD): Counted {
  const shapes = new Map<ShapeId, FallingShape>();
  placements.forEach(({ radius, x, y }, index) => {
    shapes.set(index + 1, new FallingShape(index + 1, circleShape(radius), x, y));
  });
  return calculate(shapes, size);
}

function countOne(shape: Shape, x: number, y: number): number {
  return calculate(new Map([[1, new FallingShape(1, shape, x, y)]])).count;
}

describe('computeStats with the built-in metrics', () => {
  it('reports zero for an empty world', () => {
    expect(measure([])).toEqual({ count: 0, area: 0 });
  });

  it('counts a shape that is fully inside and adds its area', () => {
    const stats = measure([{ radius: 10, x: 100, y: 50 }]);

    expect(stats.count).toBe(1);
    expect(stats.area).toBe(Math.round(100 * Math.PI));
  });

  it('counts a shape that is partly visible across the top edge', () => {
    expect(measure([{ radius: 10, x: 100, y: -9 }]).count).toBe(1);
  });

  it('counts a shape that is partly visible across the bottom edge', () => {
    expect(measure([{ radius: 10, x: 100, y: 109 }]).count).toBe(1);
  });

  it('counts a shape that is partly visible across the left or right edge', () => {
    expect(measure([{ radius: 10, x: -9, y: 50 }]).count).toBe(1);
    expect(measure([{ radius: 10, x: 209, y: 50 }]).count).toBe(1);
  });

  it('does not count a shape that is fully above the top edge, even when touching it', () => {
    expect(measure([{ radius: 10, x: 100, y: -11 }]).count).toBe(0);
    expect(measure([{ radius: 10, x: 100, y: -10 }]).count).toBe(0);
  });

  it('does not count a shape that is fully below the bottom edge, even when touching it', () => {
    expect(measure([{ radius: 10, x: 100, y: 111 }]).count).toBe(0);
    expect(measure([{ radius: 10, x: 100, y: 110 }]).count).toBe(0);
  });

  it('does not count a shape that is fully beside the playfield', () => {
    expect(measure([{ radius: 10, x: -10, y: 50 }]).count).toBe(0);
    expect(measure([{ radius: 10, x: 210, y: 50 }]).count).toBe(0);
  });

  it('sums the full, unclipped area of the counted shapes only', () => {
    const stats = measure([
      { radius: 10, x: 100, y: 50 },
      { radius: 20, x: 100, y: -5 },
      { radius: 30, x: 100, y: -500 },
      { radius: 40, x: 100, y: 500 },
    ]);

    expect(stats.count).toBe(2);
    expect(stats.area).toBe(Math.round((100 + 400) * Math.PI));
  });

  it('does not subtract overlaps', () => {
    const stats = measure([
      { radius: 10, x: 100, y: 50 },
      { radius: 10, x: 100, y: 50 },
    ]);

    expect(stats.count).toBe(2);
    expect(stats.area).toBe(Math.round(200 * Math.PI));
  });

  it('measures against the size it is given', () => {
    const placement: Placement = { radius: 10, x: 300, y: 50 };

    expect(measure([placement], { width: 200, height: 100 }).count).toBe(0);
    expect(measure([placement], { width: 400, height: 100 }).count).toBe(1);
  });

  it('overwrites the previous contents of the output instead of accumulating', () => {
    const shapes = new Map<ShapeId, FallingShape>([
      [1, new FallingShape(1, circleShape(10), 100, 50)],
    ]);
    const values: Stats = { shapeCount: 99, totalArea: 12345 };

    computeStats(shapes, FIELD, values);
    computeStats(shapes, FIELD, values);

    expect(values).toEqual({ shapeCount: 1, totalArea: 314 });
  });

  it('rounds the summed area, not each shape', () => {
    const tiny = Math.sqrt(0.4 / Math.PI);

    expect(measure([{ radius: tiny, x: 100, y: 50 }]).area).toBe(0);
    expect(
      measure([
        { radius: tiny, x: 100, y: 50 },
        { radius: tiny, x: 120, y: 50 },
      ]).area,
    ).toBe(1);
  });
});

describe('computeStats with off-centre boxes', () => {
  const reachesUpRight = boxShape({ minX: -5, maxX: 30, minY: -40, maxY: 10 });
  const reachesDownLeft = boxShape({ minX: -30, maxX: 5, minY: -10, maxY: 40 });

  it('counts a box only once its real lowest edge is below the top edge', () => {
    expect(countOne(reachesUpRight, 100, -20)).toBe(0);
    expect(countOne(reachesUpRight, 100, -10)).toBe(0);
    expect(countOne(reachesUpRight, 100, -9.5)).toBe(1);
    expect(countOne(reachesDownLeft, 100, -40)).toBe(0);
    expect(countOne(reachesDownLeft, 100, -39.5)).toBe(1);
  });

  it('stops counting a box when its real top edge reaches the bottom edge', () => {
    expect(countOne(reachesUpRight, 100, 139.5)).toBe(1);
    expect(countOne(reachesUpRight, 100, 140)).toBe(0);
    expect(countOne(reachesDownLeft, 100, 109.5)).toBe(1);
    expect(countOne(reachesDownLeft, 100, 110)).toBe(0);
  });

  it('uses the real left and right sides of a box', () => {
    expect(countOne(reachesUpRight, -30, 50)).toBe(0);
    expect(countOne(reachesUpRight, -29.5, 50)).toBe(1);
    expect(countOne(reachesUpRight, 204.5, 50)).toBe(1);
    expect(countOne(reachesUpRight, 205, 50)).toBe(0);
    expect(countOne(reachesDownLeft, -5, 50)).toBe(0);
    expect(countOne(reachesDownLeft, -4.5, 50)).toBe(1);
    expect(countOne(reachesDownLeft, 229.5, 50)).toBe(1);
    expect(countOne(reachesDownLeft, 230, 50)).toBe(0);
  });
});

describe('computeStats with the catalog triangle', () => {
  const apexUp = catalogShape('triangle', 40);
  const apexDown = catalogShape('triangle', 40, Math.PI);

  it('keeps an apex-up triangle out until its lowest vertex is below the top edge', () => {
    expect(countOne(apexUp, 100, -41)).toBe(0);
    expect(countOne(apexUp, 100, -21)).toBe(0);
    expect(countOne(apexUp, 100, -19)).toBe(1);
  });

  it('stops counting an apex-up triangle when its apex reaches the bottom edge', () => {
    expect(countOne(apexUp, 100, 139)).toBe(1);
    expect(countOne(apexUp, 100, 141)).toBe(0);
  });

  it('counts an apex-down triangle from the moment its apex tip appears', () => {
    expect(countOne(apexDown, 100, -41)).toBe(0);
    expect(countOne(apexDown, 100, -39)).toBe(1);
  });

  it('stops counting an apex-down triangle when its flat top reaches the bottom edge', () => {
    expect(countOne(apexDown, 100, 119)).toBe(1);
    expect(countOne(apexDown, 100, 121)).toBe(0);
  });
});

describe('computeStats with centred shapes', () => {
  it.each([
    ['circle', circleShape(12)],
    ['rotated quad', catalogShape('quad', 25, 0.4)],
    ['rotated hexagon', catalogShape('hexagon', 25, 1.1)],
    ['rotated ellipse', catalogShape('ellipse', 25, 0.9)],
  ])('follows the symmetric half-size rule for a %s', (_name, shape) => {
    const halfWidth = (shape.maxX - shape.minX) / 2;
    const halfHeight = (shape.maxY - shape.minY) / 2;

    for (let x = -60.37; x < 260; x += 7) {
      for (let y = -60.37; y < 160; y += 7) {
        const symmetricRule =
          x + halfWidth > 0 &&
          x - halfWidth < FIELD.width &&
          y + halfHeight > 0 &&
          y - halfHeight < FIELD.height;

        expect(countOne(shape, x, y)).toBe(symmetricRule ? 1 : 0);
      }
    }
  });
});

describe('computeStats along a whole fall', () => {
  const field: Size = { width: 300, height: 120 };
  const dtSeconds = 1 / 60;
  const polygonKinds = ['triangle', 'quad', 'pentagon', 'hexagon', 'star'] as const;

  interface Frame {
    readonly y: number;
    readonly count: number;
  }

  function unitBoundsOf(shape: Shape): Bounds {
    const sink = new RecordingSink();
    shape.definition.describe(sink);
    const [outline] = sink.polygons;
    if (outline === undefined) {
      throw new Error(`${shape.kind} did not describe a polygon`);
    }
    return bruteForceBounds(outline, shape.rotation);
  }

  function frameAt(frames: readonly Frame[], index: number): Frame {
    const frame = frames[index];
    if (frame === undefined) {
      throw new RangeError(`There is no frame ${String(index)}`);
    }
    return frame;
  }

  function irregularShape(seed: number, rotation: number): Shape {
    const outline = randomIrregularOutline(createSeededRandom(seed));
    return new Shape(new PolygonDefinition(outline, false), 'irregular', 30, rotation, 0xffffff);
  }

  const cases: [string, Shape][] = [
    ...polygonKinds.flatMap((kind) =>
      [0, 0.9, Math.PI, 4.1].map((rotation): [string, Shape] => [
        `${kind} rotated by ${String(rotation)}`,
        catalogShape(kind, 40, rotation),
      ]),
    ),
    ['irregular outline 1', irregularShape(1, 0.3)],
    ['irregular outline 2', irregularShape(2, 2.2)],
    ['irregular outline 3', irregularShape(3, 5)],
  ];

  function recordFall(shape: Shape): readonly Frame[] {
    const world = new World(field);
    const systems = [new MotionSystem(world, { gravity: 120 }), new CullSystem(world)];
    const falling = world.spawn(shape, field.width / 2, -shape.maxY - EDGE_CLEARANCE_PX);
    const frames: Frame[] = [];
    const record = (): void => {
      frames.push({ y: falling.y, count: calculate(world.shapes, world.size).count });
    };

    record();
    while (world.shapes.size > 0 && frames.length < 2_000) {
      for (const system of systems) {
        system.update(dtSeconds);
      }
      record();
    }
    expect(world.shapes.size).toBe(0);
    return frames;
  }

  it.each(cases)(
    'counts a %s exactly while a vertex of its outline is inside the playfield',
    (_name, shape) => {
      const unit = unitBoundsOf(shape);
      const frames = recordFall(shape);

      for (const { y, count } of frames) {
        const lowest = y + unit.maxY * shape.size;
        const highest = y + unit.minY * shape.size;

        expect(count).toBe(lowest > 0 && highest < field.height ? 1 : 0);
      }
      expect(frameAt(frames, 0).count).toBe(0);
      expect(frames.filter(({ count }) => count === 1).length).toBeGreaterThan(10);
    },
  );

  it('counts an apex-up triangle from the frame its lowest vertex enters until the frame its top leaves', () => {
    const triangle = catalogShape('triangle', 40);
    const frames = recordFall(triangle);
    const first = frames.findIndex(({ count }) => count === 1);
    const last = frames.findLastIndex(({ count }) => count === 1);

    expect(frameAt(frames, first).y + triangle.maxY).toBeGreaterThan(0);
    expect(frameAt(frames, first - 1).y + triangle.maxY).toBeLessThanOrEqual(0);
    expect(frameAt(frames, last).y + triangle.minY).toBeLessThan(field.height);
    expect(frameAt(frames, last + 1).y + triangle.minY).toBeGreaterThanOrEqual(field.height);
    expect(frameAt(frames, last + 1).count).toBe(0);
  });
});
