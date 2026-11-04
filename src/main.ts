import './styles/base.css';
import './styles/themes.css';
import '@fontsource/pixelify-sans';
import { loadConfig, saveConfig } from './core/storage';
import { formatTime, getTimeOfDay } from './features/clock/timeOfDay';
import { greetingText } from './features/clock/greeting';
import { searchUrl } from './features/search/engines';
import { t } from './i18n';
import { addLink, removeLink, updateLink, moveLink } from './features/links/links';
import { SceneEngine } from './scene/engine';
import { scenes, getScene, autoScene } from './scene/scenes';

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

// ---------------------------------------------------------------------------
// Hero: clock, greeting, search
// ---------------------------------------------------------------------------
const hero = document.createElement('section');
hero.className = 'hero';
hero.setAttribute('aria-label', 'Clock and search');

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
searchInput.placeholder = t(config.language, 'searchPlaceholder');
searchInput.setAttribute('aria-label', 'Search query');
searchForm.appendChild(searchInput);

const engineSelect = document.createElement('select');
engineSelect.setAttribute('aria-label', 'Search engine');
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
linksTitle.textContent = t(config.language, 'links');
linksSection.appendChild(linksTitle);

const linksList = document.createElement('ul');
linksList.className = 'links-list';
linksSection.appendChild(linksList);

const addForm = document.createElement('form');
addForm.className = 'add-link';

const titleInput = document.createElement('input');
titleInput.placeholder = 'Title';
titleInput.setAttribute('aria-label', 'Link title');

const urlInput = document.createElement('input');
urlInput.type = 'url';
urlInput.placeholder = 'https://...';
urlInput.setAttribute('aria-label', 'Link URL');

const addBtn = document.createElement('button');
addBtn.type = 'submit';
addBtn.textContent = t(config.language, 'addLink');

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
    editBtn.textContent = 'edit';
    editBtn.setAttribute('aria-label', `Edit ${link.title}`);
    editBtn.addEventListener('click', () => {
      const nt = prompt('Title', link.title);
      const nu = prompt('URL', link.url);
      if (nt !== null && nu !== null) {
        if (updateLink(config, link.id, nt, nu)) renderLinks();
        else alert('Invalid');
      }
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', `Delete ${link.title}`);
    delBtn.addEventListener('click', () => {
      removeLink(config, link.id);
      renderLinks();
    });

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.textContent = '↑';
    upBtn.setAttribute('aria-label', `Move ${link.title} up`);
    upBtn.addEventListener('click', () => {
      moveLink(config, link.id, -1);
      renderLinks();
    });

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.textContent = '↓';
    downBtn.setAttribute('aria-label', `Move ${link.title} down`);
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
    alert('Invalid link');
  }
});

renderLinks();

// ---------------------------------------------------------------------------
// Sidebar: compact scene widget + reserved slots for phase 2
// ---------------------------------------------------------------------------
const sidebar = document.createElement('aside');
sidebar.className = 'sidebar';
sidebar.setAttribute('aria-label', 'Dashboard widgets');

const sceneCard = document.createElement('figure');
sceneCard.className = 'scene-card';

const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 180;
canvas.className = 'scene-canvas';
canvas.setAttribute('role', 'img');
canvas.setAttribute('aria-label', 'Cozy pixel scene');

const engine = new SceneEngine(canvas);

const sceneControls = document.createElement('figcaption');
sceneControls.className = 'scene-controls';

const themeLabel = document.createElement('label');
themeLabel.className = 'sr-only';
themeLabel.htmlFor = 'theme-select';
themeLabel.textContent = 'Theme';

const themeSelect = document.createElement('select');
themeSelect.id = 'theme-select';
for (const theme of [
  ['cafe', 'Cafe'],
  ['forest', 'Forest'],
  ['lavender', 'Lavender'],
  ['night', 'Night'],
] as const) {
  const o = document.createElement('option');
  o.value = theme[0];
  o.textContent = theme[1];
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
sceneLabel.textContent = 'Scene';

const sceneSelect = document.createElement('select');
sceneSelect.id = 'scene-select';
const autoOpt = document.createElement('option');
autoOpt.value = 'auto';
autoOpt.textContent = 'Auto';
sceneSelect.appendChild(autoOpt);
for (const s of scenes) {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
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

function createWidgetSlot(title: string, description: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'widget-slot';
  section.setAttribute('aria-label', `${title} widget placeholder`);

  const heading = document.createElement('h2');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = description;

  section.append(heading, copy);
  return section;
}

sidebar.append(
  sceneCard,
  createWidgetSlot('Weather', 'A calm forecast will live here.'),
  createWidgetSlot('To-do', 'A short list for the day will live here.'),
);

root.append(hero, linksSection, sidebar);
app.appendChild(root);

// ---------------------------------------------------------------------------
// Scene selection and clock
// ---------------------------------------------------------------------------
function resolveScene(): void {
  const tod = getTimeOfDay(new Date().getHours());
  engine.setTimeOfDay(tod);
  engine.refreshPalette();
  const sc = config.scene === 'auto' ? autoScene(config.theme) : getScene(config.scene);
  engine.setScene(sc);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
engine.setReducedMotion(reducedMotion);

resolveScene();
engine.start();

function tick(): void {
  const now = new Date();
  clockEl.textContent = formatTime(now, config.clockFormat);
  greetingEl.textContent = greetingText(now.getHours(), config.name, config.language);
  engine.setTimeOfDay(getTimeOfDay(now.getHours()));
}
tick();
setInterval(tick, 1000);
