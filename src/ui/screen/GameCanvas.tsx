import { COPY, type GameServices } from '@/app';
import { useGameEngine } from '../hooks/useGameEngine';
import './GameCanvas.css';

interface GameCanvasProps {
  readonly services: GameServices;
  readonly drawCounters: boolean;
}

export function GameCanvas({ services, drawCounters }: GameCanvasProps) {
  const { hostRef, startFailed } = useGameEngine(services, drawCounters);

  return (
    <div className="playfield">
      <div ref={hostRef} className="playfield__host" role="img" aria-label={COPY.playfieldLabel} />
      {startFailed && (
        <p className="playfield__error" role="alert">
          {COPY.rendererError}
        </p>
      )}
    </div>
  );
}
