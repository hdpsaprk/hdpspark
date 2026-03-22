import { ComputedStats, NumericStats } from '../types';

type Row = Record<string, unknown>;

export function computeStats(rows: Row[]): ComputedStats {
  const cols = Object.keys(rows[0] || {});

  const numericCols = cols.filter((c) =>
    rows.some((r) => typeof r[c] === 'number' && !isNaN(Number(r[c])))
  );
  const catCols = cols.filter((c) => !numericCols.includes(c));

  const numericStats: Record<string, NumericStats> = {};
  numericCols.slice(0, 8).forEach((c) => {
    const vals = rows.map((r) => Number(r[c])).filter((v) => !isNaN(v));
    if (!vals.length) return;
    numericStats[c] = {
      sum: vals.reduce((a, b) => a + b, 0),
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      count: vals.length,
    };
  });

  const categoryCounts: Record<string, [string, number][]> = {};
  catCols.slice(0, 5).forEach((c) => {
    const cnt: Record<string, number> = {};
    rows.forEach((r) => {
      const v = String(r[c] ?? '');
      cnt[v] = (cnt[v] || 0) + 1;
    });
    categoryCounts[c] = Object.entries(cnt)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  });

  return { numericStats, categoryCounts };
}
