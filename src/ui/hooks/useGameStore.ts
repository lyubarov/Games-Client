import { useSyncExternalStore } from 'react';
import type { GameState, GameStore } from '@/app';

export function useGameStore<T>(store: GameStore, select: (state: GameState) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(store.getSnapshot()));
}
