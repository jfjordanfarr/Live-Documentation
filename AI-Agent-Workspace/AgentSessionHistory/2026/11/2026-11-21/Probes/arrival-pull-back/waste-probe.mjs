// Of the elements a look's attributes restyle, how many change. At rest at reading size on the heavy subject: every
// element's computed style snapshotted, then the look's attributes alone written (data-lod far, data-look connections,
// data-step removed; case D) and snapshotted again, then the held scales added (case B) and again. The trace's style
// pass says how many elements were restyled; the snapshots say how many changed, and in what.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8788, '127.0.0.1', r));
const browser = await chromium.launch(browserLaunchOptions());
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival: 'reading' } } }) });
const page = await context.newPage();
await page.goto(`http://127.0.0.1:8788/?view=local&mode=2d&node=${encodeURIComponent(process.env.SUBJECT_PATH ?? 'packages/engine/src/config/liveDocumentationConfig.ts')}`);
await page.waitForSelector('#map-container .local-placed', { timeout: 120_000 });
await page.waitForFunction(() => { const m = document.querySelector('#map-container'); const p = m?.querySelector('.local-placed'); return p && !m.dataset.camera && p.dataset.moving !== 'true'; }, undefined, { timeout: 120_000 });
await page.waitForTimeout(1500);
const result = await page.evaluate(() => {
  const map = document.querySelector('#map-container'), style = map.style;
  const elements = [map, ...map.querySelectorAll('*')];
  const snap = () => elements.map(e => { const cs = getComputedStyle(e); const v = {}; for (let i = 0; i < cs.length; i++) { const p = cs.item(i); v[p] = cs.getPropertyValue(p); } return v; });
  const compare = (x, y) => {
    let changed = 0; const byProperty = {}, byTag = {};
    x.forEach((a, i) => { const b = y[i]; const props = Object.keys({ ...a, ...b }).filter(p => a[p] !== b[p] && !p.startsWith('--')); if (!props.length) return; changed++;
      for (const p of props) byProperty[p] = (byProperty[p] ?? 0) + 1; const e = elements[i]; const key = `${e.tagName.toLowerCase()}.${(e.getAttribute('class') ?? '').split(' ')[0]}`; byTag[key] = (byTag[key] ?? 0) + 1; });
    const top = o => Object.entries(o).sort((p, q) => q[1] - p[1]).slice(0, 15);
    return { changed, byProperty: top(byProperty), byTag: top(byTag) };
  };
  const was = { lod: map.dataset.lod, look: map.dataset.look, step: map.dataset.step };
  const reading = snap();
  map.dataset.lod = 'far'; map.dataset.look = 'connections'; delete map.dataset.step;
  const attributes = snap();
  style.setProperty('--text-scale', '2.200'); style.setProperty('--control-scale', '2.200');
  const both = snap();
  map.dataset.lod = was.lod; map.dataset.look = was.look; if (was.step !== undefined) map.dataset.step = was.step;
  // The structural floor: of the elements whose values change in the whole look change, the topmost, with no changed
  // ancestor up to the map; and the topmost within their own card or directory band (no changed ancestor below the
  // nearest card or band). And the parents of the cells that change, to name the cells' roots.
  const changedSet = new Set();
  reading.forEach((a, i) => { const b = both[i]; if (Object.keys({ ...a, ...b }).some(p => a[p] !== b[p] && !p.startsWith('--'))) changedSet.add(elements[i]); });
  const container = e => e.closest('.node-card, .local-directory-band, .local-directory-closed, .local-column');
  let topmost = 0, topInContainer = 0; const topKinds = {}, cellParents = {};
  for (const e of changedSet) {
    let p = e.parentElement, top = true, topHere = true; const own = container(e);
    for (; p && p !== map; p = p.parentElement) { if (changedSet.has(p)) { top = false; if (own && own.contains(p) && p !== own) topHere = false; if (!own) topHere = false; } }
    if (own && changedSet.has(own) && own !== e) topHere = false;
    if (top) { topmost++; const key = `${e.tagName.toLowerCase()}.${(e.getAttribute('class') ?? '').split(' ')[0]}`; topKinds[key] = (topKinds[key] ?? 0) + 1; }
    if (topHere) topInContainer++;
    if (e.matches('.local-directory-cell, .local-cell')) { const q = e.parentElement; const key = `${q.tagName.toLowerCase()}.${(q.getAttribute('class') ?? '').split(' ').join('.')}`; cellParents[key] = (cellParents[key] ?? 0) + 1; }
  }
  const top = o => Object.entries(o).sort((p, q) => q[1] - p[1]).slice(0, 20);
  return { elements: elements.length, D: compare(reading, attributes), B: compare(reading, both), scalesOnTop: compare(attributes, both),
    floor: { changed: changedSet.size, topmost, topInContainer, topKinds: top(topKinds), cellParents: top(cellParents) } };
});
fs.writeFileSync(path.join(out, `waste--${process.env.LABEL ?? 'heavy'}.json`), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await browser.close();
server.close();
