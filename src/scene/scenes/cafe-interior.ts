import { ditherBand, ditherGradient, hash } from '../dither';
import { matrix, rect } from '../draw';
import { SCENE_HEIGHT, SCENE_MARGIN, SCENE_WIDTH, type Scene } from '../engine';
import type { PaletteSet } from '../palette';

const W = SCENE_WIDTH + SCENE_MARGIN * 2;
const H = SCENE_HEIGHT;

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

const PLANT = ['..a.a..', '.aaaaa.', 'aa.a.aa', '..aaa..', '..kkk..', '..kkk..'];

function lamp(ctx: CanvasRenderingContext2D, palette: PaletteSet['day'], x: number): void {
  rect(ctx, palette.ink, x - 1, 0, 2, 34);
  rect(ctx, palette.ink, x - 10, 34, 20, 3);
  rect(ctx, palette.farDark, x - 7, 37, 15, 7);
  rect(ctx, palette.light, x - 4, 40, 9, 6);
  // Sparse dust motes instead of a flat dithered block: the light cone stays
  // readable without turning the wall into a checkerboard.
  for (let i = 0; i < 18; i += 1) {
    const spread = 6 + (i % 6) * 4;
    const dx = Math.round((hash(i + x) - 0.5) * spread * 2);
    const dy = 48 + (i % 6) * 6;
    rect(ctx, i % 3 === 0 ? palette.glow : palette.accent, x + dx, dy, 1, 1);
  }
}

