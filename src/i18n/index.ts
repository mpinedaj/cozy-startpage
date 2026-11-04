import { messages, type Lang, type MessageKey } from './messages';

export function t(lang: Lang, key: MessageKey): string {
  return messages[lang]?.[key] ?? messages.en[key];
}

/** Translate and fill `{name}` placeholders in one pass. */
export function tf(lang: Lang, key: MessageKey, vars: Record<string, string | number>): string {
  return t(lang, key).replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export { messages, type Lang, type MessageKey };
