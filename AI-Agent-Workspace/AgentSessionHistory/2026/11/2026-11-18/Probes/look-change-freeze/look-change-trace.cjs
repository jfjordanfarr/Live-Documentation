// The 2D Local Map's look change, measured: a journey of camera moves across the looks' edges, with every frame the page
// drew (its time, the camera's scale and the look) and a Chromium trace of the renderer's main thread; for every frame
// more than LONG ms after the one before, what filled the main thread between them, by event, with the scripts, style
// passes (and how many elements each restyled) and layouts that owned it, and whether a style pass or layout was forced
// by a script's read. Run with `npx tsx` from the repository root against a served bundle (see the README beside it).
// PORT (8827), BASE (`/`), SUBJECT, JOURNEY (comma list: wheel-out, wheel-in, arrival), NOTCHES (wheel notches a move, 8),
// LONG (ms, 50), RUNS (1), OUT (a JSON file), TRACE_OUT (keep the raw trace there), CSS (extra CSS, for a trial).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const { browserLaunchOptions } = require(path.join(root, 'tests/e2e/browser-launch.ts'));
const port = process.env.PORT || '8827';
const base = process.env.BASE || '/';
const subject = process.env.SUBJECT || 'packages/engine/src/live-docs/pathfind.ts';
const journey = (process.env.JOURNEY || 'wheel-out,wheel-in').split(',').filter(Boolean);
const notches = Number(process.env.NOTCHES || 8);
const long = Number(process.env.LONG || 50);
const runs = Number(process.env.RUNS || 1);
// SELECTORS=1 adds Chromium's selector statistics (each style pass's time by selector), which slow the style passes.
const CATEGORIES = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.stack', 'blink.user_timing', 'v8.execute',
  ...(process.env.SELECTORS ? ['disabled-by-default-blink.debug'] : [])];

/** The renderer main thread's complete events, nested by time, with each one's self time. */
function tree(events, pid, tid) {
  const list = events.filter(e => e.pid === pid && e.tid === tid && e.ph === 'X' && e.dur > 0).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
  const stack = [], tops = [];
  for (const e of list) {
    e.children = []; e.self = e.dur;
    while (stack.length && stack[stack.length - 1].ts + stack[stack.length - 1].dur <= e.ts) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) { parent.children.push(e); parent.self -= e.dur; e.parent = parent; } else tops.push(e);
    stack.push(e);
  }
  return { list, tops };
}

const inScript = e => { for (let p = e.parent; p; p = p.parent) if (p.name === 'FunctionCall' || p.name === 'EvaluateScript' || p.name === 'FireAnimationFrame' || p.name === 'TimerFire' || p.name === 'v8.callFunction') return p; return null; };
const fnName = e => { const d = e.args?.data ?? {}; return d.functionName || d.frames?.[0]?.functionName || ''; };
const where = e => { const d = e.args?.data ?? {}; return `${fnName(e) || '(anonymous)'}@${(d.url || '').split('/').pop()}:${d.lineNumber ?? ''}:${d.columnNumber ?? ''}`; };

function breakdown(list, from, to) {
  const inside = list.filter(e => e.ts >= from && e.ts + e.dur <= to + 1);
  const self = {};
  for (const e of inside) self[e.name] = (self[e.name] ?? 0) + e.self / 1000;
  const total = {};
  for (const e of inside) total[e.name] = (total[e.name] ?? 0) + e.dur / 1000;
  const pick = names => Object.fromEntries(names.map(n => [n, +((total[n] ?? 0)).toFixed(1)]));
  const scripts = inside.filter(e => e.name === 'FunctionCall' || e.name === 'TimerFire' || e.name === 'FireAnimationFrame' || e.name === 'EventDispatch')
    .filter(e => e.dur > 2000).map(e => ({ name: e.name, at: where(e), ms: +(e.dur / 1000).toFixed(1), type: e.args?.data?.type }));
  const styles = inside.filter(e => e.name === 'UpdateLayoutTree' && e.dur > 1000).map(e => ({ ms: +(e.dur / 1000).toFixed(1), elements: e.args?.elementCount ?? e.args?.data?.elementCount, forcedBy: inScript(e) ? where(inScript(e)) : null, stack: (e.args?.beginData?.stackTrace ?? []).slice(0, 4).map(f => `${f.functionName}:${f.lineNumber}`) }));
  const layouts = inside.filter(e => e.name === 'Layout' && e.dur > 1000).map(e => ({ ms: +(e.dur / 1000).toFixed(1), dirty: e.args?.beginData?.dirtyObjects, total: e.args?.beginData?.totalObjects, forcedBy: inScript(e) ? where(inScript(e)) : null, stack: (e.args?.beginData?.stackTrace ?? []).slice(0, 4).map(f => `${f.functionName}:${f.lineNumber}`) }));
  return {
    totals: pick(['FunctionCall', 'FireAnimationFrame', 'TimerFire', 'EventDispatch', 'UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize', 'Commit', 'ProxyMain::BeginMainFrame']),
    selfTop: Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([n, ms]) => [n, +ms.toFixed(1)]),
    scripts, styles, layouts
  };
}

