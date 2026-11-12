import { OUTLINE_WIDTH_RATIO } from '@/domain';

export const MAX_RESOLUTION = 2;
export const MAX_IDLE_VIEWS = 64;
export const GEOMETRY_SCALE = 16;

export const RENDERER_OPTIONS = {
  background: 0xffffff,
  antialias: true,
  autoDensity: true,
  preference: 'webgl',
  eventFeatures: { move: true, globalMove: false, wheel: false },
} as const;

export const DESTROY_WITH_CHILDREN = { children: true } as const;

export const SHAPE_FILL_STYLE = { color: 0xffffff } as const;
export const SHAPE_OUTLINE_STYLE = {
  width: OUTLINE_WIDTH_RATIO * GEOMETRY_SCALE,
  color: 0x000000,
  join: 'round',
} as const;
