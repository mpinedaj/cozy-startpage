import { ditherBand, ditherGradient, hash } from '../dither';
import { crescent, disc, pine, rect } from '../draw';
import { SCENE_HEIGHT, SCENE_MARGIN, SCENE_WIDTH, type Scene } from '../engine';
import type { PaletteSet } from '../palette';

const W = SCENE_WIDTH + SCENE_MARGIN * 2;
const H = SCENE_HEIGHT;
const WATER_LINE = 104;

function peakHeight(x: number, seed: number, height: number): number {
  const wave = Math.sin((x + seed) * 0.016) * 0.55 + Math.sin((x + seed) * 0.006 + 2.1) * 0.45;
  return Math.round(height * (0.3 + 0.7 * Math.abs(wave)));
}

function drawPeaks(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  height: number,
  seed: number,
  color: string,
  shadow: string,
  snow: string,
  snowLine: number,
): void {
  for (let x = 0; x < W; x += 4) {
    const top = baseY - peakHeight(x, seed, height);
    ctx.fillStyle = color;
    ctx.fillRect(x, top, 4, baseY - top);
    ctx.fillStyle = shadow;
    ctx.fillRect(x + 3, top, 1, baseY - top);
    if (top < snowLine) {
      ctx.fillStyle = snow;
      ctx.fillRect(x, top, 4, 2);
      if (hash(x + seed) > 0.5) ctx.fillRect(x, top + 2, 2, 2);
    }
  }
}

