import { Container } from 'pixi.js';
import { describe, expect, it } from 'vitest';
import { allShapes, createSeededGame, setSpawnRate } from '@/testing/game';
import { ShapeContextCache } from './ShapeContextCache';
import type { ShapeView } from './ShapeView';
import { ShapeSynchronizer } from './ShapeSynchronizer';

function setup() {
  const { simulation, store } = createSeededGame();
  setSpawnRate(store, 0);
  const layer = new Container<ShapeView>();
  const contexts = new ShapeContextCache();
  const synchronizer = new ShapeSynchronizer(simulation, layer, contexts);
  return { simulation, layer, contexts, synchronizer };
}

describe('ShapeSynchronizer', () => {
  it('shows every shape and drops the view of a removed one', () => {
    const { simulation, layer } = setup();

    simulation.spawnAt(100, 100);
    simulation.spawnAt(200, 100);
    expect(layer.children).toHaveLength(2);

    simulation.removeShape(allShapes(simulation)[0]?.id ?? -1);
    expect(layer.children).toHaveLength(1);
  });

  it('reuses the view of a removed shape instead of creating a new one', () => {
    const { simulation, layer } = setup();
    simulation.spawnAt(100, 100);
    const [view] = layer.children;

    simulation.removeShape(allShapes(simulation)[0]?.id ?? -1);
    simulation.spawnAt(300, 200);

    expect(layer.children).toEqual([view]);
  });

  it('follows the simulation and empties the layer on dispose', () => {
    const { simulation, layer, contexts, synchronizer } = setup();
    simulation.spawnAt(100, 100);
    simulation.spawnAt(200, 100);

    synchronizer.dispose();
    simulation.spawnAt(300, 100);

    expect(layer.children).toHaveLength(0);
    contexts.dispose();
  });
});
