export type Matrix = readonly string[];

/** Solid rectangle with integer coordinates so edges stay square. */
export function rect(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

/** One pixel (or an n×n square) at an integer position. */
export function pixel(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  size = 1,
): void {
  rect(ctx, color, x, y, size, size);
}

/** Filled pixel circle with hard edges, used for suns, moons and glows. */
export function disc(
  ctx: CanvasRenderingContext2D,
  color: string,
  cx: number,
  cy: number,
  radius: number,
): void {
  for (let y = -radius; y <= radius; y += 1) {
    const span = Math.floor(Math.sqrt(radius * radius - y * y));
    rect(ctx, color, cx - span, cy + y, span * 2 + 1, 1);
  }
}

/**
 * Crescent moon: a disc with an offset bite, clipped to the disc so the bite
 * never paints outside the moon and into the sky.
 */
export function crescent(
  ctx: CanvasRenderingContext2D,
  color: string,
  cx: number,
  cy: number,
  radius: number,
  biteX: number,
  biteY: number,
  biteRadius: number,
): void {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y > radius * radius) continue;
      const dx = x - biteX;
      const dy = y - biteY;
      if (dx * dx + dy * dy <= biteRadius * biteRadius) continue;
      ctx.fillStyle = color;
      ctx.fillRect(cx + x, cy + y, 1, 1);
    }
  }
}

/** Random-looking but deterministic sequence in a range. */
export function rand(index: number, min: number, max: number): number {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return min + (value - Math.floor(value)) * (max - min);
}

/**
 * Draw a character-matrix sprite. Symbols map to palette roles; unknown
 * symbols are transparent.
 */
export function matrix(
  ctx: CanvasRenderingContext2D,
  art: Matrix,
  colors: Record<string, string>,
  x: number,
  y: number,
  scale = 1,
): void {
  for (let row = 0; row < art.length; row += 1) {
    const line = art[row] ?? '';
    for (let col = 0; col < line.length; col += 1) {
      const color = colors[line[col] ?? ''];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

/** Symmetric pine tree: stacked triangles with a trunk. */
export function pine(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  color: string,
  trunk: string,
): void {
  const half = Math.max(2, Math.round(height * 0.32));
  const layers = Math.max(2, Math.round(height / 6));
  for (let i = 0; i < layers; i += 1) {
    const layerY = baseY - height + Math.round((height * i) / layers);
    const width = Math.max(1, Math.round(half * ((i + 1) / layers)));
    ctx.fillStyle = color;
    ctx.fillRect(x - width, layerY, width * 2 + 1, Math.max(2, Math.round(height / (layers * 2))));
  }
  ctx.fillStyle = trunk;
  ctx.fillRect(x - 1, baseY - 4, 2, 4);
}

/** Jagged ridge built from seeded columns; keeps a single silhouette colour. */
export function ridge(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  baseY: number,
  amplitude: number,
  seed: number,
  step = 8,
): void {
  for (let x = 0; x < width; x += step) {
    const wave = Math.sin((x + seed * 37) * 0.02) * 0.6 + Math.sin((x + seed * 11) * 0.05) * 0.4;
    const top = Math.round(baseY - amplitude - wave * amplitude * 0.5);
    ctx.fillStyle = color;
    ctx.fillRect(x, top, step, baseY - top);
  }
}
