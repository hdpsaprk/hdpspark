import React from 'react';
import { DashboardKpi } from '../../types';
import { fmt } from '../../lib/fmt';

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#F97316', '#EC4899',
];

interface Props {
  kpis: DashboardKpi[];
}

export const KpiGrid: React.FC<Props> = ({ kpis }) => {
  const cols = Math.min(kpis.length, 5);

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="rounded-[12px] p-4"
          style={{
            background: '#161D2E',
            border: '1px solid #1F2D45',
            borderTop: `2px solid ${CHART_COLORS[i % CHART_COLORS.length]}`,
          }}
        >
          <div
            className="font-syne text-[10px] font-bold uppercase"
            style={{ color: '#64748B' }}
          >
            {kpi.label}
          </div>
          <div
            className="font-mono text-[28px] font-extrabold mt-1"
            style={{ color: '#F1F5F9' }}
          >
            {fmt(kpi.value)}
          </div>
          {kpi.sub && (
            <div
              className="font-mono text-[11px] mt-0.5"
              style={{ color: '#64748B' }}
            >
              {kpi.sub}
            </div>
          )}
          {kpi.trend && (
            <div
              className="font-syne text-[11px] font-bold mt-1"
              style={{
                color:
                  kpi.dir === 'up'
                    ? '#10B981'
                    : kpi.dir === 'down'
                      ? '#EF4444'
                      : '#64748B',
              }}
            >
              {kpi.trend}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
