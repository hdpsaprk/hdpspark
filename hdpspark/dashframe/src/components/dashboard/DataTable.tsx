import React from 'react';
import { DashboardTable } from '../../types';
import { fmt } from '../../lib/fmt';

interface Props {
  table: DashboardTable;
}

export const DataTable: React.FC<Props> = ({ table }) => (
  <div>
    <h3
      className="font-syne text-[13px] font-bold mb-3"
      style={{ color: '#F1F5F9' }}
    >
      {table.title}
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {table.columns.map((col, i) => (
              <th
                key={i}
                className="text-left font-syne text-[10px] font-bold uppercase px-3 py-2"
                style={{
                  color: '#64748B',
                  borderBottom: '1px solid #1F2D45',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-[#1E293B]">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="font-mono text-[11px] px-3 py-2"
                  style={{
                    color: '#F1F5F9',
                    borderBottom: '1px solid #1E293B',
                  }}
                >
                  {fmt(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
