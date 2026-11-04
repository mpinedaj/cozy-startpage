import { CONFIG_VERSION, type Config } from './types';
import { migrate } from './storage';

export type ImportFailure = 'json' | 'shape' | 'version';

export type ImportResult = { ok: true; config: Config } | { ok: false; reason: ImportFailure };

/** Pretty-printed so the file stays readable and diff-friendly. */
export function exportConfig(config: Config): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parse an exported file. Every field goes through the same migration and
 * validation as stored config, so a hand-edited file cannot inject junk.
 */
export function importConfig(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'json' };
  }
  if (!isObject(raw)) return { ok: false, reason: 'shape' };
  const version = raw.version;
  if (typeof version === 'number' && version > CONFIG_VERSION) {
    return { ok: false, reason: 'version' };
  }
  return { ok: true, config: migrate(raw) };
}
