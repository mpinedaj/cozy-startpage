import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, saveConfig, migrate } from './storage';
import { defaultConfig } from './defaults';

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
    expect(m.version).toBe(1);
  });
  it('rejects bad links', () => {
    const m = migrate({ links: [{ id: 1 }] });
    expect(m.links).toEqual([]);
  });
});
