// The Structure layout's picture with nothing pinned, at rest, in each Group Wrappers look (2026-11-07, the bag of cells):
// load it on a served bundle, count the frames drawn and the page's seconds until it rests, read what it holds, and take
// its picture at 1440 × 960. Run from the repository root with `npx tsx`, the bundle served on PORT (8912). Switches, in
// the environment: BASE (`/` or `/samples/estate/`), OPEN (a comma list of directories opened, none by default), LOOKS (a
// comma list of off, skin, cloud, cloud-rim), HOPS (the tuning's hops; the saved default when unset), OUT (a directory
// for the pictures; none taken without it), NAME (the pictures' prefix), TIMEOUT (seconds to wait for rest, 600). Prints
// one JSON line a load.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/';
const open = (process.env.OPEN || '').split(',').filter(Boolean);
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'structure',
  filters: { showTests: true, showAssets: false }, openDirectories: new Set(open) });

(async () => {
  const browser = await chromium.launch();
  for (const look of (process.env.LOOKS || 'off,skin').split(',')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await observeGraph(page);
    await page.addInitScript(([key, version, wrappers, hops]) => {
      localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, ...(hops ? { hops } : {}) } } }));
      window.restTimes = [];
      window.longTasks = [];
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.longTasks.push(entry.duration); }).observe({ type: 'longtask', buffered: true });
      document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('graph-svg');
        new MutationObserver(() => window.restTimes.push({ busy: container.getAttribute('aria-busy'), at: performance.now(), frames: window.renderedFrames }))
          .observe(container, { attributes: true, attributeFilter: ['aria-busy'] });
      });
    }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look, Number(process.env.HOPS || 0)]);
    await page.goto(url);
    await page.waitForFunction(() => (window.restTimes || []).some(change => change.busy === 'true'), null, { timeout: 120000 });
    await page.waitForFunction(() => { const t = window.restTimes; return t.length && t[t.length - 1].busy === 'false'; }, null, { timeout: 1000 * Number(process.env.TIMEOUT || 600), polling: 250 });
    const rest = await page.evaluate(() => window.restTimes[window.restTimes.length - 1]);
    // What the picture holds at rest: spheres, hubs, the bubbles (nodes drawn as bodies) and the files they hold, the skins
    // drawn, and within them the files drawn and the bubbles, veiled or not; the packing's parts and the longest tasks.
    const held = await page.evaluate(() => {
      const found = { spheres: 0, hubs: 0, bubbles: 0, bubbleFiles: 0, skins: 0, files: 0, balloons: 0, veiled: 0 };
      window.renderedGraph.scene.traverse(object => {
        const batch = object.userData.spatialBatch;
        if (batch?.kind === 'nodes') for (const { data } of batch.entries) {
          if (data.shellFiles !== undefined) { found.bubbles++; found.bubbleFiles += data.shellFiles; }
          else if (data.directoryPath !== undefined) found.hubs++; else found.spheres++;
        }
        if (object.name === 'Spatial wrappers' && object.visible) found.skins = object.userData.spatialWrappers.seeds.length;
        if (object.name === 'Spatial shell files' && object.visible) found.files = object.userData.spatialUnits.length;
        if (object.name === 'Spatial shell balloons' && object.visible) {
          found.balloons = object.userData.spatialUnits.length;
          found.veiled = object.userData.spatialUnits.filter(unit => unit.veiled).length;
        }
      });
      const packing = performance.getEntriesByName('live-docs:body-packing').map(entry => entry.duration);
      return { ...found, packingParts: packing.length, packingMs: +packing.reduce((a, b) => a + b, 0).toFixed(1),
        longestPart: packing.length ? +Math.max(...packing).toFixed(1) : 0, longestTasks: window.longTasks.sort((a, b) => b - a).slice(0, 3).map(Math.round) };
    });
    await page.waitForTimeout(1000);
    if (process.env.OUT) await page.screenshot({ path: path.join(process.env.OUT, `${process.env.NAME || 'picture'}-${look}.png`) });
    console.log(JSON.stringify({ base, open, look, hops: Number(process.env.HOPS || 0) || 'saved', frames: rest.frames, seconds: +(rest.at / 1000).toFixed(2), ...held }));
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
