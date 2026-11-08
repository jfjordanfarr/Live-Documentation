// One playback of a bundle's history in the Structure layout (2026-11-07, the bag of cells): load the Structure start
// with Group Wrappers chosen, open the History (which, with nothing asked about, opens the scan root: in the bag of cells
// the root's hub, its hops and the bubbles beyond), wait for rest, press Play and read every step as it is shown: when
// the step arrived (the picture's `data-history-step`), whether its picture was built before the next step arrived (the
// timeline's `live-docs:shells` measure, which a render makes once every body it names is packed), the frames drawn
// while it stood, the packing measured meanwhile, and the longest tasks the browser saw. Run from the repository root
// with `npx tsx`, the bundle served on PORT (8912). Switches: BASE, LOOK (skin), HOPS, LIMIT (seconds of playback to
// read at most, 900), OUT (a folder for a picture at the end). Prints JSON.
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
    window.steps = []; window.built = []; window.longTasks = []; window.packing = [];
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.longTasks.push({ at: entry.startTime, ms: entry.duration }); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'live-docs:shells') window.built.push(entry.startTime + entry.duration);
        if (entry.name === 'live-docs:body-packing') window.packing.push({ at: entry.startTime, ms: entry.duration });
      }
    }).observe({ type: 'measure', buffered: true });
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('graph-svg');
      new MutationObserver(() => {
        const step = container.dataset.historyStep;
        const last = window.steps[window.steps.length - 1];
        if (step && (!last || last.step !== step)) window.steps.push({ step, at: performance.now(), frames: window.renderedFrames });
      }).observe(container, { attributes: true, attributeFilter: ['data-history-step'] });
    });
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, process.env.LOOK || 'skin', Number(process.env.HOPS || 0)]);
  await page.goto(url);
  const rested = () => page.waitForFunction(() => document.getElementById('graph-svg').getAttribute('aria-busy') === 'false', null, { timeout: 600000, polling: 250 });
  await page.waitForTimeout(2000);
  await rested();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.waitForTimeout(2000);
  await rested();
  const startedAt = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames, steps: window.steps.length }));
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  // Until the Play button reads Play again (the last step reached), or the limit.
  const limit = 1000 * Number(process.env.LIMIT || 900);
  await page.waitForFunction(() => document.querySelector('.history-scrubber button[aria-pressed="false"][aria-label="Play"]'), null, { timeout: limit, polling: 500 }).catch(() => null);
  await page.waitForTimeout(3000);
  const read = await page.evaluate(start => {
    const steps = window.steps.slice(start.steps), end = performance.now();
    const rows = steps.map((step, i) => {
      const until = steps[i + 1]?.at ?? end;
      return { step: step.step, ms: Math.round(until - step.at), frames: (steps[i + 1]?.frames ?? window.renderedFrames) - step.frames,
        built: window.built.some(at => at >= step.at && at < until), packingMs: Math.round(window.packing.filter(part => part.at >= step.at && part.at < until).reduce((a, part) => a + part.ms, 0)) };
    });
    const tasks = window.longTasks.filter(task => task.at >= start.at).map(task => task.ms).sort((a, b) => b - a);
    const frames = rows.map(row => row.frames).sort((a, b) => a - b);
    return { steps: rows.length, built: rows.filter(row => row.built).length, notBuilt: rows.filter(row => !row.built).map(row => row.step),
      framesPerStep: { median: frames[Math.floor(frames.length / 2)], least: frames[0], most: frames[frames.length - 1] },
      packingMs: { total: rows.reduce((a, row) => a + row.packingMs, 0), mostInAStep: Math.max(0, ...rows.map(row => row.packingMs)) },
      seconds: +((end - start.at) / 1000).toFixed(1), longestTasks: tasks.slice(0, 5).map(Math.round), tasksOver200ms: tasks.filter(ms => ms > 200).length, rows };
  }, startedAt);
  if (process.env.OUT) await page.screenshot({ path: path.join(process.env.OUT, `history-${process.env.LOOK || 'skin'}-end.png`) });
  console.log(JSON.stringify({ url: url.slice(0, 60), look: process.env.LOOK || 'skin', ...read, rows: process.env.ROWS ? read.rows : undefined }, null, 1));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
