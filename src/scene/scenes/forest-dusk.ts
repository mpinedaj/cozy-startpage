import { ditherBand, ditherGradient, hash } from '../dither';
import { crescent, disc, pine, rect } from '../draw';
import { SCENE_HEIGHT, SCENE_MARGIN, SCENE_WIDTH, type Scene } from '../engine';
import type { PaletteSet } from '../palette';

const W = SCENE_WIDTH + SCENE_MARGIN * 2;
const H = SCENE_HEIGHT;

function ridgeLine(x: number, seed: number, baseY: number, height: number): number {
  const wave = Math.sin((x + seed) * 0.021) * 0.5 + Math.sin((x + seed) * 0.007 + 1.7) * 0.5;
  return baseY - Math.round(height * (0.32 + 0.68 * Math.abs(wave)));
}

function drawRidge(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  height: number,
  seed: number,
  color: string,
  snow: string,
  snowLine: number,
): void {
  for (let x = 0; x < W; x += 4) {
    const top = ridgeLine(x, seed, baseY, height);
    ctx.fillStyle = color;
    ctx.fillRect(x, top, 4, baseY - top);
    if (top < snowLine) {
      ctx.fillStyle = snow;
      ctx.fillRect(x, top, 4, 3);
      if (hash(x + seed) > 0.6) ctx.fillRect(x, top + 3, 2, 1);
    }
  }
}

