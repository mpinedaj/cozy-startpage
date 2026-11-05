import { CONFIG_VERSION, LEGACY_SCENES, SCENE_IDS, STORAGE_KEY, type Config } from './types';
import { defaultConfig } from './defaults';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

const SCENE_VALUES: readonly string[] = ['auto', ...SCENE_IDS];

/** Accept a v2 scene id, translate a v1 motif id, or fall back to auto. */
export function normalizeScene(value: unknown): Config['scene'] {
  if (typeof value !== 'string') return 'auto';
  if (SCENE_VALUES.includes(value)) return value as Config['scene'];
  return LEGACY_SCENES[value] ?? 'auto';
}

function migrate(raw: unknown): Config {
  const base = defaultConfig();
  if (!isObject(raw)) return base;
  // v1 -> v2: motif scenes became full-bleed scenes and sceneTime was added.
  const cfg: Config = {
    ...base,
    version: CONFIG_VERSION,
    name: asString(raw.name, base.name),
    theme: ['cafe', 'forest', 'lavender', 'night'].includes(raw.theme as string)
      ? (raw.theme as Config['theme'])
      : base.theme,
    scene: normalizeScene(raw.scene),
    sceneTime: ['auto', 'dawn', 'day', 'dusk', 'night'].includes(raw.sceneTime as string)
      ? (raw.sceneTime as Config['sceneTime'])
      : base.sceneTime,
    clockFormat:
      raw.clockFormat === '12' ? '12' : raw.clockFormat === '24' ? '24' : base.clockFormat,
    searchEngine: ['duckduckgo', 'google', 'bing', 'brave'].includes(raw.searchEngine as string)
      ? (raw.searchEngine as Config['searchEngine'])
      : base.searchEngine,
    effects: asBool(raw.effects, base.effects),
    reducedMotion:
      raw.reducedMotion === 'system' || raw.reducedMotion === 'on' || raw.reducedMotion === 'off'
        ? (raw.reducedMotion as Config['reducedMotion'])
        : base.reducedMotion,
    language: raw.language === 'es' ? 'es' : 'en',
    links: Array.isArray(raw.links)
      ? (raw.links as Config['links']).filter(isValidLink)
      : base.links,
    tasks: Array.isArray(raw.tasks)
      ? (raw.tasks as Config['tasks']).filter(isValidTask)
      : base.tasks,
    weather: isObject(raw.weather)
      ? {
          enabled: asBool(raw.weather.enabled, base.weather.enabled),
          city: asString(raw.weather.city, base.weather.city),
        }
      : base.weather,
    focusMode: asBool(raw.focusMode, base.focusMode),
  };
  return cfg;
}

function isValidLink(v: unknown): v is { id: string; title: string; url: string } {
  if (!isObject(v)) return false;
  return typeof v.id === 'string' && typeof v.title === 'string' && typeof v.url === 'string';
}

function isValidTask(v: unknown): v is { id: string; text: string; done: boolean } {
  if (!isObject(v)) return false;
  return typeof v.id === 'string' && typeof v.text === 'string' && typeof v.done === 'boolean';
}

export function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(config: Config): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export { migrate };
