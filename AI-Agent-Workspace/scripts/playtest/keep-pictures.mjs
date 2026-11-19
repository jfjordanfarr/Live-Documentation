#!/usr/bin/env node
// Keeps in a playtest records folder only the pictures a reader of its findings needs, and moves the rest out of the
// repository. Made on 2026-11-19, after half a ladder of runs came to 16 MB of pictures; the owner has asked that
// pictures be kept when a change needs looking at, not as a matter of course (AI-Agent-Workspace/scripts/playtest/README.md).
//
// Usage, after the runs are judged and the folder's README cites the pictures its findings rest on:
//   node AI-Agent-Workspace/scripts/playtest/keep-pictures.mjs <records folder> [--to <folder>]
//
// A run keeps its first picture, its last, and every picture the records folder's README links to
// (`<run>/shots/<file>.png`). The others move to <folder>/<run>/shots/, by default the main checkout's
// AI-Agent-Workspace/tmp/playtests/, which git ignores; actions.jsonl goes on naming them. A picture the README cites
// that was moved out earlier is moved back, so the step can be run again after the README changes.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const records = args[0] && path.resolve(args[0]);
if (!records || !fs.existsSync(path.join(records, 'README.md'))) {
  console.error('usage: keep-pictures.mjs <records folder with a README.md> [--to <folder>]');
  process.exit(2);
}
const toIndex = args.indexOf('--to');
const mainCheckout = path.dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: here, encoding: 'utf8' }).trim());
const away = path.resolve(toIndex >= 0 ? args[toIndex + 1] : path.join(mainCheckout, 'AI-Agent-Workspace', 'tmp', 'playtests'));

const cited = new Set([...fs.readFileSync(path.join(records, 'README.md'), 'utf8').matchAll(/\(([\w.-]+\/shots\/[\w.-]+\.png)\)/g)].map((m) => m[1]));
const move = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  try { fs.renameSync(from, to); } catch { fs.copyFileSync(from, to); fs.unlinkSync(from); }
};

let kept = 0, moved = 0, back = 0, keptBytes = 0, movedBytes = 0;
for (const run of fs.readdirSync(records).sort()) {
  const log = path.join(records, run, 'actions.jsonl');
  if (!fs.existsSync(log)) continue;
  const shots = fs.readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).shot).filter(Boolean);
  const keep = new Set([shots[0], shots.at(-1)].map((s) => `${run}/${s}`));
  for (const c of cited) if (c.startsWith(`${run}/`)) keep.add(c);
  for (const name of keep) {
    const there = path.join(away, name);
    if (!fs.existsSync(path.join(records, name)) && fs.existsSync(there)) { move(there, path.join(records, name)); back++; }
  }
  const dir = path.join(records, run, 'shots');
  for (const file of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const name = `${run}/shots/${file}`;
    const size = fs.statSync(path.join(dir, file)).size;
    if (keep.has(name)) { kept++; keptBytes += size; } else { move(path.join(dir, file), path.join(away, name)); moved++; movedBytes += size; }
  }
}
const missing = [...cited].filter((c) => !fs.existsSync(path.join(records, c)));
const mb = (b) => (b / 1e6).toFixed(1);
console.log(`kept ${kept} pictures (${mb(keptBytes)} MB), moved ${moved} (${mb(movedBytes)} MB) to ${away}, brought back ${back}`);
if (missing.length) { console.error(`cited but found nowhere: ${missing.join(', ')}`); process.exit(1); }
