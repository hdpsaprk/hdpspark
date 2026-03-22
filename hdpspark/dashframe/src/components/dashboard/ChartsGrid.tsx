import React from 'react';
import { DashboardChart } from '../../types';
import { ChartWidget } from './ChartWidget';

interface Props {
  charts: DashboardChart[];
}

export const ChartsGrid: React.FC<Props> = ({ charts }) => {
  const cols = charts.length === 1 ? '1fr' : 'repeat(2, 1fr)';

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: cols }}>
      {charts.map((chart, i) => (
        <div
          key={i}
          className="rounded-[12px] p-5"
          style={{ background: '#161D2E', border: '1px solid #1F2D45' }}
        >
          <h3
            className="font-syne text-[13px] font-bold mb-1"
            style={{ color: '#F1F5F9' }}
          >
            {chart.title}
          </h3>
          <p
            className="font-syne text-[11px] mb-3"
            style={{ color: '#64748B' }}
          >
            {chart.description}
          </p>
          <ChartWidget chart={chart} />
        </div>
      ))}
    </div>
  );
};
