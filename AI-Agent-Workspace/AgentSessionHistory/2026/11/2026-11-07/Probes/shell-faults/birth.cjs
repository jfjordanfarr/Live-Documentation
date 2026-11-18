// Where a picture's directory shells are born (2026-11-07, third round): the 3D page's pinned picture with shells, as
// the second round's twin builds it, revealed a piece a frame as the page reveals it, each piece placed by
// `placeNewSpheres` and nothing moved, so that the places are the births alone. Prints how straight the shells stand
// (the share of their spread along their first principal axis, one for a line), how far they reach from the files'
// centroid, and the shells in order along that axis. Run from the repository root with `npx tsx`; switches: BASE (a
// folder with `explorer-data.json`), PIN, DEPTH (the Shell Depth), HOPS.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { explorerGraphOf } = require(path.join(root, 'packages/explorer/src/shared/graph.ts'));
const { spatialGraphOf } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphData.ts'));
const { getDefaultTuning } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const layout = require(path.join(root, 'packages/explorer/src/client/views/forceGraphLayout.ts'));
const { spatialScope } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphScope.ts'));
const { nextRevealCount, revealLayers } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphReveal.ts'));
const shells = require(path.join(root, 'packages/explorer/src/client/views/forceGraphShells.ts'));

const base = process.env.BASE || 'dist/explorer';
const pin = process.env.PIN || 'packages/explorer/src/client/views/forceGraphView.ts';
const tuning = { ...getDefaultTuning().forceGraph, groupWrappers: 'skin', shellDepth: Number(process.env.DEPTH || 2), ...(process.env.HOPS ? { hops: Number(process.env.HOPS) } : {}) };
const bundle = JSON.parse(fs.readFileSync(path.resolve(root, base, 'explorer-data.json'), 'utf8'));
const data = spatialGraphOf(explorerGraphOf(bundle.graph), node => (node.archetype || '').toLowerCase() !== 'asset', [], 'connections');
const pulls = link => layout.linkPulls(link, 'connections');
const byId = new Map(data.nodes.map(node => [node.id, node]));
const scope = spatialScope(data.nodes, data.links, new Set([pin]), tuning.hops, pulls);
const held = shells.shellPicture({ nodes: byId, links: data.links, shown: new Set(scope.hops.keys()), hidden: scope.hidden, depth: tuning.shellDepth,
  popped: new Set(), beside: scope.beside, bundles: link => pulls(link) && link.kind !== 'related-doc' && link.kind !== 'cited-by' });
const hops = new Map(scope.hops);
const shellNodes = held.shells.map(shell => ({ id: shell.id, name: shell.name, codeRelativePath: shell.directory, archetype: 'shell', shellFiles: shell.files.length, publicSymbols: [],
  shellBody: shells.bodyShape(shell.id, shell.files.map(id => byId.get(id)), tuning, undefined, shell.directory).radius }));
for (const node of shellNodes) hops.set(node.id, tuning.hops + 1);
const nodes = new Map([...data.nodes.filter(node => hops.has(node.id)), ...shellNodes].map(node => [node.id, { ...node }]));
const links = [...data.links.filter(link => hops.has(link.source) && hops.has(link.target)), ...held.wires];
const order = revealLayers([...nodes.values()], links, { asked: new Set([pin]) }, link => layout.linkPulls(link, 'connections', tuning)).flat();
let shown = 0;
const first = order.length;
for (let frame = 0; shown < order.length; frame++) {
  shown = frame === 0 ? Math.min(order.length, 1) : nextRevealCount(shown, order.length, tuning.revealFrames);
  const ids = new Set(order.slice(0, shown)), piece = [...nodes.values()].filter(node => ids.has(node.id));
  const wired = links.filter(link => ids.has(link.source) && ids.has(link.target)).map(link => ({ ...link, source: nodes.get(link.source), target: nodes.get(link.target) }));
  for (const [id, start] of layout.placeNewSpheres(piece, wired, tuning, 'connections')) Object.assign(nodes.get(id), start);
}
void first;
const born = [...nodes.values()].filter(node => node.shellFiles !== undefined);
const files = [...nodes.values()].filter(node => node.shellFiles === undefined);
const mean = list => list.reduce((m, n) => ({ x: m.x + n.x / list.length, y: m.y + n.y / list.length, z: m.z + n.z / list.length }), { x: 0, y: 0, z: 0 });
const m = mean(born), f = mean(files);
const c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
for (const n of born) { const d = [n.x - m.x, n.y - m.y, n.z - m.z]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c[i][j] += d[i] * d[j]; }
let v = [1, 0.5, 0.25];
for (let k = 0; k < 200; k++) { const w = c.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]); const n = Math.hypot(...w); v = w.map(x => x / n); }
const top = c.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]).reduce((s, x, i) => s + x * v[i], 0), trace = c[0][0] + c[1][1] + c[2][2];
const filesReach = Math.max(...files.map(n => Math.hypot(n.x - f.x, n.y - f.y, n.z - f.z)));
const reach = born.map(n => Math.hypot(n.x - f.x, n.y - f.y, n.z - f.z)).sort((a, b) => a - b);
console.log(JSON.stringify({ base, pin, files: files.length, shells: born.length, straightness: +(top / trace).toFixed(3), filesReach: +filesReach.toFixed(0),
  shellReach: { least: +reach[0].toFixed(0), median: +reach[Math.floor(reach.length / 2)].toFixed(0), most: +reach[reach.length - 1].toFixed(0) } }));
if (process.env.LIST) for (const n of born.map(n => ({ id: n.id, along: +((n.x - m.x) * v[0] + (n.y - m.y) * v[1] + (n.z - m.z) * v[2]).toFixed(0), fromFiles: +Math.hypot(n.x - f.x, n.y - f.y, n.z - f.z).toFixed(0) })).sort((a, b) => a.along - b.along)) console.log(JSON.stringify(n));
