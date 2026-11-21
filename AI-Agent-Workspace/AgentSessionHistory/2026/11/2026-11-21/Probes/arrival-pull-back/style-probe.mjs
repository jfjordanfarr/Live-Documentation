// Where a look change's style time goes on the 2D map. At rest at reading size, then at rest in the connections look
// (Zoom Out pressed until the look changes), every element under the map is snapshotted (every computed property, the
// custom properties among them), and the two compared: which elements' computed values differ, and in what. The change
// itself is traced with the browser's selector statistics and invalidation tracking. The stylesheet is read for the
// custom properties the look writes on the map, the rules that read each (through other custom properties too), and the
// elements those rules match.
//   node scripts/browser-lane.mjs --label explorer -- npx tsx style-probe.mjs <repository> <out>   (SUBJECT=heavy|pathfind|estate)
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
await new Promise(r => server.listen(8786, '127.0.0.1', r));
const subjects = {
  heavy: `/?view=local&mode=2d&node=${encodeURIComponent('packages/engine/src/config/liveDocumentationConfig.ts')}`,
  pathfind: `/?view=local&mode=2d&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`,
  estate: `/samples/estate/?view=local&mode=2d&node=${encodeURIComponent('Contracts/IPaymentService.cs')}`
};
const name = process.env.SUBJECT ?? 'heavy';
const browser = await chromium.launch(browserLaunchOptions());
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival: 'reading' } } }) });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await page.goto(`http://127.0.0.1:8786${subjects[name]}`);
const settled = () => page.waitForFunction(() => { const m = document.querySelector('#map-container'); const p = m?.querySelector('.local-placed'); return p && !m.dataset.camera && p.dataset.moving !== 'true' && !m.classList.contains('local-look-fading'); }, undefined, { timeout: 120_000 });
await page.waitForSelector('#map-container .local-placed', { timeout: 120_000 });
await settled(); await page.waitForTimeout(1000); await settled();

// Every element's computed style, as a map from property to value, kept in the page under a name.
const snapshot = label => page.evaluate(label => {
  const map = document.querySelector('#map-container');
  const custom = new Set();
  for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch { continue; } const walk = list => { for (const rule of list) { if (rule.cssRules) walk(rule.cssRules); const text = rule.cssText ?? ''; for (const m of text.matchAll(/--[\w-]+/g)) custom.add(m[0]); } }; walk(rules); }
  for (const element of [map, ...map.querySelectorAll('*')]) { const style = element.getAttribute('style') ?? ''; for (const m of style.matchAll(/--[\w-]+/g)) custom.add(m[0]); }
  const elements = [map, ...map.querySelectorAll('*')];
  const snaps = elements.map(element => {
    const cs = getComputedStyle(element);
    const values = {};
    for (let i = 0; i < cs.length; i++) { const p = cs.item(i); if (!p.startsWith('--')) values[p] = cs.getPropertyValue(p); }
    for (const p of custom) { const v = cs.getPropertyValue(p); if (v !== '') values[p] = v; }
    return values;
  });
  window.__snaps = window.__snaps ?? {};
  window.__snaps[label] = { elements, snaps };
  return { elements: elements.length, custom: custom.size };
}, label);

