import type { SimulationSettings } from '@/domain';

export const PARAMETER_IDS = ['spawnRate', 'gravity'] as const;
export type ParameterId = (typeof PARAMETER_IDS)[number];

interface ParameterLimits {
  readonly initial: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export const PARAMETERS: Readonly<Record<ParameterId, ParameterLimits>> = {
  spawnRate: { initial: 1, min: 0, max: 20, step: 1 },
  gravity: { initial: 120, min: 20, max: 600, step: 20 },
};

export function initialSettings(): SimulationSettings {
  return { spawnRate: PARAMETERS.spawnRate.initial, gravity: PARAMETERS.gravity.initial };
}
