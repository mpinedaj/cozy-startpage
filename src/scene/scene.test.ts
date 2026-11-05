import { describe, expect, it } from 'vitest';
import { parseManifest } from './assets';
import { SCENE_HEIGHT, SCENE_WIDTH, coverScale } from './engine';
import { SCENE_COLOR_COUNT, paletteValues } from './palette';
import { autoScene, getScene, sceneIds, scenes } from './scenes';
import type { TimeOfDay } from '../core/types';

const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];

describe('scene palettes', () => {
  it('ships exactly four scenes with unique ids', () => {
    expect(scenes).toHaveLength(4);
    expect(new Set(sceneIds()).size).toBe(4);
  });

  it('gives every scene a full palette for every time of day', () => {
    for (const scene of scenes) {
      for (const time of TIMES) {
        const palette = scene.palettes[time];
        expect(palette, `${scene.id} ${time}`).toBeDefined();
        expect(paletteValues(palette)).toHaveLength(SCENE_COLOR_COUNT);
      }
    }
  });

  it('uses only 6-digit hex colours', () => {
    for (const scene of scenes) {
      for (const time of TIMES) {
        for (const color of paletteValues(scene.palettes[time])) {
          expect(color, `${scene.id} ${time}`).toMatch(/^#[0-9a-f]{6}$/i);
        }
      }
    }
  });

  it('keeps the palette colours distinct within a variant', () => {
    for (const scene of scenes) {
      for (const time of TIMES) {
        const colors = paletteValues(scene.palettes[time]).map((color) => color.toLowerCase());
        expect(new Set(colors).size, `${scene.id} ${time}`).toBe(SCENE_COLOR_COUNT);
      }
    }
  });

  it('has at least three depth layers per scene', () => {
    for (const scene of scenes) {
      expect(scene.layers.length, scene.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('coverScale', () => {
  const viewports: Array<[number, number]> = [
    [320, 180],
    [1920, 1080],
    [390, 844],
    [844, 390],
    [1366, 768],
    [2560, 1440],
    [0, 0],
  ];

  it('returns an integer factor of at least 1', () => {
    for (const [width, height] of viewports) {
      const scale = coverScale(width, height);
      expect(Number.isInteger(scale)).toBe(true);
      expect(scale).toBeGreaterThanOrEqual(1);
    }
  });

  it('covers the viewport without stretching', () => {
    for (const [width, height] of viewports) {
      const scale = coverScale(width, height);
      expect(scale * SCENE_WIDTH).toBeGreaterThanOrEqual(width);
      expect(scale * SCENE_HEIGHT).toBeGreaterThanOrEqual(height);
    }
  });

  it('matches known sizes', () => {
    expect(coverScale(320, 180)).toBe(1);
    expect(coverScale(1920, 1080)).toBe(6);
    expect(coverScale(390, 844)).toBe(5);
  });
});

describe('scene manifest', () => {
  const valid = {
    id: 'rainy-window',
    layers: [
      { file: 'rain.png', depth: 0.9, frames: 4, fps: 8 },
      { file: 'sky.webp', depth: 0.1 },
    ],
  };

  it('accepts a valid manifest', () => {
    const manifest = parseManifest(valid);
    expect(manifest).not.toBeNull();
    expect(manifest?.layers).toHaveLength(2);
    expect(manifest?.layers[0]).toEqual({ file: 'rain.png', depth: 0.9, frames: 4, fps: 8 });
    expect(manifest?.layers[1]).toEqual({ file: 'sky.webp', depth: 0.1, frames: 1, fps: 0 });
  });

  it('rejects malformed shapes', () => {
    expect(parseManifest(null)).toBeNull();
    expect(parseManifest([])).toBeNull();
    expect(parseManifest({ id: 'x' })).toBeNull();
    expect(parseManifest({ id: 'x', layers: [] })).toBeNull();
    expect(parseManifest({ id: '', layers: valid.layers })).toBeNull();
  });

  it('drops unsafe file names and unknown extensions', () => {
    const manifest = parseManifest({
      id: 'forest-dusk',
      layers: [{ file: '../secrets.png' }, { file: 'script.js' }, { file: 'ok.PNG' }],
    });
    expect(manifest?.layers.map((layer) => layer.file)).toEqual(['ok.PNG']);
  });

  it('clamps numbers to safe ranges and caps the layer count', () => {
    const layers = Array.from({ length: 12 }, (_, index) => ({
      file: `layer-${index}.png`,
      depth: 5,
      frames: 500,
      fps: 120,
    }));
    const manifest = parseManifest({ id: 'cafe-interior', layers });
    expect(manifest?.layers).toHaveLength(8);
    expect(manifest?.layers[0]).toEqual({
      file: 'layer-0.png',
      depth: 1,
      frames: 64,
      fps: 24,
    });
  });
});

describe('scene lookup', () => {
  it('falls back to the first scene for unknown ids', () => {
    expect(getScene('volcano').id).toBe('rainy-window');
  });

  it('picks a matching scene per theme', () => {
    expect(autoScene('cafe').id).toBe('cafe-interior');
    expect(autoScene('forest').id).toBe('forest-dusk');
    expect(autoScene('lavender').id).toBe('mountain-lake');
    expect(autoScene('night').id).toBe('rainy-window');
  });
});
