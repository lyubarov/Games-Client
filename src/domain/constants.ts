import type { Size } from './geometry/types';

export const MAX_FRAME_MS = 250;
export const MAX_ACTIVE_SHAPES = 400;
export const DEFAULT_PLAYFIELD: Size = { width: 800, height: 600 };

export const SHAPE_SIZING = { minRatio: 0.045, maxRatio: 0.09, minPx: 20, maxPx: 56 } as const;

export const OUTLINE_WIDTH_RATIO = 0.07;
export const EDGE_CLEARANCE_PX = Math.ceil((SHAPE_SIZING.maxPx * OUTLINE_WIDTH_RATIO) / 2) + 1;
