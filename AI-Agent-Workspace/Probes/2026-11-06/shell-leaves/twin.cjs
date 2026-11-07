// Round one's headless twin, its bodies built from the leaves (second round): the 3D page's pinned picture with directory shells: the scope, the shells, the island wrappers'
// room, the reveal a piece a frame after the hidden warm-up, and the motion the page runs, counted in ticks to rest.
// Run from the repository root with `npx tsx AI-Agent-Workspace/Probes/2026-11-06/shell-leaves/twin.cjs`, after building
// the bundle; the switches are in the environment: BASE (`dist/explorer` or `dist/explorer/samples/estate`), PIN,
// WRAPPERS (`off` or `skin`), DEPTH (the Shell Depth), SIZE (a factor on the shells' bodies, a trial), TRACE (where the
// work went). Pops are measured in the browser (`pop.cjs`), not here.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { forceSimulation } = require('d3-force-3d');
const { explorerGraphOf } = require(path.join(root, 'packages/explorer/src/shared/graph.ts'));
const { spatialGraphOf } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphData.ts'));
const { getDefaultTuning } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const layout = require(path.join(root, 'packages/explorer/src/client/views/forceGraphLayout.ts'));
const { spatialScope } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphScope.ts'));
const { nextRevealCount, REVEAL, revealLayers } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphReveal.ts'));
const shells = require(path.join(root, 'packages/explorer/src/client/views/forceGraphShells.ts'));
const wrappers = require(path.join(root, 'packages/explorer/src/client/views/forceGraphWrappers.ts'));

const base = process.env.BASE || 'dist/explorer';
const pin = process.env.PIN || 'packages/explorer/src/client/views/forceGraphView.ts';
const look = process.env.WRAPPERS || 'skin';
const tuning = { ...getDefaultTuning().forceGraph, groupWrappers: look, shellDepth: Number(process.env.DEPTH || 2) };
const bundle = JSON.parse(fs.readFileSync(path.resolve(root, base, 'explorer-data.json'), 'utf8'));
const graph = explorerGraphOf(bundle.graph);
const data = spatialGraphOf(graph, node => (node.archetype || '').toLowerCase() !== 'asset', [], 'connections');
const pulls = link => layout.linkPulls(link, 'connections');
const byId = new Map(data.nodes.map(node => [node.id, node]));
const cache = new Map();
// Every evaluation of the field, each a substep tried or a reading: the work a tick costs, which the page spreads over
// frames within its budget, so that a stiff picture takes more frames than ticks.
const { SpatialField } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphPhysics.ts'));
let evaluations = 0, sphereEvaluations = 0;
const begin = SpatialField.prototype.begin;
let lastField = null;
// Each tick's largest move against the picture's diagonal, and whether the tether held: how the motion calmed.
const { SpatialMotion, diagonalOf } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphPhysics.ts'));
const moves = [];
const advance = SpatialMotion.prototype.advance;
SpatialMotion.prototype.advance = function (...args) {
  const result = advance.apply(this, args);
  if (result) moves.push({ move: result.moveMax / diagonalOf(this.positions, this.field.radii), held: this.holding });
  return result;
};
SpatialField.prototype.begin = function (...args) { lastField = this; evaluations++; sphereEvaluations += this.count; return begin.apply(this, args); };

