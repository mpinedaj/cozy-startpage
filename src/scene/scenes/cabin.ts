import type { Scene, SceneContext } from '../engine';

function skyColor(tod: string): string {
  switch (tod) {
    case 'dawn': return '#f2c9a0';
    case 'day': return '#a8d8ea';
    case 'dusk': return '#e8a7a0';
    default: return '#1a1a2e';
  }
}

export const cabinScene: Scene = {
  id: 'cabin',
  name: 'Cabin',
  update: () => {},
  draw: (c: SceneContext) => {
    const { ctx, width, height, timeOfDay } = c;
    ctx.fillStyle = skyColor(timeOfDay);
    ctx.fillRect(0, 0, width, height);
    // ground
    ctx.fillStyle = '#6b8f71';
    ctx.fillRect(0, height - 40, width, 40);
    // cabin
    ctx.fillStyle = '#5b3a29';
    ctx.fillRect(120, height - 90, 80, 60);
    // roof
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(110, height - 100, 100, 12);
    // window
    ctx.fillStyle = timeOfDay === 'night' ? '#f4e9d8' : '#ffe9a0';
    ctx.fillRect(140, height - 75, 16, 16);
    // stars at night
    if (timeOfDay === 'night') {
      ctx.fillStyle = '#f4e9d8';
      for (let i = 0; i < 20; i++) {
        const x = (i * 37 + Math.floor(c.time * 0)) % width;
        const y = (i * 19) % (height - 60);
        ctx.fillRect(x, y, 2, 2);
      }
    }
  },
};
