// What the Structure layout's bubbles cost to pack, headless (2026-11-07, the bag of cells), by the third round's
// `pack.cjs` method: the bundle's structure tree as the page builds it, its bubbles for the start with nothing pinned and
// for the directories opened (OPEN, a comma list), each `bodyShape` timed (the least of REPEAT runs, the process's
// processor time), and the whole repository packed from the leaves as one bubble, the root's, which holds everything.
// Run from the repository root with `npx tsx`, after building the bundle; switches: BASE (a folder with
// `explorer-data.json`), HOPS (1), OPEN, REPEAT (3).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { explorerGraphOf } = require(path.join(root, 'packages/explorer/src/shared/graph.ts'));
const { directoryNodeId, spatialGraphOf } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphData.ts'));
const { getDefaultTuning } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const layout = require(path.join(root, 'packages/explorer/src/client/views/forceGraphLayout.ts'));
const { spatialScope } = require(path.join(root, 'packages/explorer/src/client/views/forceGraphScope.ts'));
const shells = require(path.join(root, 'packages/explorer/src/client/views/forceGraphShells.ts'));

const base = process.env.BASE || 'dist/explorer', hops = Number(process.env.HOPS || 1), repeat = Number(process.env.REPEAT || 3);
const open = (process.env.OPEN || '').split(',').filter(Boolean);
const tuning = { ...getDefaultTuning().forceGraph, groupWrappers: 'skin', hops };
const bundle = JSON.parse(fs.readFileSync(path.resolve(root, base, 'explorer-data.json'), 'utf8'));
const tree = spatialGraphOf(explorerGraphOf(bundle.graph), node => (node.archetype || '').toLowerCase() !== 'asset', [], 'structure');
const byId = new Map(tree.nodes.map(node => [node.id, node]));
const cpu = () => { const used = process.cpuUsage(); return (used.user + used.system) / 1000; };
const time = (seed, files, directory) => {
  let best = Infinity, shape;
  for (let i = 0; i < repeat; i++) { const started = cpu(); shape = shells.bodyShape(seed, files, tuning, undefined, directory); best = Math.min(best, cpu() - started); }
  return { shape, ms: +best.toFixed(1) };
};
const scope = spatialScope(tree.nodes, tree.links, new Set([directoryNodeId(''), ...open.map(directoryNodeId)]), hops, link => layout.linkPulls(link, 'structure'));
const { cells, lone } = shells.structureCells(tree.nodes, tree.links, new Set(scope.hops.keys()));
const rows = cells.map(cell => {
  const { shape, ms } = time(cell.id, cell.files.map(id => byId.get(id)), cell.directory);
  return { id: cell.id, files: cell.files.length, radius: +shape.radius.toFixed(1), drawn: shape.units.filter(unit => unit.kind === 'file').length, bubbles: shape.units.filter(unit => unit.kind === 'directory').length, ms };
});
const leaves = tree.nodes.filter(node => node.directoryPath === undefined);
const whole = time(directoryNodeId(''), leaves, '');
console.log(JSON.stringify({ base, hops, open, cells: rows.length, lone: lone.map(item => item.file), totalMs: +rows.reduce((sum, row) => sum + row.ms, 0).toFixed(1), rows }));
console.log(JSON.stringify({ whole: { files: leaves.length, radius: +whole.shape.radius.toFixed(1), drawn: whole.shape.units.filter(unit => unit.kind === 'file').length,
  bubbles: whole.shape.units.filter(unit => unit.kind === 'directory').length, veiled: whole.shape.units.filter(unit => unit.veiled).length, ms: whole.ms } }));
