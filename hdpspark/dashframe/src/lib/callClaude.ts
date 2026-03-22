import { DashboardConfig, ComputedStats } from '../types';
import { sampleRows, slimColumns } from './sampleData';
import { computeStats } from './computeStats';
import { extractJSON } from './extractJSON';

type Row = Record<string, unknown>;

const SYSTEM_PROMPT = `You are a data analyst. Always respond with only a valid JSON object.
Never include markdown fences, explanations, or any text outside the JSON object.`;

function buildPrompt(
  sheetName: string,
  totalRows: number,
  cols: string[],
  stats: ComputedStats,
  sampled: Row[],
  confluenceText: string
): string {
  let prompt = `SHEET: "${sheetName}" | ROWS: ${totalRows} | COLUMNS: ${cols.join(', ')}

PRE-COMPUTED STATS:
Numeric columns: ${JSON.stringify(stats.numericStats, null, 2)}
Category breakdowns: ${JSON.stringify(stats.categoryCounts, null, 2)}

SAMPLE ROWS (${sampled.length}):
${JSON.stringify(sampled, null, 2)}`;

  if (confluenceText.trim()) {
    prompt += `\n\nCONFLUENCE CONTEXT:\n${confluenceText.slice(0, 800)}`;
  }

  prompt += `

Return this exact JSON structure (all fields required):
{"title":"...","subtitle":"...","tags":[...],"kpis":[...],"charts":[...],"insights":[...],"blockers":[...],"table":{...}}

Requirements:
- 3-5 KPIs using the pre-computed stats
- 2-4 charts with real data arrays (max 12 points, values must be numbers)
- 3-5 insights (text may contain <strong>...</strong> for emphasis)
- 2-5 blockers with level "red", "amber", or "green" (use Confluence if provided, else flag data anomalies)
- table: 6-8 rows, 3-5 most relevant columns
- Chart types can be "bar", "line", "area", or "pie"
- Each chart data point must have "name" (string) and "value" (number)
- Each KPI can optionally have "sub", "trend", and "dir" ("up"/"down"/"neutral")
- Each blocker needs "level", "icon" (emoji), "label", and "text"
- Each insight needs "icon" (emoji) and "text"`;

  return prompt;
}

export async function callClaude(
  rows: Row[],
  confluenceText: string,
  sheetName: string
): Promise<DashboardConfig> {
  const sampled = slimColumns(sampleRows(rows, 25), 15);
  const cols = Object.keys(rows[0] || {});
  const stats = computeStats(rows);

  const userPrompt = buildPrompt(
    sheetName,
    rows.length,
    cols,
    stats,
    sampled,
    confluenceText
  );

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing VITE_ANTHROPIC_API_KEY environment variable. Add it to your .env file.'
    );
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API error ${response.status}. ${text.slice(0, 150)}`);
  }

  const json = await response.json();
  if (json.error) throw new Error('API: ' + json.error.message);
  if (!json.content?.length) throw new Error('Empty response from API.');

  const raw = json.content
    .map((b: { text?: string }) => b.text ?? '')
    .join('');
  return extractJSON(raw);
}
