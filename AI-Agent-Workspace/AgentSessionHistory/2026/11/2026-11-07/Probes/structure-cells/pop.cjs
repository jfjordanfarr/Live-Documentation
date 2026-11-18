// Pops in the Structure layout's bag of cells (2026-11-07), after the third round's `look.cjs`: load the Structure start
// with nothing pinned and Group Wrappers chosen, wait for rest, then open bubbles in a row by a click on each one's name,
// each pop as three pictures (before, with the bubble panned to the middle of the frame by right-drags from an empty
// corner; the frame of the pop, the page's clock paused and stepped one frame; at rest), with how far what it released
// stands from where its skin showed it, whether it stands inside the skin, the opened set the address carries, and what
// the drawing budget draws and veils. Run from the repository root with `npx tsx`, the bundle served on PORT (8912).
// Switches, in the environment: BASE, HOPS, LOOK (skin), POPS (a comma list of directories), OUT, NAME. Prints JSON.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/', out = process.env.OUT, name = process.env.NAME || 'pops';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'structure', filters: { showTests: true, showAssets: false } });

const drawn = page => page.evaluate(() => {
  const found = { nodes: {}, skins: {}, units: [] };
  window.renderedGraph.scene.traverse(object => {
    const batch = object.userData.spatialBatch;
    if (batch?.kind === 'nodes') for (const { data } of batch.entries) found.nodes[data.id] = { x: data.x, y: data.y, z: data.z, shellFiles: data.shellFiles, shellBody: data.shellBody };
    if (object.name === 'Spatial wrappers' && object.visible) for (const range of object.userData.spatialWrappers.ranges ?? []) found.skins[range.seed] = range;
    if ((object.name === 'Spatial shell files' || object.name === 'Spatial shell balloons') && object.visible) found.units.push(...object.userData.spatialUnits);
  });
  return found;
});
const budget = picture => ({ bubbles: Object.values(picture.nodes).filter(node => node.shellFiles !== undefined).length,
  filesDrawn: picture.units.filter(unit => unit.kind === 'file').length, veiled: picture.units.filter(unit => unit.veiled).length });
