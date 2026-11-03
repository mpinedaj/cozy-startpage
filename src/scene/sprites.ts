import type { ScenePalette } from './palette';

/**
 * Sprites are plain 2D character matrices. Only these symbols are allowed:
 *   '.' transparent, 'k' ink, 'm' accent, 'r' secondary.
 * No anti-aliasing, no colors outside the four theme colors.
 */
export type Sprite = readonly string[];
export type PixelColor = 'k' | 'm' | 'r';

function colorFor(symbol: PixelColor, palette: ScenePalette): string {
  switch (symbol) {
    case 'k':
      return palette.ink;
    case 'm':
      return palette.accent;
    case 'r':
      return palette.secondary;
  }
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  scale: number,
  palette: ScenePalette,
): void {
  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row] ?? '';
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === 'k' || ch === 'm' || ch === 'r') {
        ctx.fillStyle = colorFor(ch, palette);
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

export function spriteWidth(sprite: Sprite): number {
  return sprite.reduce((max, row) => Math.max(max, row.length), 0);
}

export function spriteHeight(sprite: Sprite): number {
  return sprite.length;
}
