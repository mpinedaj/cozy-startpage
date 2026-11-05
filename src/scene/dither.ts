/**
 * Ordered 4x4 Bayer matrix. Pixel art gradients are dithered instead of
 * anti-aliased so every edge stays hard.
 */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value.padEnd(6, '0').slice(0, 6);
  const num = Number.parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function threshold(x: number, y: number): number {
  return (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
}

/**
 * Vertical gradient through any number of colour stops, with dithered
 * transitions instead of smooth interpolation. Cheap enough to run once per
 * static layer at build time.
 */
export function ditherGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  stops: readonly string[],
): void {
  if (width <= 0 || height <= 0 || stops.length === 0) return;
  const rgb = stops.map(hexToRgb);
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const last = rgb.length - 1;
  /**
   * Keep most of each band flat and dither only the narrow transition. A
   * continuous Bayer blend across the whole height reads as noise instead of
   * pixel-art banding.
   */
  const edge = 0.08;

  for (let row = 0; row < height; row += 1) {
    const position = height > 1 ? (row / (height - 1)) * last : last;
    const base = Math.min(last, Math.floor(position));
    const next = Math.min(last, base + 1);
    const mix = position - base;
    const t = (mix - 0.5) / edge;
    const blend = t <= -1 ? 0 : t >= 1 ? 1 : (t + 1) / 2;

    for (let col = 0; col < width; col += 1) {
      const color = blend > threshold(col, row) ? rgb[next] : rgb[base];
      const offset = (row * width + col) * 4;
      data[offset] = color[0];
      data[offset + 1] = color[1];
      data[offset + 2] = color[2];
      data[offset + 3] = 255;
    }
  }

  ctx.putImageData(image, x, y);
}

/** Two-colour dither fill for mist, haze and soft bands. */
export function ditherBand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colorA: string,
  colorB: string,
  ratio = 0.5,
): void {
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      ctx.fillStyle = threshold(col, row) < ratio ? colorB : colorA;
      ctx.fillRect(x + col, y + row, 1, 1);
    }
  }
}

/** Deterministic 0..1 noise, so scenes look identical on every load. */
export function hash(index: number): number {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}
