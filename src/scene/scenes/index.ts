import type { SceneId, ThemeId } from '../../core/types';
import type { Scene } from '../engine';

/** Scene ids, in settings order. The ASCII painter lives in `scene/ascii.ts`. */
export const scenes: Scene[] = [
  { id: 'rainy-window' },
  { id: 'forest-dusk' },
  { id: 'cafe-interior' },
  { id: 'mountain-lake' },
];

const autoByTheme: Record<ThemeId, SceneId> = {
  cafe: 'cafe-interior',
  forest: 'forest-dusk',
  lavender: 'mountain-lake',
  night: 'rainy-window',
};

export function getScene(id: string): Scene {
  return scenes.find((scene) => scene.id === id) ?? scenes[0];
}

export function autoScene(theme: ThemeId): Scene {
  return getScene(autoByTheme[theme]);
}

export function sceneIds(): SceneId[] {
  return scenes.map((scene) => scene.id);
}
