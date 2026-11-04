import type { Scene, SceneContext } from '../engine';
import { drawSprite, spriteHeight, spriteWidth, type Sprite } from '../sprites';

// 27x23 mug: rounded body, coffee surface, two-pixel curved handle.
// Steam is drawn separately so it can rise.
export const MUG: Sprite = [
  '...........................',
  '....kkkkkkkkkkkk...........',
  '..kkrrrrrrrrrrrrkk.........',
  '..kmmmmmmmmmmmmmmk.........',
  '.kmmmmmmmmmmmmmmmmk........',
  '.kmmmmmmmmmmmmmmmmkkkk.....',
  '.kmmmmmmmmmmmmmmmmkkkkk....',
  '.krrrrrrrrrrrrrrrrk..kkk...',
  '.krrrrrrrrrrrrrrrrk...kkk..',
  '.krrrrrrrrrrrrrrrrk....kk..',
  '.krrrrrrrrrrrrrrrrk....kk..',
  '.krrrrrrrrrrrrrrrrk....kkk.',
  '.krrrrrrrrrrrrrrrrk....kk..',
  '.krrrrrrrrrrrrrrrrk....kk..',
  '.krrrrrrrrrrrrrrrrk...kkk..',
  '.krrrrrrrrrrrrrrrrk..kkk...',
  '.krrrrrrrrrrrrrrrrkkkkk....',
  '.krrrrrrrrrrrrrrrrkkkk.....',
  '.krrrrrrrrrrrrrrrrk........',
  '..krrrrrrrrrrrrrrk.........',
  '..kkrrrrrrrrrrrrkk.........',
  '....kkkkkkkkkkkk...........',
  '...........................',
];

const SCALE = 5;

export const mugScene: Scene = {
  id: 'mug',
  name: 'Mug',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, palette, time, timeOfDay } = c;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const w = spriteWidth(MUG) * SCALE;
    const h = spriteHeight(MUG) * SCALE;
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    // Tighter steam at night, livelier steam during the day.
    const steamColumns = timeOfDay === 'day' ? 3 : timeOfDay === 'night' ? 1 : 2;
    const steamTop = Math.max(2, y - 20);
    const steamBottom = y + SCALE;
    const span = Math.max(1, steamBottom - steamTop);
    const steamBase = x + 8 * SCALE;
    ctx.fillStyle = palette.ink;
    for (let i = 0; i < steamColumns; i++) {
      for (let j = 0; j < 3; j++) {
        const phase = (time * 11 + i * 9 + j * 13) % span;
        const sy = Math.floor(steamBottom - phase);
        const wobble = Math.round(Math.sin(time * 1.7 + i + j * 0.8) * 2);
        const sx = steamBase + i * 4 * SCALE + wobble;
        if (sy > steamTop) ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Hard pixel shadow beneath the mug.
    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 2 * SCALE, y + h - 4, w - 8 * SCALE, 3);

    drawSprite(ctx, MUG, x, y, SCALE, palette);
  },
};
