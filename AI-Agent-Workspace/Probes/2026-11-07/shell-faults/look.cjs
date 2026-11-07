// The second round's `look.cjs` (2026-11-06), with the third round's two additions (2026-11-07): before each pop the
// camera is panned, by a right-drag from an empty corner as a person would, until the shell to pop stands in the middle
// of the frame, so that the pop's pictures show it whole rather than at the frame's edge; and each pop's record lists the
// popped directories' names on screen, their boxes and whether any two overlap or stand within twenty pixels.
// Load a 3D Local Map picture on a served bundle with Group Wrappers chosen, wait for rest, count what each body shows
// within its skin against what it holds, take its picture, and optionally hover one body or pop shells in a row, each
// pop as three pictures (before, the frame of the pop with the page's clock paused and stepped one frame, at rest) with
// how far what it released moved. Run from the repository root with `npx tsx`, the bundle served on PORT (8912).
// Switches, in the environment: BASE (`/` or a sample's path), PIN (empty for the archipelago), SUBJECT, HOPS, DEPTH,
// LOOK (skin, or off), OUT, NAME, HOVER (a seed's id to put the pointer on), POPS (a comma list of directories to pop in
// turn, `largest` for the largest shell, `inner` for the largest shell the last pop released), WAIT (seconds to wait
// instead of for rest), FRAMES (frames to time with the camera turning), FRAME (0 to keep the camera where the picture
// framed it). Prints JSON.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));

const port = process.env.PORT || '8912', base = process.env.BASE || '/', pin = process.env.PIN ?? 'packages/explorer/src/client/views/forceGraphView.ts';
const out = process.env.OUT, name = process.env.NAME || 'look', look = process.env.LOOK || 'skin';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'connections',
  filters: { showTests: true, showAssets: false }, ...(pin ? { pinSet: { entries: [{ nodeId: pin, symbol: '*' }] } } : {}), ...(pin && process.env.SUBJECT ? { selectedNodeId: pin } : {}) });

/** The picture as drawn: nodes, skins and the units within them. */
const drawn = page => page.evaluate(() => {
  const found = { nodes: {}, skins: {}, units: [] };
  window.renderedGraph.scene.traverse(object => {
    const batch = object.userData.spatialBatch;
    if (batch?.kind === 'nodes') for (const { data } of batch.entries) found.nodes[data.id] = { x: data.x, y: data.y, z: data.z, shellFiles: data.shellFiles, shellBody: data.shellBody, name: data.name };
    if (object.name === 'Spatial wrappers') for (const range of object.userData.spatialWrappers.ranges ?? []) found.skins[range.seed] = range;
    if (object.name === 'Spatial shell files' || object.name === 'Spatial shell balloons') found.units.push(...object.userData.spatialUnits);
  });
  return found;
});
const rested = page => page.waitForFunction(() => document.getElementById('graph-svg').getAttribute('aria-busy') === 'false', null, { timeout: 600000, polling: 250 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const median = values => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : NaN; };

/** Where a node stands on the page, and the canvas's box; the empty corner of the canvas farthest from every node drawn. */
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

/**
 * Pan the camera, by right-drags from an empty corner as a person would, until the node stands within forty pixels of
 * the middle of the canvas: the controls do not move the picture pixel for pixel, so each drag is scaled by what the
 * last one did. Pictures only: nothing of the page is changed but where its camera looks.
 */
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
    // The controls ease to a stop over some frames.
    await page.waitForTimeout(3000);
    const moved = (await screenOf(page, id)).at;
    const done = moved ? Math.hypot(moved.x - at.x, moved.y - at.y) : 0, asked = Math.hypot(drag.x, drag.y);
    if (done > 1 && asked > 1) gain = Math.max(0.05, Math.min(20, done / asked));
  }
  return { framed: false };
}

