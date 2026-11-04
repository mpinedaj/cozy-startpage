export interface ScenePalette {
  bg: string;
  ink: string;
  accent: string;
  secondary: string;
}

const FALLBACK: ScenePalette = {
  bg: '#f4e9d8',
  ink: '#5b3a29',
  accent: '#6b8f71',
  secondary: '#e8a7a0',
};

/**
 * Read the four theme roles from the active CSS theme.
 * The canvas therefore follows `data-theme` with no duplicated palette table.
 */
export function readPalette(): ScenePalette {
  if (typeof document === 'undefined') return FALLBACK;
  const styles = getComputedStyle(document.body);
  const read = (name: string, fallback: string): string => {
    const value = styles.getPropertyValue(name).trim();
    return value || fallback;
  };
  return {
    bg: read('--bg', FALLBACK.bg),
    ink: read('--fg', FALLBACK.ink),
    accent: read('--accent', FALLBACK.accent),
    secondary: read('--muted', FALLBACK.secondary),
  };
}
