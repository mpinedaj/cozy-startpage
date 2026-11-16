import type { SceneId, TimeOfDay } from '../core/types';

/** Every scene is a deterministic character grid, sliced down for phones. */
export const ASCII_WIDTH = 120;
export const ASCII_HEIGHT = 32;
export const ASCII_MOBILE_COLUMNS = 64;
export const ASCII_FRAMES = 2;

type Grid = string[][];

function blank(): Grid {
  return Array.from({ length: ASCII_HEIGHT }, () => Array<string>(ASCII_WIDTH).fill(' '));
}

function put(grid: Grid, x: number, y: number, char: string): void {
  if (x < 0 || x >= ASCII_WIDTH || y < 0 || y >= ASCII_HEIGHT) return;
  grid[y][x] = char;
}

function text(grid: Grid, x: number, y: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) put(grid, x + index, y, value[index]);
}

function hline(grid: Grid, x: number, y: number, length: number, char = '-'): void {
  for (let index = 0; index < length; index += 1) put(grid, x + index, y, char);
}

function vline(grid: Grid, x: number, y: number, length: number, char = '|'): void {
  for (let index = 0; index < length; index += 1) put(grid, x, y + index, char);
}

function box(grid: Grid, x: number, y: number, width: number, height: number): void {
  hline(grid, x + 1, y, width - 2);
  hline(grid, x + 1, y + height - 1, width - 2);
  vline(grid, x, y + 1, height - 2);
  vline(grid, x + width - 1, y + 1, height - 2);
  put(grid, x, y, '+');
  put(grid, x + width - 1, y, '+');
  put(grid, x, y + height - 1, '+');
  put(grid, x + width - 1, y + height - 1, '+');
}

/** Stable pseudo-random value, so a frame is identical on every render. */
function hash(value: number): number {
  const noise = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return noise - Math.floor(noise);
}

function sun(grid: Grid, cx: number, cy: number): void {
  text(grid, cx - 2, cy, '\\ | /');
  text(grid, cx - 2, cy + 1, '--O--');
  text(grid, cx - 2, cy + 2, '/ | \\');
}

function moon(grid: Grid, cx: number, cy: number): void {
  text(grid, cx - 2, cy, '.--.');
  text(grid, cx - 3, cy + 1, '(    )');
  text(grid, cx - 2, cy + 2, "`--'");
}

function cloud(grid: Grid, x: number, y: number): void {
  text(grid, x + 2, y, '.--.');
  text(grid, x, y + 1, '(    )');
  text(grid, x + 2, y + 2, "`--'");
}

/** Sky content clipped to a rectangle: window panes and full backdrops share it. */
function skyPanel(
  grid: Grid,
  x: number,
  y: number,
  width: number,
  height: number,
  tod: TimeOfDay,
  frame: number,
): void {
  if (tod === 'night') {
    for (let index = 0; index < 34; index += 1) {
      const sx = x + Math.floor(hash(index * 3 + frame) * width);
      const sy = y + Math.floor(hash(index * 7 + 2) * height);
      put(grid, sx, sy, index % 9 === 0 ? '*' : '.');
    }
    moon(grid, x + width - 7, y + 2);
    return;
  }

  if (tod === 'day') {
    sun(grid, x + width - 6, y + 1);
    cloud(grid, x + 4, y + 2);
    cloud(grid, x + Math.floor(width / 2), y + height - 5);
    return;
  }

  // Dawn and dusk: low sun, a few fading stars.
  const sunX = tod === 'dawn' ? x + width - 8 : x + 8;
  sun(grid, sunX, y + height - 5);
  for (let index = 0; index < 12; index += 1) {
    const sx = x + Math.floor(hash(index * 5 + frame) * width);
    const sy = y + Math.floor(hash(index * 11 + 3) * (height - 6));
    put(grid, sx, sy, index % 4 === 0 ? '*' : '.');
  }
}

function skyline(grid: Grid, x: number, baseY: number, width: number): void {
  let cursor = x;
  let index = 0;
  while (cursor < x + width - 4) {
    const buildingWidth = Math.min(5 + Math.floor(hash(index * 3) * 7), x + width - cursor);
    const buildingHeight = 3 + Math.floor(hash(index * 7 + 1) * 5);
    box(grid, cursor, baseY - buildingHeight, buildingWidth, buildingHeight + 1);
    for (let row = baseY - buildingHeight + 1; row < baseY; row += 2) {
      for (let col = cursor + 1; col < cursor + buildingWidth - 1; col += 2) {
        put(grid, col, row, '.');
      }
    }
    cursor += buildingWidth + 1;
    index += 1;
  }
}

