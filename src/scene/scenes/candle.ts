import type { Scene, SceneContext } from '../engine';
import { drawSprite, spriteHeight, spriteWidth, type Sprite } from '../sprites';

export const CANDLE: Sprite = [
  '................',
  '.......k........',
  '......kkk.......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kmmmk......',
  '.....kkkkk......',
  '.....kkkkk......',
  '................',
  '................',
  '................',
];

export const FLAME_A: Sprite = ['.r.', '.r.', 'rrr', 'rrr', '.r.'];
export const FLAME_B: Sprite = ['.r.', '.r.', 'rrr', '.r.', '.r.'];

const SCALE = 8;

export const candleScene: Scene = {
  id: 'candle',
  name: 'Candle',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, palette, time, timeOfDay } = c;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const w = spriteWidth(CANDLE) * SCALE;
    const h = spriteHeight(CANDLE) * SCALE;
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    // The flame sits directly on the wick and flickers faster after dark.
    const speed = timeOfDay === 'night' ? 11 : timeOfDay === 'day' ? 6 : 8;
    const flame = Math.floor(time * speed) % 2 === 0 ? FLAME_A : FLAME_B;
    const flameX = x + 6 * SCALE;
    const flameY = y + SCALE - spriteHeight(flame) * SCALE;
    drawSprite(ctx, flame, flameX, flameY, SCALE, palette);

    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 5 * SCALE, y + 13 * SCALE, 6 * SCALE, 2);

    drawSprite(ctx, CANDLE, x, y, SCALE, palette);
  },
};
