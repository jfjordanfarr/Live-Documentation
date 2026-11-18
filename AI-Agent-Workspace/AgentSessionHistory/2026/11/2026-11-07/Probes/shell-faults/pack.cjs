// What a picture's bodies cost to pack, headless (2026-11-07, third round): the 3D page's pinned picture with directory
// shells, as the second round's twin builds it, and each shell's and wrapped group's `bodyShape` timed, the largest
// first, with its files and the units of its own bubble. Run from the repository root with `npx tsx`, after building the
// bundle; switches: BASE (a folder with `explorer-data.json`), PIN, DEPTH (the Shell Depth), REPEAT (timings kept, the
// least of so many runs, 3), TOP (rows printed), DUMP, SHELLS (below).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { explorerGraphOf } = require(path.join(root, 'packages/explorer/src/shared/graph.ts'));
const { spatialGraphOf } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphData.ts'));
const { getDefaultTuning } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const layout = require(path.join(root, 'packages/explorer/src/client/views/forceGraphLayout.ts'));
const { spatialScope } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphScope.ts'));
// SHELLS names another build of the shells' module to time (a bundle of an older commit's, say), the source's by default.
const shells = require(path.resolve(root, process.env.SHELLS || 'packages/explorer/src/client/views/forceGraphShells.ts'));
const wrappers = require(path.join(root, 'packages/explorer/src/client/views/forceGraphWrappers.ts'));

const base = process.env.BASE || 'dist/explorer';
const pin = process.env.PIN || 'packages/explorer/src/client/views/forceGraphView.ts';
const tuning = { ...getDefaultTuning().forceGraph, groupWrappers: 'skin', shellDepth: Number(process.env.DEPTH || 2) };
const bundle = JSON.parse(fs.readFileSync(path.resolve(root, base, 'explorer-data.json'), 'utf8'));
const data = spatialGraphOf(explorerGraphOf(bundle.graph), node => (node.archetype || '').toLowerCase() !== 'asset', [], 'connections');
const pulls = link => layout.linkPulls(link, 'connections');
const byId = new Map(data.nodes.map(node => [node.id, node]));
const scope = spatialScope(data.nodes, data.links, new Set([pin]), tuning.hops, pulls);
const partitioned = performance.now();
const held = shells.shellPicture({ nodes: byId, links: data.links, shown: new Set(scope.hops.keys()), hidden: scope.hidden, depth: tuning.shellDepth,
  popped: new Set(), beside: scope.beside, bundles: link => pulls(link) && link.kind !== 'related-doc' && link.kind !== 'cited-by' });
const partitionMs = performance.now() - partitioned;
const bodies = [...held.shells.map(shell => ({ id: shell.id, files: shell.files, directory: shell.directory })),
  ...wrappers.wrappedSeeds(scope.groups).map(seed => ({ id: seed, files: scope.groupFiles.get(seed) ?? [], centre: seed }))];
const repeat = Number(process.env.REPEAT || 3);
// DUMP names a file to write every body's shape to, by id, with the most units any one of its bubbles packs: two
// builds' dumps compared tell which bodies' packings changed.
const dump = {};
// The time is the process's own processor time, not the clock's, so that other work on a shared machine counts less.
const cpu = () => { const used = process.cpuUsage(); return (used.user + used.system) / 1000; };
const rows = bodies.map(body => {
  const nodes = body.files.map(id => byId.get(id));
  let best = Infinity, shape;
  for (let i = 0; i < repeat; i++) {
    const started = cpu();
    shape = shells.bodyShape(body.id, nodes, tuning, body.centre, body.directory);
    best = Math.min(best, cpu() - started);
  }
  const bubble = new Map();
  for (const unit of shape.units) bubble.set(unit.parent ?? '', (bubble.get(unit.parent ?? '') ?? 0) + 1);
  dump[body.id] = { widest: Math.max(shape.outline.length, ...bubble.values()), shape };
  return { id: body.id, files: body.files.length, outline: shape.outline.length, units: shape.units.length, veiled: shape.units.filter(unit => unit.veiled).length,
    radius: +shape.radius.toFixed(2), ms: +best.toFixed(1) };
}).sort((a, b) => b.ms - a.ms);
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(dump));
console.log(JSON.stringify({ base, pin, partitionMs: +partitionMs.toFixed(1), bodies: rows.length, totalMs: +rows.reduce((sum, row) => sum + row.ms, 0).toFixed(1),
  files: rows.reduce((sum, row) => sum + row.files, 0), drawnUnits: rows.reduce((sum, row) => sum + row.units, 0) }));
for (const row of rows.slice(0, Number(process.env.TOP || 12))) console.log(JSON.stringify(row));
