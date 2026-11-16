import type { SceneId, TimeOfDay } from '../core/types';
import {
  ASCII_FRAMES,
  ASCII_HEIGHT,
  ASCII_MOBILE_COLUMNS,
  ASCII_WIDTH,
  renderScene,
} from './ascii';

/** A scene is an id; `renderScene` owns the character art. */
export interface Scene {
  id: SceneId;
}

/** Ambient animation step for the two-frame scenes. */
const FRAME_MS = 620;
/** Below this width the scene shows its centre 64 columns. */
const MOBILE_BREAKPOINT = 700;
/** Monospace advance width relative to the font size, with a safety margin. */
const CHAR_RATIO = 0.63;
const MIN_FONT = 6;
const MAX_FONT = 34;

/**
 * Full-viewport ASCII backdrop. The scene is preformatted text sized to fit the
 * viewport width, so it stays sharp at any resolution and never needs a canvas.
 */
export class AsciiSceneEngine {
  private readonly element: HTMLElement;
  private sceneId: SceneId | null = null;
  private tod: TimeOfDay = 'day';
  private reducedMotion = false;
  private effects = true;
  private frame = 0;
  private timer: number | null = null;
  private columns = ASCII_WIDTH;

  constructor(element: HTMLElement) {
    this.element = element;
    window.addEventListener('resize', () => this.fit());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.start();
    });
    this.fit();
  }

  setScene(scene: Scene): void {
    if (this.sceneId === scene.id) return;
    this.sceneId = scene.id;
    this.frame = 0;
    this.draw();
    this.start();
  }

  setTimeOfDay(tod: TimeOfDay): void {
    if (this.tod === tod) return;
    this.tod = tod;
    this.draw();
  }

  setReducedMotion(value: boolean): void {
    if (this.reducedMotion === value) return;
    this.reducedMotion = value;
    if (value) {
      this.frame = 0;
      this.stop();
    } else {
      this.start();
    }
    this.draw();
  }

  setEffects(value: boolean): void {
    if (this.effects === value) return;
    this.effects = value;
    if (value) this.start();
    else {
      this.frame = 0;
      this.stop();
    }
    this.draw();
  }

  start(): void {
    if (this.timer !== null || !this.shouldAnimate()) return;
    this.timer = window.setInterval(() => {
      this.frame = (this.frame + 1) % ASCII_FRAMES;
      this.draw();
    }, FRAME_MS);
  }

  stop(): void {
    if (this.timer === null) return;
    window.clearInterval(this.timer);
    this.timer = null;
  }

  private shouldAnimate(): boolean {
    return this.sceneId !== null && this.effects && !this.reducedMotion;
  }

  /**
   * Pick the centre columns for the viewport and size the monospace glyphs so
   * the full grid fits across the screen. Phones get a narrower crop so the
   * characters stay legible instead of shrinking into noise.
   */
  private fit(): void {
    const width = window.innerWidth;
    this.columns = width < MOBILE_BREAKPOINT ? ASCII_MOBILE_COLUMNS : ASCII_WIDTH;
    const size = Math.min(MAX_FONT, Math.max(MIN_FONT, width / (this.columns * CHAR_RATIO)));
    this.element.style.fontSize = `${size.toFixed(2)}px`;
    this.draw();
  }

  private draw(): void {
    if (!this.sceneId) {
      this.element.textContent = '';
      return;
    }
    const lines = renderScene(this.sceneId, this.tod, this.frame, this.columns);
    this.element.textContent = lines.join('\n');
    this.element.style.height = `${ASCII_HEIGHT}em`;
  }
}