/** The page's render: what is shown, the shells, the room, the reveal order; kept spheres keep their places. */
function picture(popped, previous) {
  const scope = spatialScope(data.nodes, data.links, new Set([pin]), tuning.hops, pulls);
  const hops = new Map(scope.hops), room = new Map(), shellNodes = [];
  let wires = [], held = { shells: [], released: [] };
  if (look !== 'off') {
    held = shells.shellPicture({ nodes: byId, links: data.links, shown: new Set(scope.hops.keys()), hidden: scope.hidden, depth: tuning.shellDepth, popped,
      beside: scope.beside, bundles: link => pulls(link) && link.kind !== 'related-doc' && link.kind !== 'cited-by' });
    wires = held.wires;
    for (const id of held.released) hops.set(id, tuning.hops + 1);
    for (const shell of held.shells) {
      hops.set(shell.id, tuning.hops + 1);
      const node = { id: shell.id, name: shell.name, codeRelativePath: shell.directory, archetype: 'shell', shellFiles: shell.files.length, publicSymbols: [],
        shellBody: shells.bodyShape(shell.id, shell.files.map(id => byId.get(id)), tuning, undefined, shell.directory).radius };
      // SIZE scales the shell's body, as a sphere of so many symbols: a rule under trial.
      if (process.env.SIZE) { const radius = Number(process.env.SIZE) * node.shellBody; delete node.shellFiles; node.symbolCount = Math.pow(radius / tuning.nodeSize, 3) - 1; }
      shellNodes.push(node);
    }
    // A wrapped group keeps its body's room about its seed (second round): ROOM=round-one keeps the first round's.
    for (const seed of wrappers.wrappedSeeds(scope.groups)) room.set(seed, process.env.ROOM === "round-one"
      ? wrappers.wrapperPadding(tuning) + Math.max(layout.spatialNodeRadius(byId.get(seed), tuning), layout.filesRadius(scope.groups.get(seed) ?? 1, tuning))
      : Math.max(layout.spatialNodeRadius(byId.get(seed), tuning), shells.bodyShape(seed, (scope.groupFiles.get(seed) ?? []).map(id => byId.get(id)), tuning, seed).radius));
  }
  const nodes = [...data.nodes.filter(node => hops.has(node.id)), ...shellNodes].map(node => {
    const kept = cache.get(node.id);
    if (kept) { Object.assign(kept, node); return kept; }
    const fresh = { ...node }; cache.set(node.id, fresh); return fresh;
  });
  const links = [...data.links.filter(link => hops.has(link.source) && hops.has(link.target)), ...wires].map(link => ({ ...link }));
  const live = new Set(nodes.map(node => node.id));
  const kept = previous ? previous.order.slice(0, previous.shown).filter(id => live.has(id)) : [];
  const keptIds = new Set(kept);
  const layers = revealLayers(nodes, links, { asked: new Set([pin]) }, link => layout.linkPulls(link, 'connections', tuning));
  const order = kept.concat(layers.flat().filter(id => !keptIds.has(id)));
  const first = (layers[0]?.length ?? 0) + (layers[1]?.length ?? 0);
  const shown = Math.min(order.length, kept.length ? nextRevealCount(kept.length, order.length, tuning.revealFrames) : first);
  return { nodes: new Map(nodes.map(node => [node.id, node])), links, order, shown, room, held };
}

function run(popped, previous, bornAt = new Map()) {
  const view = picture(popped, previous);
  let held = [];
  const simulation = forceSimulation([], 3).stop();
  const motion = layout.motionForce({ tuning: () => tuning, layout: () => 'connections', links: () => held, strength: () => 1,
    readyToAnchor: () => view.shown >= view.order.length, clearance: node => view.room.get(node.id) });
  simulation.force('motion', motion);
  let onScreen = new Set(previous ? previous.order.slice(0, previous.shown) : []);
  const feed = () => {
    const ids = new Set(view.order.slice(0, view.shown));
    const nodes = [...view.nodes.values()].filter(node => ids.has(node.id));
    const links = view.links.filter(link => ids.has(typeof link.source === 'string' ? link.source : link.source.id) && ids.has(typeof link.target === 'string' ? link.target : link.target.id));
    for (const link of links) { link.source = view.nodes.get(typeof link.source === 'string' ? link.source : link.source.id); link.target = view.nodes.get(typeof link.target === 'string' ? link.target : link.target.id); }
    for (const node of nodes) { const at = bornAt.get(node.id); if (at && !onScreen.has(node.id)) { node.x = at.x; node.y = at.y; node.z = at.z; bornAt.delete(node.id); } }
    for (const [id, start] of layout.placeNewSpheres(nodes, links, tuning, 'connections')) Object.assign(view.nodes.get(id), start);
    onScreen = new Set(nodes.map(node => node.id));
    held = links; simulation.nodes(nodes);
  };
  feed();
  motion.wake(previous ? 'hold' : 'unfold');
  if (!previous) simulation.tick(REVEAL.warmup);
  let frames = 0;
  const trace = [];
  evaluations = 0; sphereEvaluations = 0;
  while ((!motion.still || view.shown < view.order.length) && frames < 20000) {
    const before = evaluations;
    simulation.tick(); frames++;
    trace.push(evaluations - before);
    if (view.shown < view.order.length) { view.shown = nextRevealCount(view.shown, view.order.length, tuning.revealFrames); feed(); motion.stir(); }
  }
  return { view, frames, still: motion.still, evaluations, sphereEvaluations, trace };
}

