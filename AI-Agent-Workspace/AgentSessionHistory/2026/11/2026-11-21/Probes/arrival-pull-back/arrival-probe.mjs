// The 2D arrival's pull-back, measured frame by frame: every frame the page drew through the rest at reading size and
// the ease to the neighbours (its time, the camera's scale, the map's look and band), a Chromium trace of the renderer's
// main thread with what filled each long frame (script, style and how many elements, layout, paint), the screencast's
// frames as a strip, and the moment each breakpoint was crossed. Run with `npx tsx` through the browser lane:
//   node scripts/browser-lane.mjs --label explorer -- npx tsx arrival-probe.mjs <repository> <out folder>
// CONDITION: full (the browser suite's launch, WebGL on the graphics card) or weak (software drawing, the page's thread
// slowed four times; run the whole command under `taskset -c 0,1` for two cores, as Probes/weak-machine did).
// SUBJECTS: comma list of estate, pathfind, heavy. ARRIVAL: the lever's value (then-neighbours). TUNING: extra localMap
// tuning as JSON. LABEL: a name for the run's files. RUNS: runs of each subject (1).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
const condition = process.env.CONDITION ?? 'full';
const arrival = process.env.ARRIVAL ?? 'then-neighbours';
const extra = JSON.parse(process.env.TUNING ?? '{}');
const label = process.env.LABEL ?? `${arrival}--${condition}`;
const runs = Number(process.env.RUNS ?? 1);
const HEAVY = process.env.HEAVY ?? 'packages/engine/src/live-docs/graph.ts';
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.map': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(file).pipe(res);
});
const port = Number(process.env.PORT ?? 8781);
await new Promise(r => server.listen(port, '127.0.0.1', r));
const base = `http://127.0.0.1:${port}`;
const all = {
  estate: `${base}/samples/estate/?view=local&mode=2d&node=${encodeURIComponent('Contracts/IPaymentService.cs')}`,
  pathfind: `${base}/?view=local&mode=2d&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`,
  heavy: `${base}/?view=local&mode=2d&node=${encodeURIComponent(HEAVY)}`
};
const subjects = (process.env.SUBJECTS ?? 'estate,pathfind,heavy').split(',');
const CATEGORIES = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'v8.execute'];
const LONG = 50;

/** The renderer main thread's complete events, nested, each with its self time. */
function tree(events, pid, tid) {
  const list = events.filter(e => e.pid === pid && e.tid === tid && e.ph === 'X' && e.dur > 0).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
  const stack = [];
  for (const e of list) {
    e.self = e.dur;
    while (stack.length && stack[stack.length - 1].ts + stack[stack.length - 1].dur <= e.ts) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) parent.self -= e.dur;
    e.parent = parent;
    stack.push(e);
  }
  return list;
}
const GROUP = name => name === 'UpdateLayoutTree' || name === 'RecalculateStyles' ? 'style'
  : name === 'Layout' ? 'layout'
  : ['Paint', 'PrePaint', 'Layerize', 'Commit', 'UpdateLayer', 'PaintImage', 'RasterTask', 'CompositeLayers', 'UpdateLayerTree'].includes(name) ? 'paint'
  : ['FunctionCall', 'EvaluateScript', 'v8.callFunction', 'V8.Execute', 'FireAnimationFrame', 'TimerFire', 'EventDispatch', 'RunMicrotasks', 'v8.run', 'V8.GCScavenger', 'MinorGC', 'MajorGC', 'V8.GC_SCAVENGER'].includes(name) || name.startsWith('V8.') || name.startsWith('v8.') ? 'script'
  : 'other';

/** What filled the main thread between two moments of the trace (µs): self time by group, and the style passes. */
function breakdown(list, from, to) {
  const groups = { script: 0, style: 0, layout: 0, paint: 0, other: 0 };
  for (const e of list) {
    const start = Math.max(e.ts, from), end = Math.min(e.ts + e.dur, to);
    if (end <= start) continue;
    // Self time inside the window, in proportion where an event straddles its edge.
    groups[GROUP(e.name)] += e.self * (end - start) / e.dur / 1000;
  }
  const styles = list.filter(e => e.name === 'UpdateLayoutTree' && e.ts >= from && e.ts < to && e.dur > 2000)
    .map(e => ({ ms: +(e.dur / 1000).toFixed(1), elements: e.args?.elementCount ?? e.args?.data?.elementCount ?? null }));
  return { ...Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, +v.toFixed(1)])), styles };
}

