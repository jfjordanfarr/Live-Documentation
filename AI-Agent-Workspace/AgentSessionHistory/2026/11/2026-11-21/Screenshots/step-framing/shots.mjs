// Pictures of Tuning's Step trial: three steps from the same starting pictures, at 1280 by 800, under each value.
// Usage: node shots.mjs <repository> <out folder> <values, comma-separated>
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out, valuesArg] = process.argv.slice(2);
const values = valuesArg.split(',');
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = await import(path.join(repo, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8776, '127.0.0.1', r));
const base = 'http://127.0.0.1:8776';
const SERVICE = 'PaymentService/PaymentService.cs';
const estateStart = `${base}/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: SERVICE,
  pinSet: { entries: [{ nodeId: SERVICE, symbol: '*' }] }, openDirectories: new Set(['PaymentService']), retentionOrder: undefined, filters: { showTests: true, showAssets: false } })}`;
void estateStart;
/** The start a stranger takes: a folder chosen in the search, from the bundle's first view. */
const searchFolder = (typed, directory) => async page => {
  await page.click('#search-subject');
  await page.keyboard.type(typed);
  await page.waitForSelector('#search-subject-results .search-row');
  const index = await page.evaluate(name => [...document.querySelectorAll('#search-subject-results .search-row')]
    .findIndex(row => row.classList.contains('search-row--directory') && row.querySelector('.search-row-name')?.textContent?.trim() === name), directory);
  await page.click(`#search-subject-results .search-row[data-index="${index}"]`);
};
const steps = [
  { name: 'estate-data', address: `${base}/samples/estate/`, start: searchFolder('PaymentService', 'PaymentService'),
    press: page => page.getByRole('button', { name: 'Open PaymentService/Data', exact: true }).click() },
  { name: 'repo-history', address: `${base}/?view=local&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`, start: async () => {},
    press: page => page.getByRole('button', { name: 'Open packages/engine/src/live-docs/history', exact: true }).click() },
  { name: 'repo-cell', address: `${base}/?view=local&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`, start: async () => {},
    press: page => page.locator('.local-directory-label[data-directory="packages/engine/src/live-docs/history"] .local-directory-field .local-directory-cell--file:not([hidden])').first().click() },
  // Folders of middling size, opened from the client folder chosen in the search; the press is the control's own click,
  // since the folder's box may stand outside the view.
  { name: 'repo-panels', address: `${base}/?view=local&node=${encodeURIComponent('packages/explorer/src/client/index.ts')}`, start: searchFolder('client', 'packages/explorer/src/client'),
    press: page => page.getByRole('button', { name: 'Open packages/explorer/src/client/panels', exact: true }).evaluate(button => button.click()) },
  { name: 'repo-persistence', address: `${base}/?view=local&node=${encodeURIComponent('packages/explorer/src/client/index.ts')}`, start: searchFolder('client', 'packages/explorer/src/client'),
    press: page => page.getByRole('button', { name: 'Open packages/explorer/src/client/persistence', exact: true }).evaluate(button => button.click()) }
].filter(step => !process.env.STEPS || process.env.STEPS.split(',').includes(step.name));
const settled = page => page.waitForFunction(() => {
  const map = document.querySelector('#map-container'), placed = map?.querySelector('.local-placed');
  return !!placed && map.dataset.camera !== 'moving' && placed.dataset.moving !== 'true' && placed.dataset.searchStatus !== 'running';
}, undefined, { timeout: 60000 });
const browser = await chromium.launch(browserLaunchOptions());
const report = [];
for (const value of values) {
  for (const step of steps) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await context.addInitScript(({ key, tuning }) => localStorage.setItem(key, tuning), { key: PERSISTED_UI_KEY, tuning: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, step: value, cutCounted: process.env.CUT ?? 'off' } } }) });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(step.address);
    await page.waitForTimeout(1500);
    await step.start(page);
    await settled(page); await page.waitForTimeout(600); await settled(page);
    const stem = path.join(out, `${value}--${step.name}`);
    await page.screenshot({ path: `${stem}--0-before.png` });
    const k0 = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a);
    let pressError = null;
    try { await step.press(page); } catch (e) { pressError = String(e.message).slice(0, 160); }
    const frames = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 2600) { const f = `${stem}--f${String(frames.length).padStart(2, '0')}.png`; await page.screenshot({ path: f }); frames.push(f); }
    await settled(page).catch(() => {}); await page.waitForTimeout(500); await settled(page).catch(() => {});
    await page.screenshot({ path: `${stem}--1-rest.png` });
    const sign = page.locator('.map-cut-sign:not([hidden])').first();
    if (await sign.count()) {
      const said = await page.locator('.map-cut-sign:not([hidden])').evaluateAll(signs => signs.map(s => `${s.dataset.edge} ${s.textContent} "${s.getAttribute('aria-label')}"`));
      console.log(JSON.stringify({ signs: said }));
      await sign.click();
      await settled(page).catch(() => {}); await page.waitForTimeout(600); await settled(page).catch(() => {});
      await page.screenshot({ path: `${stem}--2-after-sign.png` });
      console.log(JSON.stringify({ after: await page.locator('.map-cut-sign:not([hidden])').evaluateAll(signs => signs.map(s => `${s.dataset.edge} ${s.textContent}`)) }));
    }
    const k1 = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a);
    const pick = frames.length <= 6 ? frames : [0, 1, 2, 3, 4, 5].map(i => frames[Math.round(i * (frames.length - 1) / 5)]);
    execFileSync('montage', [...pick, '-tile', `${pick.length}x1`, '-geometry', '426x266+3+3', '-background', '#444', `${stem}--frames.png`]);
    for (const f of frames) fs.rmSync(f);
    report.push({ value, step: step.name, k0: +k0.toFixed(3), k1: +k1.toFixed(3), frames: frames.length, pressError, errors });
    console.log(JSON.stringify(report.at(-1)));
    await context.close();
  }
}
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
await browser.close();
server.close();