async function once(run) {
  const browser = await chromium.launch(browserLaunchOptions());
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const arrival = journey.includes('arrival') ? 'then-neighbours' : undefined;
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...(arrival ? { arrival } : {}) } } }) });
  // Every frame the page draws: its time, the camera's scale on the map's viewport and the look on the container; and a
  // user-timing mark at every change of look, which the trace carries, so that the trace's long frames can be named.
  await page.addInitScript(() => {
    const frames = (window.__frames = []);
    let look = '';
    const tick = t => {
      const map = document.querySelector('#map-container');
      const transform = map?.parentElement?.style.transform ?? '';
      const k = Number(/scale\(([^)]+)\)/.exec(transform)?.[1] ?? NaN);
      const now = map?.dataset.look ?? '';
      if (now !== look) { performance.mark(`look:${look || '-'}>${now || '-'}`); look = now; }
      frames.push([t, k, now]);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  if (process.env.CSS) await page.addInitScript(css => document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.append(s); }), process.env.CSS);
  const url = `http://127.0.0.1:${port}${base}?view=local&node=${encodeURIComponent(subject)}`;
  const tracing = journey[0] === 'arrival';
  if (tracing) await browser.startTracing(page, { categories: CATEGORIES });
  await page.goto(url);
  await page.locator(`.node-card[data-id="${subject}"]`).waitFor({ timeout: 60_000 });
  if (!tracing) {
    await localMapSettled(page, 60_000); await page.waitForTimeout(600);
    await browser.startTracing(page, { categories: CATEGORIES });
  }
  const box = await page.locator('#view-map').boundingBox();
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const startFrame = await page.evaluate(() => window.__frames.length);
  for (const move of journey) {
    if (move === 'arrival') { await localMapSettled(page, 60_000); await page.waitForTimeout(300); continue; }
    await page.mouse.move(centre.x, centre.y);
    for (let n = 0; n < notches; n++) { await page.mouse.wheel(0, move === 'wheel-out' ? 100 : -100); await page.waitForTimeout(60); }
    await localMapSettled(page, 60_000); await page.waitForTimeout(400);
  }
  const buffer = await browser.stopTracing();
  const frames = (await page.evaluate(() => window.__frames)).slice(tracing ? 0 : startFrame);
  if (process.env.TRACE_OUT) fs.writeFileSync(process.env.TRACE_OUT.replace('%', String(run)), buffer);
  const events = JSON.parse(buffer.toString()).traceEvents;
  const mainName = events.filter(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
  // The page's own renderer: the one whose thread carries the look marks.
  const marks = events.filter(e => (e.cat || '').includes('blink.user_timing') && String(e.name).startsWith('look:'));
  const main = mainName.find(m => marks.some(k => k.pid === m.pid)) ?? mainName[0];
  const { list } = tree(events, main.pid, main.tid);
  // rAF's own times are performance.now(); the trace's FireAnimationFrame events are those callbacks, in order, so the
  // n-th frame's trace time is the n-th FireAnimationFrame of the logger. Rather than pair them, the frames' gaps are
  // located by the marks: performance.now() at a mark and the mark's trace ts give the offset between the two clocks.
  const markTimes = await page.evaluate(() => performance.getEntriesByType('mark').filter(m => m.name.startsWith('look:')).map(m => [m.name, m.startTime]));
  let offset = null;
  for (const [name, at] of markTimes) {
    const traced = marks.find(m => m.name === name);
    if (traced) { offset = traced.ts - at * 1000; break; }
  }
  const gaps = [];
  for (let i = 1; i < frames.length; i++) {
    const gap = frames[i][0] - frames[i - 1][0];
    if (gap < long) continue;
    const entry = { atMs: +frames[i - 1][0].toFixed(0), gapMs: +gap.toFixed(0), scaleBefore: +frames[i - 1][1].toFixed(3), scaleAfter: +frames[i][1].toFixed(3), lookBefore: frames[i - 1][2], lookAfter: frames[i][2] };
    if (offset !== null) entry.trace = breakdown(list, offset + frames[i - 1][0] * 1000, offset + frames[i][0] * 1000);
    gaps.push(entry);
  }
  // Every change of look: the frame that drew it and the frames of the 500 ms after it, however short.
  const edges = [];
  for (let i = 1; i < frames.length; i++) {
    if (frames[i][2] === frames[i - 1][2] || !frames[i - 1][2]) continue;
    const after = [];
    for (let j = i + 1; j < frames.length && frames[j][0] - frames[i][0] <= 500; j++) after.push(+(frames[j][0] - frames[j - 1][0]).toFixed(0));
    edges.push({ change: `${frames[i - 1][2]}>${frames[i][2]}`, scale: +frames[i][1].toFixed(3), frameMs: +(frames[i][0] - frames[i - 1][0]).toFixed(0), longestAfterMs: Math.max(0, ...after), after });
  }
  const moving = frames.filter((f, i) => i > 0 && f[1] !== frames[i - 1][1]).length;
  const census = await page.evaluate(() => ({ elements: document.querySelectorAll('#map-container *').length, cards: document.querySelectorAll('#map-container .node-card').length, rows: document.querySelectorAll('#map-container .symbol-row').length, wires: document.querySelectorAll('.connection-path').length, look: document.querySelector('#map-container')?.dataset.look }));
  await browser.close();
  return { run, subject, base, journey, frames: frames.length, framesThatMoved: moving, census, looks: markTimes.map(m => m[0]), edges, gaps };
}

(async () => {
  const results = [];
  for (let run = 1; run <= runs; run++) results.push(await once(run));
  const out = JSON.stringify(results, null, 1);
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, out);
  for (const r of results) {
    console.log(`run ${r.run} ${r.subject} ${r.journey} frames ${r.frames} census ${JSON.stringify(r.census)} looks ${r.looks.join(' ')}`);
    for (const e of r.edges) console.log(`  edge ${e.change} at k ${e.scale}: its frame ${e.frameMs} ms, the longest in the 500 ms after ${e.longestAfterMs} ms`);
    if (process.env.GAPS) for (const g of r.gaps) console.log(`  gap ${g.gapMs} ms at ${g.atMs}: k ${g.scaleBefore}->${g.scaleAfter} ${g.lookBefore}->${g.lookAfter} ${g.trace ? JSON.stringify(g.trace.totals) : ''}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
