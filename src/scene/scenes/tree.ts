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

const SCALE = 10;

export const treeScene: Scene = {
  id: 'tree',
  name: 'Tree',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, palette, time } = c;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const w = spriteWidth(TREE) * SCALE;
    const h = spriteHeight(TREE) * SCALE;
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 3 * SCALE, y + 15 * SCALE, 10 * SCALE, 2);

    drawSprite(ctx, TREE, x, y, SCALE, palette);

    // A few leaves drift down at integer pixel positions.
    for (let i = 0; i < 3; i++) {
      const fall = (time * 14 + i * 31) % 92;
      const lx = x + (4 + i * 4) * SCALE + Math.round(Math.sin(time + i) * 3);
      const ly = y + 3 * SCALE + Math.floor(fall);
      ctx.fillStyle = i % 2 === 0 ? palette.secondary : palette.accent;
      ctx.fillRect(lx, ly, 3, 3);
    }
  },
};
