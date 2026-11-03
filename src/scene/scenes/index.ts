import type { ThemeId } from '../../core/types';
import { mugScene } from './mug';
import { treeScene } from './tree';
import { candleScene } from './candle';
import { moonScene } from './moon';
import type { Scene } from '../engine';

export const scenes = [mugScene, treeScene, candleScene, moonScene];

const autoByTheme: Record<ThemeId, string> = {
  cafe: 'mug',
  forest: 'tree',
  lavender: 'candle',
  night: 'moon',
};

export function getScene(id: string): Scene {
  return scenes.find((s) => s.id === id) ?? scenes[0];
}

export function autoScene(theme: ThemeId): Scene {
  return getScene(autoByTheme[theme]);
}
