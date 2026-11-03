import { describe, expect, it } from 'vitest';
import type { Sprite } from './sprites';
import { MUG } from './scenes/mug';
import { TREE } from './scenes/tree';
import { CANDLE, FLAME_A, FLAME_B } from './scenes/candle';
import { MOON } from './scenes/moon';

const all: Array<[string, Sprite]> = [
  ['mug', MUG],
  ['tree', TREE],
  ['candle', CANDLE],
  ['flame A', FLAME_A],
  ['flame B', FLAME_B],
  ['moon', MOON],
];

describe('pixel sprites', () => {
  for (const [name, sprite] of all) {
    it(`${name} is rectangular and uses only palette symbols`, () => {
      const width = sprite[0]?.length ?? 0;
      expect(width).toBeGreaterThan(0);
      for (const row of sprite) {
        expect(row.length).toBe(width);
        expect(row).toMatch(/^[.kmr]+$/);
      }
      expect(sprite.some((row) => /[kmr]/.test(row))).toBe(true);
    });
  }
});
