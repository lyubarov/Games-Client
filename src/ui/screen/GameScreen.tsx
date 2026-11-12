import { COPY, type GameServices } from '@/app';
import { GameControls } from '../controls/GameControls';
import { StatsPanel } from '../hud/StatsPanel';
import { GameCanvas } from './GameCanvas';
import './GameScreen.css';

interface GameScreenProps {
  readonly services: GameServices;
  readonly drawCounters: boolean;
  readonly onDrawCountersChange: (drawCounters: boolean) => void;
}

export function GameScreen({ services, drawCounters, onDrawCountersChange }: GameScreenProps) {
  return (
    <main className="game-screen">
      <h1 className="visually-hidden">{COPY.pageTitle}</h1>
      {!drawCounters && <StatsPanel store={services.store} />}
      <GameCanvas services={services} drawCounters={drawCounters} />
      <GameControls store={services.store} />
      <div className="game-screen__footer">
        <p>{COPY.hint}</p>
        <label className="game-screen__toggle">
          <input
            type="checkbox"
            checked={drawCounters}
            onChange={(event) => {
              onDrawCountersChange(event.target.checked);
            }}
          />
          {COPY.canvasCounters}
        </label>
      </div>
    </main>
  );
}
