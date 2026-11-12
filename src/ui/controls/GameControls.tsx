import { COPY, formatNumber, PARAMETER_IDS, type GameStore } from '@/app';
import { useGameStore } from '../hooks/useGameStore';
import { Stepper } from './Stepper';
import './GameControls.css';

interface GameControlsProps {
  readonly store: GameStore;
}

export function GameControls({ store }: GameControlsProps) {
  const parameters = useGameStore(store, (state) => state.parameters);

  return (
    <div className="controls">
      {PARAMETER_IDS.map((id) => {
        const { label, unit } = COPY.parameters[id];
        const { value, canDecrease, canIncrease } = parameters[id];
        return (
          <Stepper
            key={id}
            label={label}
            valueText={formatNumber(value)}
            unit={unit}
            decreaseLabel={COPY.decrease(label)}
            increaseLabel={COPY.increase(label)}
            canDecrease={canDecrease}
            canIncrease={canIncrease}
            onDecrease={() => {
              store.adjust(id, 'decrease');
            }}
            onIncrease={() => {
              store.adjust(id, 'increase');
            }}
          />
        );
      })}
    </div>
  );
}
