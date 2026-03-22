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
  let border = '#1F2D45';
  let color = '#475569';

  if (isActive) {
    bg = '#1E3A5F';
    border = '#3B82F6';
    color = '#3B82F6';
  } else if (isDone) {
    border = '#10B981';
    color = '#10B981';
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-[20px] font-syne text-[11px] font-semibold uppercase"
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
