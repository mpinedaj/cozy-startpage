import { readPalette, type ScenePalette } from './palette';

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
  private effects = true;
  private palette: ScenePalette = readPalette();
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
    this.redrawIfIdle();
  }

  setTimeOfDay(t: SceneContext['timeOfDay']): void {
    if (this.timeOfDay === t) return;
    this.timeOfDay = t;
    this.redrawIfIdle();
  }

  setReducedMotion(v: boolean): void {
    this.reducedMotion = v;
    this.redrawIfIdle();
  }

  setEffects(v: boolean): void {
    if (this.effects === v) return;
    this.effects = v;
    this.redrawIfIdle();
  }

  refreshPalette(): void {
    this.palette = readPalette();
    this.redrawIfIdle();
  }

  /** Draw one frame without starting the animation loop. */
  render(): void {
    if (!this.scene) return;
    const c = this.makeCtx();
    this.scene.draw(c);
    if (this.effects) this.drawAmbient(c);
  }

  private redrawIfIdle(): void {
    if (!this.running) this.render();
  }

  /**
   * Sparse dust motes in the side bands of the scene. They stay clear of the
   * centred motif and are disabled by the "Ambient particles" setting.
   */
  private drawAmbient(c: SceneContext): void {
    const { ctx, width, height, palette, time } = c;
    for (let i = 0; i < 5; i += 1) {
      const band = i % 2 === 0 ? width * 0.16 : width * 0.84;
      const x = Math.floor(band + Math.sin(time * 0.4 + i * 1.7) * 20);
      const y = Math.floor((i * 41 + time * (4 + i)) % height);
      ctx.fillStyle = i % 2 === 0 ? palette.accent : palette.secondary;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  private makeCtx(): SceneContext {
    return {
      ctx: this.ctx,
      width: this.canvas.width,
      height: this.canvas.height,
      time: this.time,
      timeOfDay: this.timeOfDay,
      reducedMotion: this.reducedMotion,
      palette: this.palette,
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
        this.render();
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
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
