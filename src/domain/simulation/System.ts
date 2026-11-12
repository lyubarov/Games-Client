export interface SimulationSettings {
  spawnRate: number;
  gravity: number;
}

export interface System {
  update(dtSeconds: number): void;
}
