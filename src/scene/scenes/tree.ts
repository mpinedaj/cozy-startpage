import type { Scene, SceneContext } from '../engine';
import { drawSprite, spriteHeight, spriteWidth, type Sprite } from '../sprites';

// 16x16 pine tree. Berries use the rose role only.
export const TREE: Sprite = [
  '................',
  '.......kk.......',
  '......kmmk......',
  '.....kmmrmk.....',
  '....kmmrmmmk....',
  '...kmmmmmmmmk...',
  '..kmmrmmmmmmmk..',
  '.kmmmmmmmmmmrmk.',
  '.kkkkkkkkkkkkkk.',
  '.......kk.......',
  '.......kk.......',
  '.......kk.......',
  '.......kk.......',
  '......kkkk......',
  '.....k....k.....',
  '................',
];

const SCALE = 8;

export const treeScene: Scene = {
  id: 'tree',
  name: 'Tree',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, palette, time, timeOfDay } = c;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const w = spriteWidth(TREE) * SCALE;
    const h = spriteHeight(TREE) * SCALE;
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 3 * SCALE, y + 15 * SCALE, 10 * SCALE, 2);

    drawSprite(ctx, TREE, x, y, SCALE, palette);

    if (timeOfDay === 'night') {
      // Slow rose fireflies instead of falling leaves.
      for (let i = 0; i < 2; i++) {
        const fx = x + (5 + i * 6) * SCALE + Math.round(Math.sin(time * 0.7 + i) * 4);
        const fy = y + (4 + i * 5) * SCALE + Math.round(Math.cos(time * 0.6 + i) * 4);
        ctx.fillStyle = palette.secondary;
        ctx.fillRect(fx, fy, 3, 3);
      }
    } else {
      const leaves = timeOfDay === 'day' ? 2 : timeOfDay === 'dusk' ? 3 : 1;
      for (let i = 0; i < leaves; i++) {
        const fall = (time * 14 + i * 31) % 92;
        const lx = x + (4 + i * 7) * SCALE + Math.round(Math.sin(time + i) * 3);
        const ly = y + 3 * SCALE + Math.floor(fall);
        ctx.fillStyle = i % 2 === 0 ? palette.secondary : palette.accent;
        ctx.fillRect(lx, ly, 3, 3);
      }
    }
  },
};
