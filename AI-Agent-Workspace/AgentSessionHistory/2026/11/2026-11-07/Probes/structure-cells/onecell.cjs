// Whether any bubble of a 3D picture shows a single cell (the owner, 2026-11-07: "Make no embryos which appear to have
// only one cell"): load a picture with Group Wrappers chosen, wait for rest, and count what each skin and each inner
// bubble shows within it, a wrapped group's own seed counted, since its sphere stands inside its skin; a veiled bubble,
// drawn milky with nothing inside, is counted apart. Run from the repository root with `npx tsx`, the bundle served on
// PORT (8912). Switches: BASE, LAYOUT (connections or structure), PIN (none for the start), HOPS, DEPTH (Shell Depth),
// OUT and NAME (a picture). Prints one JSON line.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/', pin = process.env.PIN || '';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: process.env.LAYOUT || 'connections',
  filters: { showTests: true, showAssets: false }, ...(pin ? { pinSet: { entries: [{ nodeId: pin, symbol: '*' }] } } : {}) });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, hops, depth]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: 'skin', hops, shellDepth: depth } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, Number(process.env.HOPS || 2), Number(process.env.DEPTH || 2)]);
  await page.goto(url);
  await page.waitForTimeout(3000);
  await page.waitForFunction(() => document.getElementById('graph-svg').getAttribute('aria-busy') === 'false', null, { timeout: 600000, polling: 250 });
  await page.waitForTimeout(3000);
  const read = await page.evaluate(() => {
    const units = [], seeds = new Set(), sphereNodes = new Set();
    window.renderedGraph.scene.traverse(object => {
      const batch = object.userData.spatialBatch;
      if (batch?.kind === 'nodes') for (const { data } of batch.entries) if (data.shellFiles === undefined) sphereNodes.add(data.id);
      if (object.name === 'Spatial wrappers' && object.visible) for (const seed of object.userData.spatialWrappers.seeds) seeds.add(seed);
      if ((object.name === 'Spatial shell files' || object.name === 'Spatial shell balloons') && object.visible) units.push(...object.userData.spatialUnits);
    });
    const shown = new Map();
    const count = (key, unit) => { const at = shown.get(key) ?? shown.set(key, { cells: 0, veiled: 0 }).get(key); if (unit.veiled) at.veiled++; else at.cells++; };
    for (const unit of units) if (unit.kind !== 'body') count(unit.parent === undefined ? `skin:${unit.seed}` : `bubble:${unit.seed}:${unit.parent}`, unit);
    // A wrapped group's seed is a sphere drawn inside its own skin.
    for (const seed of seeds) { if (sphereNodes.has(seed)) count(`skin:${seed}`, {}); if (!shown.has(`skin:${seed}`)) shown.set(`skin:${seed}`, { cells: 0, veiled: 0 }); }
    const bodies = [...shown].map(([key, at]) => ({ key, ...at }));
    return { skins: seeds.size, bubbles: bodies.length, oneCell: bodies.filter(body => body.cells + body.veiled === 1 && body.veiled === 0), empty: bodies.filter(body => body.cells + body.veiled === 0),
      veiledOnly: bodies.filter(body => body.cells === 0 && body.veiled > 0).length };
  });
  if (process.env.OUT) await page.screenshot({ path: path.join(process.env.OUT, `${process.env.NAME || 'onecell'}.png`) });
  console.log(JSON.stringify({ base, layout: process.env.LAYOUT || 'connections', pin: pin || null, hops: Number(process.env.HOPS || 2), depth: Number(process.env.DEPTH || 2), ...read }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