const before = await snapshot('reading');
// The look change, as a person makes it: Zoom Out pressed until the look is connections; traced.
const events = [];
cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
await cdp.send('Tracing.start', { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.invalidationTracking', 'blink.user_timing'].join(','), transferMode: 'ReportEvents' });
for (let i = 0; i < 6; i++) {
  if (await page.evaluate(() => document.querySelector('#map-container').dataset.look) === 'connections') break;
  await page.click('#controls [data-zoom="out"]');
  await page.waitForTimeout(400);
}
await settled(); await page.waitForTimeout(800); await settled();
const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
await cdp.send('Tracing.end');
await done;
const after = await snapshot('connections');
const look = await page.evaluate(() => document.querySelector('#map-container').dataset.look);

// The comparison, in the page: elements whose computed values differ, by kind of property.
const diff = await page.evaluate(() => {
  const a = window.__snaps.reading, b = window.__snaps.connections;
  const index = new Map(b.elements.map((e, i) => [e, i]));
  let same = 0, onlyCustom = 0, standard = 0, gone = 0;
  const byProperty = {}, byClass = {};
  a.elements.forEach((element, i) => {
    const j = index.get(element);
    if (j === undefined) { gone++; return; }
    const x = a.snaps[i], y = b.snaps[j];
    const changed = Object.keys({ ...x, ...y }).filter(p => x[p] !== y[p]);
    if (!changed.length) { same++; return; }
    const std = changed.filter(p => !p.startsWith('--'));
    if (std.length) standard++; else onlyCustom++;
    for (const p of changed) byProperty[p] = (byProperty[p] ?? 0) + 1;
    if (std.length) { const key = (element.getAttribute('class') ?? element.tagName).split(' ')[0] || element.tagName; byClass[key] = (byClass[key] ?? 0) + 1; }
  });
  // The changed elements by kind: those whose standard properties differ only as their parent's do (inherited values
  // such as visibility, colour and font flowing down a subtree whose root changed), and the roots of such changes.
  const changedOf = new Map();
  a.elements.forEach((element, i) => { const j = index.get(element); if (j === undefined) return; const x = a.snaps[i], y = b.snaps[j];
    changedOf.set(element, Object.keys({ ...x, ...y }).filter(p => !p.startsWith('--') && x[p] !== y[p])); });
  const INHERITED = new Set(['visibility', 'color', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-wrap-mode', 'white-space', 'white-space-collapse', 'cursor', 'pointer-events', 'fill', 'stroke', 'text-align', 'word-break', 'overflow-wrap', 'font-family', 'font-style', 'direction', 'interactivity', 'caret-color', 'text-indent', 'word-spacing', 'hyphens', '-webkit-text-fill-color', 'text-decoration-color', 'column-rule-color', 'outline-color', 'border-block-start-color', 'border-block-end-color', 'border-inline-start-color', 'border-inline-end-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'text-emphasis-color', '-webkit-text-stroke-color', 'perspective-origin', 'transform-origin', 'inline-size', 'block-size', 'width', 'height', 'min-width', 'min-height', 'min-inline-size', 'min-block-size']);
  let followers = 0, roots = 0, visibilityOnly = 0;
  for (const [element, props] of changedOf) {
    if (!props.length) continue;
    const parentProps = new Set(changedOf.get(element.parentElement) ?? []);
    const followsParent = props.every(p => parentProps.has(p) && INHERITED.has(p));
    if (followsParent) followers++; else roots++;
    if (props.length && props.every(p => p === 'visibility')) visibilityOnly++;
  }
  const top = o => Object.entries(o).sort((p, q) => q[1] - p[1]).slice(0, 40);
  // A card's custom properties: on a card, which it has and how many of them it inherits from above the map's cards.
  const card = document.querySelector('#map-container .node-card');
  const cs = getComputedStyle(card), own = card.getAttribute('style') ?? '';
  const cardCustom = Object.keys(b.snaps[index.get(card)] ?? {}).filter(p => p.startsWith('--'));
  return { followers, roots, visibilityOnly, compared: a.elements.length, same, onlyCustom, standard, gone, byProperty: top(byProperty), byClass: top(byClass), cardCustom: cardCustom.length, cardCustomNames: cardCustom.slice(0, 200), cardInline: own.slice(0, 300), cardLook: cs.getPropertyValue('--text-scale') };
});

// The rules that read each custom property the look writes on the map, through others defined from it, and the
// elements under the map each such rule matches.
const readers = await page.evaluate(() => {
  const map = document.querySelector('#map-container');
  const written = ['--text-scale', '--control-scale', '--name-growth', '--look-from-scale', '--look-zoom', '--look-keep'];
  const rules = [];
  for (const sheet of document.styleSheets) { let list; try { list = sheet.cssRules; } catch { continue; } const walk = l => { for (const r of l) { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText) rules.push(r); } }; walk(list); }
  // Custom properties defined from a written one, to a fixed point.
  const reach = new Set(written);
  for (let changed = true; changed;) {
    changed = false;
    for (const r of rules) for (let i = 0; i < r.style.length; i++) {
      const p = r.style.item(i);
      if (!p.startsWith('--') || reach.has(p)) continue;
      const v = r.style.getPropertyValue(p);
      if ([...reach].some(w => v.includes(`var(${w}`))) { reach.add(p); changed = true; }
    }
  }
  const readingRules = rules.filter(r => { for (let i = 0; i < r.style.length; i++) { const v = r.style.getPropertyValue(r.style.item(i)); if ([...reach].some(w => v.includes(`var(${w}`))) return true; } return false; });
  const matched = new Set();
  for (const r of readingRules) { try { for (const e of map.querySelectorAll(r.selectorText)) matched.add(e); if (map.matches(r.selectorText)) matched.add(map); } catch { /* a pseudo-element selector */ } }
  const lookRules = rules.filter(r => /data-look|data-lod|data-looks|data-step|local-look-fading|data-look-from/.test(r.selectorText));
  const lookMatched = new Set();
  for (const r of lookRules) { try { for (const e of map.querySelectorAll(r.selectorText)) lookMatched.add(e); } catch { } }
  return { written, reachedProperties: [...reach], readingRules: readingRules.length, elementsReading: matched.size, lookRules: lookRules.length, elementsMatchedByLookRules: lookMatched.size,
    totalRules: rules.length, mapElements: map.querySelectorAll('*').length + 1 };
});

// From the trace: the style passes, their elements; the invalidation records by reason; the selector statistics' top selectors.
const styles = events.filter(e => e.name === 'UpdateLayoutTree' && e.ph === 'X' && e.dur > 2000).map(e => ({ ms: +(e.dur / 1000).toFixed(1), elements: e.args?.elementCount ?? null }));
const reasons = {};
for (const e of events.filter(e => /InvalidationTracking/.test(e.name))) {
  const d = e.args?.data ?? {};
  const key = `${e.name}: ${d.reason ?? d.changedAttribute ?? d.changedClass ?? d.changedId ?? d.changedPseudo ?? d.invalidationList?.[0]?.classes?.join(' ') ?? '?'}`;
  reasons[key] = (reasons[key] ?? 0) + 1;
}
const selectorTotals = {};
for (const e of events.filter(e => e.name === 'SelectorStats')) {
  for (const s of e.args?.selector_stats?.selector_timings ?? []) {
    const t = selectorTotals[s.selector] ??= { ms: 0, attempts: 0, matches: 0 };
    t.ms += (s['elapsed (us)'] ?? 0) / 1000; t.attempts += s.match_attempts ?? 0; t.matches += s.match_count ?? 0;
  }
}
const selectorTop = Object.entries(selectorTotals).sort((a, b) => b[1].ms - a[1].ms).slice(0, 25).map(([s, t]) => ({ selector: s.slice(0, 160), ms: +t.ms.toFixed(2), attempts: t.attempts, matches: t.matches }));
const selectorAll = Object.values(selectorTotals).reduce((s, t) => s + t.ms, 0);
const result = { subject: name, look, before, after, diff, readers, styles, invalidation: Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 30), selectorMsTotal: +selectorAll.toFixed(1), selectorTop };
fs.writeFileSync(path.join(out, `style--${name}.json`), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ subject: name, look, followers: diff.followers, roots: diff.roots, visibilityOnly: diff.visibilityOnly, compared: diff.compared, same: diff.same, onlyCustom: diff.onlyCustom, standard: diff.standard, gone: diff.gone, cardCustom: diff.cardCustom, readers, styles, selectorMsTotal: result.selectorMsTotal }, null, 1));
console.log('byProperty', JSON.stringify(diff.byProperty.slice(0, 25)));
console.log('byClass', JSON.stringify(diff.byClass.slice(0, 20)));
console.log('invalidation', JSON.stringify(result.invalidation.slice(0, 12)));
console.log('selectors', JSON.stringify(selectorTop.slice(0, 10)));
await browser.close();
server.close();
