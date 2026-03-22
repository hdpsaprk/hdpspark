import React from 'react';
import { DashboardInsight } from '../../types';

interface Props {
  insights: DashboardInsight[];
}

export const InsightsList: React.FC<Props> = ({ insights }) => (
  <div className="flex flex-col gap-[10px]">
    {insights.map((item, i) => (
      <div key={i} className="flex gap-3">
        <span className="text-[14px] flex-shrink-0">{item.icon}</span>
        <div
          className="font-syne text-[12px]"
          style={{ color: '#94A3B8', lineHeight: 1.55 }}
          dangerouslySetInnerHTML={{ __html: item.text }}
        />
      </div>
    ))}
  </div>
);
