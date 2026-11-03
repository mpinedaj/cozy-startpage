import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './validation';

describe('validation', () => {
  it('accepts http/https', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com/path')).toBe(true);
  });
  it('rejects others', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
  });
  it('sanitize', () => {
    expect(sanitizeUrl('  https://x.com  ')).toBe('https://x.com');
    expect(sanitizeUrl('foo')).toBeNull();
  });
});
