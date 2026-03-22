export interface SheetData {
  [sheetName: string]: Record<string, unknown>[];
}

export interface ParsedFile {
  fileName: string;
  sheetNames: string[];
  sheets: SheetData;
}

export interface NumericStats {
  sum: number;
  avg: number;
  min: number;
  max: number;
  count: number;
}

export interface ComputedStats {
  numericStats: Record<string, NumericStats>;
  categoryCounts: Record<string, [string, number][]>;
}

export type ChartType = "bar" | "line" | "area" | "pie";
export type TrendDir = "up" | "down" | "neutral";
export type BlockerLevel = "red" | "amber" | "green";

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface DashboardKpi {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  dir?: TrendDir;
}

export interface DashboardChart {
  type: ChartType;
  title: string;
  description: string;
  data: ChartDataPoint[];
}

export interface DashboardInsight {
  icon: string;
  text: string;
}

export interface DashboardBlocker {
  level: BlockerLevel;
  icon: string;
  label: string;
  text: string;
}

export interface DashboardTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface DashboardConfig {
  title: string;
  subtitle: string;
  tags: string[];
  kpis: DashboardKpi[];
  charts: DashboardChart[];
  insights: DashboardInsight[];
  blockers: DashboardBlocker[];
  table: DashboardTable;
}

export type AppStep = 1 | 2 | 3;

export interface AppState {
  parsedFile: ParsedFile | null;
  activeSheet: string;
  confluence: string;
  loading: boolean;
  loadMsg: string;
  dashboard: DashboardConfig | null;
  error: string;
  errorDetail: string;
}
