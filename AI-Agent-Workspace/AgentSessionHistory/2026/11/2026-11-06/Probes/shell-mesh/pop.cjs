// Pop the largest shell of a pinned 3D picture with Group Wrappers on Skin, then the largest shell it released (a balloon
// out of a balloon), each as three pictures: before, the frame of the pop, and at rest again. The page's clock is paused
// at the pop and stepped one frame, so that the frame of the pop is the page's own first frame after it. For each unit a
// pop releases it reports where the skin showed it, where it stood at the frame of the pop, whether it stood inside the
// skin, and how far it moved by the time the picture rested. Run from the repository root with `npx tsx`, the bundle
// served on PORT (8912). Switches, in the environment: BASE, PIN, DEPTH, SUBJECT (the pinned file is the subject too),
// LEVELS (pops in a row, 2), OUT (a directory for the pictures), NAME (their prefix), LOOK (skin). Prints JSON.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/';
const pin = process.env.PIN || 'packages/explorer/src/client/views/forceGraphView.ts';
const depth = Number(process.env.DEPTH || 2), levels = Number(process.env.LEVELS || 2), out = process.env.OUT, name = process.env.NAME || 'pop';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'connections',
  filters: { showTests: true, showAssets: false }, pinSet: { entries: [{ nodeId: pin, symbol: '*' }] }, ...(process.env.SUBJECT ? { selectedNodeId: pin } : {}) });

/** The picture as the page draws it: every node's place and body, each skin's centre and radius, and what each skin shows. */
const drawn = page => page.evaluate(() => {
  const found = { nodes: {}, skins: {}, units: [] };
  window.renderedGraph.scene.traverse(object => {
    const batch = object.userData.spatialBatch;
    if (batch?.kind === 'nodes') for (const { data } of batch.entries) found.nodes[data.id] = { x: data.x, y: data.y, z: data.z, shellFiles: data.shellFiles, shellBody: data.shellBody, symbols: data.publicSymbols?.length ?? 0 };
    if (object.name === 'Spatial wrappers') for (const range of object.userData.spatialWrappers.ranges ?? []) found.skins[range.seed] = range;
    if (object.name === 'Spatial shell files' || object.name === 'Spatial shell balloons') found.units.push(...object.userData.spatialUnits);
  });
  return found;
});
const rested = page => page.waitForFunction(() => document.getElementById('graph-svg').getAttribute('aria-busy') === 'false', null, { timeout: 300000, polling: 250 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const median = values => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : NaN; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, look, shellDepth]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: look, shellDepth } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, process.env.LOOK || 'skin', depth]);
  await page.clock.install();
  await page.goto(url);
  await page.waitForFunction(() => document.getElementById('graph-svg')?.getAttribute('aria-busy') === 'true', null, { timeout: 120000 });
  await rested(page);
  await page.waitForTimeout(1500);
  const report = [];
  let popped = null;
  for (let level = 1; level <= levels; level++) {
    const before = await drawn(page);
    // The largest shell, or at the second level the largest the last pop released.
    const candidates = Object.entries(before.nodes).filter(([id, node]) => node.shellFiles !== undefined && before.skins[id] && (!popped || id.startsWith(`shell:${popped}/`)));
    if (!candidates.length) break;
    const [shellId, shell] = candidates.sort((a, b) => b[1].shellFiles - a[1].shellFiles)[0];
    const skin = before.skins[shellId], shown = before.units.filter(unit => unit.seed === shellId);
    if (out) await page.screenshot({ path: path.join(out, `${name}-${level}-before.png`) });
    const startedAt = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(startedAt + 1000);
    // Enter on the shell's name pops it, as a click on its skin does; the page's frames wait for the clock.
    const label = page.locator(`.force-graph-label[data-node-id="${shellId}"]`);
    await label.evaluate(element => element.click());
    await page.clock.runFor(20);
    const atPop = await drawn(page);
    if (out) await page.screenshot({ path: path.join(out, `${name}-${level}-pop.png`) });
    // Each unit shown, matched to what stands at the frame of the pop: a file by its id, a balloon by the shell of its directory.
    const matchOf = unit => {
      if (unit.kind === 'file') return atPop.nodes[unit.id] ? unit.id : null;
      return Object.keys(atPop.nodes).find(id => id === `shell:${unit.id}` || id.startsWith(`shell:${unit.id}/`)) ?? null;
    };
    const centre = { x: skin.x, y: skin.y, z: skin.z };
    const units = shown.map(unit => {
      const id = matchOf(unit), born = id ? atPop.nodes[id] : null;
      return { unit: unit.id, kind: unit.kind, id, radius: unit.radius, shown: { x: unit.x, y: unit.y, z: unit.z }, born,
        offFromShown: born ? distance(born, unit) : null, inside: born ? distance(born, centre) + unit.radius <= skin.radius + 1e-6 : false };
    });
    await page.clock.resume();
    const popStarted = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames }));
    await page.waitForTimeout(500);
    await rested(page);
    const popRested = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames }));
    await page.waitForTimeout(1000);
    const after = await drawn(page);
    if (out) await page.screenshot({ path: path.join(out, `${name}-${level}-rest.png`) });
    for (const entry of units) if (entry.id && after.nodes[entry.id]) entry.moved = distance(after.nodes[entry.id], entry.born);
    const moved = units.filter(entry => entry.moved !== undefined).map(entry => entry.moved);
    // The spheres that stood before the pop and after it, for how far the whole picture moved in the same time.
    const releasedIds = new Set(units.map(entry => entry.id));
    const others = Object.keys(before.nodes).filter(id => !releasedIds.has(id) && after.nodes[id]).map(id => distance(after.nodes[id], before.nodes[id]));
    report.push({ level, shell: shellId, files: shell.shellFiles, skinRadius: +skin.radius.toFixed(2), body: shell.shellBody, unitsShown: shown.length,
      matched: units.filter(entry => entry.id).length, allInside: units.every(entry => entry.inside),
      worstOffFromShown: +Math.max(0, ...units.map(entry => entry.offFromShown ?? Infinity)).toFixed(2),
      movedMedian: +median(moved).toFixed(1), movedMax: +Math.max(...moved).toFixed(1), movedMedianOfRadius: +(median(moved) / skin.radius).toFixed(2),
      othersMovedMedian: +median(others).toFixed(1), othersMovedMax: +Math.max(...others).toFixed(1),
      restAfterPop: { seconds: +((popRested.at - popStarted.at) / 1000).toFixed(1), frames: popRested.frames - popStarted.frames },
      units: units.map(({ unit, kind, radius, offFromShown, inside, moved: m }) => ({ unit, kind, radius: +radius.toFixed(1), offFromShown: offFromShown === null ? null : +offFromShown.toFixed(2), inside, moved: m === undefined ? null : +m.toFixed(1) })) });
    popped = shellId.slice('shell:'.length);
  }
  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
