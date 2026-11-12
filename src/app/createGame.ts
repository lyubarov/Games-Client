import {
  CullSystem,
  DEFAULT_PLAYFIELD,
  MotionSystem,
  ShapeFactory,
  SpawnSystem,
  SystemRandom,
  World,
  type RandomSource,
} from '@/domain';
import { GameSession } from './GameSession';
import { initialSettings } from './parameters';
import type { GameServices } from './ports';

export function createGame(random: RandomSource = new SystemRandom()): GameServices {
  const world = new World(DEFAULT_PLAYFIELD);
  const settings = initialSettings();
  const factory = new ShapeFactory(random);
  const systems = [
    new SpawnSystem(world, factory, random, settings),
    new MotionSystem(world, settings),
    new CullSystem(world),
  ];
  const session = new GameSession(world, systems, settings, factory);
  return { simulation: session, store: session };
}
