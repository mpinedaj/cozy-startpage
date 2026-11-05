import './styles/base.css';
import './styles/themes.css';
import '@fontsource/pixelify-sans';
import { loadConfig, saveConfig } from './core/storage';
import { exportConfig, importConfig } from './core/portable';
import { sanitizeUrl } from './core/validation';
import type { Config, SceneId, ThemeId, TimeOfDay } from './core/types';
import { formatTime, getTimeOfDay } from './features/clock/timeOfDay';
import { greetingText } from './features/clock/greeting';
import { searchUrl } from './features/search/engines';
import { t, type Lang, type MessageKey } from './i18n';
import { addLink, removeLink, updateLink, moveLink } from './features/links/links';
import { prefersReducedMotion } from './features/settings/motion';
import { SceneEngine } from './scene/engine';
import { autoScene, getScene, scenes } from './scene/scenes';
import { createTasksWidget } from './ui/tasks-widget';
import { createWeatherWidget } from './ui/weather-widget';
import { openConfirmDialog, openFormDialog, openMessageDialog } from './ui/dialog';

const config = loadConfig();

// ---------------------------------------------------------------------------
// Full-viewport pixel backdrop
// ---------------------------------------------------------------------------
const sceneCanvas = document.createElement('canvas');
sceneCanvas.className = 'scene-canvas';
sceneCanvas.setAttribute('aria-hidden', 'true');
document.body.prepend(sceneCanvas);
const engine = new SceneEngine(sceneCanvas);

function applyTheme(): void {
  document.body.dataset.theme = config.theme;
  engine.syncTheme();
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('app missing');

const root = document.createElement('main');
root.className = 'startpage';

// ---------------------------------------------------------------------------
// Localisation helpers
// ---------------------------------------------------------------------------
function setText(el: HTMLElement, key: MessageKey): void {
  el.dataset.i18n = key;
  el.textContent = t(config.language, key);
}

function setPlaceholder(el: HTMLInputElement, key: MessageKey): void {
  el.dataset.i18nPlaceholder = key;
  el.placeholder = t(config.language, key);
}

function setAriaLabel(el: HTMLElement, key: MessageKey): void {
  el.dataset.i18nAria = key;
  el.setAttribute('aria-label', t(config.language, key));
}

function applyLanguage(): void {
  document.documentElement.lang = config.language;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey | undefined;
    if (key) el.textContent = t(config.language, key);
  });
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as MessageKey | undefined;
    if (key) el.placeholder = t(config.language, key);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria as MessageKey | undefined;
    if (key) el.setAttribute('aria-label', t(config.language, key));
  });
  renderLinks();
  weatherWidget.render(config.language);
  tasksWidget.render(config.language);
}

// ---------------------------------------------------------------------------
// Hero: clock, greeting and search
// ---------------------------------------------------------------------------
const hero = document.createElement('section');
hero.className = 'panel hero-panel';
setAriaLabel(hero, 'heroLabel');

const clockEl = document.createElement('div');
clockEl.className = 'clock';
clockEl.id = 'clock';

const greetingEl = document.createElement('div');
greetingEl.className = 'greeting';

const searchForm = document.createElement('form');
searchForm.className = 'search';
searchForm.setAttribute('role', 'search');

const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.name = 'q';
searchInput.autocomplete = 'off';
setPlaceholder(searchInput, 'searchPlaceholder');
setAriaLabel(searchInput, 'searchQuery');

const engineSelect = document.createElement('select');
engineSelect.id = 'search-engine';
setAriaLabel(engineSelect, 'searchEngineLabel');
for (const value of ['duckduckgo', 'google', 'bing', 'brave'] as const) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  engineSelect.appendChild(option);
}
engineSelect.value = config.searchEngine;

searchForm.append(searchInput, engineSelect);
hero.append(clockEl, greetingEl, searchForm);

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  window.location.href = searchUrl(config.searchEngine, query);
});

engineSelect.addEventListener('change', () => {
  config.searchEngine = engineSelect.value as Config['searchEngine'];
  saveConfig(config);
});

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------
const linksSection = document.createElement('aside');
linksSection.className = 'panel links-panel';
linksSection.setAttribute('aria-labelledby', 'links-title');

const linksTitle = document.createElement('h2');
linksTitle.id = 'links-title';
setText(linksTitle, 'links');
linksSection.appendChild(linksTitle);

