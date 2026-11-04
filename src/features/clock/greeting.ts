import type { Lang } from '../../i18n';
import { t } from '../../i18n';

export function greetingKey(
  hour: number,
): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' | 'greetingNight' {
  if (hour >= 5 && hour < 12) return 'greetingMorning';
  if (hour >= 12 && hour < 17) return 'greetingAfternoon';
  if (hour >= 17 && hour < 21) return 'greetingEvening';
  return 'greetingNight';
}

export function greetingText(hour: number, name: string, lang: Lang): string {
  const key = greetingKey(hour);
  const base = t(lang, key);
  const trimmed = name.trim();
  return trimmed ? `${base}, ${trimmed}` : base;
}
