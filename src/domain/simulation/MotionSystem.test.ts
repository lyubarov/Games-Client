import { describe, expect, it } from 'vitest';
import { circleShape } from '@/testing/fixtures';
import { MotionSystem } from './MotionSystem';
import { World } from './World';

function createWorld(): World {
  return new World({ width: 200, height: 1000 });
}

describe('MotionSystem', () => {
  it('moves a falling shape ½·g·t² from rest, however the time is sliced', () => {
    const fallAfterOneSecond = (frames: number): number => {
      const world = createWorld();
      const falling = world.spawn(circleShape(10), 100, 0);
      const system = new MotionSystem(world, { gravity: 200 });
      for (let frame = 0; frame < frames; frame += 1) {
        system.update(1 / frames);
      }
      return falling.y;
    };

    expect(fallAfterOneSecond(1)).toBeCloseTo(100, 9);
    expect(fallAfterOneSecond(7)).toBeCloseTo(100, 9);
    expect(fallAfterOneSecond(60)).toBeCloseTo(100, 9);
  });

  it('accelerates: the speed grows linearly with time', () => {
    const world = createWorld();
    const falling = world.spawn(circleShape(10), 100, 0);
    const system = new MotionSystem(world, { gravity: 200 });

    system.update(0.5);

    expect(falling.velocityY).toBeCloseTo(100, 9);
  });

  it('reads the gravity setting on every update and keeps the speed it already has', () => {
    const world = createWorld();
    const settings = { gravity: 100 };
    const falling = world.spawn(circleShape(10), 100, 0);
    const system = new MotionSystem(world, settings);

    system.update(1);
    settings.gravity = 0;
    system.update(1);

    expect(falling.velocityY).toBeCloseTo(100, 9);
    expect(falling.y).toBeCloseTo(50 + 100, 9);
  });

  it('moves every shape and never sideways', () => {
    const world = createWorld();
    const first = world.spawn(circleShape(10), 30, 0);
    const second = world.spawn(circleShape(10), 170, 400);

    new MotionSystem(world, { gravity: 120 }).update(1);

    expect(first.y).toBeCloseTo(60, 9);
    expect(second.y).toBeCloseTo(460, 9);
    expect([first.x, second.x]).toEqual([30, 170]);
  });
});
