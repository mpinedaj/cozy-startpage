import './styles/base.css';
import './styles/themes.css';
import '@fontsource/pixelify-sans';
import { loadConfig, saveConfig } from './core/storage';
import { formatTime } from './features/clock/timeOfDay';
import { greetingText } from './features/clock/greeting';
import { searchUrl } from './features/search/engines';
import { t } from './i18n';

const config = loadConfig();

function applyTheme(): void {
  document.body.dataset.theme = config.theme;
  document.documentElement.lang = config.language;
}

applyTheme();

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('app missing');

const root = document.createElement('main');
root.className = 'startpage';

const clockEl = document.createElement('div');
clockEl.className = 'clock';
const greetingEl = document.createElement('div');
greetingEl.className = 'greeting';

const searchForm = document.createElement('form');
searchForm.className = 'search';
const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.placeholder = t(config.language, 'searchPlaceholder');
searchForm.appendChild(searchInput);
const engineSelect = document.createElement('select');
for (const e of ['duckduckgo', 'google', 'bing', 'brave']) {
  const o = document.createElement('option');
  o.value = e;
  o.textContent = e;
  engineSelect.appendChild(o);
}
engineSelect.value = config.searchEngine;
searchForm.appendChild(engineSelect);

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  window.location.href = searchUrl(config.searchEngine, q);
});

engineSelect.addEventListener('change', () => {
  config.searchEngine = engineSelect.value as typeof config.searchEngine;
  saveConfig(config);
});

root.append(clockEl, greetingEl, searchForm);
app.appendChild(root);

function tick(): void {
  const now = new Date();
  clockEl.textContent = formatTime(now, config.clockFormat);
  greetingEl.textContent = greetingText(now.getHours(), config.name, config.language);
}
tick();
setInterval(tick, 1000);