export const mountainLake: Scene = {
  id: 'mountain-lake',
  palettes: {
    dawn: {
      skyTop: '#3b3a63',
      skyMid: '#9a7a92',
      skyLow: '#e8b59a',
      sun: '#ffe1b0',
      glow: '#ffcfa0',
      far: '#5f6f87',
      farDark: '#435369',
      mid: '#3f5a6b',
      midDark: '#2c4350',
      near: '#2a3a3a',
      nearDark: '#1b2828',
      light: '#ffd27a',
      accent: '#7fae9e',
      ink: '#101821',
    },
    day: {
      skyTop: '#5c9ac8',
      skyMid: '#a3cbe0',
      skyLow: '#e2eef0',
      sun: '#fff6cc',
      glow: '#ffffff',
      far: '#6f8ba0',
      farDark: '#526c80',
      mid: '#3f6a7a',
      midDark: '#2c4f5c',
      near: '#2f4a3f',
      nearDark: '#203630',
      light: '#ffe58f',
      accent: '#8fc4b4',
      ink: '#0c161c',
    },
    dusk: {
      skyTop: '#3a2a4a',
      skyMid: '#94606c',
      skyLow: '#e09370',
      sun: '#ffc27a',
      glow: '#ffab6a',
      far: '#55506b',
      farDark: '#3b374f',
      mid: '#3a4f60',
      midDark: '#283a48',
      near: '#26332f',
      nearDark: '#18231f',
      light: '#ffb96b',
      accent: '#a88f6a',
      ink: '#12101a',
    },
    night: {
      skyTop: '#080e1c',
      skyMid: '#122036',
      skyLow: '#1e3048',
      sun: '#e6f0f8',
      glow: '#9fc0d8',
      far: '#263748',
      farDark: '#192734',
      mid: '#1c3440',
      midDark: '#132630',
      near: '#16261f',
      nearDark: '#0c1713',
      light: '#ffcf8a',
      accent: '#6f8f8a',
      ink: '#05090d',
    },
  } satisfies PaletteSet,

  layers: [
    {
      id: 'sky',
      depth: 0.05,
      paint: (ctx, p, tod) => {
        ditherGradient(ctx, 0, 0, W, H, [p.skyTop, p.skyMid, p.skyLow]);

        if (tod === 'night') {
          for (let i = 0; i < 54; i += 1) {
            ctx.fillStyle = hash(i) > 0.8 ? p.glow : p.accent;
            ctx.fillRect(Math.round(hash(i + 4) * W), Math.round(hash(i + 17) * 90), 1, 1);
          }
        }

        const sunX = 268;
        const sunY = tod === 'day' ? 30 : tod === 'night' ? 38 : 48;
        disc(ctx, p.glow, sunX, sunY, 17);
        if (tod === 'night') crescent(ctx, p.sun, sunX, sunY, 11, 3, -2, 9);
        else disc(ctx, p.sun, sunX, sunY, 11);
        rect(ctx, p.glow, sunX - 20, sunY, 4, 1);
        rect(ctx, p.glow, sunX + 17, sunY, 4, 1);
        rect(ctx, p.glow, sunX, sunY - 20, 1, 4);
        rect(ctx, p.glow, sunX, sunY + 17, 1, 4);

        for (let i = 0; i < 6; i += 1) {
          const cx = Math.round(hash(i + 6) * W);
          const cy = 16 + Math.round(hash(i + 23) * 58);
          const cw = 44 + Math.round(hash(i + 11) * 60);
          rect(ctx, p.skyMid, cx, cy + 2, cw, 4);
          ditherBand(ctx, cx + 3, cy, cw - 8, 3, p.skyLow, p.skyMid, 0.5);
        }

        if (tod !== 'night') {
          for (let i = 0; i < 4; i += 1) {
            const bx = 60 + i * 22 + Math.round(hash(i + 31) * 10);
            const by = 42 + Math.round(hash(i + 44) * 20);
            ctx.fillStyle = p.ink;
            ctx.fillRect(bx, by, 2, 1);
            ctx.fillRect(bx + 3, by - 1, 2, 1);
            ctx.fillRect(bx + 7, by, 2, 1);
          }
        }
      },
    },
    {
      id: 'peaks',
      depth: 0.18,
      paint: (ctx, p, tod) => {
        drawPeaks(ctx, WATER_LINE, 58, 9, p.far, p.farDark, p.skyLow, 64);
        ditherBand(ctx, 0, 66, W, 8, p.far, p.skyMid, 0.25);
        drawPeaks(ctx, WATER_LINE, 40, 71, p.farDark, p.ink, p.far, 82);

        // Treeline at the water edge.
        for (let x = -4; x < W + 8; x += 8) {
          const height = 8 + Math.round(hash(x + 5) * 12);
          pine(ctx, x, WATER_LINE + 1, height, tod === 'night' ? p.midDark : p.mid, p.ink);
        }
      },
    },
    {
      id: 'water',
      depth: 0.4,
      paint: (ctx, p, tod) => {
        ditherGradient(ctx, 0, WATER_LINE, W, 68, [p.midDark, p.mid, p.farDark]);
        rect(ctx, p.skyLow, 0, WATER_LINE, W, 1);

        // Dithered reflection, strongest near the far shore.
        for (let x = 0; x < W; x += 3) {
          const top = WATER_LINE - peakHeight(x, 71, 40);
          const depth = Math.min(46, Math.round((WATER_LINE - top) * 0.9));
          const color = top < 82 ? p.far : p.farDark;
          for (let y = 0; y < depth; y += 2) {
            if (hash(x * 3 + y) > 0.55) {
              ctx.fillStyle = color;
              ctx.fillRect(x, WATER_LINE + 2 + y, 2, 1);
            }
          }
        }

        // Light path from the sun.
        for (let y = WATER_LINE + 3; y < 168; y += 4) {
          const width = 8 + Math.round((y - WATER_LINE) / 3);
          rect(ctx, p.glow, 262 - width / 2, y, width, 1);
        }

        if (tod === 'night') {
          rect(ctx, p.glow, 262, WATER_LINE + 2, 1, 60);
        }
      },
    },
    {
      id: 'shore',
      depth: 0.7,
      paint: (ctx, p) => {
        rect(ctx, p.ink, 0, 166, W, 14);
        rect(ctx, p.nearDark, 0, 168, W, 12);
        ditherBand(ctx, 0, 166, W, 4, p.near, p.nearDark, 0.5);

        // Rocks in the water.
        for (let i = 0; i < 7; i += 1) {
          const x = 20 + Math.round(hash(i + 2) * 90);
          const y = 160 + Math.round(hash(i + 9) * 8);
          const w = 6 + Math.round(hash(i + 16) * 8);
          rect(ctx, p.nearDark, x, y, w, 4);
          rect(ctx, p.near, x + 1, y, w - 3, 1);
        }

        // Pines framing the shore.
        pine(ctx, 16, 186, 92, p.near, p.ink);
        pine(ctx, 40, 184, 64, p.nearDark, p.ink);
        pine(ctx, 388, 186, 86, p.near, p.ink);

        // Campfire on the near shore, kept left of the widget column.
        rect(ctx, p.ink, 150, 170, 18, 3);
        rect(ctx, p.accent, 151, 169, 16, 2);
        rect(ctx, p.ink, 146, 172, 6, 2);
        rect(ctx, p.ink, 168, 171, 6, 2);

        // Tapered flame with warm embers above it instead of a dithered block.
        rect(ctx, p.accent, 157, 162, 6, 8);
        rect(ctx, p.accent, 158, 159, 4, 4);
        rect(ctx, p.accent, 159, 156, 2, 4);
        rect(ctx, p.sun, 158, 164, 4, 5);
        rect(ctx, p.sun, 159, 161, 2, 4);
        rect(ctx, p.light, 159, 158, 2, 4);
        for (let row = 0; row < 12; row += 1) {
          const half = 2 + Math.floor(row / 3);
          for (let col = -half; col <= half; col += 1) {
            if (hash(row * 13 + col + 4) < 0.55) continue;
            rect(ctx, row < 4 ? p.light : p.glow, 160 + col, 158 - row, 1, 1);
          }
        }
      },
    },
  ],

  animate: (ctx, p, tod, time) => {
    // Water shimmer: short horizontal dashes sliding with the current.
    for (let i = 0; i < 26; i += 1) {
      const y = WATER_LINE + 4 + Math.round(hash(i + 3) * 58);
      const drift = Math.round(Math.sin(time * 0.5 + i) * 8);
      const x = Math.round(hash(i + 11) * W + drift);
      const width = 2 + Math.round(hash(i + 29) * 5);
      ctx.fillStyle = i % 4 === 0 ? p.glow : p.accent;
      ctx.fillRect(x, y, width, 1);
    }

    // Fire: flickering core plus sparks.
    const flicker = Math.sin(time * 6.3) > -0.3 ? 1 : 0;
    ctx.fillStyle = p.sun;
    ctx.fillRect(157, 157 + flicker, 4, 4);
    ctx.fillStyle = p.light;
    ctx.fillRect(159, 154 + flicker, 2, 3);
    for (let i = 0; i < 7; i += 1) {
      const rise = (time * 14 + i * 11) % 30;
      const x = 156 + Math.round(Math.sin(time * 2 + i) * 4);
      const y = 158 - rise;
      if (y < 146) continue;
      ctx.fillStyle = i % 2 === 0 ? p.light : p.accent;
      ctx.fillRect(x, y, 1, 1);
    }

    if (tod === 'night' || tod === 'dusk') {
      for (let i = 0; i < 8; i += 1) {
        const x = Math.round(60 + hash(i + 13) * 240 + Math.sin(time * 0.6 + i) * 8);
        const y = Math.round(130 + hash(i + 27) * 34);
        if (Math.sin(time * 2 + i * 1.7) < 0) continue;
        ctx.fillStyle = p.light;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  },
};
