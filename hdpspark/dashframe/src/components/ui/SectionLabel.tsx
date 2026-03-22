import React from 'react';

interface Props {
  label: string;
}

export const SectionLabel: React.FC<Props> = ({ label }) => (
  <div className="flex items-center gap-2 mb-[10px]">
    <span
      className="font-heading text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{ color: '#B0AEA5' }}
    >
      {label}
    </span>
    <div className="flex-1 h-px" style={{ background: '#E8E6DC' }} />
  </div>
);
