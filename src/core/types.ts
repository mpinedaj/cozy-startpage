export type ThemeId = 'cafe' | 'forest' | 'lavender' | 'night';
export type ClockFormat = '12' | '24';
export type SearchEngine = 'duckduckgo' | 'google' | 'bing' | 'brave';
export type Language = 'en' | 'es';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type SceneTime = 'auto' | TimeOfDay;

/** Full-bleed background scenes. `auto` is a config-only value. */
export const SCENE_IDS = ['rainy-window', 'forest-dusk', 'cafe-interior', 'mountain-lake'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Config {
  version: number;
  name: string;
  theme: ThemeId;
  scene: SceneId | 'auto';
  sceneTime: SceneTime;
  clockFormat: ClockFormat;
  searchEngine: SearchEngine;
  effects: boolean;
  reducedMotion: 'system' | 'on' | 'off';
  language: Language;
  links: Link[];
  tasks: Task[];
  weather: { enabled: boolean; city: string };
  focusMode: boolean;
}

export const CONFIG_VERSION = 2;
export const STORAGE_KEY = 'cozy-startpage:config';

/** Scenes that shipped in v1. They are mapped to the nearest v2 scene. */
export const LEGACY_SCENES: Record<string, SceneId> = {
  mug: 'cafe-interior',
  tree: 'forest-dusk',
  candle: 'rainy-window',
  moon: 'mountain-lake',
};
