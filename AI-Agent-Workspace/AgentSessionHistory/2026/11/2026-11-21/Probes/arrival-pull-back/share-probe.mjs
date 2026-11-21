// What share of the look change's restyle belongs to cards outside the window, at rest at reading size. The look's own
// writes (data-lod, data-look, --text-scale and --control-scale on the map) are made by hand, three times over the whole
// map and three times with every card outside the window skipped by `content-visibility: hidden`, which leaves its
// subtree's style uncomputed; the trace's style passes give each one's elements and time.
//   node scripts/browser-lane.mjs --label explorer -- npx tsx share-probe.mjs <repository> <out> (CONDITION=full|weak)
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
const condition = process.env.CONDITION ?? 'full';
const subject = process.env.HEAVY ?? 'packages/engine/src/config/liveDocumentationConfig.ts';
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8783, '127.0.0.1', r));
const browser = await chromium.launch(condition === 'weak' ? {} : browserLaunchOptions());
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival: 'reading' } } }) });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
if (condition === 'weak') await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.goto(`http://127.0.0.1:8783/?view=local&mode=2d&node=${encodeURIComponent(subject)}`);
await page.waitForSelector('#map-container .local-placed', { timeout: 120_000 });
await page.waitForFunction(() => { const m = document.querySelector('#map-container'); const p = m?.querySelector('.local-placed'); return p && !m.dataset.camera && p.dataset.moving !== 'true'; }, undefined, { timeout: 120_000 });
await page.waitForTimeout(1500);
const counts = await page.evaluate(() => {
  const frame = document.querySelector('#view-map').getBoundingClientRect();
  const wrappers = [...document.querySelectorAll('#map-container .local-column')].filter(w => w.querySelector('.node-card'));
  const meets = r => r.right > frame.left && r.left < frame.right && r.bottom > frame.top && r.top < frame.bottom;
  const inView = wrappers.filter(w => meets(w.getBoundingClientRect()));
  const size = w => w.querySelectorAll('*').length + 1;
  return { map: document.querySelectorAll('#map-container *').length, cards: wrappers.length, cardsInView: inView.length,
    elementsInCards: wrappers.reduce((s, w) => s + size(w), 0), elementsInView: inView.reduce((s, w) => s + size(w), 0) };
});
// What each look draws over the whole map: the elements of each kind that are rendered, and the characters of text drawn.
const inventory = await page.evaluate(() => {
  const map = document.querySelector('#map-container');
  const kinds = { 'prose (descriptions)': '.local-reading-prose', 'symbol names': '.symbol-label', 'row and file actions': '.local-symbol-pin, .local-symbol-more, .local-file-pin, .local-file-more, .local-file-recentre, .local-file-close, .local-card-actions button',
    'anchor dots': '.symbol-anchor.dot', 'test chips': '.node-tests__item, .node-tests__more', 'path and directory lines': '.node-path, .node-directory, .node-meta', 'file names': '.local-file-name' };
  const read = () => Object.fromEntries(Object.entries(kinds).map(([kind, selector]) => {
    const drawn = [...map.querySelectorAll(selector)].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && Number(getComputedStyle(e).opacity) > 0.01);
    return [kind, { elements: drawn.length, characters: drawn.reduce((s, e) => s + (e.textContent ?? '').trim().length, 0) }];
  }));
  const reading = read();
  const was = { lod: map.dataset.lod, look: map.dataset.look, step: map.dataset.step, text: map.style.getPropertyValue('--text-scale'), control: map.style.getPropertyValue('--control-scale') };
  map.dataset.lod = 'far'; map.dataset.look = 'connections'; delete map.dataset.step; map.style.setProperty('--text-scale', '2.200'); map.style.setProperty('--control-scale', '2.200');
  const connections = read();
  map.dataset.lod = was.lod; map.dataset.look = was.look; if (was.step !== undefined) map.dataset.step = was.step; map.style.setProperty('--text-scale', was.text); map.style.setProperty('--control-scale', was.control);
  void document.body.offsetWidth;
  return { reading, connections };
});
const events = [];
cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing', transferMode: 'ReportEvents' });
await page.evaluate(async () => {
  const map = document.querySelector('#map-container'), frame = document.querySelector('#view-map').getBoundingClientRect();
  const meets = r => r.right > frame.left && r.left < frame.right && r.bottom > frame.top && r.top < frame.bottom;
  const off = [...map.querySelectorAll('.local-column')].filter(w => w.querySelector('.node-card') && !meets(w.getBoundingClientRect()));
  const was = { lod: map.dataset.lod, look: map.dataset.look, step: map.dataset.step, text: map.style.getPropertyValue('--text-scale'), control: map.style.getPropertyValue('--control-scale') };
  const flush = () => void document.body.offsetWidth;
  const to = () => { map.dataset.lod = 'far'; map.dataset.look = 'connections'; delete map.dataset.step; map.style.setProperty('--text-scale', '2.200'); map.style.setProperty('--control-scale', '2.200'); };
  const back = () => { map.dataset.lod = was.lod; map.dataset.look = was.look; if (was.step !== undefined) map.dataset.step = was.step; map.style.setProperty('--text-scale', was.text); map.style.setProperty('--control-scale', was.control); };
  const pause = () => new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 3; i++) {
    performance.mark(`whole-${i}`); to(); flush(); performance.mark(`whole-${i}-end`); back(); flush(); await pause();
    for (const w of off) w.style.contentVisibility = 'hidden';
    flush(); await pause();
    performance.mark(`view-${i}`); to(); flush(); performance.mark(`view-${i}-end`); back(); flush();
    for (const w of off) w.style.contentVisibility = '';
    flush(); await pause();
  }
});
const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
await cdp.send('Tracing.end');
await done;
const marks = new Map(events.filter(e => e.cat?.includes('blink.user_timing') && /^(whole|view)-\d(-end)?$/.test(e.name)).map(e => [e.name, e.ts]));
const styles = events.filter(e => e.name === 'UpdateLayoutTree' && e.ph === 'X');
const rows = [];
for (const kind of ['whole', 'view']) for (let i = 0; i < 3; i++) {
  const from = marks.get(`${kind}-${i}`), to = marks.get(`${kind}-${i}-end`);
  const inside = styles.filter(e => e.ts >= from && e.ts <= to);
  rows.push({ kind, i, ms: +(inside.reduce((s, e) => s + e.dur, 0) / 1000).toFixed(1), elements: inside.reduce((s, e) => s + (e.args?.elementCount ?? 0), 0) });
}
const result = { condition, subject, counts, rows, inventory };
console.log(JSON.stringify(result));
fs.writeFileSync(path.join(out, `share--${condition}.json`), JSON.stringify(result, null, 1));
await browser.close();
server.close();
