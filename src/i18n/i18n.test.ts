import { describe, expect, it } from 'vitest';
import { t, tf } from './index';

describe('i18n', () => {
  it('returns the string for the requested language', () => {
    expect(t('en', 'links')).toBe('Links');
    expect(t('es', 'links')).toBe('Enlaces');
  });

  it('fills named placeholders', () => {
    expect(tf('en', 'tasksProgress', { done: 2, total: 5 })).toBe('Done: 2/5');
    expect(tf('es', 'tasksProgress', { done: 2, total: 5 })).toBe('Hechas: 2/5');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(tf('en', 'tasksProgress', { done: 1 })).toBe('Done: 1/{total}');
  });
});
