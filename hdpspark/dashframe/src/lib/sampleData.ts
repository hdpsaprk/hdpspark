type Row = Record<string, unknown>;

export function sampleRows(rows: Row[], n = 25): Row[] {
  if (rows.length <= n) return rows;
  const step = Math.floor(rows.length / n);
  return rows.filter((_, i) => i % step === 0).slice(0, n);
}

export function slimColumns(rows: Row[], maxCols = 15): Row[] {
  if (!rows.length) return rows;
  const keys = Object.keys(rows[0]).slice(0, maxCols);
  return rows.map((r) => {
    const o: Row = {};
    keys.forEach((k) => (o[k] = r[k]));
    return o;
  });
}