export const forestDusk: Scene = {
  id: 'forest-dusk',
  palettes: {
    dawn: {
      skyTop: '#2f3a5c',
      skyMid: '#7a6a7e',
      skyLow: '#e2a487',
      sun: '#ffe0b0',
      glow: '#ffcf9a',
      far: '#4f5a6b',
      farDark: '#38414f',
      mid: '#33473f',
      midDark: '#22302b',
      near: '#1d2a24',
      nearDark: '#131c18',
      light: '#ffd27a',
      accent: '#8fae7e',
      ink: '#0f1512',
    },
    day: {
      skyTop: '#5f9bc4',
      skyMid: '#9cc6d9',
      skyLow: '#dcecec',
      sun: '#fff4c8',
      glow: '#ffffff',
      far: '#6d8493',
      farDark: '#4f6572',
      mid: '#3f6b4a',
      midDark: '#2b4a34',
      near: '#23402c',
      nearDark: '#162a1d',
      light: '#ffe38a',
      accent: '#9fc17e',
      ink: '#0b1410',
    },
    dusk: {
      skyTop: '#3a2a4d',
      skyMid: '#8a4f5e',
      skyLow: '#e08a5e',
      sun: '#ffcf8a',
      glow: '#ffb27a',
      far: '#5b4a5e',
      farDark: '#3f3344',
      mid: '#3d5148',
      midDark: '#283831',
      near: '#1f2f26',
      nearDark: '#141f1a',
      light: '#ffb96b',
      accent: '#a8a06a',
      ink: '#100f1a',
    },
    night: {
      skyTop: '#0a1020',
      skyMid: '#152238',
      skyLow: '#23324c',
      sun: '#e8f0f5',
      glow: '#9fb6d6',
      far: '#26333f',
      farDark: '#182229',
      mid: '#1b2f26',
      midDark: '#12201a',
      near: '#14231c',
      nearDark: '#0b130f',
      light: '#ffe89a',
      accent: '#6f8f6a',
      ink: '#050a09',
    },
  } satisfies PaletteSet,

  layers: [
    {
      id: 'sky',
      depth: 0.04,
      paint: (ctx, p, tod) => {
        ditherGradient(ctx, 0, 0, W, H, [p.skyTop, p.skyMid, p.skyLow]);

        if (tod === 'night') {
          for (let i = 0; i < 60; i += 1) {
            ctx.fillStyle = hash(i) > 0.75 ? p.glow : p.accent;
            ctx.fillRect(Math.round(hash(i + 5) * W), Math.round(hash(i + 19) * 110), 1, 1);
          }
        }

        const sunY = tod === 'day' ? 30 : tod === 'night' ? 38 : 46;
        const sunX = 110;
        disc(ctx, p.glow, sunX, sunY, 16);
        if (tod === 'night') crescent(ctx, p.sun, sunX, sunY, 11, 3, -2, 9);
        else disc(ctx, p.sun, sunX, sunY, 11);
        rect(ctx, p.glow, sunX - 19, sunY, 4, 1);
        rect(ctx, p.glow, sunX + 16, sunY, 4, 1);
        rect(ctx, p.glow, sunX, sunY - 19, 1, 4);
        rect(ctx, p.glow, sunX, sunY + 16, 1, 4);

        // Drifting cloud bars, lighter on the side facing the sun.
        for (let i = 0; i < 5; i += 1) {
          const cx = Math.round(hash(i + 2) * W);
          const cy = 18 + Math.round(hash(i + 41) * 62);
          const cw = 40 + Math.round(hash(i + 8) * 54);
          rect(ctx, p.skyMid, cx, cy + 2, cw, 5);
          ditherBand(ctx, cx + 2, cy, cw - 6, 3, p.skyLow, p.skyMid, 0.45);
        }

        if (tod !== 'night') {
          for (let i = 0; i < 3; i += 1) {
            const bx = 120 + i * 26 + Math.round(hash(i + 60) * 12);
            const by = 34 + Math.round(hash(i + 70) * 18);
            ctx.fillStyle = p.ink;
            ctx.fillRect(bx, by, 2, 1);
            ctx.fillRect(bx + 3, by - 1, 2, 1);
            ctx.fillRect(bx + 7, by, 2, 1);
          }
        }
      },
    },
    {
      id: 'mountains',
      depth: 0.18,
      paint: (ctx, p, tod) => {
        drawRidge(ctx, 152, 96, 12, p.far, p.skyLow, 72);
        ditherBand(ctx, 0, 100, W, 10, p.far, p.skyMid, 0.3);
        drawRidge(ctx, 166, 64, 64, p.farDark, p.far, 128);
        ditherBand(ctx, 0, 140, W, 10, p.farDark, p.far, 0.35);

        // A thin band of distant pines along the ridge foot.
        for (let x = 0; x < W; x += 9) {
          const height = 6 + Math.round(hash(x + 3) * 10);
          pine(ctx, x, 156, height, tod === 'night' ? p.midDark : p.mid, p.ink);
        }
      },
    },
    {
      id: 'treeline',
      depth: 0.42,
      paint: (ctx, p) => {
        rect(ctx, p.nearDark, 0, 164, W, H - 164);
        for (let x = -6; x < W + 10; x += 13) {
          const height = 34 + Math.round(hash(x + 7) * 46);
          pine(ctx, x, 170, height, p.mid, p.midDark);
        }
        for (let x = 6; x < W + 10; x += 21) {
          const height = 20 + Math.round(hash(x + 19) * 26);
          pine(ctx, x, 172, height, p.midDark, p.ink);
        }
      },
    },
    {
      id: 'foreground',
      depth: 0.72,
      paint: (ctx, p) => {
        // Ground band with a lighter path.
        rect(ctx, p.nearDark, 0, 158, W, H - 158);
        ditherBand(ctx, 0, 158, W, 6, p.near, p.nearDark, 0.4);
        rect(ctx, p.near, 150, 171, 110, 4);
        rect(ctx, p.accent, 170, 168, 44, 1);

        // Grass and ferns.
        for (let i = 0; i < 60; i += 1) {
          const x = Math.round(hash(i + 4) * W);
          const y = 165 + Math.round(hash(i + 12) * 12);
          const height = 2 + Math.round(hash(i + 30) * 4);
          ctx.fillStyle = i % 3 === 0 ? p.accent : p.near;
          ctx.fillRect(x, y - height, 1, height);
          ctx.fillRect(x + 2, y - height + 1, 1, height - 1);
        }

        // Heavy pines framing the view.
        pine(ctx, 26, 182, 116, p.near, p.ink);
        pine(ctx, 52, 184, 88, p.nearDark, p.ink);
        pine(ctx, 372, 184, 108, p.near, p.ink);
        pine(ctx, 346, 182, 76, p.nearDark, p.ink);

        // A warm camp light far away.
        rect(ctx, p.light, 262, 150, 1, 2);
        rect(ctx, p.glow, 261, 149, 3, 1);
      },
    },
  ],

  animate: (ctx, p, tod, time) => {
    if (tod !== 'night' && tod !== 'dusk') return;
    for (let i = 0; i < 14; i += 1) {
      const x = Math.round(120 + hash(i + 1) * 180 + Math.sin(time * 0.7 + i) * 9);
      const y = Math.round(120 + hash(i + 21) * 48 + Math.cos(time * 0.9 + i * 1.7) * 5);
      const twinkle = Math.sin(time * 2.4 + i * 2.1);
      if (twinkle < -0.2) continue;
      ctx.fillStyle = twinkle > 0.6 ? p.glow : p.light;
      ctx.fillRect(x, y, 1, 1);
      if (twinkle > 0.85) {
        ctx.fillStyle = p.light;
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      }
    }
  },
};
