import React from 'react';
import { DashboardTable } from '../../types';
import { fmt } from '../../lib/fmt';

interface Props {
  table: DashboardTable;
}

export const DataTable: React.FC<Props> = ({ table }) => (
  <div>
    <h3
      className="font-heading text-[13px] font-bold mb-3"
      style={{ color: '#141413' }}
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
                className="text-left font-heading text-[10px] font-bold uppercase px-3 py-2"
                style={{
                  color: '#B0AEA5',
                  borderBottom: '1px solid #E8E6DC',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-[#F3F0E8]">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="font-mono text-[11px] px-3 py-2"
                  style={{
                    color: '#141413',
                    borderBottom: '1px solid #F3F0E8',
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
