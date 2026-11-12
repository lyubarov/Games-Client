export interface RandomSource {
  next(): number;
}

export class SystemRandom implements RandomSource {
  next(): number {
    return Math.random();
  }
}

export function randomBetween(random: RandomSource, min: number, max: number): number {
  return min + random.next() * (max - min);
}

export function randomInt(random: RandomSource, min: number, max: number): number {
  return min + Math.floor(random.next() * (max - min + 1));
}

export function pickOne<T>(random: RandomSource, items: readonly T[]): T {
  const item = items[Math.floor(random.next() * items.length)];
  if (item === undefined) {
    throw new RangeError('Cannot pick from an empty list');
  }
  return item;
}