const linksList = document.createElement('ul');
linksList.className = 'links-list';
linksSection.appendChild(linksList);

const addForm = document.createElement('form');
addForm.className = 'add-link';

const titleInput = document.createElement('input');
titleInput.type = 'text';
titleInput.autocomplete = 'off';
titleInput.maxLength = 40;
setPlaceholder(titleInput, 'linkTitle');
setAriaLabel(titleInput, 'linkTitle');

const urlInput = document.createElement('input');
urlInput.type = 'url';
urlInput.autocomplete = 'off';
setPlaceholder(urlInput, 'linkUrl');
setAriaLabel(urlInput, 'linkUrlLabel');

const addBtn = document.createElement('button');
addBtn.type = 'submit';
setText(addBtn, 'addLink');

addForm.append(titleInput, urlInput, addBtn);
linksSection.appendChild(addForm);

function renderLinks(): void {
  linksList.textContent = '';
  for (const link of config.links) {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.title;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.appendChild(a);

    const actions = document.createElement('div');
    actions.className = 'link-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-button';
    editBtn.textContent = '✎';
    editBtn.setAttribute('aria-label', `${t(config.language, 'edit')} ${link.title}`);
    editBtn.addEventListener('click', async () => {
      const result = await openFormDialog(config.language, {
        titleKey: 'editLinkTitle',
        fields: [
          { name: 'title', labelKey: 'linkTitle', value: link.title, maxLength: 40 },
          { name: 'url', labelKey: 'linkUrlLabel', type: 'url', value: link.url },
        ],
        confirmKey: 'save',
        cancelKey: 'cancel',
        validate: (values) =>
          values.title.trim() && sanitizeUrl(values.url) ? null : 'invalidLink',
      });
      if (!result) return;
      if (updateLink(config, link.id, result.title, result.url)) renderLinks();
      else {
        await openMessageDialog(config.language, {
          titleKey: 'invalidLink',
          messageKey: 'invalidLinkHint',
        });
      }
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-button';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', `${t(config.language, 'delete')} ${link.title}`);
    delBtn.addEventListener('click', async () => {
      const confirmed = await openConfirmDialog(config.language, {
        titleKey: 'deleteLinkTitle',
        messageKey: 'deleteLinkMessage',
        messageVars: { name: link.title },
      });
      if (!confirmed) return;
      removeLink(config, link.id);
      renderLinks();
    });

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'icon-button';
    upBtn.textContent = '↑';
    upBtn.setAttribute('aria-label', `${t(config.language, 'moveUp')} ${link.title}`);
    upBtn.addEventListener('click', () => {
      moveLink(config, link.id, -1);
      renderLinks();
    });

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'icon-button';
    downBtn.textContent = '↓';
    downBtn.setAttribute('aria-label', `${t(config.language, 'moveDown')} ${link.title}`);
    downBtn.addEventListener('click', () => {
      moveLink(config, link.id, 1);
      renderLinks();
    });

    actions.append(editBtn, delBtn, upBtn, downBtn);
    li.appendChild(actions);
    linksList.appendChild(li);
  }
}

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (addLink(config, titleInput.value, urlInput.value)) {
    titleInput.value = '';
    urlInput.value = '';
    renderLinks();
  } else {
    await openMessageDialog(config.language, {
      titleKey: 'invalidLink',
      messageKey: 'invalidLinkHint',
    });
  }
});

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------
const weatherWidget = createWeatherWidget(config);
const tasksWidget = createTasksWidget(config);

const widgets = document.createElement('div');
widgets.className = 'widgets';
setAriaLabel(widgets, 'widgetsLabel');
widgets.append(weatherWidget.element, tasksWidget.element);

// ---------------------------------------------------------------------------
// Settings dialog
// ---------------------------------------------------------------------------
const settingsBtn = document.createElement('button');
settingsBtn.type = 'button';
settingsBtn.className = 'settings-open';
setText(settingsBtn, 'settings');
settingsBtn.setAttribute('aria-haspopup', 'dialog');
settingsBtn.setAttribute('aria-controls', 'settings-dialog');

const topbar = document.createElement('div');
topbar.className = 'topbar';
topbar.append(settingsBtn);

