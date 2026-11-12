import { describe, expect, it } from 'vitest';
import { boxShape, catalogShape, circleShape } from '@/testing/fixtures';
import type { FallingShape } from './FallingShape';
import { EDGE_CLEARANCE_PX } from '../constants';
import { CullSystem } from './CullSystem';
import { World } from './World';

const HEIGHT = 100;
const REMOVAL_LINE = HEIGHT + EDGE_CLEARANCE_PX;

function createWorld(): World {
  return new World({ width: 200, height: HEIGHT });
}

function idsOf(world: World): number[] {
  return [...world.shapes.keys()];
}

describe('CullSystem', () => {
  it('keeps a shape until its top edge is the edge clearance below the bottom edge', () => {
    const world = createWorld();
    const stillInside = world.spawn(circleShape(10), 50, REMOVAL_LINE + 10 - 1);
    const justInside = world.spawn(circleShape(10), 100, REMOVAL_LINE + 10 - 0.5);
    const exactlyGone = world.spawn(circleShape(10), 150, REMOVAL_LINE + 10);
    const farGone = world.spawn(circleShape(10), 20, REMOVAL_LINE + 50);

    new CullSystem(world).update();

    expect(idsOf(world)).toEqual([stillInside.id, justInside.id]);
    expect(world.shapes.has(exactlyGone.id)).toBe(false);
    expect(world.shapes.has(farGone.id)).toBe(false);
  });

  it('keeps a shape whose top edge is below the bottom edge but within the clearance', () => {
    const world = createWorld();
    const falling = world.spawn(circleShape(10), 50, HEIGHT + 10 + 1);

    new CullSystem(world).update();

    expect(world.shapes.has(falling.id)).toBe(true);
  });

  it('removes a lopsided shape when its real top reaches the removal line', () => {
    const world = createWorld();
    const shortAbove = boxShape({ minX: -5, maxX: 5, minY: -10, maxY: 30 });
    const tallAbove = boxShape({ minX: -5, maxX: 5, minY: -30, maxY: 10 });
    const shortStays = world.spawn(shortAbove, 50, REMOVAL_LINE + 10 - 1);
    const shortGoes = world.spawn(shortAbove, 100, REMOVAL_LINE + 10);
    const tallStays = world.spawn(tallAbove, 150, REMOVAL_LINE + 30 - 1);
    const tallGoes = world.spawn(tallAbove, 20, REMOVAL_LINE + 30);

    new CullSystem(world).update();

    expect(idsOf(world)).toEqual([shortStays.id, tallStays.id]);
    expect(world.shapes.has(shortGoes.id)).toBe(false);
    expect(world.shapes.has(tallGoes.id)).toBe(false);
  });

  it('removes a shape that has not moved if the playfield shrinks beneath it', () => {
    const world = createWorld();
    const falling = world.spawn(circleShape(10), 100, 60);

    world.resize({ width: 200, height: 40 });
    new CullSystem(world).update();

    expect(world.shapes.has(falling.id)).toBe(false);
  });

  it('never culls shapes that are still above the top edge', () => {
    const world = createWorld();
    const falling = world.spawn(circleShape(10), 100, -13);

    new CullSystem(world).update();

    expect(world.shapes.has(falling.id)).toBe(true);
  });

  it('never culls a lopsided shape just above the top edge', () => {
    const world = createWorld();
    const apexUp = world.spawn(catalogShape('triangle', 40), 100, -23);
    const apexDown = world.spawn(catalogShape('triangle', 40, Math.PI), 100, -43);

    new CullSystem(world).update();

    expect(world.shapes.has(apexUp.id)).toBe(true);
    expect(world.shapes.has(apexDown.id)).toBe(true);
  });

  it('announces removals in insertion order, after the shape has left the map', () => {
    const world = createWorld();
    const removed: FallingShape[] = [];
    const stillPresent: boolean[] = [];
    world.onRemoved((falling) => {
      removed.push(falling);
      stillPresent.push(world.shapes.has(falling.id));
    });
    const first = world.spawn(circleShape(10), 10, REMOVAL_LINE + 20);
    world.spawn(circleShape(10), 20, 50);
    const third = world.spawn(circleShape(10), 30, REMOVAL_LINE + 20);

    new CullSystem(world).update();

    expect(removed).toEqual([first, third]);
    expect(stillPresent).toEqual([false, false]);
  });

  it('does nothing in an empty world', () => {
    const world = createWorld();

    expect(() => {
      new CullSystem(world).update();
    }).not.toThrow();
  });
});
