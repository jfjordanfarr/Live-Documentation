// A check of the links in documents the repository's audits leave out (the archive's records, summaries and
// inventories) and in Memory: every relative target exists, and every anchor names a heading of its target outside
// fenced blocks, by the engine's own slugger. Links inside fenced blocks are verbatim messages and are not checked.
// Usage, from the repository's root:
//   npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/scripts/check-record-links.mts [--since <git-rev>] <file.md>...
// With --since, only links on lines the file gained since that revision are checked; fences are not tracked then, so
// a link inside a newly copied message is reported and is the reader's to set aside.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createSlugger, slugText } from '../../packages/engine/src/tooling/githubSlugger.ts';

const args = process.argv.slice(2);
let since = '';
const files: string[] = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--since') { since = args[i + 1]; i += 1; } else files.push(args[i]);
}

const anchorsOf = new Map<string, Set<string>>();
function headingAnchors(file: string): Set<string> {
  const known = anchorsOf.get(file);
  if (known) return known;
  const slugger = createSlugger();
  const anchors = new Set<string>();
  let fence = '';
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const mark = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (mark && mark[1][0] === fence[0] && mark[1].length >= fence.length && line.trim() === mark[1]) fence = '';
      continue;
    }
    if (mark) { fence = mark[1]; continue; }
    const heading = /^ {0,3}#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) anchors.add(slugger.slug(slugText(heading[1])));
  }
  anchorsOf.set(file, anchors);
  return anchors;
}

let broken = 0;
let checked = 0;
for (const file of files) {
  let lines = fs.readFileSync(file, 'utf8').split('\n').map((text, index) => ({ text, number: index + 1 }));
  if (since) {
    const diff = execFileSync('git', ['diff', '-U0', since, '--', file], { encoding: 'utf8', maxBuffer: 1 << 28 });
    const added = new Set<number>();
    for (const hunk of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      for (let n = start; n < start + count; n += 1) added.add(n);
    }
    lines = lines.filter(line => added.has(line.number));
  }
  let fence = '';
  for (const { text, number } of lines) {
    const mark = /^ {0,3}(`{3,}|~{3,})/.exec(text);
    if (fence) { if (mark && mark[1][0] === fence[0] && mark[1].length >= fence.length && text.trim() === mark[1]) fence = ''; continue; }
    if (mark && !since) { fence = mark[1]; continue; }
    for (const link of text.matchAll(/\]\(([^()\s]+(?:\([^()\s]*\)[^()\s]*)*)\)/g)) {
      const target = link[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      checked += 1;
      const [rawPath, anchor] = target.split('#');
      const resolved = rawPath ? path.resolve(path.dirname(file), decodeURIComponent(rawPath)) : path.resolve(file);
      if (!fs.existsSync(resolved)) { broken += 1; console.log(`${file}:${number}: no such file: ${target}`); continue; }
      if (anchor !== undefined && anchor !== '' && resolved.endsWith('.md')) {
        if (/^L\d+/.test(anchor)) continue;
        if (!headingAnchors(resolved).has(decodeURIComponent(anchor))) { broken += 1; console.log(`${file}:${number}: no such heading: ${target}`); }
      }
    }
  }
}
console.log(`${checked} links checked, ${broken} broken`);
process.exit(broken ? 1 : 0);
