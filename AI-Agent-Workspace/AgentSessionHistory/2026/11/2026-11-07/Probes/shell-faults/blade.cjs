// What the long white blade through the T3 sample's 3D picture with Skin is (2026-11-07, third round): load the picture,
// wait, and list the drawn wires widest on screen at either end with their ends, the camera's place against every skin,
// and the skins' radii; AXIS, LINE and HIDE add the readings below. Run from the repository root with `npx tsx`, the
// bundle served on PORT (8912) with the T3 sample under `samples/t3-code/`. Switches: BASE, PIN, LOOK (skin), WAIT
// (seconds, 150), OUT (a picture), NAME, AXIS, LINE, HIDE (seconds to wait with each object hidden). Prints JSON documents.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { observeGraph } = require(path.join(root, 'tests/e2e/force-graph-observation.ts'));
const port = process.env.PORT || '8912', base = process.env.BASE || '/samples/t3-code/', pin = process.env.PIN || 'packages/contracts/src/agentSessions.ts';
const url = `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: '3d', spatialLayout: 'connections',
  filters: { showTests: true, showAssets: false }, pinSet: { entries: [{ nodeId: pin, symbol: '*' }] } });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await observeGraph(page);
  await page.addInitScript(([key, version, look]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: look, shellDepth: 2 } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, process.env.LOOK || 'skin']);
  await page.goto(url);
  await page.waitForTimeout(1000 * Number(process.env.WAIT || 150));
  if (process.env.OUT) await page.screenshot({ path: path.join(process.env.OUT, `${process.env.NAME || 'blade'}.png`) });
  const found = await page.evaluate(() => {
    const observed = window.renderedGraph, camera = observed.camera, canvas = document.querySelector('#graph-svg canvas').getBoundingClientRect();
    const nodes = new Map(), wires = [];
    let skins = [], lines = null;
    observed.scene.traverse(object => {
      const batch = object.userData.spatialBatch;
      if (batch?.kind === 'nodes') for (const { data } of batch.entries) nodes.set(data.id, data);
      if (batch?.kind === 'links') lines = object;
      if (object.name === 'Spatial wrappers') skins = object.userData.spatialWrappers.ranges ?? [];
    });
    const width = lines.geometry.getAttribute('spatialWidth'), scale = lines.material.uniforms.spatialWidthScale.value;
    const projection = camera.projectionMatrix.elements[5], matrix = lines.matrixWorld.clone();
    for (const entry of lines.userData.spatialBatch.entries) {
      if (entry.slot < 0 || entry.slot >= lines.count) continue;
      lines.getMatrixAt(entry.slot, matrix);
      const start = camera.position.clone().set(0, 0, 0).applyMatrix4(matrix), end = camera.position.clone().set(0, 0, 1).applyMatrix4(matrix);
      const w = point => point.clone().applyMatrix4(camera.matrixWorldInverse).z * -1;
      const pixels = z => width.getX(entry.slot) * scale * projection * canvas.height / 2 / Math.max(1e-6, z);
      const source = typeof entry.data.source === 'string' ? entry.data.source : entry.data.source.id, target = typeof entry.data.target === 'string' ? entry.data.target : entry.data.target.id;
      wires.push({ source, target, kind: entry.data.kind, count: entry.data.count, depthStart: +w(start).toFixed(1), depthEnd: +w(end).toFixed(1), pixelsStart: +pixels(w(start)).toFixed(1), pixelsEnd: +pixels(w(end)).toFixed(1),
        length: +start.distanceTo(end).toFixed(1) });
    }
    wires.sort((a, b) => Math.max(b.pixelsStart, b.pixelsEnd) - Math.max(a.pixelsStart, a.pixelsEnd));
    const inside = skins.filter(skin => Math.hypot(camera.position.x - skin.x, camera.position.y - skin.y, camera.position.z - skin.z) < skin.radius).map(skin => skin.seed);
    return { camera: camera.position.toArray().map(v => +v.toFixed(1)), near: camera.near, inside, widest: wires.slice(0, 8), wires: wires.length,
      largestSkins: [...skins].sort((a, b) => b.radius - a.radius).slice(0, 5).map(skin => ({ seed: skin.seed, radius: +skin.radius.toFixed(1), distance: +Math.hypot(camera.position.x - skin.x, camera.position.y - skin.y, camera.position.z - skin.z).toFixed(1) })) };
  });
  console.log(JSON.stringify(found, null, 1));
  // AXIS: the wires that lie along the line through the two largest skins' centres, within a degree and a twentieth of
  // the larger skin's radius, and the ends they share most.
  if (process.env.AXIS) console.log(JSON.stringify(await page.evaluate(() => {
    const observed = window.renderedGraph, nodes = new Map();
    let skins = [], lines = null;
    observed.scene.traverse(object => {
      const batch = object.userData.spatialBatch;
      if (batch?.kind === 'nodes') for (const { data } of batch.entries) nodes.set(data.id, data);
      if (batch?.kind === 'links') lines = object;
      if (object.name === 'Spatial wrappers') skins = object.userData.spatialWrappers.ranges ?? [];
    });
    const [a, b] = [...skins].sort((p, q) => q.radius - p.radius);
    const ax = b.x - a.x, ay = b.y - a.y, az = b.z - a.z, length = Math.hypot(ax, ay, az), ux = ax / length, uy = ay / length, uz = az / length;
    const offAxis = p => { const t = (p.x - a.x) * ux + (p.y - a.y) * uy + (p.z - a.z) * uz; return { t, d: Math.hypot(p.x - a.x - t * ux, p.y - a.y - t * uy, p.z - a.z - t * uz) }; };
    const end = id => nodes.get(typeof id === 'string' ? id : id.id);
    let along = 0, total = 0;
    const ends = new Map(), files = new Set();
    for (const entry of lines.userData.spatialBatch.entries) {
      if (entry.slot < 0 || entry.slot >= lines.count) continue;
      const s = end(entry.data.source), t = end(entry.data.target);
      if (!s || !t) continue;
      total++;
      const dx = t.x - s.x, dy = t.y - s.y, dz = t.z - s.z, d = Math.hypot(dx, dy, dz) || 1;
      const cos = Math.abs((dx * ux + dy * uy + dz * uz) / d);
      if (cos > Math.cos(Math.PI / 180) && offAxis(s).d < a.radius / 20 && offAxis(t).d < a.radius / 20) {
        along++;
        for (const node of [s, t]) { ends.set(node.id, (ends.get(node.id) ?? 0) + 1); files.add(node.id); }
      }
    }
    const placed = [...files].map(id => ({ id, ...offAxis(nodes.get(id)) })).sort((p, q) => p.t - q.t);
    return { axis: { from: a.seed, to: b.seed, length: +length.toFixed(1), radii: [+a.radius.toFixed(1), +b.radius.toFixed(1)] }, wires: total, along,
      ends: [...ends].sort((p, q) => q[1] - p[1]).slice(0, 12), alongNodes: placed.length,
      span: placed.length ? [+placed[0].t.toFixed(0), +placed[placed.length - 1].t.toFixed(0)] : null,
      sample: placed.filter((_, i) => i % Math.max(1, Math.floor(placed.length / 12)) === 0).map(p => ({ id: p.id, t: +p.t.toFixed(0), d: +p.d.toFixed(1), shell: nodes.get(p.id).shellFiles ?? null })) };
  }), null, 1));
  // LINE: on the screen, the line through the two largest skins' centres: the nodes standing within eight pixels of it,
  // the wires lying along it, by kind of end, and how straight the shells stand in space (the share of their spread
  // along their first principal axis).
  if (process.env.LINE) console.log(JSON.stringify(await page.evaluate(() => {
    const observed = window.renderedGraph, camera = observed.camera, canvas = document.querySelector('#graph-svg canvas').getBoundingClientRect();
    const nodes = new Map();
    let skins = [], lines = null;
    observed.scene.traverse(object => {
      const batch = object.userData.spatialBatch;
      if (batch?.kind === 'nodes') for (const { data } of batch.entries) nodes.set(data.id, data);
      if (batch?.kind === 'links') lines = object;
      if (object.name === 'Spatial wrappers') skins = object.userData.spatialWrappers.ranges ?? [];
    });
    const screen = p => { const q = camera.position.clone().set(p.x, p.y, p.z).project(camera); return { x: (q.x + 1) * canvas.width / 2, y: (1 - q.y) * canvas.height / 2 }; };
    const [a, b] = [...skins].sort((p, q) => q.radius - p.radius).map(screen);
    const lx = b.x - a.x, ly = b.y - a.y, ll = Math.hypot(lx, ly);
    const off = s => Math.abs((s.x - a.x) * ly - (s.y - a.y) * lx) / ll;
    const near = [...nodes.values()].filter(node => Number.isFinite(node.x) && off(screen(node)) < 8);
    const nearIds = new Set(near.map(node => node.id));
    const kinds = {}, ends = new Map();
    let along = 0;
    for (const entry of lines.userData.spatialBatch.entries) {
      if (entry.slot < 0 || entry.slot >= lines.count) continue;
      const s = typeof entry.data.source === 'string' ? entry.data.source : entry.data.source.id, t = typeof entry.data.target === 'string' ? entry.data.target : entry.data.target.id;
      if (!nearIds.has(s) || !nearIds.has(t)) continue;
      along++;
      const kind = `${nodes.get(s).shellFiles !== undefined ? 'shell' : 'file'}-${nodes.get(t).shellFiles !== undefined ? 'shell' : 'file'}`;
      kinds[kind] = (kinds[kind] ?? 0) + 1;
      for (const id of [s, t]) ends.set(id, (ends.get(id) ?? 0) + 1);
    }
    // How straight the shells stand: the eigenvalues of their positions' covariance, largest first, as shares.
    const shells = [...nodes.values()].filter(node => node.shellFiles !== undefined && Number.isFinite(node.x));
    const mean = shells.reduce((m, n) => ({ x: m.x + n.x / shells.length, y: m.y + n.y / shells.length, z: m.z + n.z / shells.length }), { x: 0, y: 0, z: 0 });
    const c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const n of shells) { const d = [n.x - mean.x, n.y - mean.y, n.z - mean.z]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c[i][j] += d[i] * d[j]; }
    let v = [1, 1, 1];
    for (let k = 0; k < 100; k++) { const w = c.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]); const n = Math.hypot(...w); v = w.map(x => x / n); }
    const top = c.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]).reduce((s, x, i) => s + x * v[i], 0), trace = c[0][0] + c[1][1] + c[2][2];
    const toCamera = camera.position.clone().sub(observed.camera.position.clone().set(mean.x, mean.y, mean.z)).normalize();
    const shownFiles = [...nodes.values()].filter(node => node.shellFiles === undefined && Number.isFinite(node.x));
    const fileMean = shownFiles.reduce((m, n) => ({ x: m.x + n.x / shownFiles.length, y: m.y + n.y / shownFiles.length, z: m.z + n.z / shownFiles.length }), { x: 0, y: 0, z: 0 });
    return { nearNodes: near.length, nearShells: near.filter(node => node.shellFiles !== undefined).length, wiresAlong: along, kinds,
      ends: [...ends].sort((p, q) => q[1] - p[1]).slice(0, 10),
      shells: shells.length, straightness: +(top / trace).toFixed(3), axisAgainstView: +Math.abs(v[0] * toCamera.x + v[1] * toCamera.y + v[2] * toCamera.z).toFixed(3),
      shellsMean: [mean.x, mean.y, mean.z].map(x => +x.toFixed(0)), filesMean: [fileMean.x, fileMean.y, fileMean.z].map(x => +x.toFixed(0)),
      shellsByDistance: shells.map(n => ({ id: n.id, files: n.shellFiles, body: +(n.shellBody ?? 0).toFixed(0), alongAxis: +((n.x - mean.x) * v[0] + (n.y - mean.y) * v[1] + (n.z - mean.z) * v[2]).toFixed(0),
        offAxis: +Math.hypot(n.x - mean.x - v[0] * ((n.x - mean.x) * v[0] + (n.y - mean.y) * v[1] + (n.z - mean.z) * v[2]), n.y - mean.y - v[1] * ((n.x - mean.x) * v[0] + (n.y - mean.y) * v[1] + (n.z - mean.z) * v[2]), n.z - mean.z - v[2] * ((n.x - mean.x) * v[0] + (n.y - mean.y) * v[1] + (n.z - mean.z) * v[2])).toFixed(0) }))
        .sort((p, q) => p.alongAxis - q.alongAxis) };
  }), null, 1));
  // HIDE: each drawn object of the scene hidden in turn for two frames, a picture of the middle of the canvas taken
  // without it, so that the object whose absence removes the blade names it.
  if (process.env.HIDE && process.env.OUT) {
    const objects = await page.evaluate(() => window.renderedGraph.scene.children.map((object, index) => ({ index, name: object.name || object.type, visible: object.visible, count: object.count ?? null })));
    console.log(JSON.stringify(objects));
    // By the materials, which the page does not touch, rather than the objects' visibility, which it sets every frame.
    const show = (index, shown) => page.evaluate(([at, on]) => window.renderedGraph.scene.children[at].traverse(object => {
      for (const material of [object.material ?? []].flat()) material.visible = on;
    }), [index, shown]);
    for (const object of objects.filter(item => item.visible)) {
      await show(object.index, false);
      await page.waitForTimeout(1000 * Number(process.env.HIDE));
      await page.screenshot({ path: path.join(process.env.OUT, `${process.env.NAME || 'blade'}-without-${object.index}.png`), clip: { x: 560, y: 380, width: 560, height: 480 } });
      await show(object.index, true);
    }
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
