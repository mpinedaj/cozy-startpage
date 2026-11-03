import type { Config, Link } from '../../core/types';
import { sanitizeUrl } from '../../core/validation';
import { saveConfig } from '../../core/storage';

export function addLink(config: Config, title: string, url: string): boolean {
  const clean = sanitizeUrl(url);
  if (!clean) return false;
  const t = title.trim();
  if (!t) return false;
  const link: Link = { id: crypto.randomUUID(), title: t, url: clean };
  config.links.push(link);
  saveConfig(config);
  return true;
}

export function removeLink(config: Config, id: string): void {
  config.links = config.links.filter((l) => l.id !== id);
  saveConfig(config);
}

export function updateLink(config: Config, id: string, title: string, url: string): boolean {
  const clean = sanitizeUrl(url);
  if (!clean) return false;
  const t = title.trim();
  if (!t) return false;
  const link = config.links.find((l) => l.id === id);
  if (!link) return false;
  link.title = t;
  link.url = clean;
  saveConfig(config);
  return true;
}

export function moveLink(config: Config, id: string, dir: -1 | 1): void {
  const idx = config.links.findIndex((l) => l.id === id);
  if (idx < 0) return;
  const ni = idx + dir;
  if (ni < 0 || ni >= config.links.length) return;
  const [item] = config.links.splice(idx, 1);
  config.links.splice(ni, 0, item);
  saveConfig(config);
}
