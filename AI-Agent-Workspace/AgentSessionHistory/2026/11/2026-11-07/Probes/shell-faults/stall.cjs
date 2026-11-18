// How long the page holds the thread while it builds a picture's bodies (2026-11-07, third round): load a 3D Local Map
// picture with Group Wrappers chosen, and after WAIT seconds read the page's timeline: each "live-docs:shells" measure
// (the render's partition, and before the third round every body's packing with it), each "live-docs:body-packing"
// measure (the third round's packing a part of a frame at a time), the longest tasks the browser saw, and when the first
// frame was drawn. Run from the repository root with `npx tsx`, the bundle served on PORT (8912). Switches: BASE, PIN,
// LOOK (skin), DEPTH, WAIT (seconds, 60).
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));
const port = process.env.PORT || '8912', base = process.env.BASE || '/samples/t3-code/', pin = process.env.PIN ?? 'packages/contracts/src/agentSessions.ts';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'connections',
  filters: { showTests: true, showAssets: false }, ...(pin ? { pinSet: { entries: [{ nodeId: pin, symbol: '*' }] } } : {}) });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, look, depth]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: look, shellDepth: depth } } }));
    window.longTasks = [];
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.longTasks.push({ at: entry.startTime, ms: entry.duration }); }).observe({ type: 'longtask', buffered: true });
    window.firstFrameAt = null;
    const watch = () => { if (window.renderedFrames > 0) window.firstFrameAt = performance.now(); else requestAnimationFrame(watch); };
    requestAnimationFrame(watch);
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, process.env.LOOK || 'skin', Number(process.env.DEPTH || 2)]);
  await page.goto(url);
  await page.waitForTimeout(1000 * Number(process.env.WAIT || 60));
  const read = await page.evaluate(() => {
    const of = name => performance.getEntriesByName(name).map(entry => entry.duration);
    const summary = list => ({ count: list.length, longest: list.length ? +Math.max(...list).toFixed(1) : null, total: +list.reduce((a, b) => a + b, 0).toFixed(1) });
    const tasks = window.longTasks.map(task => task.ms).sort((a, b) => b - a);
    return { shells: summary(of('live-docs:shells')), packing: summary(of('live-docs:body-packing')), hulls: summary(of('live-docs:wrapper-hulls')),
      longestTasks: tasks.slice(0, 5).map(ms => +ms.toFixed(0)), firstFrameAt: window.firstFrameAt === null ? null : +(window.firstFrameAt / 1000).toFixed(2), frames: window.renderedFrames };
  });
  console.log(JSON.stringify({ url: url.slice(0, 60), ...read }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
