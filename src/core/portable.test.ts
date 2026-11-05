import { describe, expect, it } from 'vitest';
import { defaultConfig } from './defaults';
import { CONFIG_VERSION } from './types';
import { exportConfig, importConfig } from './portable';

/** Config exported by v1.0.0, before full-bleed scenes and sceneTime. */
const v1Backup = {
  version: 1,
  name: 'Ada',
  theme: 'night',
  scene: 'moon',
  clockFormat: '24',
  searchEngine: 'duckduckgo',
  effects: true,
  reducedMotion: 'system',
  language: 'en',
  links: [],
  tasks: [],
  weather: { enabled: false, city: '' },
  focusMode: false,
};

describe('portable config', () => {
  it('round-trips a config', () => {
    const config = defaultConfig();
    config.name = 'Martín';
    config.language = 'es';
    config.theme = 'night';
    config.scene = 'rainy-window';
    config.sceneTime = 'dusk';
    config.tasks.push({ id: 't1', text: 'water plants', done: true });
    config.links.push({ id: 'l1', title: 'GitHub', url: 'https://github.com' });
    config.weather = { enabled: true, city: 'Madrid' };

    const result = importConfig(exportConfig(config));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.name).toBe('Martín');
    expect(result.config.language).toBe('es');
    expect(result.config.theme).toBe('night');
    expect(result.config.scene).toBe('rainy-window');
    expect(result.config.sceneTime).toBe('dusk');
    expect(result.config.tasks).toEqual([{ id: 't1', text: 'water plants', done: true }]);
    expect(result.config.links).toEqual([{ id: 'l1', title: 'GitHub', url: 'https://github.com' }]);
    expect(result.config.weather).toEqual({ enabled: true, city: 'Madrid' });
    expect(result.config.version).toBe(CONFIG_VERSION);
  });

  it('writes readable JSON with a trailing newline', () => {
    const text = exportConfig(defaultConfig());
    expect(text.endsWith('\n')).toBe(true);
    expect(text).toContain('\n  "version": 2,');
  });

  it('imports a v1.0.0 backup', () => {
    const result = importConfig(JSON.stringify(v1Backup));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.version).toBe(CONFIG_VERSION);
    expect(result.config.scene).toBe('mountain-lake');
    expect(result.config.sceneTime).toBe('auto');
    expect(result.config.theme).toBe('night');
  });

  it('rejects malformed JSON', () => {
    expect(importConfig('{ not json')).toEqual({ ok: false, reason: 'json' });
  });

  it('rejects values that are not objects', () => {
    expect(importConfig('[]')).toEqual({ ok: false, reason: 'shape' });
    expect(importConfig('"hello"')).toEqual({ ok: false, reason: 'shape' });
    expect(importConfig('null')).toEqual({ ok: false, reason: 'shape' });
  });

  it('rejects files from a newer version', () => {
    expect(importConfig(JSON.stringify({ version: CONFIG_VERSION + 1 }))).toEqual({
      ok: false,
      reason: 'version',
    });
  });

  it('sanitises unknown and invalid fields', () => {
    const result = importConfig(
      JSON.stringify({
        version: 0,
        theme: 'neon',
        scene: 'volcano',
        sceneTime: 'noon',
        clockFormat: '36',
        language: 'fr',
        links: [{ id: 'a', title: 'ok', url: 'https://ok.test' }, { nope: true }],
        tasks: [{ id: 't', text: 'keep', done: false }, 'bad'],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.theme).toBe('cafe');
    expect(result.config.scene).toBe('auto');
    expect(result.config.sceneTime).toBe('auto');
    expect(result.config.clockFormat).toBe('24');
    expect(result.config.language).toBe('en');
    expect(result.config.links).toHaveLength(1);
    expect(result.config.tasks).toHaveLength(1);
  });
});