const settingsDialog = document.createElement('dialog');
settingsDialog.className = 'settings-dialog';
settingsDialog.id = 'settings-dialog';
settingsDialog.setAttribute('aria-labelledby', 'settings-title');

const settingsForm = document.createElement('form');
settingsForm.className = 'settings-form';
settingsForm.method = 'dialog';

const settingsHeader = document.createElement('header');
settingsHeader.className = 'settings-header';

const settingsTitle = document.createElement('h2');
settingsTitle.id = 'settings-title';
setText(settingsTitle, 'settings');

const settingsClose = document.createElement('button');
settingsClose.type = 'submit';
settingsClose.className = 'dialog-close';
settingsClose.textContent = '×';
setAriaLabel(settingsClose, 'close');

settingsHeader.append(settingsTitle, settingsClose);

function createField(
  labelKey: MessageKey,
  control: HTMLInputElement | HTMLSelectElement,
): HTMLDivElement {
  const field = document.createElement('div');
  field.className = 'field';
  const label = document.createElement('label');
  label.htmlFor = control.id;
  setText(label, labelKey);
  field.append(label, control);
  return field;
}

function createCheckboxField(
  id: string,
  labelKey: MessageKey,
  hintKey?: MessageKey,
): { field: HTMLDivElement; input: HTMLInputElement } {
  const input = document.createElement('input');
  input.id = id;
  input.type = 'checkbox';

  const row = document.createElement('label');
  row.className = 'checkbox-row';
  row.htmlFor = id;

  const text = document.createElement('span');
  setText(text, labelKey);
  row.append(input, text);

  const field = document.createElement('div');
  field.className = 'field';
  field.append(row);

  if (hintKey) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    setText(hint, hintKey);
    field.append(hint);
  }

  return { field, input };
}

function pick<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

const nameInput = document.createElement('input');
nameInput.id = 'setting-name';
nameInput.type = 'text';
nameInput.maxLength = 32;
nameInput.autocomplete = 'off';
nameInput.value = config.name;
setPlaceholder(nameInput, 'namePlaceholder');
nameInput.addEventListener('input', () => {
  config.name = nameInput.value;
  saveConfig(config);
  updateClock();
});

const languageSelect = document.createElement('select');
languageSelect.id = 'setting-language';
for (const [value, label] of [
  ['en', 'English'],
  ['es', 'Español'],
] as const) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  languageSelect.appendChild(option);
}
languageSelect.value = config.language;
languageSelect.addEventListener('change', () => {
  config.language = languageSelect.value as Lang;
  saveConfig(config);
  applyLanguage();
  updateClock();
});

const themeSelect = document.createElement('select');
themeSelect.id = 'setting-theme';
for (const [value, key] of [
  ['cafe', 'themeCafe'],
  ['forest', 'themeForest'],
  ['lavender', 'themeLavender'],
  ['night', 'themeNight'],
] as const) {
  const option = document.createElement('option');
  option.value = value;
  setText(option, key);
  themeSelect.appendChild(option);
}
themeSelect.value = config.theme;
themeSelect.addEventListener('change', () => {
  config.theme = pick<ThemeId>(themeSelect.value, ['cafe', 'forest', 'lavender', 'night'], 'cafe');
  saveConfig(config);
  applyTheme();
  if (config.scene === 'auto') resolveScene();
});

const sceneKeys: Record<SceneId, MessageKey> = {
  'rainy-window': 'sceneRainyWindow',
  'forest-dusk': 'sceneForestDusk',
  'cafe-interior': 'sceneCafeInterior',
  'mountain-lake': 'sceneMountainLake',
};

const sceneSelect = document.createElement('select');
sceneSelect.id = 'setting-scene';
const autoSceneOption = document.createElement('option');
autoSceneOption.value = 'auto';
setText(autoSceneOption, 'auto');
sceneSelect.appendChild(autoSceneOption);
for (const scene of scenes) {
  const option = document.createElement('option');
  option.value = scene.id;
  setText(option, sceneKeys[scene.id]);
  sceneSelect.appendChild(option);
}
sceneSelect.value = config.scene;
sceneSelect.addEventListener('change', () => {
  config.scene = sceneSelect.value === 'auto' ? 'auto' : (sceneSelect.value as SceneId);
  saveConfig(config);
  resolveScene();
});

