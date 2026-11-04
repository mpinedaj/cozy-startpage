import './styles/base.css';
import './styles/themes.css';
import '@fontsource/pixelify-sans';
import { loadConfig, saveConfig } from './core/storage';
import { exportConfig, importConfig } from './core/portable';
import type { Config } from './core/types';
import { formatTime, getTimeOfDay } from './features/clock/timeOfDay';
import { greetingText } from './features/clock/greeting';
import { searchUrl } from './features/search/engines';
import { t, type MessageKey } from './i18n';
import { addLink, removeLink, updateLink, moveLink } from './features/links/links';
import { prefersReducedMotion } from './features/settings/motion';
import { SceneEngine } from './scene/engine';
import { scenes, getScene, autoScene } from './scene/scenes';
import { createTasksWidget } from './ui/tasks-widget';
import { createWeatherWidget } from './ui/weather-widget';

const config = loadConfig();

function applyTheme(): void {
  document.body.dataset.theme = config.theme;
}
applyTheme();

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

function setAriaLabel(el: Element, key: MessageKey): void {
  el.setAttribute('data-i18n-aria', key);
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
  tasksWidget.render(config.language);
  weatherWidget.render(config.language);
  updateClock();
}

// ---------------------------------------------------------------------------
// Hero: clock, greeting, search
// ---------------------------------------------------------------------------
const hero = document.createElement('section');
hero.className = 'hero';
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
setPlaceholder(searchInput, 'searchPlaceholder');
setAriaLabel(searchInput, 'searchQuery');
searchForm.appendChild(searchInput);

const engineSelect = document.createElement('select');
setAriaLabel(engineSelect, 'searchEngineLabel');
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

hero.append(clockEl, greetingEl, searchForm);

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------
const linksSection = document.createElement('section');
linksSection.className = 'links';
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
setPlaceholder(titleInput, 'linkTitle');
setAriaLabel(titleInput, 'linkTitle');

const urlInput = document.createElement('input');
urlInput.type = 'url';
setPlaceholder(urlInput, 'linkUrl');
setAriaLabel(urlInput, 'linkUrlLabel');

const addBtn = document.createElement('button');
addBtn.type = 'submit';
setText(addBtn, 'addLink');

addForm.append(titleInput, urlInput, addBtn);
linksSection.appendChild(addForm);

function renderLinks(): void {
  linksList.textContent = '';
  config.links.forEach((link) => {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.title;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.appendChild(a);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = t(config.language, 'edit');
    editBtn.setAttribute('aria-label', `${t(config.language, 'edit')} ${link.title}`);
    editBtn.addEventListener('click', () => {
      const nt = prompt(t(config.language, 'linkTitle'), link.title);
      const nu = prompt(t(config.language, 'linkUrlLabel'), link.url);
      if (nt !== null && nu !== null) {
        if (updateLink(config, link.id, nt, nu)) renderLinks();
        else alert(t(config.language, 'invalidLink'));
      }
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', `${t(config.language, 'delete')} ${link.title}`);
    delBtn.addEventListener('click', () => {
      removeLink(config, link.id);
      renderLinks();
    });

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.textContent = '↑';
    upBtn.setAttribute('aria-label', `${t(config.language, 'moveUp')} ${link.title}`);
    upBtn.addEventListener('click', () => {
      moveLink(config, link.id, -1);
      renderLinks();
    });

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.textContent = '↓';
    downBtn.setAttribute('aria-label', `${t(config.language, 'moveDown')} ${link.title}`);
    downBtn.addEventListener('click', () => {
      moveLink(config, link.id, 1);
      renderLinks();
    });

    li.append(editBtn, delBtn, upBtn, downBtn);
    linksList.appendChild(li);
  });
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (addLink(config, titleInput.value, urlInput.value)) {
    titleInput.value = '';
    urlInput.value = '';
    renderLinks();
  } else {
    alert(t(config.language, 'invalidLink'));
  }
});

// ---------------------------------------------------------------------------
// Sidebar: scene card, weather and to-do
// ---------------------------------------------------------------------------
const sidebar = document.createElement('aside');
sidebar.className = 'sidebar';
setAriaLabel(sidebar, 'widgetsLabel');

const sceneCard = document.createElement('figure');
sceneCard.className = 'scene-card';

const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 180;
canvas.className = 'scene-canvas';
canvas.setAttribute('role', 'img');
setAriaLabel(canvas, 'sceneAlt');

const engine = new SceneEngine(canvas);

const sceneControls = document.createElement('figcaption');
sceneControls.className = 'scene-controls';

const themeLabel = document.createElement('label');
themeLabel.className = 'sr-only';
themeLabel.htmlFor = 'theme-select';
setText(themeLabel, 'themeLabel');

const themeSelect = document.createElement('select');
themeSelect.id = 'theme-select';
for (const [value, key] of [
  ['cafe', 'themeCafe'],
  ['forest', 'themeForest'],
  ['lavender', 'themeLavender'],
  ['night', 'themeNight'],
] as const) {
  const o = document.createElement('option');
  o.value = value;
  setText(o, key);
  themeSelect.appendChild(o);
}
themeSelect.value = config.theme;
themeSelect.addEventListener('change', () => {
  config.theme = themeSelect.value as typeof config.theme;
  applyTheme();
  saveConfig(config);
  resolveScene();
});

const sceneLabel = document.createElement('label');
sceneLabel.className = 'sr-only';
sceneLabel.htmlFor = 'scene-select';
setText(sceneLabel, 'sceneLabel');

const sceneKeys: Record<string, MessageKey> = {
  mug: 'sceneMug',
  tree: 'sceneTree',
  candle: 'sceneCandle',
  moon: 'sceneMoon',
};

const sceneSelect = document.createElement('select');
sceneSelect.id = 'scene-select';
const autoOpt = document.createElement('option');
autoOpt.value = 'auto';
setText(autoOpt, 'auto');
sceneSelect.appendChild(autoOpt);
for (const s of scenes) {
  const o = document.createElement('option');
  o.value = s.id;
  const key = sceneKeys[s.id];
  if (key) setText(o, key);
  else o.textContent = s.name;
  sceneSelect.appendChild(o);
}
sceneSelect.value = config.scene;
sceneSelect.addEventListener('change', () => {
  config.scene = sceneSelect.value;
  saveConfig(config);
  resolveScene();
});

sceneControls.append(themeLabel, themeSelect, sceneLabel, sceneSelect);
sceneCard.append(canvas, sceneControls);

const weatherWidget = createWeatherWidget(config);
const tasksWidget = createTasksWidget(config);

const settingsBtn = document.createElement('button');
settingsBtn.type = 'button';
settingsBtn.className = 'settings-open';
setText(settingsBtn, 'settings');
settingsBtn.setAttribute('aria-haspopup', 'dialog');
settingsBtn.setAttribute('aria-controls', 'settings-dialog');

const sidebarTools = document.createElement('div');
sidebarTools.className = 'sidebar-tools';
sidebarTools.append(settingsBtn);

sidebar.append(sidebarTools, sceneCard, weatherWidget.element, tasksWidget.element);

// ---------------------------------------------------------------------------
// Settings dialog
// ---------------------------------------------------------------------------
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
  const o = document.createElement('option');
  o.value = value;
  o.textContent = label;
  languageSelect.appendChild(o);
}
languageSelect.value = config.language;
languageSelect.addEventListener('change', () => {
  config.language = languageSelect.value as typeof config.language;
  saveConfig(config);
  applyLanguage();
});

