import React from 'react';
import { DashboardKpi } from '../../types';
import { fmt } from '../../lib/fmt';

const CHART_COLORS = [
  '#D97757', '#6A9BCC', '#788C5D', '#9B7DB8',
  '#DC2626', '#0891B2', '#EA580C', '#DB2777',
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
            background: '#FFFFFF',
            border: '1px solid #E8E6DC',
            borderTop: `2px solid ${CHART_COLORS[i % CHART_COLORS.length]}`,
          }}
        >
          <div
            className="font-heading text-[10px] font-bold uppercase"
            style={{ color: '#B0AEA5' }}
          >
            {kpi.label}
          </div>
          <div
            className="font-mono text-[28px] font-extrabold mt-1"
            style={{ color: '#141413' }}
          >
            {fmt(kpi.value)}
          </div>
          {kpi.sub && (
            <div
              className="font-mono text-[11px] mt-0.5"
              style={{ color: '#6B5E54' }}
            >
              {kpi.sub}
            </div>
          )}
          {kpi.trend && (
            <div
              className="font-heading text-[11px] font-bold mt-1"
              style={{
                color:
                  kpi.dir === 'up'
                    ? '#788C5D'
                    : kpi.dir === 'down'
                      ? '#DC2626'
                      : '#B0AEA5',
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
