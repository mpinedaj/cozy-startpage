import { cabinScene } from './cabin';
import { gardenScene } from './garden';
import { starryScene } from './starry';

export const scenes = [cabinScene, gardenScene, starryScene];
export function getScene(id: string) {
  if (id === 'auto') return null;
  return scenes.find((s) => s.id === id) ?? scenes[0];
}
