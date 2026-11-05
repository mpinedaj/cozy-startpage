import type { TimeOfDay } from '../core/types';

/**
 * Scene palettes are independent from the UI theme: each scene ships one
 * 14-colour palette per time of day. The theme only tints the result.
 */
export interface ScenePalette {
  /** Sky / wall gradient, far to near. */
  skyTop: string;
  skyMid: string;
  skyLow: string;
  /** Sun, moon, lamps and their halo. */
  sun: string;
  glow: string;
  /** Depth ramps: far, mid, near, each with a shadow tone. */
  far: string;
  farDark: string;
  mid: string;
  midDark: string;
  near: string;
  nearDark: string;
  /** Small warm accents: windows, fire, mug, highlights. */
  light: string;
  accent: string;
  ink: string;
}

export type PaletteSet = Record<TimeOfDay, ScenePalette>;

export const SCENE_COLOR_COUNT = 14;

const FALLBACK_TINT = '#5b3a29';

/** Read the current theme's scene tint. Themes only nudge the scene. */
export function readSceneTint(): string {
  if (typeof document === 'undefined') return FALLBACK_TINT;
  const value = getComputedStyle(document.body).getPropertyValue('--scene-tint').trim();
  return value || FALLBACK_TINT;
}

/** Used by tests and the palette editor to catch a palette with a missing role. */
export function paletteValues(palette: ScenePalette): string[] {
  return Object.values(palette);
}
