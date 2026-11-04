import { describe, expect, it } from 'vitest';
import {
  WEATHER_KEYS,
  forecastUrl,
  formatTemperature,
  geocodeUrl,
  parseCurrent,
  parsePlace,
  weatherKind,
} from './weather';

describe('weather URLs', () => {
  it('builds an encoded geocoding URL', () => {
    const url = new URL(geocodeUrl('San Sebastián', 'es'));
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(url.searchParams.get('name')).toBe('San Sebastián');
    expect(url.searchParams.get('count')).toBe('1');
    expect(url.searchParams.get('language')).toBe('es');
  });

  it('trims the city name', () => {
    const url = new URL(geocodeUrl('  Madrid  ', 'en'));
    expect(url.searchParams.get('name')).toBe('Madrid');
  });

  it('builds a forecast URL with current fields', () => {
    const url = new URL(forecastUrl(40.4168, -3.7038));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('40.4168');
    expect(url.searchParams.get('longitude')).toBe('-3.7038');
    expect(url.searchParams.get('current')).toBe('temperature_2m,weather_code');
  });
});

describe('weatherKind', () => {
  it('maps clear and cloudy codes', () => {
    expect(weatherKind(0)).toBe('clear');
    expect(weatherKind(1)).toBe('cloudy');
    expect(weatherKind(3)).toBe('cloudy');
  });

  it('maps wet and frozen codes', () => {
    expect(weatherKind(45)).toBe('fog');
    expect(weatherKind(53)).toBe('drizzle');
    expect(weatherKind(63)).toBe('rain');
    expect(weatherKind(73)).toBe('snow');
    expect(weatherKind(81)).toBe('showers');
    expect(weatherKind(86)).toBe('snow');
    expect(weatherKind(95)).toBe('thunder');
  });

  it('falls back to cloudy for unknown codes', () => {
    expect(weatherKind(42)).toBe('cloudy');
    expect(weatherKind(-1)).toBe('cloudy');
  });

  it('has a label key for every kind', () => {
    expect(WEATHER_KEYS.rain).toBe('weatherRain');
    expect(Object.keys(WEATHER_KEYS)).toHaveLength(8);
  });
});

describe('parsePlace', () => {
  it('reads the first result', () => {
    expect(
      parsePlace({
        results: [{ name: 'Madrid', latitude: 40.4, longitude: -3.7, country: 'Spain' }],
      }),
    ).toEqual({ name: 'Madrid', latitude: 40.4, longitude: -3.7 });
  });

  it('rejects empty or malformed payloads', () => {
    expect(parsePlace({ results: [] })).toBeNull();
    expect(parsePlace({ results: [{ name: 'X' }] })).toBeNull();
    expect(parsePlace(null)).toBeNull();
    expect(parsePlace('nope')).toBeNull();
  });
});

describe('parseCurrent', () => {
  it('reads temperature and code', () => {
    expect(parseCurrent({ current: { temperature_2m: 17.4, weather_code: 3 } })).toEqual({
      temperature: 17.4,
      code: 3,
    });
  });

  it('rejects incomplete payloads', () => {
    expect(parseCurrent({ current: { temperature_2m: 17 } })).toBeNull();
    expect(parseCurrent({})).toBeNull();
    expect(parseCurrent([])).toBeNull();
  });
});

describe('formatTemperature', () => {
  it('rounds to whole degrees', () => {
    expect(formatTemperature(17.4)).toBe('17°C');
    expect(formatTemperature(17.6)).toBe('18°C');
    expect(formatTemperature(-0.4)).toBe('0°C');
  });
});
