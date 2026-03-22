import React from 'react';
import { DashboardConfig } from '../../types';
import { SectionLabel } from '../ui/SectionLabel';
import { KpiGrid } from './KpiGrid';
import { BlockersGrid } from './BlockersGrid';
import { ChartsGrid } from './ChartsGrid';
import { InsightsList } from './InsightsList';
import { DataTable } from './DataTable';
import { Button } from '../ui/Button';

interface Props {
  config: DashboardConfig;
  onReset: () => void;
}

export const Dashboard: React.FC<Props> = ({ config, onReset }) => (
  <div className="flex flex-col gap-6">
    {/* Title section */}
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1
          className="font-syne text-[22px] font-bold"
          style={{ color: '#F1F5F9' }}
        >
          {config.title}
        </h1>
        <p className="font-syne text-[13px] mt-1" style={{ color: '#64748B' }}>
          {config.subtitle}
        </p>
        {config.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {config.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-bold uppercase"
                style={{
                  background: '#1E3A5F',
                  color: '#3B82F6',
                  border: '1px solid #3B82F640',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Button variant="secondary" onClick={onReset}>
        ↩ New
      </Button>
    </div>

    {/* KPIs */}
    {config.kpis.length > 0 && (
      <div>
        <SectionLabel label="Key Metrics" />
        <KpiGrid kpis={config.kpis} />
      </div>
    )}

    {/* Blockers */}
    {config.blockers.length > 0 && (
      <div>
        <SectionLabel label="Blockers & Risks" />
        <BlockersGrid blockers={config.blockers} />
      </div>
    )}

    {/* Charts */}
    {config.charts.length > 0 && (
      <div>
        <SectionLabel label="Charts" />
        <ChartsGrid charts={config.charts} />
      </div>
    )}

    {/* Insights */}
    {config.insights.length > 0 && (
      <div>
        <SectionLabel label="Insights" />
        <InsightsList insights={config.insights} />
      </div>
    )}

    {/* Table */}
    {config.table && config.table.columns?.length > 0 && (
      <div>
        <SectionLabel label="Summary Table" />
        <DataTable table={config.table} />
      </div>
    )}
  </div>
);
