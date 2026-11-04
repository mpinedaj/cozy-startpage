import type { Scene, SceneContext } from '../engine';
import { drawSprite, spriteHeight, spriteWidth, type Sprite } from '../sprites';

export const MOON: Sprite = [
  '................',
  '.....kkkkkk.....',
  '...kkkkkkkkkk...',
  '..kkkkkkkkkkkk..',
  '..kkkrrkkkkkkk..',
  '.kkkkkkkkkkkkkk.',
  '.kkkkkkkkkkkkkk.',
  '.kkkkkkkrrkkkkk.',
  '.kkkkkkkkkkkkkk.',
  '..kkkkkrkkkkkk..',
  '..kkkkkkkkkkkk..',
  '...kkkkkkkkkk...',
  '.....kkkkkk.....',
  '................',
  '................',
  '................',
];

const SCALE = 8;

export const moonScene: Scene = {
  id: 'moon',
  name: 'Moon',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, palette, time, timeOfDay } = c;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const w = spriteWidth(MOON) * SCALE;
    const h = spriteHeight(MOON) * SCALE;
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    drawSprite(ctx, MOON, x, y, SCALE, palette);

    // More stars after dark, none at midday.
    const starCount = timeOfDay === 'night' ? 4 : timeOfDay === 'dusk' ? 2 : timeOfDay === 'dawn' ? 1 : 0;
    const stars = [
      [x - 28, y + 20],
      [x + w + 18, y + 34],
      [x + 10, y + h + 16],
      [x + w - 22, y - 14],
    ];
    for (let i = 0; i < starCount; i++) {
      const on = Math.floor(time * 2 + i) % 4 !== 0;
      if (!on) continue;
      ctx.fillStyle = i % 2 === 0 ? palette.secondary : palette.accent;
      const [sx, sy] = stars[i];
      ctx.fillRect(sx, sy, 3, 3);
      ctx.fillRect(sx + 6, sy + 6, 2, 2);
    }
  },
};
