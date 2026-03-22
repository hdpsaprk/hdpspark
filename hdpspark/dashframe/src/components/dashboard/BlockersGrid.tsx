import React from 'react';
import { DashboardBlocker } from '../../types';

const LEVEL_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  red: { bg: '#EF444412', border: '#EF444438', label: '#EF4444' },
  amber: { bg: '#F59E0B12', border: '#F59E0B38', label: '#F59E0B' },
  green: { bg: '#10B98112', border: '#10B98138', label: '#10B981' },
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
              className="font-syne text-[10px] font-bold uppercase"
              style={{ color: s.label }}
            >
              {b.label}
            </div>
            <div
              className="font-syne text-[12px] mt-1"
              style={{ color: '#64748B', lineHeight: 1.4 }}
            >
              {b.text}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
