import { describe, expect, it } from 'vitest';
import { ASCII_HEIGHT, ASCII_MOBILE_COLUMNS, ASCII_WIDTH, renderScene } from './ascii';
import { autoScene, getScene, sceneIds, scenes } from './scenes';
import type { TimeOfDay } from '../core/types';

const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];
const PRINTABLE = /^[\x20-\x7e]*$/;

describe('ascii scenes', () => {
  it('ships exactly four scenes with unique ids', () => {
    expect(scenes).toHaveLength(4);
    expect(new Set(sceneIds()).size).toBe(4);
  });

  it('renders the full grid for every scene, time and frame', () => {
    for (const scene of sceneIds()) {
      for (const time of TIMES) {
        for (const frame of [0, 1]) {
          const lines = renderScene(scene, time, frame);
          expect(lines, `${scene} ${time} ${frame}`).toHaveLength(ASCII_HEIGHT);
          for (const line of lines) {
            expect(line.length, `${scene} ${time} ${frame}`).toBeLessThanOrEqual(ASCII_WIDTH);
          }
        }
      }
    }
  });

  it('uses printable ASCII only', () => {
    for (const scene of sceneIds()) {
      for (const time of TIMES) {
        for (const line of renderScene(scene, time, 0)) {
          expect(line, `${scene} ${time}`).toMatch(PRINTABLE);
        }
      }
    }
  });

  it('is deterministic for the same scene, time and frame', () => {
    for (const scene of sceneIds()) {
      expect(renderScene(scene, 'dusk', 1)).toEqual(renderScene(scene, 'dusk', 1));
    }
  });

  it('crops the centre columns for phones', () => {
    const wide = renderScene('cafe-interior', 'day', 0);
    const narrow = renderScene('cafe-interior', 'day', 0, ASCII_MOBILE_COLUMNS);
    const start = Math.floor((ASCII_WIDTH - ASCII_MOBILE_COLUMNS) / 2);

    expect(narrow).toHaveLength(ASCII_HEIGHT);
    expect(narrow[20]).toBe(wide[20].slice(start, start + ASCII_MOBILE_COLUMNS).trimEnd());
    for (const line of narrow) {
      expect(line.length).toBeLessThanOrEqual(ASCII_MOBILE_COLUMNS);
    }
  });

  it('clamps an extremely narrow crop to 24 columns', () => {
    for (const line of renderScene('rainy-window', 'night', 0, 10)) {
      expect(line.length).toBeLessThanOrEqual(24);
    }
  });

  it('changes between the two frames where the art animates', () => {
    const differs = (scene: (typeof scenes)[number]['id'], time: TimeOfDay): boolean =>
      JSON.stringify(renderScene(scene, time, 0)) !== JSON.stringify(renderScene(scene, time, 1));

    expect(differs('rainy-window', 'day')).toBe(true);
    expect(differs('mountain-lake', 'night')).toBe(true);
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
