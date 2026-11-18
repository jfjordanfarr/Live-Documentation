// What moves while the Structure start enters and settles (2026-11-08): load the start with nothing pinned in a look and
// at HOPS hops, and at every drawn frame read every sphere's place from the page's own node buffer; print the frame the
// last sphere entered, the frame of rest, the picture's motion in windows of frames (the largest and the summed
// displacement of a frame, the window's mean), and the spheres that travelled farthest before and after the entry ended.
// Run from the repository root with `npx tsx`, the bundle served on PORT (8912). Switches: BASE, LOOK (skin), HOPS,
// WINDOW (frames a row, 25), TOP (spheres listed, 6), TIMEOUT (seconds, 900). Prints JSON.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'structure', filters: { showTests: true, showAssets: false } });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, wrappers, hops]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, ...(hops ? { hops } : {}) } } }));
    // Every frame: the frame's number, the busy flag and each sphere's place, read after the page has drawn it.
    window.entryFrames = [];
    const read = () => {
      const graph = window.renderedGraph;
      if (graph) {
        const places = {};
        graph.scene.traverse(object => {
          const batch = object.userData.spatialBatch;
          if (batch?.kind === 'nodes') for (const { data } of batch.entries) if (Number.isFinite(data.x)) places[data.id] = [data.x, data.y, data.z, data.shellBody ?? 0];
        });
        window.entryFrames.push({ frame: window.renderedFrames, busy: document.getElementById('graph-svg')?.getAttribute('aria-busy'), places });
      }
      requestAnimationFrame(read);
    };
    requestAnimationFrame(read);
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, process.env.LOOK || 'skin', Number(process.env.HOPS || 0)]);
  await page.goto(url);
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => document.getElementById('graph-svg').getAttribute('aria-busy') === 'false', null, { timeout: 1000 * Number(process.env.TIMEOUT || 900), polling: 250 });
  const report = await page.evaluate(([window_, top]) => {
    // One row a drawn frame: the last reading of each frame number.
    const byFrame = new Map();
    for (const reading of window.entryFrames) byFrame.set(reading.frame, reading);
    const frames = [...byFrame.values()].sort((a, b) => a.frame - b.frame);
    const count = frames.map(f => Object.keys(f.places).length), all = Math.max(...count);
    const entered = frames.find(f => Object.keys(f.places).length === all).frame;
    const rest = frames[frames.length - 1].frame;
    const rows = [], travel = { during: {}, after: {} };
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1], b = frames[i];
      let largest = 0, sum = 0;
      for (const [id, p] of Object.entries(b.places)) {
        const q = a.places[id];
        if (!q) continue;
        const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
        largest = Math.max(largest, d); sum += d;
        const phase = b.frame <= entered ? travel.during : travel.after;
        phase[id] = (phase[id] ?? 0) + d;
      }
      const w = Math.floor(b.frame / window_);
      const row = rows[w] ??= { frames: `${w * window_}-${w * window_ + window_ - 1}`, spheres: 0, largest: 0, sum: 0, n: 0 };
      row.spheres = Object.keys(b.places).length; row.largest = Math.max(row.largest, largest); row.sum += sum; row.n++;
    }
    const topOf = phase => Object.entries(phase).sort((x, y) => y[1] - x[1]).slice(0, top).map(([id, d]) => [id, Math.round(d)]);
    return { spheres: all, enteredAtFrame: entered, restAtFrame: rest,
      windows: rows.filter(Boolean).map(r => ({ frames: r.frames, spheres: r.spheres, largestStep: +r.largest.toFixed(1), meanFrameTravel: +(r.sum / r.n).toFixed(1) })),
      farthestDuringEntry: topOf(travel.during), farthestAfterEntry: topOf(travel.after) };
  }, [Number(process.env.WINDOW || 25), Number(process.env.TOP || 6)]);
  console.log(JSON.stringify({ base, look: process.env.LOOK || 'skin', hops: Number(process.env.HOPS || 0) || 'saved', ...report }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
