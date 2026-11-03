import type { Scene, SceneContext } from '../engine';

export const gardenScene: Scene = {
  id: 'garden',
  name: 'Garden',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, timeOfDay } = c;
    ctx.fillStyle = timeOfDay === 'night' ? '#1a1a2e' : '#a8d8ea';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#6b8f71';
    ctx.fillRect(0, height - 50, width, 50);
    // flowers
    const colors = ['#e8a7a0', '#f4e9d8', '#ffe9a0'];
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(20 + i * 24, height - 60, 6, 6);
      ctx.fillStyle = '#5b3a29';
      ctx.fillRect(22 + i * 24, height - 54, 2, 8);
    }
  },
};
