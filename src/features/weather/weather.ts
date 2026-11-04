import type { Lang, MessageKey } from '../../i18n';

export type WeatherKind =
  'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'showers' | 'snow' | 'thunder';

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  code: number;
}

export interface WeatherSnapshot extends CurrentWeather {
  place: string;
}

export const WEATHER_KEYS: Record<WeatherKind, MessageKey> = {
  clear: 'weatherClear',
  cloudy: 'weatherCloudy',
  fog: 'weatherFog',
  drizzle: 'weatherDrizzle',
  rain: 'weatherRain',
  showers: 'weatherShowers',
  snow: 'weatherSnow',
  thunder: 'weatherThunder',
};

const GEOCODE_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8000;

export function geocodeUrl(city: string, lang: Lang): string {
  const params = new URLSearchParams({
    name: city.trim(),
    count: '1',
    language: lang,
    format: 'json',
  });
  return `${GEOCODE_ENDPOINT}?${params.toString()}`;
}

export function forecastUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: 'temperature_2m,weather_code',
    timezone: 'auto',
  });
  return `${FORECAST_ENDPOINT}?${params.toString()}`;
}

/** Map a WMO weather code to the small set of labels the widget shows. */
export function weatherKind(code: number): WeatherKind {
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunder';
  return 'cloudy';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parsePlace(data: unknown): Place | null {
  if (!isObject(data) || !Array.isArray(data.results)) return null;
  const first: unknown = data.results[0];
  if (!isObject(first)) return null;
  const { name, latitude, longitude } = first;
  if (typeof name !== 'string' || !name) return null;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  return { name, latitude, longitude };
}

export function parseCurrent(data: unknown): CurrentWeather | null {
  if (!isObject(data) || !isObject(data.current)) return null;
  const { temperature_2m: temperature, weather_code: code } = data.current;
  if (typeof temperature !== 'number' || typeof code !== 'number') return null;
  return { temperature, code };
}

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json();
}

/**
 * Resolve a city name and read its current weather. Two requests, no key and
 * no account; the caller is responsible for deciding when to call it.
 */
export async function fetchWeather(city: string, lang: Lang): Promise<WeatherSnapshot> {
  const place = parsePlace(await getJson(geocodeUrl(city, lang)));
  if (!place) throw new Error('City not found');
  const current = parseCurrent(await getJson(forecastUrl(place.latitude, place.longitude)));
  if (!current) throw new Error('Unexpected forecast payload');
  return { place: place.name, ...current };
}
