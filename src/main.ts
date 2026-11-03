import './styles/base.css';
import './styles/themes.css';
import '@fontsource/pixelify-sans';
import { loadConfig, saveConfig } from './core/storage';
import { formatTime } from './features/clock/timeOfDay';
import { greetingText } from './features/clock/greeting';
import { searchUrl } from './features/search/engines';
import { t } from './i18n';
import { addLink, removeLink, updateLink, moveLink } from './features/links/links';
import { SceneEngine } from './scene/engine';
import { scenes, getScene } from './scene/scenes';
import { getTimeOfDay } from './features/clock/timeOfDay';

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

// Clock
const clockEl = document.createElement('div');
clockEl.className = 'clock';
const greetingEl = document.createElement('div');
greetingEl.className = 'greeting';

// Search
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

// Links
const linksSection = document.createElement('section');
linksSection.className = 'links';
const linksTitle = document.createElement('h2');
linksTitle.textContent = t(config.language, 'links');
linksSection.appendChild(linksTitle);
const linksList = document.createElement('ul');
linksSection.appendChild(linksList);

const addForm = document.createElement('form');
addForm.className = 'add-link';
const titleInput = document.createElement('input');
titleInput.placeholder = 'Title';
const urlInput = document.createElement('input');
urlInput.type = 'url';
urlInput.placeholder = 'https://...';
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
    editBtn.textContent = '✎';
    editBtn.addEventListener('click', () => {
      const nt = prompt('Title', link.title);
      const nu = prompt('URL', link.url);
      if (nt !== null && nu !== null) {
        if (updateLink(config, link.id, nt, nu)) renderLinks();
        else alert('Invalid');
      }
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.addEventListener('click', () => {
      removeLink(config, link.id);
      renderLinks();
    });

    const upBtn = document.createElement('button');
    upBtn.textContent = '↑';
    upBtn.addEventListener('click', () => {
      moveLink(config, link.id, -1);
      renderLinks();
    });

    const downBtn = document.createElement('button');
    downBtn.textContent = '↓';
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

// Canvas scene
const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 180;
canvas.className = 'scene-canvas';
const engine = new SceneEngine(canvas);

const controls = document.createElement('div');
controls.className = 'controls';
const themeSelect = document.createElement('select');
for (const t of ['cafe', 'forest', 'lavender', 'night']) {
  const o = document.createElement('option');
  o.value = t;
  o.textContent = t;
  themeSelect.appendChild(o);
}
themeSelect.value = config.theme;
themeSelect.addEventListener('change', () => {
  config.theme = themeSelect.value as typeof config.theme;
  applyTheme();
  saveConfig(config);
});
const sceneSelect = document.createElement('select');
const autoOpt = document.createElement('option');
autoOpt.value = 'auto';
autoOpt.textContent = 'auto';
sceneSelect.appendChild(autoOpt);
for (const s of scenes) {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
  sceneSelect.appendChild(o);
}
sceneSelect.value = config.scene;
controls.append(themeSelect, sceneSelect);
root.append(canvas, controls, clockEl, greetingEl, searchForm, linksSection);
app.appendChild(root);

function resolveScene() {
  const tod = getTimeOfDay(new Date().getHours());
  engine.setTimeOfDay(tod);
  let sc;
  if (config.scene === 'auto') {
    const id = tod === 'night' ? 'starry' : tod === 'day' ? 'garden' : 'cabin';
    sc = getScene(id);
  } else {
    sc = getScene(config.scene);
  }
  if (sc) engine.setScene(sc);
}

sceneSelect.addEventListener('change', () => {
  config.scene = sceneSelect.value;
  saveConfig(config);
  resolveScene();
});

// reduced motion
const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
engine.setReducedMotion(rm);

resolveScene();
engine.start();

function tick(): void {
  const now = new Date();
  clockEl.textContent = formatTime(now, config.clockFormat);
  greetingEl.textContent = greetingText(now.getHours(), config.name, config.language);
  engine.setTimeOfDay(getTimeOfDay(now.getHours()));
  if (config.scene === 'auto') resolveScene();
}
tick();
setInterval(tick, 1000);