export const cafeInterior: Scene = {
  id: 'cafe-interior',
  palettes: {
    dawn: {
      skyTop: '#5a4238',
      skyMid: '#8a6450',
      skyLow: '#c99a78',
      sun: '#ffcf8a',
      glow: '#ffe0b0',
      far: '#6b4a3a',
      farDark: '#4a3226',
      mid: '#7a523c',
      midDark: '#573827',
      near: '#3a2a22',
      nearDark: '#241813',
      light: '#ffe0a8',
      accent: '#a8756a',
      ink: '#1b120e',
    },
    day: {
      skyTop: '#8a6a54',
      skyMid: '#b98f6e',
      skyLow: '#e3c49e',
      sun: '#fff0c0',
      glow: '#ffd9a0',
      far: '#7a5138',
      farDark: '#573826',
      mid: '#6b4630',
      midDark: '#4a2f20',
      near: '#3f2c22',
      nearDark: '#281a13',
      light: '#ffe2ab',
      accent: '#9e7a8a',
      ink: '#1a120d',
    },
    dusk: {
      skyTop: '#4a3440',
      skyMid: '#7a5450',
      skyLow: '#c08a6a',
      sun: '#ffbd7a',
      glow: '#ffd2a0',
      far: '#5c3f3a',
      farDark: '#3e2a26',
      mid: '#5a3a2c',
      midDark: '#3c251c',
      near: '#33241d',
      nearDark: '#1f1511',
      light: '#ffcf8a',
      accent: '#a86f6a',
      ink: '#150f12',
    },
    night: {
      skyTop: '#1c1a2a',
      skyMid: '#2e2a3c',
      skyLow: '#4a3a44',
      sun: '#ffcf8a',
      glow: '#ffb86a',
      far: '#332a35',
      farDark: '#211b24',
      mid: '#3a2a26',
      midDark: '#261a16',
      near: '#241c1a',
      nearDark: '#151011',
      light: '#ffd08a',
      accent: '#8f6f7a',
      ink: '#0a080c',
    },
  } satisfies PaletteSet,

  layers: [
    {
      id: 'wall',
      depth: 0.08,
      paint: (ctx, p, tod) => {
        ditherGradient(ctx, 0, 0, W, H, [p.skyTop, p.skyMid, p.skyLow]);

        // Wainscot.
        rect(ctx, p.farDark, 0, 128, W, 30);
        rect(ctx, p.ink, 0, 127, W, 1);
        for (let x = 8; x < W; x += 28) rect(ctx, p.far, x, 132, 20, 20);

        // Window with the street outside.
        rect(ctx, p.ink, 38, 36, 118, 92);
        rect(ctx, p.farDark, 42, 40, 110, 84);
        ditherGradient(ctx, 46, 44, 102, 76, [p.skyMid, p.skyLow]);
        for (let i = 0; i < 9; i += 1) {
          const bx = 50 + Math.round(hash(i + 3) * 84);
          const bh = 10 + Math.round(hash(i + 9) * 22);
          rect(ctx, p.farDark, bx, 118 - bh, 9, bh);
          if (i % 2 === 0) {
            rect(ctx, p.light, bx + 2, 104, 1, 2);
          }
        }
        rect(ctx, p.near, 94, 40, 6, 84);
        rect(ctx, p.near, 46, 82, 102, 6);
        rect(ctx, p.near, 34, 126, 126, 5);
        ditherBand(ctx, 34, 131, 126, 5, p.nearDark, p.near, 0.4);

        for (let i = 0; i < 6; i += 1) {
          const x = 50 + Math.round(hash(i + 40) * 92);
          const y = 48 + Math.round((hash(i + 52) * 60 + (tod === 'day' ? 0 : 8)) % 60);
          ctx.fillStyle = p.glow;
          ctx.fillRect(x, y, 1, 4);
        }

        // Framed pictures.
        rect(ctx, p.farDark, 196, 44, 34, 26);
        rect(ctx, p.accent, 200, 48, 26, 18);
        rect(ctx, p.farDark, 198, 50, 8, 8);
        rect(ctx, p.farDark, 244, 52, 26, 20);
        rect(ctx, p.light, 248, 56, 18, 12);

        // Shelf with jars.
        rect(ctx, p.farDark, 288, 84, 112, 4);
        for (let i = 0; i < 5; i += 1) {
          const x = 292 + i * 21;
          const height = 12 + Math.round(hash(i + 14) * 12);
          rect(ctx, p.far, x, 84 - height, 12, height);
          rect(ctx, p.midDark, x, 84 - height, 12, 2);
          rect(ctx, p.accent, x + 2, 84 - height + 3, 8, 3);
        }

        lamp(ctx, p, 150);
        lamp(ctx, p, 270);
      },
    },
    {
      id: 'counter',
      depth: 0.34,
      paint: (ctx, p) => {
        // Counter body and top.
        rect(ctx, p.midDark, 0, 148, W, 32);
        rect(ctx, p.mid, 0, 140, W, 10);
        rect(ctx, p.near, 0, 140, W, 3);
        rect(ctx, p.ink, 0, 149, W, 1);
        for (let x = 12; x < W; x += 48) {
          rect(ctx, p.farDark, x, 154, 36, 20);
          rect(ctx, p.ink, x, 154, 36, 1);
          rect(ctx, p.light, x + 30, 160, 2, 2);
        }

        // Espresso machine.
        rect(ctx, p.ink, 246, 96, 84, 45);
        rect(ctx, p.far, 250, 100, 76, 37);
        rect(ctx, p.farDark, 250, 100, 76, 5);
        rect(ctx, p.light, 258, 110, 8, 6);
        rect(ctx, p.ink, 256, 109, 12, 8);
        rect(ctx, p.accent, 274, 110, 6, 6);
        rect(ctx, p.ink, 273, 109, 8, 8);
        rect(ctx, p.midDark, 288, 126, 20, 10);
        rect(ctx, p.accent, 290, 128, 16, 2);
        rect(ctx, p.ink, 298, 136, 2, 4);

        // Cups and a plant on the counter.
        for (let i = 0; i < 3; i += 1) {
          const x = 360 + i * 13;
          rect(ctx, p.light, x, 132, 6, 8);
          rect(ctx, p.ink, x - 1, 132, 8, 2);
        }
        matrix(ctx, PLANT, { a: p.accent, k: p.farDark }, 214, 124, 1);
        rect(ctx, p.farDark, 211, 136, 22, 4);
      },
    },
    {
      id: 'table',
      depth: 0.62,
      paint: (ctx, p) => {
        // Foreground table edge.
        rect(ctx, p.ink, 0, 172, W, 10);
        rect(ctx, p.nearDark, 0, 174, W, 8);
        rect(ctx, p.near, 0, 170, W, 4);
        rect(ctx, p.accent, 0, 169, W, 1);

        // Notebook and pencil.
        rect(ctx, p.ink, 96, 158, 58, 15);
        rect(ctx, p.far, 99, 160, 52, 11);
        for (let y = 162; y < 170; y += 3) rect(ctx, p.farDark, 103, y, 44, 1);
        rect(ctx, p.light, 170, 160, 34, 3);
        rect(ctx, p.ink, 170, 163, 34, 1);
        rect(ctx, p.accent, 206, 160, 5, 3);

        // Mug within reach.
        matrix(ctx, MUG, { k: p.ink, m: p.light, r: p.accent }, 250, 156, 1);
        rect(ctx, p.ink, 249, 155, 12, 2);
        rect(ctx, p.accent, 262, 159, 2, 4);

        // Chair back silhouette on the right.
        rect(ctx, p.ink, 372, 96, 28, 86);
        rect(ctx, p.nearDark, 376, 100, 20, 78);
        rect(ctx, p.nearDark, 356, 168, 8, 12);
      },
    },
  ],

  animate: (ctx, p, tod, time, effects) => {
    // Steam from the mug and the espresso machine.
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        const rise = (time * 14 + j * 12 + i * 19) % 40;
        const x = 253 + i * 4 + Math.round(Math.sin(time * 1.6 + j) * 2);
        const y = 154 - rise;
        ctx.fillStyle = j % 2 === 0 ? p.glow : p.accent;
        ctx.fillRect(x, Math.round(y), 1, 1);
      }
    }
    if (Math.sin(time * 1.3) > 0) {
      ctx.fillStyle = p.glow;
      ctx.fillRect(299, 142, 1, 2);
      ctx.fillRect(303, 146, 1, 1);
    }

    // Lamp flicker: a single brighter pixel on the nearest bulb.
    if (Math.sin(time * 7.1) > -0.85) {
      ctx.fillStyle = p.light;
      ctx.fillRect(146, 44, 2, 1);
      ctx.fillRect(266, 44, 2, 1);
    }

    // Windows still show rain at dusk and night.
    if (tod === 'night' || tod === 'dusk') {
      for (let i = 0; i < 14; i += 1) {
        const span = 70;
        const y = 46 + ((hash(i + 7) * span + time * 20) % span);
        const x = 48 + Math.round(hash(i + 31) * 96);
        if (Math.abs(y - 82) < 4 && x > 92 && x < 100) continue;
        ctx.fillStyle = i % 3 === 0 ? p.accent : p.glow;
        ctx.fillRect(x, Math.round(y), 1, 2);
      }
    }

    if (!effects) return;
    for (let i = 0; i < 5; i += 1) {
      const x = Math.round(60 + hash(i + 5) * 280 + Math.sin(time * 0.3 + i) * 6);
      const y = Math.round(60 + hash(i + 17) * 90 + Math.cos(time * 0.4 + i) * 4);
      ctx.fillStyle = p.glow;
      ctx.fillRect(x, y, 1, 1);
    }
  },
};
