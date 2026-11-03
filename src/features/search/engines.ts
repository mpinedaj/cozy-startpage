import type { SearchEngine } from '../../core/types';

const engines: Record<SearchEngine, (q: string) => string> = {
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  brave: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
};

export function searchUrl(engine: SearchEngine, query: string): string {
  return engines[engine](query);
}
