import type { Scene, SceneContext } from '../engine';

export const starryScene: Scene = {
  id: 'starry',
  name: 'Starry',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height } = c;
    ctx.fillStyle = '#0b1026';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f4e9d8';
    for (let i = 0; i < 60; i++) {
      const x = (i * 53) % width;
      const y = (i * 29) % height;
      ctx.fillRect(x, y, 2, 2);
    }
    // moon
    ctx.fillStyle = '#f4e9d8';
    ctx.fillRect(width - 60, 30, 24, 24);
  },
};
