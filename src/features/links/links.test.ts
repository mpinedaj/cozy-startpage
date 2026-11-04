import { describe, it, expect, beforeEach } from 'vitest';
import { defaultConfig } from '../../core/defaults';
import { addLink, removeLink, updateLink, moveLink } from './links';

describe('links', () => {
  let cfg = defaultConfig();
  beforeEach(() => {
    cfg = defaultConfig();
  });

  it('add valid', () => {
    expect(addLink(cfg, 'Ex', 'https://example.com')).toBe(true);
    expect(cfg.links.length).toBe(1);
  });
  it('reject invalid url', () => {
    expect(addLink(cfg, 'Ex', 'javascript:alert(1)')).toBe(false);
    expect(cfg.links.length).toBe(0);
  });
  it('reject empty title', () => {
    expect(addLink(cfg, '', 'https://example.com')).toBe(false);
  });
  it('update', () => {
    addLink(cfg, 'Ex', 'https://example.com');
    const id = cfg.links[0].id;
    expect(updateLink(cfg, id, 'New', 'https://new.com')).toBe(true);
    expect(cfg.links[0].title).toBe('New');
  });
  it('remove', () => {
    addLink(cfg, 'Ex', 'https://example.com');
    const id = cfg.links[0].id;
    removeLink(cfg, id);
    expect(cfg.links.length).toBe(0);
  });
  it('move', () => {
    addLink(cfg, 'A', 'https://a.com');
    addLink(cfg, 'B', 'https://b.com');
    const id = cfg.links[1].id;
    moveLink(cfg, id, -1);
    expect(cfg.links[0].title).toBe('B');
  });
});
