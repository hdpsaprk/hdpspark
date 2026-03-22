import React from 'react';
import { AppStep } from '../../types';
import { StepPill } from '../ui/StepPill';

interface Props {
  step: AppStep;
}

export const Header: React.FC<Props> = ({ step }) => (
  <header
    className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
    style={{
      background: '#111827',
      borderBottom: '1px solid #1F2D45',
    }}
  >
    <div className="font-mono text-[13px] font-bold tracking-wider">
      <span style={{ color: '#3B82F6' }}>DASH</span>
      <span style={{ color: '#64748B' }}>FRAME</span>
    </div>
    <div className="flex items-center gap-2">
      <StepPill number={1} label="INPUT" currentStep={step} />
      <StepPill number={2} label="ANALYZE" currentStep={step} />
      <StepPill number={3} label="DASHBOARD" currentStep={step} />
    </div>
  </header>
);
