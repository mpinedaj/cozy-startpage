import { messages, type Lang, type MessageKey } from './messages';

export function t(lang: Lang, key: MessageKey): string {
  return messages[lang]?.[key] ?? messages.en[key];
}

export { messages, type Lang, type MessageKey };
