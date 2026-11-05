import type { SceneId, TimeOfDay } from '../core/types';
import { loadSceneAssets, type LoadedLayer } from './assets';
import { readSceneTint, type ScenePalette } from './palette';

export const SCENE_WIDTH = 320;
export const SCENE_HEIGHT = 180;
/** Extra art on each side so parallax never reveals an edge. */
export const SCENE_MARGIN = 40;
const FPS = 12;
const PARALLAX_PX = 10;

export interface SceneLayer {
  id: string;
  /** 0 = far (barely moves), 1 = near (moves the most). */
  depth: number;
  paint: (ctx: CanvasRenderingContext2D, palette: ScenePalette, tod: TimeOfDay) => void;
}

export interface Scene {
  id: SceneId;
  /** Optional image layers in `public/assets/scenes/<id>/`. */
  assets?: boolean;
  palettes: Record<TimeOfDay, ScenePalette>;
  layers: SceneLayer[];
  /** Per-frame animation: rain, steam, fireflies, water shimmer. */
  animate?: (
    ctx: CanvasRenderingContext2D,
    palette: ScenePalette,
    tod: TimeOfDay,
    time: number,
    effects: boolean,
  ) => void;
}

/** Smallest integer scale that covers the viewport. Crops, never stretches. */
export function coverScale(viewWidth: number, viewHeight: number): number {
  return Math.max(1, Math.ceil(viewWidth / SCENE_WIDTH), Math.ceil(viewHeight / SCENE_HEIGHT));
}

/**
 * Full-viewport backdrop. A 320x180 buffer is upscaled by an integer factor
 * and drawn behind the UI; static art is pre-rendered once per time of day.
 */
export class SceneEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly cache = new Map<string, HTMLCanvasElement>();
  private scene: Scene | null = null;
  private images: LoadedLayer[] = [];
  private tod: TimeOfDay = 'day';
  private reducedMotion = false;
  private effects = true;
  private tint = readSceneTint();
  private time = 0;
  private last = 0;
  private acc = 0;
  private raf = 0;
  private running = false;
  private assetToken = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = SCENE_WIDTH;
    canvas.height = SCENE_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create a 2D context');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.fit();

    window.addEventListener('resize', () => this.fit());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else if (!this.reducedMotion) this.start();
    });
  }

  /** Cover the viewport with integer pixels and keep the buffer centred. */
  private fit(): void {
    const scale = coverScale(window.innerWidth, window.innerHeight);
    this.canvas.style.width = `${SCENE_WIDTH * scale}px`;
    this.canvas.style.height = `${SCENE_HEIGHT * scale}px`;
  }

  setScene(scene: Scene): void {
    if (this.scene?.id === scene.id) return;
    this.scene = scene;
    this.time = 0;
    this.buildLayers();
    void this.syncAssets(scene);
    this.redrawIfIdle();
  }

  setTimeOfDay(tod: TimeOfDay): void {
    if (this.tod === tod) return;
    this.tod = tod;
    this.buildLayers();
    this.redrawIfIdle();
  }

  setReducedMotion(value: boolean): void {
    if (this.reducedMotion === value) return;
    this.reducedMotion = value;
    if (value) {
      this.stop();
      this.time = 0;
    }
    this.redrawIfIdle();
  }

  setEffects(value: boolean): void {
    if (this.effects === value) return;
    this.effects = value;
    this.redrawIfIdle();
  }

  /** Re-read the theme tint after `data-theme` changes. */
  syncTheme(): void {
    this.tint = readSceneTint();
    this.redrawIfIdle();
  }

  private async syncAssets(scene: Scene): Promise<void> {
    this.assetToken += 1;
    const token = this.assetToken;
    if (!scene.assets) {
      this.images = [];
      return;
    }
    const images = await loadSceneAssets(scene.id);
    if (token !== this.assetToken) return;
    this.images = images;
    this.redrawIfIdle();
  }

  private palette(): ScenePalette {
    return this.scene?.palettes[this.tod] ?? this.scene?.palettes.day ?? EMPTY_PALETTE;
  }

  private buildLayers(): void {
    this.cache.clear();
    if (!this.scene) return;
    const palette = this.palette();
    for (const layer of this.scene.layers) {
      const buffer = document.createElement('canvas');
      buffer.width = SCENE_WIDTH + SCENE_MARGIN * 2;
      buffer.height = SCENE_HEIGHT;
      const ctx = buffer.getContext('2d');
      if (!ctx) continue;
      ctx.imageSmoothingEnabled = false;
      layer.paint(ctx, palette, this.tod);
      this.cache.set(layer.id, buffer);
    }
  }

  render(): void {
    const palette = this.palette();
    const ctx = this.ctx;
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.skyLow;
    ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    if (this.scene) {
      for (const layer of this.scene.layers) {
        const bitmap = this.cache.get(layer.id);
        if (!bitmap) continue;
        ctx.drawImage(bitmap, -SCENE_MARGIN + this.drift(layer.depth), 0);
      }

      for (const image of this.images) {
        this.drawImageLayer(image);
      }

      this.scene.animate?.(ctx, palette, this.tod, this.time, this.effects);
    }

    if (this.effects) this.drawDust(palette);
    if (this.tint) {
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = this.tint;
      ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
      ctx.globalAlpha = 1;
    }
  }

  private drift(depth: number): number {
    if (this.reducedMotion) return 0;
    const phase = depth * 7.3;
    return Math.round(Math.sin(this.time * 0.22 + phase) * PARALLAX_PX * depth);
  }

  private drawImageLayer(layer: LoadedLayer): void {
    const frameWidth = layer.image.width / Math.max(1, layer.frames);
    const frame = layer.fps > 0 ? Math.floor(this.time * layer.fps) % Math.max(1, layer.frames) : 0;
    this.ctx.drawImage(
      layer.image,
      frame * frameWidth,
      0,
      frameWidth,
      layer.image.height,
      -SCENE_MARGIN + this.drift(layer.depth),
      0,
      SCENE_WIDTH + SCENE_MARGIN * 2,
      SCENE_HEIGHT,
    );
  }

  /** A few drifting motes on top of everything; off with "Ambient particles". */
  private drawDust(palette: ScenePalette): void {
    const ctx = this.ctx;
    for (let i = 0; i < 6; i += 1) {
      const band = i % 2 === 0 ? SCENE_WIDTH * 0.14 : SCENE_WIDTH * 0.86;
      const x = Math.round(band + Math.sin(this.time * 0.4 + i * 1.7) * 22);
      const y = Math.round((i * 37 + this.time * (3 + i * 0.6)) % SCENE_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? palette.glow : palette.accent;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  private redrawIfIdle(): void {
    if (!this.running) this.render();
  }

  start(): void {
    if (this.running || !this.scene) return;
    if (this.reducedMotion) {
      this.time = 0;
      this.render();
      return;
    }
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = (now - this.last) / 1000;
      this.last = now;
      this.acc += Math.min(dt, 0.25);
      const step = 1 / FPS;
      if (this.acc >= step) {
        this.acc %= step;
        this.time += step;
        this.render();
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}

const EMPTY_PALETTE: ScenePalette = {
  skyTop: '#000000',
  skyMid: '#000000',
  skyLow: '#000000',
  sun: '#000000',
  glow: '#000000',
  far: '#000000',
  farDark: '#000000',
  mid: '#000000',
  midDark: '#000000',
  near: '#000000',
  nearDark: '#000000',
  light: '#000000',
  accent: '#000000',
  ink: '#000000',
};
