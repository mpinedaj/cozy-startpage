import type { Scene, SceneContext } from '../engine';
import { drawSprite, spriteHeight, spriteWidth, type Sprite } from '../sprites';

export const CANDLE: Sprite = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '.......k........',
  '......kkk.......',
  '....kmmmmmk.....',
  '....kmmmmmk.....',
  '....kmmmmmk.....',
  '....kmmmmmk.....',
  '....kmmmmmk.....',
  '....kkkkkkk.....',
  '.....kkkkk......',
  '................',
  '................',
];

export const FLAME_A: Sprite = [
  '...r...',
  '..rrr..',
  '.rrrrr.',
  'rrrrrrr',
  '.rrrrr.',
  '..rrr..',
];
export const FLAME_B: Sprite = [
  '...r...',
  '..rrr..',
  '.rrrrr.',
  '.rrrrr.',
  '..rrr..',
  '...r...',
];

const SCALE = 10;

export const candleScene: Scene = {
  id: 'candle',
  name: 'Candle',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, palette, time } = c;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const w = spriteWidth(CANDLE) * SCALE;
    const h = spriteHeight(CANDLE) * SCALE;
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    // The flame sits directly on the wick and alternates between two matrices.
    const flame = Math.floor(time * 8) % 2 === 0 ? FLAME_A : FLAME_B;
    drawSprite(ctx, flame, x + 4 * SCALE + 5, y - SCALE, SCALE, palette);

    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 3 * SCALE, y + 14 * SCALE, 10 * SCALE, 2);

    drawSprite(ctx, CANDLE, x, y, SCALE, palette);
  },
};
