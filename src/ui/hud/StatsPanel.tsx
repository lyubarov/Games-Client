import { COPY, formatNumber, METRIC_IDS, type GameStore } from '@/app';
import { useGameStore } from '../hooks/useGameStore';
import './StatsPanel.css';

interface StatsPanelProps {
  readonly store: GameStore;
}

export function StatsPanel({ store }: StatsPanelProps) {
  const metrics = useGameStore(store, (state) => state.metrics);

  return (
    <dl className="stats">
      {METRIC_IDS.map((id) => {
        const { label, unit } = COPY.metrics[id];
        return (
          <div key={id} className="stats__tab">
            <dt className="stats__label">{label}</dt>
            <dd className="stats__value">
              {formatNumber(metrics[id])}
              {unit ? (
                <>
                  {' '}
                  <span className="stats__unit">{unit}</span>
                </>
              ) : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
