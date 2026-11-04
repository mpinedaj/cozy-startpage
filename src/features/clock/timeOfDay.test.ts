import { describe, it, expect } from 'vitest';
import { getTimeOfDay, formatTime } from './timeOfDay';

describe('timeOfDay', () => {
  it('dawn', () => expect(getTimeOfDay(6)).toBe('dawn'));
  it('day', () => expect(getTimeOfDay(12)).toBe('day'));
  it('dusk', () => expect(getTimeOfDay(18)).toBe('dusk'));
  it('night', () => expect(getTimeOfDay(23)).toBe('night'));
  it('format 24', () => expect(formatTime(new Date(2020, 0, 1, 9, 5), '24')).toBe('09:05'));
  it('format 12', () => expect(formatTime(new Date(2020, 0, 1, 13, 5), '12')).toBe('1:05 PM'));
});
