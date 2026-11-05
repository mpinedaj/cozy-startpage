import { ditherBand, ditherGradient, hash } from '../dither';
import { crescent, disc, matrix, rect } from '../draw';
import { SCENE_HEIGHT, SCENE_MARGIN, SCENE_WIDTH, type Scene } from '../engine';
import type { PaletteSet } from '../palette';

const W = SCENE_WIDTH + SCENE_MARGIN * 2;
const H = SCENE_HEIGHT;

/** Glass area and mullions, in layer coordinates. */
const FRAME = { left: 28, top: 12, right: 372, bottom: 158, bar: 9 };
const MULLION_X = 197;
const MULLION_Y = 84;

function pane(index: number): { x: number; y: number; w: number; h: number } {
  const innerLeft = FRAME.left + FRAME.bar;
  const innerTop = FRAME.top + FRAME.bar;
  const innerRight = FRAME.right - FRAME.bar;
  const innerBottom = FRAME.bottom - FRAME.bar;
  const x = index % 2 === 0 ? innerLeft : MULLION_X + FRAME.bar;
  const y = index < 2 ? innerTop : MULLION_Y + FRAME.bar;
  return {
    x,
    y,
    w: (index % 2 === 0 ? MULLION_X : innerRight) - x,
    h: (index < 2 ? MULLION_Y : innerBottom) - y,
  };
}

const MUG = [
  '..kkkkkk..',
  '.kmmmmmmk.',
  'kmmmmmmmmk',
  'kmmmmmmmmk',
  'krrrrrrrrk',
  'krrrrrrrrk',
  'krrrrrrrrk',
  'krrrrrrrrk',
  '.krrrrrrk.',
  '..kkkkkk..',
];

