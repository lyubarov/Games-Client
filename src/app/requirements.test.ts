import { describe, expect, it } from 'vitest';
import type { Shape, Size } from '@/domain';
import {
  adjustTimes,
  allShapes,
  createSeededGame,
  onlyShape,
  runFrames,
  setSpawnRate,
} from '@/testing/game';
import type { GameServices, Simulation } from './index';

const FIELD: Size = { width: 800, height: 600 };
const JUST_OVER_TEN_SECONDS_MS = 10_100;
const CATALOG_KINDS = ['triangle', 'quad', 'pentagon', 'hexagon', 'circle', 'ellipse', 'star'];

function gameWithSpawnRate(rate: number): GameServices {
  const game = createSeededGame();
  setSpawnRate(game.store, rate);
  return game;
}

interface Spawn {
  readonly shape: Shape;
  readonly x: number;
  readonly y: number;
}

function trackSpawns(simulation: Simulation): Spawn[] {
  const spawned: Spawn[] = [];
  simulation.onSpawned(({ shape, x, y }) => {
    spawned.push({ shape, x, y });
  });
  return spawned;
}

describe('2. Falling shapes', () => {
  it('spawn above the top edge at a random X across the width (2b, 2c)', () => {
    const { simulation } = gameWithSpawnRate(20);
    const spawned = trackSpawns(simulation);

    runFrames(simulation, 40);

    const xs = spawned.map(({ x }) => x);
    expect(spawned.length).toBeGreaterThan(30);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(FIELD.width / 2);
    for (const { shape, x, y } of spawned) {
      expect(y + shape.maxY).toBeLessThanOrEqual(0);
      expect(x + shape.minX).toBeGreaterThanOrEqual(0);
      expect(x + shape.maxX).toBeLessThanOrEqual(FIELD.width);
    }
  });

  it('are removed once they have fallen below the bottom edge (2d)', () => {
    const { simulation } = gameWithSpawnRate(0);
    simulation.spawnAt(400, FIELD.height - 10);

    runFrames(simulation, 1);
    expect(simulation.shapes.size).toBe(1);

    runFrames(simulation, 200);
    expect(simulation.shapes.size).toBe(0);
  });

  it('fall faster under a higher gravity value (2f)', () => {
    const fallInOneSecond = (gravityIncreases: number): number => {
      const { simulation, store } = gameWithSpawnRate(0);
      adjustTimes(store, 'gravity', 'increase', gravityIncreases);
      simulation.spawnAt(400, 100);
      runFrames(simulation, 20);
      return onlyShape(simulation).y - 100;
    };

    expect(fallInOneSecond(5)).toBeGreaterThan(fallInOneSecond(0));
  });

  it('are generated once per second, at any frame rate (2g)', () => {
    const spawnedWith = (frameMs: number): number => {
      const { simulation } = createSeededGame();
      const spawned = trackSpawns(simulation);
      runFrames(simulation, Math.round(JUST_OVER_TEN_SECONDS_MS / frameMs), frameMs);
      return spawned.length;
    };

    expect(spawnedWith(1000 / 60)).toBe(10);
    expect(spawnedWith(100)).toBe(10);
  });

  it('come in all seven kinds and in random colours (2h)', () => {
    const { simulation } = gameWithSpawnRate(20);
    const spawned = trackSpawns(simulation);

    runFrames(simulation, 200);

    expect(new Set(spawned.map(({ shape }) => shape.kind))).toEqual(new Set(CATALOG_KINDS));
    expect(new Set(spawned.map(({ shape }) => shape.color)).size).toBeGreaterThan(
      CATALOG_KINDS.length,
    );
  });
});

describe('3. Clicking the rectangle', () => {
  it('spawns a shape at the pointer, and it starts falling (3)', () => {
    const { simulation } = gameWithSpawnRate(0);

    simulation.spawnAt(123, 456);
    const clicked = onlyShape(simulation);
    runFrames(simulation, 4);

    expect(clicked.x).toBe(123);
    expect(clicked.y).toBeGreaterThan(456);
  });

  it('spawns an irregular shape in its own random colour each time (3a)', () => {
    const { simulation } = gameWithSpawnRate(0);

    for (const x of [100, 300, 500, 700]) {
      simulation.spawnAt(x, 300);
    }
    const clicked = allShapes(simulation);

    expect(clicked.every(({ shape }) => shape.kind === 'irregular')).toBe(true);
    expect(new Set(clicked.map(({ shape }) => shape.color)).size).toBe(clicked.length);
    expect(new Set(clicked.map(({ shape }) => shape.area)).size).toBe(clicked.length);
  });
});

