// Headless twin of the Structure start's rest (2026-11-08): the picture the page builds with nothing pinned at HOPS hops,
// Off (every hub a hub, the spokes ruled by the sizes and the link gap) and with Group Wrappers on (the frontier hubs as
// bubbles of their packed bodies, a hub of one file as that file, each spoke as long as `structureSpokes` packs it with
// the gap: `collision` for the collision's gap, `link` for the tuning's link gap, each sphere born where its hub's packing
// holds it; or `none`, milestone 1's spokes, ruled by the two ends' radii and the link gap, each sphere born as the easing
// bears it), and eased by `easeSpatialLayout` until still. Prints the ticks to rest of each. Run from the repository root
// with `npx tsx`; switches: BASE (a folder with `explorer-data.json`), HOPS (1), GRAVITY (the tuning's unless set), GAPS (a comma list of none, collision,
// link).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { explorerGraphOf } = require(path.join(root, 'packages/explorer/src/shared/graph.ts'));
const { directoryNodeId, spatialGraphOf } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphData.ts'));
const { getDefaultTuning } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const layout = require(path.join(root, 'packages/explorer/src/client/views/forceGraphLayout.ts'));
const { spatialScope } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphScope.ts'));
const shells = require(path.join(root, 'packages/explorer/src/client/views/forceGraphShells.ts'));

const base = process.env.BASE || 'dist/explorer', hops = Number(process.env.HOPS || 1);
const tuning = { ...getDefaultTuning().forceGraph, hops, ...(process.env.GRAVITY !== undefined ? { gravity: Number(process.env.GRAVITY) } : {}) };
const bundle = JSON.parse(fs.readFileSync(path.resolve(root, base, 'explorer-data.json'), 'utf8'));
const tree = spatialGraphOf(explorerGraphOf(bundle.graph), node => (node.archetype || '').toLowerCase() !== 'asset', [], 'structure');
const pulls = link => layout.linkPulls(link, 'structure');
const shown = new Set(spatialScope(tree.nodes, tree.links, new Set([directoryNodeId('')]), hops, pulls).hops.keys());
const ease = (nodes, links) => layout.easeSpatialLayout(nodes, links, tuning, 'structure', { reveal: { asked: new Set([directoryNodeId('')]) } });

// Off: the page's picture with nothing placed; the easing bears each sphere as the page does.
const off = ease(tree.nodes.map(node => ({ ...node })), tree.links);
console.log(JSON.stringify({ base, hops, look: 'off', spheres: off.nodes.length, ticks: off.ticks, still: off.still }));

for (const gapName of (process.env.GAPS || 'none,collision,link').split(',')) {
  // `none`: the spokes ruled by the ends' radii and the link gap, as milestone 1 built them, births as the easing makes them.
  const gap = gapName === 'link' ? tuning.linkGap : tuning.collisionGap, packed = gapName !== 'none';
  const { cells, lone } = shells.structureCells(tree.nodes, tree.links, shown);
  const nodes = new Map(tree.nodes.filter(node => shown.has(node.id)).map(node => [node.id, { ...node }]));
  const links = tree.links.filter(link => shown.has(link.source) && shown.has(link.target)).map(link => ({ ...link }));
  for (const cell of cells) {
    const body = shells.bodyShape(cell.id, cell.files.map(id => tree.nodes.find(node => node.id === id)), tuning, undefined, cell.directory);
    Object.assign(nodes.get(cell.id), { shellFiles: cell.files.length, shellBody: body.radius });
  }
  for (const { hub, file, parent } of lone) {
    nodes.delete(hub);
    nodes.set(file, { ...tree.nodes.find(node => node.id === file) });
    if (parent && nodes.has(parent)) links.push({ source: parent, target: file, kind: 'containment', count: 1, forward: 1, backward: 0 });
  }
  const kept = links.filter(link => nodes.has(link.source) && nodes.has(link.target));
  const spokes = shells.structureSpokes(kept, new Set(nodes.keys()), id => layout.spatialNodeRadius(nodes.get(id), tuning), gap);
  if (packed) for (const link of kept) { const spoke = spokes.get(link.target); if (link.kind === 'containment' && spoke && spoke.hub === link.source) link.rest = spoke.rest; }
  // Every sphere born where its hub's packing holds it, about the root at the origin.
  const at = id => { const spoke = spokes.get(id); if (!spoke) return { x: 0, y: 0, z: 0 }; const hub = at(spoke.hub); return { x: hub.x + spoke.at.x, y: hub.y + spoke.at.y, z: hub.z + spoke.at.z }; };
  if (packed) for (const node of nodes.values()) Object.assign(node, at(node.id));
  const skin = ease([...nodes.values()], kept);
  console.log(JSON.stringify({ base, hops, look: 'skin', gap: gapName, spheres: skin.nodes.length, bubbles: cells.length, ticks: skin.ticks, still: skin.still }));
}
