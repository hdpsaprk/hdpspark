import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardChart } from '../../types';

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#F97316', '#EC4899',
];

const AXIS_TICK = { fill: '#64748B', fontSize: 11 };
const GRID_STYLE = { stroke: '#1F2D45', strokeDasharray: '3 3' };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#111827',
    border: '1px solid #1F2D45',
    borderRadius: 8,
    fontSize: 12,
    color: '#F1F5F9',
  },
};

interface Props {
  chart: DashboardChart;
}

export const ChartWidget: React.FC<Props> = ({ chart }) => {
  const safe = chart.data.map((d) => ({
    ...d,
    value:
      typeof d.value === 'number'
        ? d.value
        : parseFloat(String(d.value).replace(/[^0-9.-]/g, '')) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      {chart.type === 'bar' ? (
        <BarChart data={safe}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="name" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="value" barSize={20} radius={[3, 3, 0, 0]}>
            {safe.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      ) : chart.type === 'line' ? (
        <LineChart data={safe}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="name" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      ) : chart.type === 'area' ? (
        <AreaChart data={safe}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="name" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            fill={CHART_COLORS[0] + '25'}
          />
        </AreaChart>
      ) : (
        <PieChart>
          <Tooltip {...TOOLTIP_STYLE} />
          <Pie
            data={safe}
            dataKey="value"
            nameKey="name"
            outerRadius={75}
            label={({ name, percent }: { name: string; percent: number }) =>
              `${name.slice(0, 11)} ${(percent * 100).toFixed(0)}%`
            }
          >
            {safe.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      )}
    </ResponsiveContainer>
  );
};