describe('4. Clicking a shape', () => {
  it('removes it and leaves the others (4)', () => {
    const { simulation } = gameWithSpawnRate(0);
    simulation.spawnAt(200, 300);
    simulation.spawnAt(600, 300);
    const [clicked, other] = allShapes(simulation);

    simulation.removeShape(clicked?.id ?? -1);

    expect(allShapes(simulation).map(({ id }) => id)).toEqual([other?.id]);
  });
});

describe('5. Counters', () => {
  it('count only the shapes displayed in the rectangle (5a)', () => {
    const { simulation, store } = createSeededGame();

    runFrames(simulation, 21);
    const falling = onlyShape(simulation);
    for (let guard = 0; guard < 200 && falling.y + falling.shape.maxY <= 0; guard += 1) {
      expect(store.getSnapshot().metrics.shapeCount).toBe(0);
      runFrames(simulation, 1);
    }

    expect(falling.y + falling.shape.maxY).toBeGreaterThan(0);
    expect(store.getSnapshot().metrics.shapeCount).toBe(1);
  });

  it('show the area of a displayed shape in px² (5b)', () => {
    const { simulation, store } = gameWithSpawnRate(0);

    simulation.spawnAt(400, 300);

    expect(store.getSnapshot().metrics.totalArea).toBe(
      Math.round(onlyShape(simulation).shape.area),
    );
  });

  it('add up the areas of several shapes (5b)', () => {
    const { simulation, store } = gameWithSpawnRate(0);
    simulation.spawnAt(200, 300);
    simulation.spawnAt(600, 300);

    const area = allShapes(simulation).reduce((sum, { shape }) => sum + shape.area, 0);

    expect(store.getSnapshot().metrics).toEqual({ shapeCount: 2, totalArea: Math.round(area) });
  });
});

describe('6. Controls', () => {
  it('raise the spawn rate and the number of spawns with it (6a)', () => {
    const { simulation, store } = createSeededGame();
    const spawned = trackSpawns(simulation);

    adjustTimes(store, 'spawnRate', 'increase', 9);
    runFrames(simulation, 100);

    expect(store.getSnapshot().parameters.spawnRate.value).toBe(10);
    expect(spawned).toHaveLength(50);
  });

  it('stop at the limits instead of going past them (6)', () => {
    const { store } = createSeededGame();

    adjustTimes(store, 'spawnRate', 'increase', 30);
    expect(store.getSnapshot().parameters.spawnRate).toEqual({
      value: 20,
      canIncrease: false,
      canDecrease: true,
    });

    adjustTimes(store, 'spawnRate', 'decrease', 30);
    expect(store.getSnapshot().parameters.spawnRate).toEqual({
      value: 0,
      canIncrease: true,
      canDecrease: false,
    });
  });

  it('raise and lower the gravity value (6b)', () => {
    const { store } = createSeededGame();

    store.adjust('gravity', 'increase');
    expect(store.getSnapshot().parameters.gravity.value).toBe(140);

    adjustTimes(store, 'gravity', 'decrease', 2);
    expect(store.getSnapshot().parameters.gravity.value).toBe(100);
  });
});

describe('Frame timing', () => {
  it('does not release a burst of spawns after a long pause', () => {
    const { simulation } = gameWithSpawnRate(20);
    const spawned = trackSpawns(simulation);

    simulation.advance(5_000);

    expect(spawned).toHaveLength(5);
  });

  it('ignores zero, negative and NaN frame times', () => {
    const { simulation } = gameWithSpawnRate(20);
    simulation.spawnAt(400, 100);
    const clicked = onlyShape(simulation);

    simulation.advance(0);
    simulation.advance(-16);
    simulation.advance(Number.NaN);

    expect(simulation.shapes.size).toBe(1);
    expect(clicked.y).toBe(100);
  });
});

describe('Store', () => {
  it('returns the same snapshot until a value changes, then a new one', () => {
    const { simulation, store } = gameWithSpawnRate(0);
    const before = store.getSnapshot();

    runFrames(simulation, 5);
    expect(store.getSnapshot()).toBe(before);

    simulation.spawnAt(400, 300);
    const after = store.getSnapshot();
    expect(after).not.toBe(before);
    expect(after.parameters).toBe(before.parameters);
  });

  it('notifies subscribers once per change and stops after unsubscribe', () => {
    const { simulation, store } = gameWithSpawnRate(0);
    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    simulation.spawnAt(400, 300);
    store.adjust('gravity', 'increase');
    unsubscribe();
    store.adjust('gravity', 'increase');

    expect(notifications).toBe(2);
  });
});

describe('Memory', () => {
  it('caps the number of live shapes, for clicks and for timed spawns alike', () => {
    const { simulation } = gameWithSpawnRate(20);

    for (let click = 0; click < 450; click += 1) {
      simulation.spawnAt(400, 300);
    }
    runFrames(simulation, 4);

    expect(simulation.shapes.size).toBe(400);
  });
});
