import './styles/base.css';
import './styles/themes.css';
import '@fontsource/pixelify-sans';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.textContent = 'cozy-startpage';
}