/** The popped directories' names on screen: their boxes, and the closest two stand. */
const poppedNames = page => page.evaluate(() => {
  const names = [...document.querySelectorAll('.force-graph-label[data-kind="popped"]')].filter(label => !label.hidden).map(label => {
    const box = label.getBoundingClientRect();
    return { directory: label.dataset.directory, x: Math.round(box.left), y: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) };
  });
  let closest = Infinity;
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const a = names[i], b = names[j];
    const gapX = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width)), gapY = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height));
    closest = Math.min(closest, Math.hypot(gapX, gapY));
  }
  return { names, closest: Number.isFinite(closest) ? Math.round(closest) : null };
});

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, wrappers, shellDepth, hops]) => {
    const forceGraph = { groupWrappers: wrappers, shellDepth, ...(hops ? { hops } : {}) };
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph } }));
    window.restTimes = [];
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('graph-svg');
      new MutationObserver(() => window.restTimes.push({ busy: container.getAttribute('aria-busy'), at: performance.now(), frames: window.renderedFrames }))
        .observe(container, { attributes: true, attributeFilter: ['aria-busy'] });
    });
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look, Number(process.env.DEPTH || 2), Number(process.env.HOPS || 0)]);
  if (process.env.POPS) await page.clock.install();
  await page.goto(url);
  await page.waitForFunction(() => (window.restTimes || []).some(change => change.busy === 'true'), null, { timeout: 300000 });
  // WAIT gives up on rest after so many seconds, for a picture as large as the T3 sample's.
  if (process.env.WAIT) await page.waitForTimeout(1000 * Number(process.env.WAIT)); else await rested(page);
  const rest = await page.evaluate(() => window.restTimes[window.restTimes.length - 1]);
  await page.waitForTimeout(1500);
  // FRAMES: the cost of a frame drawn, the camera turned a little about its target every frame, so that each frame draws.
  const frameCost = process.env.FRAMES ? await page.evaluate(count => new Promise(resolve => {
    const camera = window.renderedGraph.camera, start = camera.position.clone(), times = [];
    let frame = 0, last = performance.now();
    const step = now => {
      if (frame) times.push(now - last);
      last = now;
      if (frame++ >= count) { camera.position.copy(start); resolve(times); return; }
      const angle = 0.002 * frame, c = Math.cos(angle), s = Math.sin(angle);
      camera.position.set(start.x * c - start.z * s, start.y, start.x * s + start.z * c);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), Number(process.env.FRAMES)) : null;
  const picture = await drawn(page);
  // Each body: how many files it holds, how many spheres are drawn within it (its seed counted for a group), how many bubbles, how many veiled.
  const bodies = {};
  for (const unit of picture.units) {
    const body = bodies[unit.seed] ??= { files: 0, bubbles: 0, veiled: 0 };
    if (unit.kind === 'file') body.files++; else if (unit.kind === 'directory') { body.bubbles++; if (unit.veiled) body.veiled++; }
  }
  const counts = Object.entries(bodies).map(([seed, body]) => ({ seed, holds: picture.nodes[seed]?.shellFiles ?? null, ...body }));
  const report = { url: url.slice(0, 60), frames: rest.frames, seconds: +(rest.at / 1000).toFixed(2), spheres: Object.keys(picture.nodes).length, skins: Object.keys(picture.skins).length,
    filesDrawnWithin: picture.units.filter(unit => unit.kind === 'file').length, counts, pops: [],
    frameMs: frameCost ? { median: +median(frameCost).toFixed(1), mean: +(frameCost.reduce((a, b) => a + b, 0) / frameCost.length).toFixed(1), frames: frameCost.length } : null };
  if (out) await page.screenshot({ path: path.join(out, `${name}.png`) });
  if (process.env.HOVER) {
    const at = await page.evaluate(id => {
      const observed = window.renderedGraph, rect = document.querySelector('#graph-svg canvas').getBoundingClientRect();
      let found = null;
      observed.scene.traverse(object => {
        const batch = object.userData.spatialBatch;
        if (batch?.kind === 'nodes') for (const { data } of batch.entries) if (data.id === id) {
          const p = observed.camera.position.clone().set(data.x, data.y, data.z).project(observed.camera);
          found = { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
        }
      });
      return found;
    }, process.env.HOVER);
    if (at) { await page.mouse.move(at.x, at.y); await page.waitForTimeout(1500); if (out) await page.screenshot({ path: path.join(out, `${name}-hover.png`) }); }
    report.hovered = at;
  }
  let last = null;
  for (const [level, wanted] of (process.env.POPS || '').split(',').filter(Boolean).entries()) {
    const before = await drawn(page);
    const shells = Object.entries(before.nodes).filter(([id, node]) => node.shellFiles !== undefined && (wanted === 'largest' || wanted !== 'inner' || (last && id.startsWith(`shell:${last}/`))));
    const pick = wanted === 'largest' || wanted === 'inner' ? shells.sort((a, b) => b[1].shellFiles - a[1].shellFiles)[0] : shells.find(([id]) => id === `shell:${wanted}`);
    if (!pick) { report.pops.push({ level, wanted, missing: true }); break; }
    const [shellId, shell] = pick, skin = before.skins[shellId];
    const shown = before.units.filter(unit => unit.seed === shellId && unit.kind !== 'body');
    const framing = process.env.FRAME === '0' ? null : await frameOn(page, shellId);
    if (out) await page.screenshot({ path: path.join(out, `${name}-pop-${level + 1}-before.png`) });
    await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
    await page.locator(`.force-graph-label[data-node-id="${shellId}"]`).evaluate(element => element.click());
    await page.clock.runFor(20);
    const atPop = await drawn(page);
    if (out) await page.screenshot({ path: path.join(out, `${name}-pop-${level + 1}-pop.png`) });
    // The units of the outer skin: its own files and its bubbles one level in, each matched to what stands at the pop.
    const released = shown.filter(unit => unit.depth === 0);
    const matchOf = unit => unit.kind === 'file' ? (atPop.nodes[unit.id] ? unit.id : null) : (atPop.nodes[`shell:${unit.id}`] ? `shell:${unit.id}` : null);
    const centre = skin ? { x: skin.x, y: skin.y, z: skin.z } : before.nodes[shellId];
    const units = released.map(unit => {
      const id = matchOf(unit), born = id ? atPop.nodes[id] : null;
      return { unit: unit.id, kind: unit.kind, id, radius: unit.radius, born, bornRadius: id && born.shellBody !== undefined ? born.shellBody : unit.radius,
        offFromShown: born ? distance(born, unit) : null, inside: born && skin ? distance(born, centre) + unit.radius <= skin.radius + 1e-6 : null };
    });
    const innerShown = shown.filter(unit => unit.depth > 0).length;
    await page.clock.resume();
    const popStart = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames }));
    await page.waitForTimeout(500);
    await rested(page);
    const popRest = await page.evaluate(() => ({ at: performance.now(), frames: window.renderedFrames }));
    await page.waitForTimeout(1000);
    const after = await drawn(page);
    if (out) await page.screenshot({ path: path.join(out, `${name}-pop-${level + 1}-rest.png`) });
    for (const entry of units) if (entry.id && after.nodes[entry.id]) entry.moved = distance(after.nodes[entry.id], entry.born);
    const releasedIds = new Set(units.map(entry => entry.id));
    const others = Object.keys(before.nodes).filter(id => !releasedIds.has(id) && after.nodes[id]).map(id => distance(after.nodes[id], before.nodes[id]));
    const moved = units.filter(entry => entry.moved !== undefined).map(entry => entry.moved);
    report.pops.push({ level: level + 1, shell: shellId, files: shell.shellFiles, skinRadius: skin?.radius, body: shell.shellBody, released: units.length, matched: units.filter(entry => entry.id).length,
      bubblesReleased: units.filter(entry => entry.kind === 'directory').length, innerUnitsShown: innerShown, allInside: units.every(entry => entry.inside !== false),
      worstOffFromShown: Math.max(0, ...units.map(entry => entry.offFromShown ?? Infinity)), sizeKept: units.filter(entry => entry.kind === 'directory').every(entry => entry.id && Math.abs(entry.bornRadius - entry.radius) < 1e-3),
      movedMedian: +median(moved).toFixed(1), movedMax: +Math.max(...moved).toFixed(1), movedMedianOfRadius: skin ? +(median(moved) / skin.radius).toFixed(2) : null, othersMovedMedian: +median(others).toFixed(1),
      restAfterPop: { seconds: +((popRest.at - popStart.at) / 1000).toFixed(1), frames: popRest.frames - popStart.frames }, framing, poppedNames: await poppedNames(page) });
    last = shellId.slice('shell:'.length);
  }
  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
