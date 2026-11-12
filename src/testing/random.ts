import type { RandomSource } from '@/domain';

const UINT32_RANGE = 2 ** 32;
const MULBERRY32_INCREMENT = 0x6d2b79f5;

function toUint32(value: number): number {
  return value >>> 0;
}

export function createSeededRandom(seed: number): RandomSource {
  let state = toUint32(seed);
  return {
    next() {
      state = toUint32(state + MULBERRY32_INCREMENT);
      let mixed = Math.imul(state ^ (state >>> 15), state | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      return toUint32(mixed ^ (mixed >>> 14)) / UINT32_RANGE;
    },
  };
}
