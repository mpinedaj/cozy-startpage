import type { SceneId, ThemeId } from '../../core/types';
import type { Scene } from '../engine';
import { cafeInterior } from './cafe-interior';
import { forestDusk } from './forest-dusk';
import { mountainLake } from './mountain-lake';
import { rainyWindow } from './rainy-window';

export const scenes: Scene[] = [rainyWindow, forestDusk, cafeInterior, mountainLake];

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