const started = Date.now();
const first = run(new Set());
const shellCount = first.view.held.shells.length;
console.log(JSON.stringify({ base, pin, look, depth: tuning.shellDepth, spheres: first.view.nodes.size, shells: shellCount,
  files: first.view.held.shells.reduce((sum, shell) => sum + shell.files.length, 0), frames: first.frames, evaluations: first.evaluations, perTick: +(first.evaluations / first.frames).toFixed(2), still: first.still, ms: Date.now() - started }));

if (process.env.TRACE) {
  // Evaluations a tick, by fifty ticks, and each shell's contacts at rest: where the work went.
  const t = first.trace, buckets = [];
  for (let i = 0; i < t.length; i += 50) buckets.push(t.slice(i, i + 50).reduce((a, b) => a + b, 0));
  console.log('evaluations by 50 ticks', buckets.join(' '));
  const after = moves.slice(REVEAL.warmup), anchored = after.findIndex(tick => tick.held);
  console.log('anchored at tick', anchored, 'of', after.length, 'moves by 25 ticks', Array.from({ length: Math.ceil(after.length / 25) }, (_, i) => Math.max(...after.slice(25 * i, 25 * i + 25).map(tick => tick.move)).toExponential(1)).join(' '));
  const nodes = [...first.view.nodes.values()].filter(node => Number.isFinite(node.x));
  const radius = node => Math.max(layout.spatialNodeRadius(node, tuning), first.view.room.get(node.id) ?? 0);
  const centre = nodes.reduce((c, n) => ({ x: c.x + n.x / nodes.length, y: c.y + n.y / nodes.length, z: c.z + n.z / nodes.length }), { x: 0, y: 0, z: 0 });
  for (const node of nodes.filter(node => node.archetype === 'shell')) {
    const contacts = nodes.filter(other => other !== node && Math.hypot(other.x - node.x, other.y - node.y, other.z - node.z) < radius(node) + radius(other) + tuning.collisionGap).length;
    const wires = first.view.links.filter(link => (link.source.id ?? link.source) === node.id || (link.target.id ?? link.target) === node.id).length;
    console.log(node.id, 'radius', radius(node).toFixed(1), 'wires', wires, 'contacts', contacts, 'from centre', Math.hypot(node.x - centre.x, node.y - centre.y, node.z - centre.z).toFixed(0));
  }
}

if (process.env.TRACE) {
  // The stiffest spheres at rest, which set every tick's substeps: their springs' share and the rest.
  const field = lastField, ids = [...first.view.nodes.values()].filter(node => Number.isFinite(node.x)).map(node => node.id);
  const nodes = first.view.nodes;
  const x = Float64Array.from(ids.flatMap(id => [nodes.get(id).x, nodes.get(id).y, nodes.get(id).z]));
  if (field.count === ids.length) {
    const reading = field.forces(x, new Float64Array(x.length));
    const stiff = [...field.scratch.stiffness].map((value, i) => ({ id: ids[i], value, springs: field.springStiffness[i] })).sort((a, b) => b.value - a.value).slice(0, 6);
    console.log('greatest stiffness', reading.stiffness.toFixed(2), 'step allowed', Math.sqrt(2 / reading.stiffness).toFixed(3));
    for (const s of stiff) console.log('  ', s.id, s.value.toFixed(2), 'springs', s.springs.toFixed(2));
  }
  // Each pair in contact at rest that a shell is in: how far inside the clearance, and the wire between them if any.
  const placed = [...nodes.values()].filter(node => Number.isFinite(node.x));
  const radius = node => Math.max(layout.spatialNodeRadius(node, tuning), first.view.room.get(node.id) ?? 0);
  for (const a of placed) for (const b of placed) {
    if (a.id >= b.id || (a.archetype !== 'shell' && b.archetype !== 'shell')) continue;
    const r = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z), clearance = radius(a) + radius(b) + tuning.collisionGap;
    if (r >= clearance) continue;
    const wire = first.view.links.find(link => [link.source.id ?? link.source, link.target.id ?? link.target].sort().join() === [a.id, b.id].sort().join());
    console.log('contact', a.id, b.id, 'inside by', (clearance - r).toFixed(2), 'wire count', wire?.count ?? 0,
      'rest', wire ? layout.spatialLinkDistance({ source: a, target: b, count: wire.count }, tuning).toFixed(1) : '-', 'clearance', clearance.toFixed(1));
  }
}