const launch = condition === 'weak' ? {} : browserLaunchOptions();
const browser = await chromium.launch(launch);
const results = [];
for (const name of subjects) for (let run = 1; run <= runs; run++) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival, ...extra } } })
  });
  await context.addInitScript(() => {
    const log = window.__frames = [];
    let last = '';
    const tick = t => {
      const map = document.querySelector('#map-container');
      const viewport = document.querySelector('#map-viewport');
      if (map && viewport) {
        const k = viewport.style.transform ? Number((viewport.style.transform.match(/scale\(([-\d.e]+)\)/) ?? [])[1]) : null;
        const state = `${map.dataset.look ?? ''}|${map.dataset.lod ?? ''}|${map.dataset.step ?? ''}|${map.classList.contains('local-look-fading')}|${map.dataset.camera ?? ''}`;
        log.push({ t, k, state: state === last ? undefined : state });
        last = state;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  const cdp = await context.newCDPSession(page);
  if (condition === 'weak') await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const shots = [];
  cdp.on('Page.screencastFrame', frame => { shots.push({ ts: frame.metadata.timestamp, data: frame.data }); cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {}); });
  await page.goto(all[name], { waitUntil: 'domcontentloaded', timeout: 120_000 });
  // The arrival's hold begins once the map has settled at reading size; the trace starts as soon as the map is placed.
  await page.waitForSelector('#map-container .local-placed', { timeout: 120_000 });
  const events = [];
  cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
  await cdp.send('Tracing.start', { categories: CATEGORIES.join(','), transferMode: 'ReportEvents' });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 640, maxHeight: 400, everyNthFrame: 1 });
  const sync = await page.evaluate(() => { performance.mark('probe-sync'); return { now: performance.now(), wall: Date.now() }; });
  // Until the camera has been still for 1.5 s (the arrival's hold and ease say it moves), or a minute.
  await page.waitForFunction(() => {
    const map = document.querySelector('#map-container');
    const still = !map?.dataset.camera;
    const w = window;
    if (!still) w.__stillSince = 0; else if (!w.__stillSince) w.__stillSince = performance.now();
    return still && performance.now() - w.__stillSince > 1500 && w.__frames.some(f => f.state?.includes('moving'));
  }, undefined, { timeout: 90_000, polling: 100 }).catch(() => errors.push('the camera did not come to rest within 90 s'));
  await cdp.send('Page.stopScreencast');
  const done = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
  await cdp.send('Tracing.end');
  await done;
  const frames = await page.evaluate(() => window.__frames);
  const elements = await page.evaluate(() => ({ map: document.querySelectorAll('#map-container *').length, cards: document.querySelectorAll('#map-container .node-card').length, bands: document.querySelectorAll('#map-container .local-directory-band').length, wires: document.querySelectorAll('#map-connections .connection-path').length }));
  // The renderer's main thread: the CrRendererMain thread that holds the sync mark.
  const mark = events.find(e => e.name === 'probe-sync');
  const pid = mark?.pid, tid = events.find(e => e.ph === 'M' && e.name === 'thread_name' && e.pid === pid && e.args?.name === 'CrRendererMain')?.tid;
  const list = pid !== undefined ? tree(events, pid, tid) : [];
  const offset = mark ? mark.ts / 1000 - sync.now : 0; // trace ms = page ms + offset
  // The motion: from the last frame at the rest's scale to the first at the end's.
  let state = '';
  const marked = frames.map(f => ({ ...f, state: f.state === undefined ? state : (state = f.state) }));
  const moving = marked.findIndex(f => f.state.endsWith('moving'));
  const ks = marked.map(f => f.k);
  let easeStart = -1, easeEnd = -1;
  for (let i = Math.max(1, moving); i < marked.length; i++) if (ks[i] !== ks[i - 1] && ks[i - 1] !== null) easeEnd = i;
  // The ease is the run of frames, each at a new scale, that ends at the last change; the rest before it holds one scale.
  if (easeEnd > 0) { easeStart = easeEnd - 1; while (easeStart > 0 && ks[easeStart] !== ks[easeStart - 1] && ks[easeStart - 1] !== null) easeStart--; }
  const window_ = easeStart >= 0 ? marked.slice(easeStart, easeEnd + 1) : [];
  const intervals = window_.slice(1).map((f, i) => ({ at: +(f.t - window_[0].t).toFixed(0), ms: +(f.t - window_[i].t).toFixed(1), k: +f.k.toFixed(3), state: f.state, prevT: window_[i].t, t: f.t }));
  const sorted = intervals.map(i => i.ms).sort((a, b) => a - b);
  const q = p => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null;
  const longFrames = intervals.filter(i => i.ms > LONG).map(i => ({ at: i.at, ms: i.ms, k: i.k, state: i.state,
    ...breakdown(list, (i.prevT + offset) * 1000, (i.t + offset) * 1000) }));
  const changes = marked.filter((f, i) => i > 0 && f.state !== marked[i - 1].state).map(f => ({ at: easeStart >= 0 ? +(f.t - marked[easeStart].t).toFixed(0) : null, k: f.k === null ? null : +f.k.toFixed(3), state: f.state }));
  const restAt = moving >= 0 && easeStart >= 0 ? +(marked[easeStart].t - marked[moving].t).toFixed(0) : null;
  const whole = window_.length ? breakdown(list, (window_[0].t + offset) * 1000, (window_.at(-1).t + offset) * 1000) : null;
  // The frames where the look changes, wherever they fall (in the ease, at rest before it or after it): the frame that
  // first shows the new look and the one after, each with what filled it.
  const lookFrames = marked.flatMap((f, i) => {
    if (i === 0 || f.state.split('|')[0] === marked[i - 1].state.split('|')[0]) return [];
    return [i, i + 1].filter(j => j < marked.length).map(j => ({ at: easeStart >= 0 ? +(marked[j].t - marked[easeStart].t).toFixed(0) : null, ms: +(marked[j].t - marked[j - 1].t).toFixed(1),
      k: marked[j].k === null ? null : +marked[j].k.toFixed(3), look: marked[j].state.split('|')[0], ...breakdown(list, (marked[j - 1].t + offset) * 1000, (marked[j].t + offset) * 1000) }));
  });
  // The longest frame anywhere from a second before the ease to a second and a half after it.
  const span = easeStart >= 0 ? marked.slice(1).map((f, i) => ({ f, prev: marked[i] })).filter(({ f }) => f.t >= marked[easeStart].t - 1000 && f.t <= marked[easeEnd].t + 1500) : [];
  const longest = span.sort((a, b) => (b.f.t - b.prev.t) - (a.f.t - a.prev.t))[0];
  const row = { subject: name, run, condition, arrival, extra, elements, restBeforeEase: restAt, ease: window_.length ? { ms: +(window_.at(-1).t - window_[0].t).toFixed(0), frames: intervals.length,
    fromK: +window_[0].k.toFixed(3), toK: +window_.at(-1).k.toFixed(3), median: q(0.5), p90: q(0.9), worst: sorted.at(-1) ?? null, whole } : null,
    worstFrame: [...longFrames].sort((a, b) => b.ms - a.ms)[0] ?? null, longFrames, changes, lookFrames,
    longestAround: longest ? { at: +(longest.f.t - marked[easeStart].t).toFixed(0), ms: +(longest.f.t - longest.prev.t).toFixed(1), k: +longest.f.k.toFixed(3), state: longest.f.state,
      ...breakdown(list, (longest.prev.t + offset) * 1000, (longest.f.t + offset) * 1000) } : null, errors };
  results.push(row);
  console.log(JSON.stringify({ subject: name, run, ease: row.ease && { ms: row.ease.ms, frames: row.ease.frames, median: row.ease.median, p90: row.ease.p90, worst: row.ease.worst }, rest: restAt, worst: row.worstFrame && { at: row.worstFrame.at, ms: row.worstFrame.ms, k: row.worstFrame.k, state: row.worstFrame.state, style: row.worstFrame.style, layout: row.worstFrame.layout, paint: row.worstFrame.paint, script: row.worstFrame.script, styles: row.worstFrame.styles }, changes: row.changes.length, errors }));
  // The strip: the screencast across the motion, eight frames evenly from the rest's last to the end, and the two around the worst gap.
  if (shots.length && window_.length) {
    const wallOf = t => (sync.wall + (t - sync.now)) / 1000; // the screencast's timestamps are in seconds of wall time
    const from = wallOf(window_[0].t) - Number(process.env.LEAD ?? 0.2), to = wallOf(window_.at(-1).t) + 0.4;
    const inside = shots.filter(s => s.ts >= from && s.ts <= to);
    const pick = new Set();
    for (let i = 0; i < 8; i++) pick.add(inside[Math.round(i * (inside.length - 1) / 7)]);
    const dir = path.join(out, `${label}--${name}--frames`);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    [...pick].filter(Boolean).sort((a, b) => a.ts - b.ts).forEach((s, i, arr) => {
      const file = path.join(dir, `${String(i).padStart(2, '0')}.jpg`);
      fs.writeFileSync(file, Buffer.from(s.data, 'base64'));
      const gap = i ? Math.round((s.ts - arr[i - 1].ts) * 1000) : 0;
      files.push('-label', `+${Math.round((s.ts - from - Number(process.env.LEAD ?? 0.2)) * 1000)} ms (${gap} after)`, file);
    });
    execFileSync('montage', [...files, '-tile', '4x2', '-geometry', '+4+4', '-pointsize', '14', '-background', '#333', '-fill', 'white', path.join(out, `${label}--${name}--strip.png`)]);
    fs.rmSync(dir, { recursive: true });
    row.screencast = { inside: inside.length, gaps: inside.slice(1).map((s, i) => Math.round((s.ts - inside[i].ts) * 1000)) };
  }
  await context.close();
}
fs.writeFileSync(path.join(out, `${label}.json`), JSON.stringify(results, null, 1));
await browser.close();
server.close();