function mountain(grid: Grid, cx: number, baseY: number, height: number): void {
  for (let row = 0; row < height; row += 1) {
    const half = Math.round(row * 1.15);
    const y = baseY - height + 1 + row;
    put(grid, cx - half, y, '/');
    put(grid, cx + half, y, '\\');
  }
  put(grid, cx, baseY - height, '*');
  hline(
    grid,
    cx - Math.round((height - 1) * 1.15),
    baseY,
    Math.round((height - 1) * 1.15) * 2 + 1,
    '_',
  );
}

function pine(grid: Grid, cx: number, baseY: number, height: number): void {
  for (let row = 0; row < height; row += 1) {
    const half = Math.max(0, Math.round(row * 0.5));
    const y = baseY - 1 - row;
    for (let x = cx - half; x <= cx + half; x += 1) put(grid, x, y, '#');
    put(grid, cx - half, y, '/');
    put(grid, cx + half, y, '\\');
  }
  put(grid, cx, baseY, '|');
  put(grid, cx, baseY + 1, '|');
}

function ground(grid: Grid, y: number): void {
  for (let x = 0; x < ASCII_WIDTH; x += 1) put(grid, x, y, x % 3 === 0 ? '.' : '_');
}

function paintRainWindow(grid: Grid, tod: TimeOfDay, frame: number): void {
  // Sparse wallpaper outside the window.
  for (let y = 0; y < ASCII_HEIGHT; y += 3) {
    for (let x = 2; x < ASCII_WIDTH; x += 9) put(grid, x + ((y / 3) % 3), y, ':');
  }

  const left = 24;
  const top = 2;
  const width = 74;
  const height = 23;

  skyPanel(grid, left + 1, top + 1, width - 2, height - 2, tod, frame);
  skyline(grid, left + 2, top + height - 3, width - 6);

  for (let index = 0; index < 74; index += 1) {
    const x = left + 2 + Math.floor(hash(index * 13 + frame * 7) * (width - 4));
    const y = top + 2 + Math.floor(hash(index * 7 + frame * 3) * (height - 6));
    put(grid, x, y, index % 6 === 0 ? ',' : "'");
  }

  box(grid, left, top, width, height);
  vline(grid, left + Math.floor(width / 2), top + 1, height - 2);
  hline(grid, left + 1, top + Math.floor(height / 2), width - 2);

  hline(grid, left - 4, top + height, width + 8, '=');

  // Mug on the sill, with steam that changes between frames.
  text(grid, 42, 26, ' _____');
  text(grid, 42, 27, '|     |');
  text(grid, 42, 28, '|#####|)');
  text(grid, 42, 29, ' \\___/');
  put(grid, 47, 25, frame % 2 === 0 ? '~' : '^');
  put(grid, 49, 24, frame % 2 === 0 ? '^' : '~');
}

function paintForest(grid: Grid, tod: TimeOfDay, frame: number): void {
  skyPanel(grid, 18, 0, 84, 15, tod, frame);
  mountain(grid, 18, 23, 8);
  mountain(grid, 60, 23, 11);
  mountain(grid, 102, 23, 7);
  ground(grid, 29);

  const trees: Array<[number, number]> = [
    [6, 12],
    [19, 9],
    [31, 15],
    [44, 10],
    [58, 17],
    [72, 11],
    [85, 16],
    [99, 9],
    [113, 13],
  ];
  for (const [x, height] of trees) pine(grid, x, 29, height);

  // A trail opening in the centre keeps the focal point visible on phones.
  for (let y = 29; y < ASCII_HEIGHT; y += 1) {
    const half = (y - 28) * 2;
    for (let x = 60 - half; x <= 60 + half; x += 1) put(grid, x, y, '.');
  }

  if (tod !== 'day') {
    const count = tod === 'night' ? 26 : 16;
    for (let index = 0; index < count; index += 1) {
      const x = 30 + Math.floor(hash(index * 3 + frame * 5) * 60);
      const y = 12 + Math.floor(hash(index * 7 + frame * 2) * 15);
      put(grid, x, y, index % 4 === 0 ? '*' : '.');
    }
  }
}

