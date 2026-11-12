import { useEffect, useRef, useState } from 'react';
import type { GameServices } from '@/app';
import { GameEngine } from '@/engine';

const NEXT_TASK_MS = 0;

function startOnNextTask(engine: GameEngine, onFailure: (error: unknown) => void): () => void {
  let stopped = false;
  const timer = setTimeout(() => {
    engine.start().catch((error: unknown) => {
      if (!stopped) {
        onFailure(error);
      }
    });
  }, NEXT_TASK_MS);

  return () => {
    stopped = true;
    clearTimeout(timer);
    engine.dispose();
  };
}

export function useGameEngine({ simulation, store }: GameServices, drawCounters: boolean) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [startFailed, setStartFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const engine = new GameEngine({ host, simulation, store });
    engineRef.current = engine;
    const stop = startOnNextTask(engine, (error) => {
      console.error(error);
      setStartFailed(true);
    });
    return () => {
      engineRef.current = null;
      stop();
    };
  }, [simulation, store]);

  useEffect(() => {
    engineRef.current?.setDrawCounters(drawCounters);
  }, [drawCounters, simulation, store]);

  return { hostRef, startFailed };
}
