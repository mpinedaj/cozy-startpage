import { expect, test, type Page } from '@playwright/test';
import type { Config } from '../src/core/types';

const STORAGE_KEY = 'cozy-startpage:config';

const baseConfig: Config = {
  version: 1,
  name: '',
  theme: 'cafe',
  scene: 'auto',
  clockFormat: '24',
  searchEngine: 'duckduckgo',
  effects: true,
  reducedMotion: 'off',
  language: 'en',
  links: [],
  tasks: [],
  weather: { enabled: false, city: '' },
  focusMode: false,
};

/** Write a config into storage, then reload so the app boots with it. */
async function seed(page: Page, patch: Partial<Config> = {}): Promise<void> {
  const config: Config = { ...baseConfig, ...patch };
  await page.goto('/');
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [
    STORAGE_KEY,
    JSON.stringify(config),
  ] as const);
  await page.reload();
}

function canvasHash(page: Page): Promise<string> {
  return page.evaluate(() => document.querySelector('canvas')?.toDataURL().slice(-96) ?? 'missing');
}

function readConfig(page: Page): Promise<Config> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}') as Config,
    STORAGE_KEY,
  );
}

test.describe('start page', () => {
  test('renders the clock, greeting and search form', async ({ page }) => {
    await seed(page, { name: 'Ada' });
    await page.goto('/');

    await expect(page.locator('#clock')).toHaveText(/^\d{2}:\d{2}$/);
    await expect(page.locator('.greeting')).toContainText('Ada');
    await expect(page.getByPlaceholder('Search the web...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
    await expect(page.locator('canvas')).toHaveAttribute('role', 'img');
  });

  test('search opens the selected engine', async ({ page }) => {
    await page.route('https://duckduckgo.com/**', (route) => route.fulfill({ body: 'ok' }));
    await seed(page);

    await page.getByPlaceholder('Search the web...').fill('pixel art');
    await page.getByPlaceholder('Search the web...').press('Enter');

    await page.waitForURL('https://duckduckgo.com/?q=pixel%20art');
  });

  test('adds a link, remembers it and removes it', async ({ page }) => {
    await seed(page);

    await page.getByPlaceholder('Title').fill('GitHub');
    await page.getByPlaceholder('https://...').fill('https://github.com');
    await page.getByRole('button', { name: 'Add link' }).click();

    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();

    await page.getByRole('button', { name: 'Delete GitHub' }).click();
    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  });

  test('rejects an invalid link', async ({ page }) => {
    await seed(page);

    await page.getByPlaceholder('Title').fill('FTP');
    await page.getByPlaceholder('https://...').fill('ftp://example.com');

    page.once('dialog', (dialog) => {
      expect(dialog.message()).toBe('Invalid link');
      void dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Add link' }).click();

    await expect(page.locator('.links-list li')).toHaveCount(0);
  });

  test('switches language without a reload and remembers it', async ({ page }) => {
    await seed(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.selectOption('#setting-language', 'es');
    await page.getByRole('button', { name: 'Listo' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('#links-title')).toHaveText('Enlaces');
    await expect(page.getByPlaceholder('Buscar en la web...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ajustes' })).toBeVisible();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('#links-title')).toHaveText('Enlaces');
    expect((await readConfig(page)).language).toBe('es');
  });

  test('adds, completes and clears tasks', async ({ page }) => {
    await seed(page);

    const input = page.getByPlaceholder('Add a task');
    await input.fill('water the plants');
    await input.press('Enter');
    await input.fill('read a book');
    await input.press('Enter');

    await expect(page.locator('.task')).toHaveCount(2);
    await expect(page.locator('.widget-tasks .widget-meta')).toHaveText('Done: 0/2');

    await page.locator('.task').first().getByRole('checkbox').check();
    await expect(page.locator('.widget-tasks .widget-meta')).toHaveText('Done: 1/2');

    await page.reload();
    await expect(page.locator('.task-done')).toHaveCount(1);

    await page.getByRole('button', { name: 'Clear done' }).click();
    await expect(page.locator('.task')).toHaveCount(1);
    await expect(page.locator('.widget-tasks .widget-empty')).toHaveText('Nothing planned yet.');
  });

  test('shows the forecast and recovers from a failed request', async ({ page }) => {
    let failing = false;

    await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
      failing
        ? route.fulfill({ status: 500, body: 'nope' })
        : route.fulfill({
            json: { results: [{ name: 'Madrid', latitude: 40.4168, longitude: -3.7038 }] },
          }),
    );
    await page.route('**/api.open-meteo.com/**', (route) =>
      route.fulfill({ json: { current: { temperature_2m: 17.4, weather_code: 3 } } }),
    );

    await seed(page, { weather: { enabled: true, city: 'Madrid' } });
    await expect(page.locator('.weather-temp')).toHaveText('17°C');
    await expect(page.locator('.weather-desc')).toHaveText('Cloudy');
    await expect(page.locator('.widget-weather .widget-meta')).toHaveText('Madrid');

    failing = true;
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.fill('#setting-city', 'Barcelona');
    await page.locator('#setting-city').blur();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.locator('.widget-weather .widget-empty')).toHaveText(
      'Could not load the weather.',
    );
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();

    failing = false;
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.locator('.weather-temp')).toHaveText('17°C');
  });

  test('exports and imports the config', async ({ page }) => {
    await seed(page, { name: 'Ada' });
    await page.getByRole('button', { name: 'Settings' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const exported = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Config;
    expect(exported.name).toBe('Ada');
    expect(download.suggestedFilename()).toMatch(/^cozy-startpage-\d{4}-\d{2}-\d{2}\.json$/);

    const imported: Config = {
      ...baseConfig,
      name: 'Grace',
      language: 'es',
      theme: 'night',
      clockFormat: '12',
      tasks: [{ id: 't1', text: 'revisar', done: false }],
    };
    await page.setInputFiles('input[type=file]', {
      name: 'config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(imported)),
    });

    await expect(page.locator('.settings-status')).toHaveText('Ajustes importados.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'night');
    await expect(page.locator('#setting-name')).toHaveValue('Grace');
    await expect(page.locator('.task')).toHaveCount(1);

    await page.getByRole('button', { name: 'Listo' }).click();
    await expect(page.locator('.clock')).toHaveText(/^\d{1,2}:\d{2} (AM|PM)$/);

    await page.reload();
    expect((await readConfig(page)).name).toBe('Grace');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('rejects an invalid import without touching the config', async ({ page }) => {
    await seed(page, { name: 'Ada' });
    await page.getByRole('button', { name: 'Settings' }).click();

    await page.setInputFiles('input[type=file]', {
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ not json'),
    });
    await expect(page.locator('.settings-status')).toHaveText('That file is not a valid config.');

    await page.setInputFiles('input[type=file]', {
      name: 'future.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ ...baseConfig, version: 99 })),
    });
    await expect(page.locator('.settings-status')).toHaveText(
      'That file was made by a newer version.',
    );

    await expect(page.locator('#setting-name')).toHaveValue('Ada');
  });

  test('freezes the scene when motion is reduced', async ({ page }) => {
    await seed(page, { reducedMotion: 'on' });
    await page.waitForTimeout(300);

    const first = await canvasHash(page);
    await page.waitForTimeout(600);
    expect(await canvasHash(page)).toBe(first);
  });

  test('animates the scene when motion is allowed', async ({ page }) => {
    await seed(page, { reducedMotion: 'off' });
    await page.waitForTimeout(300);

    const first = await canvasHash(page);
    await page.waitForTimeout(700);
    expect(await canvasHash(page)).not.toBe(first);
  });

  test('has no horizontal overflow on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, {
      name: 'Martín',
      language: 'es',
      tasks: [{ id: 't1', text: 'una tarea con un nombre bastante largo', done: false }],
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);

    await page.getByRole('button', { name: 'Ajustes' }).click();
    const dialogFits = await page.evaluate(() => {
      const dialog = document.querySelector('dialog');
      if (!dialog) return false;
      const rect = dialog.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0;
    });
    expect(dialogFits).toBe(true);

    const doneVisible = await page.evaluate(() => {
      const rect = document.querySelector('.settings-actions button')?.getBoundingClientRect();
      return !!rect && rect.bottom <= innerHeight && rect.top >= 0;
    });
    expect(doneVisible).toBe(true);
  });
});
