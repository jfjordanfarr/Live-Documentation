// Load a pinned 3D picture on a served bundle with Group Wrappers in a given look, count the frames drawn and the page's
// seconds until it rests, and take its picture at 1440 × 960. Run from the repository root with `npx tsx`, the bundle
// served on PORT (8912): `npx tsx AI-Agent-Workspace/Probes/2026-11-06/shell-mesh/rest.cjs`. Switches, in the
// environment: BASE (`/` or `/samples/estate/`), PIN, LOOKS (a comma list of off, skin, cloud, cloud-rim), DEPTH (the
// Shell Depth), RUNS (loads of each look, the looks taken in turn so that a loaded machine weighs on each alike), OUT (a
// directory for the pictures; none taken without it), NAME (the pictures' prefix), SUBJECT (below). Prints one JSON
// line a load.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/';
const pin = process.env.PIN || 'packages/explorer/src/client/views/forceGraphView.ts';
const depth = Number(process.env.DEPTH || 2), runs = Number(process.env.RUNS || 1);
// With SUBJECT set, the pinned file is the subject too, as in the links of the November 5 record the review of November 6
// loaded, so that the camera stands on it; without, the shells spec's picture, framed whole.
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'connections',
  filters: { showTests: true, showAssets: false }, pinSet: { entries: [{ nodeId: pin, symbol: '*' }] }, ...(process.env.SUBJECT ? { selectedNodeId: pin } : {}) });

(async () => {
  const browser = await chromium.launch();
  for (let run = 1; run <= runs; run++) for (const look of (process.env.LOOKS || 'off,skin').split(',')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await observeGraph(page);
    await page.addInitScript(([key, version, wrappers, shellDepth]) => {
      localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, shellDepth } } }));
      // The page's own time of each change of its busy state, beside the frame the observation counts.
      window.restTimes = [];
      document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('graph-svg');
        new MutationObserver(() => window.restTimes.push({ busy: container.getAttribute('aria-busy'), at: performance.now(), frames: window.renderedFrames }))
          .observe(container, { attributes: true, attributeFilter: ['aria-busy'] });
      });
    }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look, depth]);
    await page.goto(url);
    await page.waitForFunction(() => (window.restTimes || []).some(change => change.busy === 'true'), null, { timeout: 120000 });
    await page.waitForFunction(() => { const t = window.restTimes; return t.length && t[t.length - 1].busy === 'false'; }, null, { timeout: 300000, polling: 250 });
    const rest = await page.evaluate(() => window.restTimes[window.restTimes.length - 1]);
    // What the picture holds at rest: spheres, shells, the skins drawn, and what they show within them.
    const held = await page.evaluate(() => {
      const found = { spheres: 0, shells: 0, skins: 0, files: 0, balloons: 0 };
      window.renderedGraph.scene.traverse(object => {
        const batch = object.userData.spatialBatch;
        if (batch?.kind === 'nodes') for (const { data } of batch.entries) data.shellFiles === undefined ? found.spheres++ : found.shells++;
        if (object.name === 'Spatial wrappers') found.skins = object.userData.spatialWrappers.seeds.filter(seed => seed.startsWith('shell:')).length;
        if (object.name === 'Spatial shell files') found.files = object.userData.spatialUnits.length;
        if (object.name === 'Spatial shell balloons') found.balloons = object.userData.spatialUnits.length;
      });
      return found;
    });
    await page.waitForTimeout(1000);
    if (process.env.OUT && run === 1) await page.screenshot({ path: path.join(process.env.OUT, `${process.env.NAME || 'picture'}-${look}.png`) });
    console.log(JSON.stringify({ base, pin, depth, look, run, frames: rest.frames, seconds: +(rest.at / 1000).toFixed(2), ...held }));
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
