// What a style pass over the map costs by cause, at rest at reading size on one subject: each change below is made on
// the map, the style flushed and the pass traced, five times, the map put back between. The trace's style passes give
// each one's elements and time (the browser's own measure; a forced flush is timed by the pass itself, not by script).
//   A  a custom property no rule reads, changed on the map (pure inheritance: every element under the map recomputed)
//   A' the same property registered as not inherited, changed on the map (only the map itself)
//   B  the look's own writes made by hand (data-lod far, data-look connections, the held scales 2.2)
//   C  the held scales alone (--text-scale and --control-scale to 2.2), without the attributes
//   D  the attributes alone (data-lod, data-look, data-step), without the held scales
//   E  a data attribute no rule reads, set on the map
// And it reads every style rule of the page (sheets and adopted sheets) for those that use the held scales, and counts
// the elements under the map each such rule matches.
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
await new Promise(r => server.listen(8787, '127.0.0.1', r));
const subject = process.env.SUBJECT_PATH ?? 'packages/engine/src/config/liveDocumentationConfig.ts';
const condition = process.env.CONDITION ?? 'full';
const browser = await chromium.launch(condition === 'weak' ? {} : browserLaunchOptions());
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival: 'reading' } } }) });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
if (condition === 'weak') await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.goto(`http://127.0.0.1:8787/?view=local&mode=2d&node=${encodeURIComponent(subject)}`);
await page.waitForSelector('#map-container .local-placed', { timeout: 120_000 });
await page.waitForFunction(() => { const m = document.querySelector('#map-container'); const p = m?.querySelector('.local-placed'); return p && !m.dataset.camera && p.dataset.moving !== 'true'; }, undefined, { timeout: 120_000 });
await page.waitForTimeout(1500);
const rules = await page.evaluate(() => {
  const map = document.querySelector('#map-container');
  const all = [];
  const walk = list => { for (const r of list) { if (r.selectorText !== undefined) all.push(r); if (r.cssRules && r.cssRules.length) walk(r.cssRules); } };
  for (const sheet of [...document.styleSheets, ...(document.adoptedStyleSheets ?? [])]) { try { walk(sheet.cssRules); } catch { } }
  const reads = name => all.filter(r => { for (let i = 0; i < r.style.length; i++) if (r.style.getPropertyValue(r.style.item(i)).includes(`var(${name}`)) return true; return false; });
  const matched = list => { const set = new Set(); for (const r of list) { try { for (const e of map.querySelectorAll(r.selectorText)) set.add(e); } catch { } } return set.size; };
  const out = { totalRules: all.length, mapElements: map.querySelectorAll('*').length + 1, byProperty: {} };
  for (const name of ['--text-scale', '--control-scale', '--name-growth', '--look-from-scale', '--look-zoom', '--look-keep']) {
    const list = reads(name);
    out.byProperty[name] = { rules: list.length, elementsMatched: matched(list) };
  }
  const lookRules = all.filter(r => /data-look|data-lod|data-looks|data-step|local-look-fading/.test(r.selectorText));
  out.lookRules = { rules: lookRules.length, elementsMatched: matched(lookRules) };
  // Custom properties declared by rules (not inline), and how many elements each declaring rule reaches.
  const declaring = all.filter(r => { for (let i = 0; i < r.style.length; i++) if (r.style.item(i).startsWith('--')) return true; return false; });
  out.declaringRules = declaring.length;
  return out;
});
const events = [];
cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing', transferMode: 'ReportEvents' });
await page.evaluate(async () => {
  const map = document.querySelector('#map-container'), style = map.style;
  const flush = () => void document.body.offsetWidth;
  const pause = () => new Promise(r => setTimeout(r, 120));
  try { CSS.registerProperty({ name: '--probe-local', syntax: '<number>', inherits: false, initialValue: '0' }); } catch { }
  const was = { lod: map.dataset.lod, look: map.dataset.look, step: map.dataset.step, text: style.getPropertyValue('--text-scale'), control: style.getPropertyValue('--control-scale') };
  const cases = {
    A: [() => style.setProperty('--probe-inherited', String(Math.random())), () => style.removeProperty('--probe-inherited')],
    "A'": [() => style.setProperty('--probe-local', String(Math.random())), () => style.removeProperty('--probe-local')],
    B: [() => { map.dataset.lod = 'far'; map.dataset.look = 'connections'; delete map.dataset.step; style.setProperty('--text-scale', '2.200'); style.setProperty('--control-scale', '2.200'); },
        () => { map.dataset.lod = was.lod; map.dataset.look = was.look; if (was.step !== undefined) map.dataset.step = was.step; style.setProperty('--text-scale', was.text); style.setProperty('--control-scale', was.control); }],
    C: [() => { style.setProperty('--text-scale', '2.200'); style.setProperty('--control-scale', '2.200'); }, () => { style.setProperty('--text-scale', was.text); style.setProperty('--control-scale', was.control); }],
    D: [() => { map.dataset.lod = 'far'; map.dataset.look = 'connections'; delete map.dataset.step; }, () => { map.dataset.lod = was.lod; map.dataset.look = was.look; if (was.step !== undefined) map.dataset.step = was.step; }],
    E: [() => { map.dataset.probe = String(Math.random()); }, () => { delete map.dataset.probe; }]
  };
  const roots = selector => [...map.querySelectorAll(selector)];
  const skipped = (selector) => {
    const list = roots(selector);
    return [() => { for (const e of list) e.style.contentVisibility = 'hidden'; flush(); }, () => { for (const e of list) e.style.contentVisibility = ''; flush(); }];
  };
  const CELLS = '.local-directory-field, .local-closed-cells, .local-closed-cells-held, .local-directory-cells';
  const PROSE = '.local-reading-prose, .local-reading-block';
  const bounds = { F: CELLS, G: PROSE, H: `${CELLS}, ${PROSE}` };
  window.__boundRoots = Object.fromEntries(Object.entries(bounds).map(([k, v]) => [k, roots(v).length]));
  for (const [name, selector] of Object.entries(bounds)) {
    const [prep, unprep] = skipped(selector);
    cases[name] = [() => { cases.B[0](); }, () => { cases.B[1](); }];
    cases[name].prep = prep; cases[name].unprep = unprep;
  }
  for (let i = 0; i < 5; i++) for (const [name, entry] of Object.entries(cases)) {
    const [to, back] = entry;
    entry.prep?.(); flush(); await pause();
    performance.mark(`${name}-${i}`); to(); flush(); performance.mark(`${name}-${i}-end`);
    back(); flush(); entry.unprep?.(); await pause();
  }
});
const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
await cdp.send('Tracing.end');
await done;
const marks = new Map(events.filter(e => e.cat?.includes('blink.user_timing')).map(e => [e.name, e.ts]));
const styles = events.filter(e => e.name === 'UpdateLayoutTree' && e.ph === 'X');
const results = {};
for (const name of ['A', "A'", 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const from = marks.get(`${name}-${i}`), to = marks.get(`${name}-${i}-end`);
    const inside = styles.filter(e => e.ts >= from && e.ts <= to);
    runs.push({ ms: +(inside.reduce((s, e) => s + e.dur, 0) / 1000).toFixed(1), elements: inside.reduce((s, e) => s + (e.args?.elementCount ?? 0), 0) });
  }
  const ms = runs.map(r => r.ms).sort((a, b) => a - b);
  results[name] = { median: ms[2], min: ms[0], max: ms[4], elements: runs[2].elements, runs };
}
const boundRoots = await page.evaluate(() => window.__boundRoots);
const result = { condition, subject, rules, boundRoots, results };
fs.writeFileSync(path.join(out, `cost--${process.env.LABEL ?? 'heavy'}--${condition}.json`), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ condition, boundRoots, results: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { median: v.median, min: v.min, max: v.max, elements: v.elements }])) }, null, 1));
await browser.close();
server.close();
