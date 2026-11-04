import type { Config } from '../core/types';
import { t, type Lang } from '../i18n';
import {
  WEATHER_KEYS,
  fetchWeather,
  formatTemperature,
  weatherKind,
  type WeatherSnapshot,
} from '../features/weather/weather';

type WeatherView =
  | { state: 'off' }
  | { state: 'empty' }
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; data: WeatherSnapshot };

export interface WeatherWidget {
  element: HTMLElement;
  render(lang: Lang): void;
  refresh(): void;
}

export function createWeatherWidget(config: Config): WeatherWidget {
  let lang: Lang = 'en';
  let view: WeatherView = { state: 'off' };
  let requestId = 0;

  const section = document.createElement('section');
  section.className = 'widget widget-weather';
  section.setAttribute('aria-labelledby', 'weather-title');

  const head = document.createElement('div');
  head.className = 'widget-head';

  const title = document.createElement('h2');
  title.id = 'weather-title';

  const place = document.createElement('span');
  place.className = 'widget-meta';

  head.append(title, place);

  const main = document.createElement('p');
  main.className = 'weather-main';

  const temp = document.createElement('span');
  temp.className = 'weather-temp';

  const desc = document.createElement('span');
  desc.className = 'weather-desc';

  main.append(temp, desc);

  const message = document.createElement('p');
  message.className = 'widget-empty';
  message.setAttribute('aria-live', 'polite');

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'weather-retry';

  section.append(head, main, message, retry);

  retry.addEventListener('click', () => {
    refresh();
  });

  function render(next?: Lang): void {
    if (next) lang = next;

    title.textContent = t(lang, 'weather');
    retry.textContent = t(lang, 'weatherRetry');

    const ready = view.state === 'ready';
    main.hidden = !ready;
    place.hidden = !ready;
    retry.hidden = view.state !== 'error';
    message.hidden = ready;

    if (view.state === 'ready') {
      temp.textContent = formatTemperature(view.data.temperature);
      desc.textContent = t(lang, WEATHER_KEYS[weatherKind(view.data.code)]);
      place.textContent = view.data.place;
      return;
    }

    switch (view.state) {
      case 'off':
        message.textContent = t(lang, 'weatherDisabled');
        break;
      case 'empty':
        message.textContent = t(lang, 'weatherNoCity');
        break;
      case 'loading':
        message.textContent = t(lang, 'weatherLoading');
        break;
      case 'error':
        message.textContent = t(lang, 'weatherError');
        break;
    }
  }

  /**
   * Fetch the forecast for the configured city. Stale responses are dropped by
   * comparing request ids, so switching city twice in a row cannot flash the
   * older result.
   */
  function refresh(): void {
    if (!config.weather.enabled) {
      view = { state: 'off' };
      render();
      return;
    }

    const city = config.weather.city.trim();
    if (!city) {
      view = { state: 'empty' };
      render();
      return;
    }

    const id = (requestId += 1);
    view = { state: 'loading' };
    render();

    fetchWeather(city, lang)
      .then((data) => {
        if (id !== requestId) return;
        view = { state: 'ready', data };
        render();
      })
      .catch(() => {
        if (id !== requestId) return;
        view = { state: 'error' };
        render();
      });
  }

  render();
  return { element: section, render, refresh };
}