export const rainyWindow: Scene = {
  id: 'rainy-window',
  palettes: {
    dawn: {
      skyTop: '#3a3050',
      skyMid: '#8b5d6f',
      skyLow: '#d99a86',
      sun: '#ffd9a0',
      glow: '#ffe6c4',
      far: '#57465f',
      farDark: '#3c3145',
      mid: '#46384e',
      midDark: '#2e2434',
      near: '#5c3d2e',
      nearDark: '#3a2620',
      light: '#ffcf8a',
      accent: '#b98a7a',
      ink: '#1a1420',
    },
    day: {
      skyTop: '#6f9fc4',
      skyMid: '#a3c6dc',
      skyLow: '#dbe9ec',
      sun: '#fff3c7',
      glow: '#ffffff',
      far: '#71849a',
      farDark: '#515f72',
      mid: '#5e6a7c',
      midDark: '#414a58',
      near: '#6d4834',
      nearDark: '#472d21',
      light: '#ffe1a0',
      accent: '#9fb6a8',
      ink: '#22252e',
    },
    dusk: {
      skyTop: '#2b2440',
      skyMid: '#6b4056',
      skyLow: '#c2705c',
      sun: '#ffb27a',
      glow: '#ffd2a8',
      far: '#4a3d55',
      farDark: '#31283c',
      mid: '#3b3043',
      midDark: '#261f2d',
      near: '#4f3328',
      nearDark: '#302018',
      light: '#ffc17a',
      accent: '#b07a6a',
      ink: '#16121d',
    },
    night: {
      skyTop: '#0c0f1d',
      skyMid: '#151f36',
      skyLow: '#222e4a',
      sun: '#f2ecd0',
      glow: '#a8bfe6',
      far: '#1e2539',
      farDark: '#141928',
      mid: '#232a3d',
      midDark: '#161b29',
      near: '#3b2a24',
      nearDark: '#241914',
      light: '#ffcf7a',
      accent: '#7d93b8',
      ink: '#070910',
    },
  } satisfies PaletteSet,

  layers: [
    {
      id: 'sky',
      depth: 0.06,
      paint: (ctx, p, tod) => {
        ditherGradient(ctx, 0, 0, W, H, [p.skyTop, p.skyMid, p.skyLow]);

        if (tod === 'night' || tod === 'dawn') {
          for (let i = 0; i < 40; i += 1) {
            const x = Math.round(hash(i) * W);
            const y = Math.round(hash(i + 90) * 90) + 4;
            ctx.fillStyle = hash(i + 12) > 0.7 ? p.glow : p.accent;
            ctx.fillRect(x, y, 1, 1);
          }
        }

        // Sun or moon behind the clouds: hard pixel disc with a crescent bite.
        const sunX = 300;
        const sunY = totodY(tod);
        disc(ctx, p.glow, sunX, sunY, 13);
        if (tod === 'night') crescent(ctx, p.sun, sunX, sunY, 9, 3, -2, 8);
        else disc(ctx, p.sun, sunX, sunY, 9);
        rect(ctx, p.glow, sunX - 14, sunY, 3, 1);
        rect(ctx, p.glow, sunX + 12, sunY, 3, 1);
        rect(ctx, p.glow, sunX, sunY - 14, 1, 3);
        rect(ctx, p.glow, sunX, sunY + 12, 1, 3);

        // Dithered cloud banks.
        for (let i = 0; i < 4; i += 1) {
          const cx = Math.round(hash(i + 3) * W);
          const cy = 22 + Math.round(hash(i + 8) * 52);
          const cw = 34 + Math.round(hash(i + 21) * 40);
          const ch = 6 + Math.round(hash(i + 33) * 5);
          rect(ctx, p.skyMid, cx, cy + 2, cw, ch);
          ditherBand(ctx, cx + 2, cy, cw - 4, 3, p.skyLow, p.skyMid, 0.5);
          ditherBand(ctx, cx, cy + ch + 1, cw, 2, p.skyMid, p.skyLow, 0.3);
        }
      },
    },
    {
      id: 'city',
      depth: 0.2,
      paint: (ctx, p, tod) => {
        let x = -8;
        let index = 0;
        while (x < W) {
          const width = 26 + Math.round(hash(index) * 22);
          const height = 26 + Math.round(hash(index + 5) * 46);
          const top = 150 - height;
          rect(ctx, p.far, x, top, width, height);
          rect(ctx, p.farDark, x, top, width, 2);
          rect(ctx, p.farDark, x + width - 2, top, 2, height);

          if (tod === 'night' || tod === 'dusk' || tod === 'dawn') {
            for (let wy = top + 6; wy < 146; wy += 8) {
              for (let wx = x + 4; wx < x + width - 4; wx += 7) {
                if (hash(wx * 0.7 + wy) > 0.55) {
                  ctx.fillStyle = p.light;
                  ctx.fillRect(wx, wy, 2, 3);
                }
              }
            }
          } else {
            for (let wy = top + 7; wy < 144; wy += 9) {
              for (let wx = x + 5; wx < x + width - 4; wx += 8) {
                ctx.fillStyle = p.farDark;
                ctx.fillRect(wx, wy, 3, 3);
              }
            }
          }

          if (height > 58) rect(ctx, p.farDark, x + width / 2, top - 8, 1, 8);
          x += width + 4 + Math.round(hash(index + 11) * 6);
          index += 1;
        }

        // Haze and a hint of rain on the horizon.
        ditherBand(ctx, 0, 128, W, 22, p.far, p.mid, 0.35);
        ditherBand(ctx, 0, 138, W, 12, p.mid, p.farDark, 0.4);
      },
    },
    {
      id: 'frame',
      depth: 0.42,
      paint: (ctx, p) => {
        // Curtains, drawn to the edges so the layer can slide.
        rect(ctx, p.nearDark, -10, 0, 56, 156);
        rect(ctx, p.nearDark, 354, 0, 56, 156);
        for (let i = 0; i < 5; i += 1) {
          rect(ctx, p.near, 2 + i * 9, 6, 2, 148);
          rect(ctx, p.near, 360 + i * 9, 6, 2, 148);
        }
        rect(ctx, p.ink, 46, 0, 1, 156);
        rect(ctx, p.ink, 353, 0, 1, 156);

        // Window frame.
        const { left, top, right, bottom, bar } = FRAME;
        rect(ctx, p.ink, left - 1, top - 1, right - left + 2, bar + 1);
        rect(ctx, p.near, left, top, right - left, bar);
        rect(ctx, p.nearDark, left, top + bar - 2, right - left, 2);
        rect(ctx, p.ink, left - 1, bottom - 1, right - left + 2, bar + 1);
        rect(ctx, p.near, left, bottom, right - left, bar);
        rect(ctx, p.nearDark, left, bottom, right - left, 3);
        rect(ctx, p.ink, left - 1, top - 1, bar + 1, bottom - top + 2);
        rect(ctx, p.near, left, top, bar, bottom - top);
        rect(ctx, p.ink, right - 1, top - 1, bar + 1, bottom - top + 2);
        rect(ctx, p.near, right - bar, top, bar, bottom - top);

        // Mullions.
        rect(ctx, p.ink, MULLION_X - 1, top, FRAME.bar + 2, bottom - top);
        rect(ctx, p.near, MULLION_X, top, FRAME.bar, bottom - top);
        rect(ctx, p.ink, left, MULLION_Y - 1, right - left, FRAME.bar + 2);
        rect(ctx, p.near, left, MULLION_Y, right - left, FRAME.bar);

        // Wood grain.
        for (let i = 0; i < 26; i += 1) {
          const gx = 30 + Math.round(hash(i) * 330);
          const gy = 13 + Math.round(hash(i + 4) * 8);
          rect(ctx, p.nearDark, gx, gy, 5, 1);
          rect(ctx, p.nearDark, gx, gy + 130, 4, 1);
        }

        // Sill.
        rect(ctx, p.ink, 14, 156, 372, 2);
        rect(ctx, p.near, 16, 158, 368, 16);
        rect(ctx, p.nearDark, 16, 170, 368, 4);
        rect(ctx, p.accent, 16, 166, 368, 1);

        // A mug and a small plant on the sill.
        matrix(ctx, MUG, { k: p.ink, m: p.light, r: p.accent }, 286, 147, 1);
        rect(ctx, p.ink, 285, 146, 12, 2);
        rect(ctx, p.nearDark, 60, 150, 22, 14);
        rect(ctx, p.ink, 59, 149, 24, 2);
        rect(ctx, p.accent, 62, 151, 4, 3);
        rect(ctx, p.nearDark, 70, 143, 3, 8);
        rect(ctx, p.accent, 66, 140, 3, 4);
        rect(ctx, p.accent, 73, 141, 3, 3);
      },
    },
  ],

  animate: (ctx, p, tod, time) => {
    // Rain, clipped to the four panes so it never covers the frame.
    for (let i = 0; i < 46; i += 1) {
      const glass = pane(i % 4);
      const speed = 26 + hash(i + 7) * 34;
      const span = glass.h + 26;
      const y = glass.y - 12 + ((hash(i + 2) * span + time * speed) % span);
      const x = glass.x + Math.round(hash(i + 31) * (glass.w - 1));
      const length = 2 + Math.round(hash(i + 17) * 6);
      ctx.fillStyle = i % 4 === 0 ? p.accent : p.glow;
      ctx.fillRect(x, Math.round(y), 1, length);
      if (i % 7 === 0) {
        ctx.fillStyle = p.glow;
        ctx.fillRect(x, Math.round(y) + length, 2, 1);
      }
    }

    // A slow trail on the glass.
    const trail = Math.round((time * 9) % 120) + 20;
    ctx.fillStyle = p.glow;
    ctx.fillRect(148, trail, 2, 5);
    ctx.fillRect(148, trail + 6, 1, 2);

    // Steam from the mug.
    const columns = tod === 'day' ? 3 : 2;
    for (let i = 0; i < columns; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        const rise = (time * 16 + j * 13 + i * 21) % 46;
        const x = 288 + i * 4 + Math.round(Math.sin(time * 1.8 + i + j) * 2);
        const y = 148 - rise;
        ctx.fillStyle = j % 2 === 0 ? p.glow : p.accent;
        ctx.fillRect(x, Math.round(y), 1, 1);
      }
    }

    // A single blinking lamp in the city.
    if (Math.sin(time * 2.2) > 0.2) {
      ctx.fillStyle = p.light;
      ctx.fillRect(112, 118, 2, 2);
    }
  },
};

function totodY(tod: 'dawn' | 'day' | 'dusk' | 'night'): number {
  return tod === 'day' ? 30 : tod === 'night' ? 46 : 38;
}