function paintCafe(grid: Grid, tod: TimeOfDay, frame: number): void {
  // Interior wall and floor.
  for (let y = 0; y < ASCII_HEIGHT; y += 4) {
    for (let x = 1; x < ASCII_WIDTH; x += 11) put(grid, x + (y % 3), y, '.');
  }
  hline(grid, 0, 30, ASCII_WIDTH, '_');

  // Shelves with cups.
  hline(grid, 4, 10, 38, '-');
  hline(grid, 4, 15, 38, '-');
  text(grid, 8, 9, 'c c   c    c c');
  text(grid, 10, 14, 'c   c c  c');

  // Pendant lamps.
  for (const x of [32, 70]) {
    vline(grid, x, 0, 5, '|');
    text(grid, x - 2, 5, '\\___/');
    put(grid, x, 6, '*');
    for (let index = 0; index < 6; index += 1) {
      put(grid, x - 3 + Math.floor(hash(index + frame) * 7), 8 + index, '.');
    }
  }

  // Window with the same sky as the outdoor scenes.
  const windowX = 86;
  const windowY = 3;
  box(grid, windowX, windowY, 30, 16);
  skyPanel(grid, windowX + 1, windowY + 1, 28, 14, tod, frame);
  skyline(grid, windowX + 2, windowY + 12, 26);
  vline(grid, windowX + 15, windowY + 1, 14);
  hline(grid, windowX + 1, windowY + 8, 28);

  // Counter, machine and stools.
  hline(grid, 0, 24, 84, '=');
  text(grid, 10, 18, '+------+');
  text(grid, 10, 19, '|  ##  |');
  text(grid, 10, 20, '|  ##  |');
  text(grid, 10, 21, '+------+');
  text(grid, 50, 21, ' _____');
  text(grid, 50, 22, '|     |)');
  text(grid, 50, 23, ' \\___/');
  put(grid, 55, 20, frame % 2 === 0 ? '~' : '^');
  put(grid, 57, 19, frame % 2 === 0 ? '^' : '~');

  for (const x of [6, 24, 42, 60, 78]) {
    text(grid, x, 26, '| |');
    text(grid, x - 1, 27, '(_)');
  }
}

function paintLake(grid: Grid, tod: TimeOfDay, frame: number): void {
  skyPanel(grid, 0, 0, ASCII_WIDTH, 16, tod, frame);
  mountain(grid, 28, 18, 11);
  mountain(grid, 60, 18, 14);
  mountain(grid, 94, 18, 9);

  for (let x = 0; x < ASCII_WIDTH; x += 1) put(grid, x, 19, '~');

  for (let y = 20; y < 28; y += 2) {
    for (let x = (y + frame) % 7; x < ASCII_WIDTH; x += 11) put(grid, x, y, '~');
    for (let x = (y + frame + 4) % 9; x < ASCII_WIDTH; x += 13) put(grid, x, y + 1, '-');
  }

  // Reflection under the tallest peak.
  for (let y = 20; y < 27; y += 2) put(grid, 60, y, '|');
  for (let y = 21; y < 27; y += 3) put(grid, 59 + (y % 3), y, '.');

  ground(grid, 29);

  // Campfire on the near shore.
  text(grid, 44, 28, '(####)');
  text(grid, 46, 27, '/\\');
  text(grid, 45, 26, '(##)');
  put(grid, 47, 25, frame % 2 === 0 ? '^' : '*');
  put(grid, 48, 24, frame % 2 === 0 ? '*' : '^');
  for (let index = 0; index < 4; index += 1) {
    put(grid, 45 + Math.floor(hash(index * 3 + frame) * 5), 23 - index, '.');
  }
}

const painters: Record<SceneId, (grid: Grid, tod: TimeOfDay, frame: number) => void> = {
  'rainy-window': paintRainWindow,
  'forest-dusk': paintForest,
  'cafe-interior': paintCafe,
  'mountain-lake': paintLake,
};

/**
 * Render one frame. `columns` slices the centre of the grid so phones see a
 * readable composition instead of a 120-column strip at 5px.
 */
export function renderScene(
  scene: SceneId,
  tod: TimeOfDay,
  frame: number,
  columns = ASCII_WIDTH,
): string[] {
  const grid = blank();
  painters[scene](grid, tod, frame);
  const lines = grid.map((row) => row.join('').replace(/\s+$/, ''));
  if (columns >= ASCII_WIDTH) return lines;
  const safeColumns = Math.max(24, Math.min(columns, ASCII_WIDTH));
  const start = Math.floor((ASCII_WIDTH - safeColumns) / 2);
  return lines.map((line) => line.slice(start, start + safeColumns).replace(/\s+$/, ''));
}
