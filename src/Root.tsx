import { useState } from 'react';
import { createGame } from '@/app';
import { GameScreen } from '@/ui';

function wantsCanvasCounters(search: string): boolean {
  return new URLSearchParams(search).get('hud') === 'pixi';
}

export default function Root() {
  const [services] = useState(createGame);
  const [drawCounters, setDrawCounters] = useState(() =>
    wantsCanvasCounters(window.location.search),
  );

  return (
    <GameScreen
      services={services}
      drawCounters={drawCounters}
      onDrawCountersChange={setDrawCounters}
    />
  );
}
