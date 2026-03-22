import React from 'react';
import { DashboardBlocker } from '../../types';

const LEVEL_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  red:   { bg: '#FEF2F2', border: '#FECACA', label: '#DC2626' },
  amber: { bg: '#FFFBEB', border: '#FDE68A', label: '#D97706' },
  green: { bg: '#F0FDF4', border: '#BBF7D0', label: '#788C5D' },
};

interface Props {
  blockers: DashboardBlocker[];
}

export const BlockersGrid: React.FC<Props> = ({ blockers }) => (
  <div
    className="grid gap-[10px]"
    style={{
      gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    }}
  >
    {blockers.map((b, i) => {
      const s = LEVEL_STYLES[b.level] || LEVEL_STYLES.amber;
      return (
        <div
          key={i}
          className="rounded-[12px] p-4 flex gap-3"
          style={{ background: s.bg, border: `1px solid ${s.border}` }}
        >
          <span className="text-[14px] flex-shrink-0">{b.icon}</span>
          <div>
            <div
              className="font-heading text-[10px] font-bold uppercase"
              style={{ color: s.label }}
            >
              {b.label}
            </div>
            <div
              className="font-body text-[12px] mt-1"
              style={{ color: '#6B5E54', lineHeight: 1.4 }}
            >
              {b.text}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