const rested = page => page.waitForFunction(() => document.getElementById('graph-svg').getAttribute('aria-busy') === 'false', null, { timeout: 600000, polling: 250 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const screenOf = (page, id) => page.evaluate(id => {
  const observed = window.renderedGraph, rect = document.querySelector('#graph-svg canvas').getBoundingClientRect();
  const project = data => { const p = observed.camera.position.clone().set(data.x, data.y, data.z).project(observed.camera); return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 }; };
  let at = null;
  const all = [];
  observed.scene.traverse(object => {
    const batch = object.userData.spatialBatch;
    if (batch?.kind === 'nodes') for (const { data } of batch.entries) { if (!Number.isFinite(data.x)) continue; const p = project(data); all.push(p); if (data.id === id) at = p; }
  });
  const corners = [[0.12, 0.15], [0.88, 0.15], [0.12, 0.8], [0.88, 0.8], [0.5, 0.12]].map(([u, v]) => ({ x: rect.left + u * rect.width, y: rect.top + v * rect.height }));
  const empty = corners.map(corner => ({ corner, clear: Math.min(Infinity, ...all.map(p => Math.hypot(p.x - corner.x, p.y - corner.y))) })).sort((a, b) => b.clear - a.clear)[0].corner;
  return { at, centre: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, empty };
}, id);

/** Pan by right-drags from an empty corner until the node stands within forty pixels of the middle: pictures only. */
async function frameOn(page, id) {
  let gain = 1;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { at, centre, empty } = await screenOf(page, id);
    if (!at) return { framed: false };
    const dx = centre.x - at.x, dy = centre.y - at.y;
    if (Math.hypot(dx, dy) < 40) return { framed: true, attempts: attempt };
    const drag = { x: dx / gain, y: dy / gain };
    await page.mouse.move(empty.x, empty.y);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(empty.x + drag.x, empty.y + drag.y, { steps: 12 });
    await page.mouse.up({ button: 'right' });
    await page.mouse.move(2, 2);
    await page.waitForTimeout(3000);
    const moved = (await screenOf(page, id)).at;
    const done = moved ? Math.hypot(moved.x - at.x, moved.y - at.y) : 0, asked = Math.hypot(drag.x, drag.y);
    if (done > 1 && asked > 1) gain = Math.max(0.05, Math.min(20, done / asked));
  }
  return { framed: false };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, wrappers, hops]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, ...(hops ? { hops } : {}) } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, process.env.LOOK || 'skin', Number(process.env.HOPS || 0)]);
  await page.clock.install();
  await page.goto(url);
  await page.waitForTimeout(2000);
  await rested(page);
  await page.waitForTimeout(1500);
  const start = await drawn(page);
  const report = { url: url.slice(0, 60), start: budget(start), pops: [] };
  for (const [level, directory] of (process.env.POPS || 'packages,packages/explorer').split(',').entries()) {
    const id = `directory:${directory}`, before = await drawn(page), skin = before.skins[id];
    if (!before.nodes[id]?.shellFiles) { report.pops.push({ level: level + 1, directory, missing: true }); break; }
    const shown = before.units.filter(unit => unit.seed === id && unit.depth === 0);
    const framing = await frameOn(page, id);
    if (out) await page.screenshot({ path: path.join(out, `${name}-pop-${level + 1}-before.png`) });
    await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
    await page.locator(`.force-graph-label[data-node-id="${id}"]`).evaluate(element => element.click());
    await page.clock.runFor(20);
    const atPop = await drawn(page);
    if (out) await page.screenshot({ path: path.join(out, `${name}-pop-${level + 1}-pop.png`) });
    // Each unit of the skin's own level, as what stands at the pop: a file by its id, a bubble as its hub.
    const units = shown.map(unit => {
      const match = atPop.nodes[unit.id] ? unit.id : atPop.nodes[`directory:${unit.id}`] ? `directory:${unit.id}` : null, born = match ? atPop.nodes[match] : null;
      return { unit: unit.id, kind: unit.kind, match, off: born ? distance(born, unit) : null, inside: born && skin ? distance(born, skin) + unit.radius <= skin.radius + 1e-6 : null,
        sizeKept: unit.kind !== 'directory' || !born ? null : born.shellBody === undefined ? 'no body' : Math.abs(born.shellBody - unit.radius) < 1e-3 };
    });
    await page.clock.resume();
    const popStart = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames }));
    await page.waitForTimeout(500);
    await rested(page);
    const popRest = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames }));
    await page.waitForTimeout(1000);
    const after = await drawn(page);
    if (out) await page.screenshot({ path: path.join(out, `${name}-pop-${level + 1}-rest.png`) });
    const opened = [...decompressSnapshot(new URL(page.url()).searchParams.get('s')).openDirectories].sort();
    report.pops.push({ level: level + 1, directory, files: before.nodes[id].shellFiles, skinRadius: skin?.radius, released: units.length, matched: units.filter(unit => unit.match).length,
      bubbles: units.filter(unit => unit.kind === 'directory').length, worstOff: Math.max(0, ...units.map(unit => unit.off ?? Infinity)), allInside: units.every(unit => unit.inside !== false),
      sizesKept: units.every(unit => unit.sizeKept !== false && unit.sizeKept !== 'no body'), hubStands: !!after.nodes[id] && after.nodes[id].shellFiles === undefined, opened,
      atRest: budget(after), restAfterPop: { seconds: +((popRest.at - popStart.at) / 1000).toFixed(1), frames: popRest.frames - popStart.frames }, framing,
      unmatched: units.filter(unit => !unit.match).map(unit => unit.unit) });
  }
  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
