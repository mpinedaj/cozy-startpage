import { describe, expect, it } from 'vitest';
import { asciiClock } from './ascii';

describe('ascii clock', () => {
  it('renders five rows', () => {
    expect(asciiClock('09:41').split('\n')).toHaveLength(5);
  });

  it('uses printable ASCII only', () => {
    expect(asciiClock('23:59')).toMatch(/^[\x20-\x7e\n]+$/);
  });

  it('draws different glyphs for different times', () => {
    expect(asciiClock('12:00')).not.toBe(asciiClock('12:01'));
  });

  it('falls back to blank space for unknown glyphs', () => {
    expect(asciiClock('x').trim()).toBe('');
  });
});