const timeSelect = document.createElement('select');
timeSelect.id = 'setting-time';
const timeAuto = document.createElement('option');
timeAuto.value = 'auto';
setText(timeAuto, 'auto');
timeSelect.appendChild(timeAuto);
for (const [value, key] of [
  ['dawn', 'timeDawn'],
  ['day', 'timeDay'],
  ['dusk', 'timeDusk'],
  ['night', 'timeNight'],
] as const) {
  const option = document.createElement('option');
  option.value = value;
  setText(option, key);
  timeSelect.appendChild(option);
}
timeSelect.value = config.sceneTime;
timeSelect.addEventListener('change', () => {
  config.sceneTime = pick<Config['sceneTime']>(
    timeSelect.value,
    ['auto', 'dawn', 'day', 'dusk', 'night'],
    'auto',
  );
  saveConfig(config);
  applyTimeOfDay();
});

const clockSelect = document.createElement('select');
clockSelect.id = 'setting-clock';
for (const [value, key] of [
  ['24', 'clock24'],
  ['12', 'clock12'],
] as const) {
  const option = document.createElement('option');
  option.value = value;
  setText(option, key);
  clockSelect.appendChild(option);
}
clockSelect.value = config.clockFormat;
clockSelect.addEventListener('change', () => {
  config.clockFormat = clockSelect.value === '12' ? '12' : '24';
  saveConfig(config);
  updateClock();
});

const effectsToggle = createCheckboxField('setting-effects', 'effectsLabel', 'effectsHint');
effectsToggle.input.checked = config.effects;
effectsToggle.input.addEventListener('change', () => {
  config.effects = effectsToggle.input.checked;
  saveConfig(config);
  engine.setEffects(config.effects);
});

const motionSelect = document.createElement('select');
motionSelect.id = 'setting-motion';
for (const [value, key] of [
  ['system', 'motionSystem'],
  ['on', 'motionOn'],
  ['off', 'motionOff'],
] as const) {
  const option = document.createElement('option');
  option.value = value;
  setText(option, key);
  motionSelect.appendChild(option);
}
motionSelect.value = config.reducedMotion;
motionSelect.addEventListener('change', () => {
  config.reducedMotion = pick<Config['reducedMotion']>(
    motionSelect.value,
    ['system', 'on', 'off'],
    'system',
  );
  saveConfig(config);
  applyMotion();
});

const weatherToggle = createCheckboxField('setting-weather', 'weatherEnableLabel');

const cityInput = document.createElement('input');
cityInput.id = 'setting-city';
cityInput.type = 'text';
cityInput.maxLength = 64;
cityInput.autocomplete = 'off';
cityInput.value = config.weather.city;
setPlaceholder(cityInput, 'weatherCityPlaceholder');
setAriaLabel(cityInput, 'weatherCityLabel');

weatherToggle.input.checked = config.weather.enabled;
weatherToggle.input.addEventListener('change', () => {
  config.weather.enabled = weatherToggle.input.checked;
  saveConfig(config);
  weatherWidget.refresh();
});
cityInput.addEventListener('change', () => {
  config.weather.city = cityInput.value.trim();
  saveConfig(config);
  weatherWidget.refresh();
});

const weatherGroup = document.createElement('div');
weatherGroup.className = 'settings-group';

const weatherHeading = document.createElement('h3');
weatherHeading.className = 'settings-subtitle';
setText(weatherHeading, 'weather');

const weatherHint = document.createElement('p');
weatherHint.className = 'hint';
setText(weatherHint, 'weatherHint');

weatherGroup.append(
  weatherHeading,
  weatherToggle.field,
  createField('weatherCityLabel', cityInput),
  weatherHint,
);

function applyConfig(next: Config): void {
  Object.assign(config, next);
  saveConfig(config);

  nameInput.value = config.name;
  languageSelect.value = config.language;
  themeSelect.value = config.theme;
  sceneSelect.value = config.scene;
  timeSelect.value = config.sceneTime;
  clockSelect.value = config.clockFormat;
  effectsToggle.input.checked = config.effects;
  motionSelect.value = config.reducedMotion;
  weatherToggle.input.checked = config.weather.enabled;
  cityInput.value = config.weather.city;
  engineSelect.value = config.searchEngine;

  applyTheme();
  engine.setEffects(config.effects);
  resolveScene();
  applyMotion();
  applyLanguage();
  weatherWidget.refresh();
  updateClock();
}

