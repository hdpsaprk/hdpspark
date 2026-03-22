import React from 'react';

interface Props {
  label: string;
}

export const SectionLabel: React.FC<Props> = ({ label }) => (
  <div className="flex items-center gap-2 mb-[10px]">
    <span
      className="font-syne text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{ color: '#64748B' }}
    >
      {label}
    </span>
    <div className="flex-1 h-px" style={{ background: '#1F2D45' }} />
  </div>
);
