import { DashboardConfig } from '../types';

export function extractJSON(text: string): DashboardConfig {
  let s = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1) {
    throw new Error(
      'No JSON object found in response.\n\nRaw: ' + s.slice(0, 400)
    );
  }
  s = s.slice(first, last + 1);

  try {
    return JSON.parse(s) as DashboardConfig;
  } catch (_) {
    // continue to fix attempt
  }

  const fixed = s
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ');
  try {
    return JSON.parse(fixed) as DashboardConfig;
  } catch (e) {
    throw new Error(
      `Could not parse response JSON: ${(e as Error).message}\n\nRaw (first 400 chars): ${s.slice(0, 400)}`
    );
  }
}
