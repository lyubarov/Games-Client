import { useId } from 'react';
import './Stepper.css';

interface StepperProps {
  readonly label: string;
  readonly valueText: string;
  readonly unit: string;
  readonly decreaseLabel: string;
  readonly increaseLabel: string;
  readonly canDecrease: boolean;
  readonly canIncrease: boolean;
  readonly onDecrease: () => void;
  readonly onIncrease: () => void;
}

export function Stepper({
  label,
  valueText,
  unit,
  decreaseLabel,
  increaseLabel,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: StepperProps) {
  const labelId = useId();

  return (
    <div className="stepper" role="group" aria-labelledby={labelId}>
      <div className="stepper__control">
        <button
          type="button"
          className="stepper__button"
          aria-label={decreaseLabel}
          aria-disabled={!canDecrease}
          onClick={canDecrease ? onDecrease : undefined}
        >
          &minus;
        </button>
        <output className="stepper__value">
          {valueText}
          {unit ? (
            <span className="stepper__unit" aria-hidden>
              {unit}
            </span>
          ) : null}
        </output>
        <button
          type="button"
          className="stepper__button"
          aria-label={increaseLabel}
          aria-disabled={!canIncrease}
          onClick={canIncrease ? onIncrease : undefined}
        >
          +
        </button>
      </div>
      <span className="stepper__label" id={labelId}>
        {label}
      </span>
    </div>
  );
}
