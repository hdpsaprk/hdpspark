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
          style={{ background: '#FFFFFF', border: '1px solid #E8E6DC' }}
        >
          <h3
            className="font-heading text-[13px] font-bold mb-1"
            style={{ color: '#141413' }}
          >
            {chart.title}
          </h3>
          <p
            className="font-body text-[11px] mb-3"
            style={{ color: '#B0AEA5' }}
          >
            {chart.description}
          </p>
          <ChartWidget chart={chart} />
        </div>
      ))}
    </div>
  );
};
