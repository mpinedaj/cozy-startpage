import type { TimeOfDay } from '../../core/types';

export type { TimeOfDay };

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function formatTime(date: Date, format: '12' | '24'): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const mm = String(m).padStart(2, '0');
  if (format === '24') {
    return `${String(h).padStart(2, '0')}:${mm}`;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${mm} ${period}`;
}
