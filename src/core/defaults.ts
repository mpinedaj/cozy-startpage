import type { Config } from './types';
import { CONFIG_VERSION } from './types';

export function defaultConfig(): Config {
  return {
    version: CONFIG_VERSION,
    name: '',
    theme: 'cafe',
    scene: 'auto',
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
}
