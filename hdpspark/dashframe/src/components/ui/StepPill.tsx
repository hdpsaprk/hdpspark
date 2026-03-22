import React from 'react';
import { AppStep } from '../../types';

interface Props {
  number: 1 | 2 | 3;
  label: string;
  currentStep: AppStep;
}

export const StepPill: React.FC<Props> = ({ number, label, currentStep }) => {
  const isActive = currentStep === number;
  const isDone = currentStep > number;

  let bg = 'transparent';
  let border = '#E8E6DC';
  let color = '#B0AEA5';

  if (isActive) {
    bg = '#D9775712';
    border = '#D97757';
    color = '#D97757';
  } else if (isDone) {
    border = '#788C5D';
    color = '#788C5D';
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-[20px] font-heading text-[11px] font-semibold uppercase"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
      }}
    >
      {number}·{label}
    </span>
  );
};
