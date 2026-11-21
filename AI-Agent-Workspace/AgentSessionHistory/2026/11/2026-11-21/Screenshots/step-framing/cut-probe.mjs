// What the counted cut watches after two steps, read in the browser: the watched thing, its cards' boxes on screen,
// where the label sits in the DOM, the map's frame, and each control's place and state. node probe.mjs <repository> <out>
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
const root = path.join(repo, 'dist/explorer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8778, '127.0.0.1', r));
const base = 'http://127.0.0.1:8778';
const settled = page => page.waitForFunction(() => {
  const map = document.querySelector('#map-container'), placed = map?.querySelector('.local-placed');
  return !!placed && map.dataset.camera !== 'moving' && placed.dataset.moving !== 'true' && placed.dataset.searchStatus !== 'running';
}, undefined, { timeout: 60000 });
const read = (page, directory) => page.evaluate(directory => {
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
  const map = document.querySelector('#map-container');
  const label = document.querySelector(`.local-directory-label[data-directory="${directory}"]`);
  const band = label?.closest('.local-directory-band');
  const signs = document.querySelector('.map-cut-signs');
  return {
    cutOf: map.dataset.cutOf ?? null, cutCards: map.dataset.cutCards ?? null,
    labelParent: label?.parentElement?.className + ' ' + (label?.parentElement?.dataset?.directory ?? ''), bandDir: band?.dataset.directory ?? null,
    bandCards: band ? band.querySelectorAll('.node-card[data-id], .local-directory-closed[data-directory]').length : null,
    viewMap: r(document.querySelector('#view-map')), layer: r(document.querySelector('#map-viewport')), signsBox: r(signs),
    signsParent: signs?.parentElement?.id, signsStyle: signs?.getAttribute('style'),
    signs: [...document.querySelectorAll('.map-cut-sign')].map(s => ({ edge: s.dataset.edge, hidden: s.hidden, text: s.textContent, box: r(s), display: getComputedStyle(s).display, z: getComputedStyle(signs).zIndex }))
  };
}, directory);
const browser = await chromium.launch(browserLaunchOptions());
for (const [name, address, start, directory, press] of [
  ['estate', `${base}/samples/estate/`, async page => {
    await page.click('#search-subject'); await page.keyboard.type('PaymentService');
    await page.waitForSelector('#search-subject-results .search-row');
    const index = await page.evaluate(() => [...document.querySelectorAll('#search-subject-results .search-row')].findIndex(row => row.classList.contains('search-row--directory') && row.querySelector('.search-row-name')?.textContent?.trim() === 'PaymentService'));
    await page.click(`#search-subject-results .search-row[data-index="${index}"]`);
  }, 'PaymentService/Data', page => page.getByRole('button', { name: 'Open PaymentService/Data', exact: true }).click()],
  ['history', `${base}/?view=local&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`, async () => {}, 'packages/engine/src/live-docs/history',
    page => page.getByRole('button', { name: 'Open packages/engine/src/live-docs/history', exact: true }).click()]
]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cutCounted: 'on' } } }) });
  const page = await context.newPage();
  await page.goto(address); await page.waitForTimeout(1500); await start(page);
  await settled(page); await page.waitForTimeout(600); await settled(page);
  console.log(name, 'before', JSON.stringify(await read(page, directory)));
  await press(page);
  await settled(page); await page.waitForTimeout(800); await settled(page);
  console.log(name, 'after', JSON.stringify(await read(page, directory)));
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  if (name === 'history') {
    const boxes = await page.evaluate(directory => {
      const frame = document.querySelector('.map-cut-signs').getBoundingClientRect();
      const band = document.querySelector(`.local-directory-label[data-directory="${directory}"]`).closest('.local-directory-band');
      return { frame: [Math.round(frame.width), Math.round(frame.height)], cards: [...band.querySelectorAll('.node-card[data-id], .local-directory-closed[data-directory]')].map(card => {
        const b = card.getBoundingClientRect();
        return [card.dataset.id ?? card.dataset.directory, Math.round(b.left - frame.left), Math.round(b.top - frame.top), Math.round(b.right - frame.left), Math.round(b.bottom - frame.top)];
      }) };
    }, directory);
    fs.writeFileSync(path.join(out, 'history-boxes.json'), JSON.stringify(boxes));
    await page.locator('.map-cut-sign[data-edge="right"]').click();
    await settled(page); await page.waitForTimeout(800); await settled(page);
    console.log(name, 'after-press', JSON.stringify(await read(page, directory)));
    await page.screenshot({ path: path.join(out, `${name}-after-press.png`) });
  }
  await context.close();
}
await browser.close(); server.close();
