import { clamp } from '@/shared/clamp';
import { randomBetween, type RandomSource } from './random';

const SATURATION = { min: 0.65, max: 0.9 } as const;
const LIGHTNESS = { min: 0.5, max: 0.62 } as const;
const DEGREES_PER_TURN = 360;
const HUE_SECTOR_DEGREES = 30;
const HUE_SECTORS = 12;
const CHANNEL_PHASE = { red: 0, green: 8, blue: 4 } as const;
const RAMP_UP_AT = 3;
const RAMP_DOWN_AT = 9;
const BYTE_MAX = 255;
const RED_SHIFT = 16;
const GREEN_SHIFT = 8;

function channel(phase: number, hue: number, amplitude: number, lightness: number): number {
  const sector = (phase + hue / HUE_SECTOR_DEGREES) % HUE_SECTORS;
  const ramp = Math.min(sector - RAMP_UP_AT, RAMP_DOWN_AT - sector, 1);
  return lightness - amplitude * Math.max(-1, ramp);
}

function toByte(unit: number): number {
  return Math.round(clamp(unit, 0, 1) * BYTE_MAX);
}

function hslToHex(hue: number, saturation: number, lightness: number): number {
  const amplitude = saturation * Math.min(lightness, 1 - lightness);
  const red = toByte(channel(CHANNEL_PHASE.red, hue, amplitude, lightness));
  const green = toByte(channel(CHANNEL_PHASE.green, hue, amplitude, lightness));
  const blue = toByte(channel(CHANNEL_PHASE.blue, hue, amplitude, lightness));
  return (red << RED_SHIFT) | (green << GREEN_SHIFT) | blue;
}

export function randomColor(random: RandomSource): number {
  return hslToHex(
    random.next() * DEGREES_PER_TURN,
    randomBetween(random, SATURATION.min, SATURATION.max),
    randomBetween(random, LIGHTNESS.min, LIGHTNESS.max),
  );
}
