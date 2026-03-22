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
      background: '#FFFFFF',
      borderBottom: '1px solid #E8E6DC',
    }}
  >
    <div className="font-mono text-[13px] font-bold tracking-wider">
      <span style={{ color: '#D97757' }}>DASH</span>
      <span style={{ color: '#B0AEA5' }}>FRAME</span>
    </div>
    <div className="flex items-center gap-2">
      <StepPill number={1} label="INPUT" currentStep={step} />
      <StepPill number={2} label="ANALYZE" currentStep={step} />
      <StepPill number={3} label="DASHBOARD" currentStep={step} />
    </div>
  </header>
);
