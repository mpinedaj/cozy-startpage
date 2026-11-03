import type { ThemeId } from '../core/types';

export interface ScenePalette {
  bg: string;
  ink: string;
  accent: string;
  secondary: string;
}

// Each theme is built from exactly four named colors: cream, coffee, moss, rose.
// Scenes may only use these four, mapped to the roles below.
export const palettes: Record<ThemeId, ScenePalette> = {
  cafe: { bg: '#f4e9d8', ink: '#5b3a29', accent: '#6b8f71', secondary: '#e8a7a0' },
  forest: { bg: '#e8f0e4', ink: '#2f4a33', accent: '#6b8f71', secondary: '#c98b84' },
  lavender: { bg: '#f0e8f7', ink: '#4a3a5b', accent: '#8a7fa8', secondary: '#d9a7cf' },
  night: { bg: '#12121f', ink: '#e8e0d8', accent: '#3a4a5b', secondary: '#e8a7a0' },
};

export function getPalette(theme: ThemeId): ScenePalette {
  return palettes[theme] ?? palettes.cafe;
}
