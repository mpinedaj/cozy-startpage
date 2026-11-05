import type { SceneId } from '../core/types';

/** Layer image files are 320x180 (or a horizontal strip of 320x180 frames). */
export interface ManifestLayer {
  file: string;
  depth: number;
  frames: number;
  fps: number;
}

export interface SceneManifest {
  id: SceneId;
  layers: ManifestLayer[];
}

const FILE_PATTERN = /^[\w.-]+\.(png|jpe?g|webp|gif)$/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

/**
 * Validate a scene manifest before any image is requested. Unknown fields are
 * ignored, bad layers are dropped, and a manifest without valid layers is
 * rejected so the procedural scene keeps working.
 */
export function parseManifest(raw: unknown): SceneManifest | null {
  if (!isObject(raw)) return null;
  const id = raw.id;
  if (typeof id !== 'string' || !id) return null;
  if (!Array.isArray(raw.layers)) return null;

  const layers: ManifestLayer[] = [];
  for (const entry of raw.layers.slice(0, 8)) {
    if (!isObject(entry)) continue;
    const file = entry.file;
    if (typeof file !== 'string' || !FILE_PATTERN.test(file)) continue;
    layers.push({
      file,
      depth: clampNumber(entry.depth, 0, 1, 0.5),
      frames: Math.round(clampNumber(entry.frames, 1, 64, 1)),
      fps: Math.round(clampNumber(entry.fps, 0, 24, 0)),
    });
  }

  return layers.length > 0 ? { id: id as SceneId, layers } : null;
}

export interface LoadedLayer {
  image: HTMLImageElement;
  depth: number;
  frames: number;
  fps: number;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

/**
 * Optional image layers live in `public/assets/scenes/<id>/`. A missing or
 * invalid manifest resolves to an empty list, so the procedural scene wins.
 */
export async function loadSceneAssets(id: SceneId): Promise<LoadedLayer[]> {
  if (typeof document === 'undefined' || typeof fetch !== 'function') return [];
  const base = new URL(`assets/scenes/${id}/`, document.baseURI);

  try {
    const response = await fetch(new URL('manifest.json', base));
    if (!response.ok) return [];
    const manifest = parseManifest(await response.json());
    if (!manifest) return [];

    const loaded = await Promise.all(
      manifest.layers.map(async (layer) => {
        const image = await loadImage(new URL(layer.file, base).toString());
        return image ? { image, depth: layer.depth, frames: layer.frames, fps: layer.fps } : null;
      }),
    );
    return loaded.filter((layer): layer is LoadedLayer => layer !== null);
  } catch {
    return [];
  }
}
