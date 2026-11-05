import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, saveConfig, migrate, normalizeScene } from './storage';
import { defaultConfig } from './defaults';
import { CONFIG_VERSION, STORAGE_KEY } from './types';

/**
 * Shape of a real config exported by v1.0.0. Kept verbatim (including the
 * motif scene ids) so the v1 -> v2 migration is exercised end to end.
 */
const v1Backup = {
  version: 1,
  name: 'Ada',
  theme: 'forest',
  scene: 'tree',
  clockFormat: '12',
  searchEngine: 'google',
  effects: false,
  reducedMotion: 'on',
  language: 'es',
  links: [{ id: 'l1', title: 'GitHub', url: 'https://github.com' }],
  tasks: [{ id: 't1', text: 'regar plantas', done: true }],
  weather: { enabled: true, city: 'Madrid' },
  focusMode: false,
};

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('returns default when empty', () => {
    expect(loadConfig()).toEqual(defaultConfig());
  });

  it('round trips', () => {
    const c = defaultConfig();
    c.name = 'Ada';
    saveConfig(c);
    expect(loadConfig().name).toBe('Ada');
  });

  it('migrates partial', () => {
    const m = migrate({ name: 'Bob' });
    expect(m.name).toBe('Bob');
    expect(m.version).toBe(CONFIG_VERSION);
    expect(m.scene).toBe('auto');
    expect(m.sceneTime).toBe('auto');
  });

  it('migrates a v1.0.0 backup to v2', () => {
    const m = migrate(v1Backup);
    expect(m.version).toBe(2);
    expect(m.scene).toBe('forest-dusk');
    expect(m.sceneTime).toBe('auto');
    expect(m.name).toBe('Ada');
    expect(m.theme).toBe('forest');
    expect(m.clockFormat).toBe('12');
    expect(m.searchEngine).toBe('google');
    expect(m.effects).toBe(false);
    expect(m.reducedMotion).toBe('on');
    expect(m.language).toBe('es');
    expect(m.links).toEqual(v1Backup.links);
    expect(m.tasks).toEqual(v1Backup.tasks);
    expect(m.weather).toEqual(v1Backup.weather);
  });

  it('loads a v1 config straight from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Backup));
    const config = loadConfig();
    expect(config.version).toBe(CONFIG_VERSION);
    expect(config.scene).toBe('forest-dusk');
    expect(config.language).toBe('es');
  });

  it('maps every legacy scene id', () => {
    expect(normalizeScene('mug')).toBe('cafe-interior');
    expect(normalizeScene('tree')).toBe('forest-dusk');
    expect(normalizeScene('candle')).toBe('rainy-window');
    expect(normalizeScene('moon')).toBe('mountain-lake');
  });

  it('keeps known v2 scenes and drops unknown values', () => {
    expect(normalizeScene('rainy-window')).toBe('rainy-window');
    expect(normalizeScene('auto')).toBe('auto');
    expect(normalizeScene('volcano')).toBe('auto');
    expect(normalizeScene(42)).toBe('auto');
    expect(normalizeScene(null)).toBe('auto');
  });

  it('validates sceneTime', () => {
    expect(migrate({ sceneTime: 'dusk' }).sceneTime).toBe('dusk');
    expect(migrate({ sceneTime: 'noon' }).sceneTime).toBe('auto');
    expect(migrate({ sceneTime: 7 }).sceneTime).toBe('auto');
  });

  it('rejects bad links', () => {
    const m = migrate({ links: [{ id: 1 }] });
    expect(m.links).toEqual([]);
  });
});
