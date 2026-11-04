import { describe, expect, it } from 'vitest';
import { prefersReducedMotion } from './motion';

describe('prefersReducedMotion', () => {
  it('follows the system preference when set to system', () => {
    expect(prefersReducedMotion('system', true)).toBe(true);
    expect(prefersReducedMotion('system', false)).toBe(false);
  });

  it('always reduces when set to on', () => {
    expect(prefersReducedMotion('on', true)).toBe(true);
    expect(prefersReducedMotion('on', false)).toBe(true);
  });

  it('never reduces when set to off', () => {
    expect(prefersReducedMotion('off', true)).toBe(false);
    expect(prefersReducedMotion('off', false)).toBe(false);
  });
});
