import { getPalette, type ScenePalette } from './palette';
import type { ThemeId } from '../core/types';

export interface SceneContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number; // seconds
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  reducedMotion: boolean;
  palette: ScenePalette;
}

export interface Scene {
  id: string;
  name: string;
  init?: (ctx: SceneContext) => void;
  update: (dt: number, ctx: SceneContext) => void;
  draw: (ctx: SceneContext) => void;
}

export class SceneEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scene: Scene | null = null;
  private running = false;
  private last = 0;
  private acc = 0;
  private readonly fps = 12;
  private readonly step = 1 / this.fps;
  private time = 0;
  private timeOfDay: SceneContext['timeOfDay'] = 'day';
  private reducedMotion = false;
  private theme: ThemeId = 'cafe';
  private raf = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('no ctx');
    this.ctx = c;
    this.ctx.imageSmoothingEnabled = false;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.start();
    });
  }

  setScene(scene: Scene): void {
    this.scene = scene;
    const ctx = this.makeCtx();
    scene.init?.(ctx);
  }

  setTimeOfDay(t: SceneContext['timeOfDay']): void {
    this.timeOfDay = t;
  }

  setReducedMotion(v: boolean): void {
    this.reducedMotion = v;
  }

  setTheme(theme: ThemeId): void {
    this.theme = theme;
  }

  private makeCtx(): SceneContext {
    return {
      ctx: this.ctx,
      width: this.canvas.width,
      height: this.canvas.height,
      time: this.time,
      timeOfDay: this.timeOfDay,
      reducedMotion: this.reducedMotion,
      palette: getPalette(this.theme),
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = (now - this.last) / 1000;
      this.last = now;
      if (this.reducedMotion) {
        // render single frame then stop
        const c = this.makeCtx();
        this.scene?.draw(c);
        this.running = false;
        return;
      }
      this.acc += dt;
      while (this.acc >= this.step) {
        this.acc -= this.step;
        this.time += this.step;
        const c = this.makeCtx();
        this.scene?.update(this.step, c);
      }
      const c = this.makeCtx();
      c.time = this.time;
      this.scene?.draw(c);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
