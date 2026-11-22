#!/usr/bin/env node
// The independent key for the command-line arm's two repository questions of 2026-11-22 (README.md beside this
// file): what a file reaches, and what a change to a file touches. It asks TypeScript's own compiler, which shares no
// mechanism with Live Documentation's readers: `ts.preProcessFile` lists each file's imports (`import`, `import type`,
// `export … from`, a literal `import()` and `require`), and `ts.resolveModuleName` resolves each under the
// repository's tsconfig.base.json (its `paths` included). Code files only: .ts, .tsx, .mts, .cts, .js, .mjs, .cjs.
//
// Usage: node import-oracle.mjs <checkout> <tracked-files.txt> --reach <file> | --touch <file>
//   --reach: every code file the file reaches through imports, nearest first, with its hops.
//   --touch: every code file that reaches the file through imports (what a change to it touches), nearest first.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [checkout, trackedList, mode, subject] = process.argv.slice(2);
const ts = createRequire(path.join(checkout, 'package.json'))('typescript');
const code = /\.(ts|tsx|mts|cts|js|mjs|cjs)$/;
const files = fs.readFileSync(trackedList, 'utf8').split('\n').filter((f) => code.test(f) && !f.startsWith('AI-Agent-Workspace/') && !f.endsWith('.d.ts'));
const known = new Set(files);
const config = ts.parseJsonConfigFileContent(ts.readConfigFile(path.join(checkout, 'tsconfig.base.json'), ts.sys.readFile).config, ts.sys, checkout);
const options = { ...config.options, allowJs: true, moduleResolution: ts.ModuleResolutionKind.Bundler, baseUrl: checkout };
const outbound = new Map();
for (const file of files) {
  const text = fs.readFileSync(path.join(checkout, file), 'utf8');
  const { importedFiles } = ts.preProcessFile(text, true, true);
  const targets = new Set();
  for (const { fileName } of importedFiles) {
    const resolved = ts.resolveModuleName(fileName, path.join(checkout, file), options, ts.sys).resolvedModule;
    if (!resolved) continue;
    const relative = path.relative(checkout, resolved.resolvedFileName).split(path.sep).join('/');
    if (known.has(relative) && relative !== file) targets.add(relative);
  }
  outbound.set(file, targets);
}
const inbound = new Map(files.map((f) => [f, new Set()]));
for (const [from, targets] of outbound) for (const to of targets) inbound.get(to).add(from);
const edges = mode === '--reach' ? outbound : inbound;
if (!known.has(subject)) { console.error(`not a code file of the checkout: ${subject}`); process.exit(2); }
const hops = new Map([[subject, 0]]);
let frontier = [subject];
while (frontier.length) {
  const next = [];
  for (const file of frontier) for (const neighbour of [...edges.get(file)].sort()) {
    if (hops.has(neighbour)) continue;
    hops.set(neighbour, hops.get(file) + 1);
    next.push(neighbour);
  }
  frontier = next;
}
hops.delete(subject);
console.log(`${mode === '--reach' ? 'reached from' : 'reaching'} ${subject}: ${hops.size} code files`);
for (const [file, n] of [...hops].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))) console.log(`${n}\t${file}`);