const clockSelect = document.createElement('select');
clockSelect.id = 'setting-clock';
for (const [value, key] of [
  ['24', 'clock24'],
  ['12', 'clock12'],
] as const) {
  const o = document.createElement('option');
  o.value = value;
  setText(o, key);
  clockSelect.appendChild(o);
}
clockSelect.value = config.clockFormat;
clockSelect.addEventListener('change', () => {
  config.clockFormat = clockSelect.value as typeof config.clockFormat;
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
  const o = document.createElement('option');
  o.value = value;
  setText(o, key);
  motionSelect.appendChild(o);
}
motionSelect.value = config.reducedMotion;
motionSelect.addEventListener('change', () => {
  config.reducedMotion = motionSelect.value as typeof config.reducedMotion;
  saveConfig(config);
  applyMotion();
});

const weatherToggle = createCheckboxField('setting-weather', 'weatherEnableLabel');
weatherToggle.input.checked = config.weather.enabled;
weatherToggle.input.addEventListener('change', () => {
  config.weather.enabled = weatherToggle.input.checked;
  saveConfig(config);
  weatherWidget.refresh();
});

const cityInput = document.createElement('input');
cityInput.id = 'setting-city';
cityInput.type = 'text';
cityInput.maxLength = 64;
cityInput.autocomplete = 'off';
cityInput.value = config.weather.city;
setPlaceholder(cityInput, 'weatherCityPlaceholder');
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

// ---------------------------------------------------------------------------
// Backup: export and import the whole config as JSON
// ---------------------------------------------------------------------------
function applyConfig(next: Config): void {
  Object.assign(config, next);
  saveConfig(config);

  nameInput.value = config.name;
  languageSelect.value = config.language;
  clockSelect.value = config.clockFormat;
  effectsToggle.input.checked = config.effects;
  motionSelect.value = config.reducedMotion;
  weatherToggle.input.checked = config.weather.enabled;
  cityInput.value = config.weather.city;
  themeSelect.value = config.theme;
  sceneSelect.value = config.scene;
  engineSelect.value = config.searchEngine;

  applyTheme();
  engine.setEffects(config.effects);
  resolveScene();
  applyMotion();
  applyLanguage();
  weatherWidget.refresh();
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

root.append(hero, linksSection, sidebar);
app.append(root);
document.body.append(settingsDialog);

// ---------------------------------------------------------------------------
// Scene selection, motion preference and clock
// ---------------------------------------------------------------------------
function resolveScene(): void {
  const tod = getTimeOfDay(new Date().getHours());
  engine.setTimeOfDay(tod);
  engine.refreshPalette();
  const sc = config.scene === 'auto' ? autoScene(config.theme) : getScene(config.scene);
  engine.setScene(sc);
}

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyMotion(): void {
  const reduced = prefersReducedMotion(config.reducedMotion, motionQuery.matches);
  engine.setReducedMotion(reduced);
  if (!reduced && !document.hidden) engine.start();
}

motionQuery.addEventListener('change', () => {
  if (config.reducedMotion === 'system') applyMotion();
});

resolveScene();
engine.setEffects(config.effects);
applyMotion();

function updateClock(): void {
  const now = new Date();
  clockEl.textContent = formatTime(now, config.clockFormat);
  greetingEl.textContent = greetingText(now.getHours(), config.name, config.language);
  engine.setTimeOfDay(getTimeOfDay(now.getHours()));
}

applyLanguage();
weatherWidget.refresh();
setInterval(updateClock, 1000);