const dataGroup = document.createElement('div');
dataGroup.className = 'settings-group';

const dataHeading = document.createElement('h3');
dataHeading.className = 'settings-subtitle';
setText(dataHeading, 'dataLabel');

const dataHint = document.createElement('p');
dataHint.className = 'hint';
setText(dataHint, 'dataHint');

const dataActions = document.createElement('div');
dataActions.className = 'data-actions';

const exportBtn = document.createElement('button');
exportBtn.type = 'button';
setText(exportBtn, 'exportConfig');
exportBtn.addEventListener('click', () => {
  const blob = new Blob([exportConfig(config)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cozy-startpage-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

const importLabel = document.createElement('label');
importLabel.className = 'file-button';

const importText = document.createElement('span');
setText(importText, 'importConfig');

const importInput = document.createElement('input');
importInput.type = 'file';
importInput.accept = 'application/json,.json';
importInput.className = 'sr-only';
importLabel.append(importText, importInput);

const importStatus = document.createElement('p');
importStatus.className = 'settings-status';
importStatus.setAttribute('role', 'status');

importInput.addEventListener('change', async () => {
  const file = importInput.files?.[0];
  importInput.value = '';
  if (!file) return;
  try {
    const result = importConfig(await file.text());
    if (!result.ok) {
      importStatus.textContent = t(
        config.language,
        result.reason === 'version' ? 'importVersion' : 'importInvalid',
      );
      return;
    }
    applyConfig(result.config);
    importStatus.textContent = t(config.language, 'importOk');
  } catch {
    importStatus.textContent = t(config.language, 'importInvalid');
  }
});

dataActions.append(exportBtn, importLabel);
dataGroup.append(dataHeading, dataHint, dataActions, importStatus);

const settingsActions = document.createElement('div');
settingsActions.className = 'settings-actions';
const doneBtn = document.createElement('button');
doneBtn.type = 'submit';
setText(doneBtn, 'done');
settingsActions.append(doneBtn);

const settingsBody = document.createElement('div');
settingsBody.className = 'settings-body';
settingsBody.append(
  createField('nameLabel', nameInput),
  createField('languageLabel', languageSelect),
  createField('themeLabel', themeSelect),
  createField('sceneLabel', sceneSelect),
  createField('timeLabel', timeSelect),
  createField('clockLabel', clockSelect),
  effectsToggle.field,
  createField('motionLabel', motionSelect),
  weatherGroup,
  dataGroup,
);
settingsForm.append(settingsHeader, settingsBody, settingsActions);
settingsDialog.appendChild(settingsForm);

settingsBtn.addEventListener('click', () => {
  if (!settingsDialog.open) settingsDialog.showModal();
});

const pageTitle = document.createElement('h1');
pageTitle.className = 'sr-only';
pageTitle.textContent = 'cozy startpage';

root.append(pageTitle, hero, linksSection, widgets);
app.append(root, topbar);
document.body.append(settingsDialog);

// ---------------------------------------------------------------------------
// Scene, time of day, motion and clock
// ---------------------------------------------------------------------------
function currentTimeOfDay(): TimeOfDay {
  return config.sceneTime === 'auto' ? getTimeOfDay(new Date().getHours()) : config.sceneTime;
}

function applyTimeOfDay(): void {
  engine.setTimeOfDay(currentTimeOfDay());
}

function resolveScene(): void {
  const scene = config.scene === 'auto' ? autoScene(config.theme) : getScene(config.scene);
  engine.setScene(scene);
  applyTimeOfDay();
  engine.start();
}

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyMotion(): void {
  const reduced = prefersReducedMotion(config.reducedMotion, motionQuery.matches);
  engine.setReducedMotion(reduced);
  if (!reduced && !document.hidden) engine.start();
  else engine.stop();
}

motionQuery.addEventListener('change', () => {
  if (config.reducedMotion === 'system') applyMotion();
});

function updateClock(): void {
  const now = new Date();
  clockEl.textContent = formatTime(now, config.clockFormat);
  greetingEl.textContent = greetingText(now.getHours(), config.name, config.language);
  engine.setTimeOfDay(currentTimeOfDay());
}

applyTheme();
applyLanguage();
resolveScene();
engine.setEffects(config.effects);
applyMotion();
weatherWidget.refresh();
updateClock();
setInterval(updateClock, 1000);
