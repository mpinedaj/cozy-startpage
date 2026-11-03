export type ThemeId = 'cafe' | 'forest' | 'lavender' | 'night';
export type ClockFormat = '12' | '24';
export type SearchEngine = 'duckduckgo' | 'google' | 'bing' | 'brave';
export type Language = 'en' | 'es';

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
  scene: string;
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

export const CONFIG_VERSION = 1;
export const STORAGE_KEY = 'cozy-startpage:config';
