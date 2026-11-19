#!/usr/bin/env node
// Runs many blind playtesters in batches: a few at a time under the shared browser lock, then the lock left free for a
// while so that a gate or timing run waiting for it exclusively gets in. Made on 2026-11-18 for the first ladder of
// models (AI-Agent-Workspace/scripts/playtest/README.md).
//
// Usage:
//   node AI-Agent-Workspace/scripts/playtest/ladder.mjs --plan <plan.json> --into <records folder> [--parallel 4] [--gap 30]
//
// The plan is a list of runs: { "name", "task", "model", "effort", "variant" }. Each run goes to <into>/<name>; a run
// whose folder already holds a finished run.json is skipped, so a ladder that stopped is resumed by running it again.
// One server serves the site for the whole ladder, so that no run's end stops the site under another.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const planFile = option('--plan');
const into = option('--into');
const parallel = Number(option('--parallel', '4'));
const gapSeconds = Number(option('--gap', '30'));
if (!planFile || !into) { console.error('usage: ladder.mjs --plan <plan.json> --into <records folder> [--parallel 4] [--gap 30]'); process.exit(2); }

// Finished means the tester gave a result; a run stopped before it did (outcome "no result") is run again, afresh.
const finished = (name) => {
  try { const run = JSON.parse(fs.readFileSync(path.join(into, name, 'run.json'), 'utf8')); return Boolean(run.finishedAt) && run.outcome !== 'no result'; } catch { return false; }
};
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8')).filter((run) => !finished(run.name));
console.log(`${plan.length} runs to do, ${parallel} at a time`);

const port = 8792;
const serving = async () => { try { return (await fetch(`http://127.0.0.1:${port}/`)).ok; } catch { return false; } };
let server = null;
if (!await serving()) {
  const mainCheckout = path.dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: here, encoding: 'utf8' }).trim());
  const httpServer = createRequire(import.meta.url).resolve('http-server/bin/http-server');
  server = spawn(process.execPath, [httpServer, path.join(mainCheckout, 'dist', 'explorer'), '-a', '127.0.0.1', '-p', String(port), '-c-1', '--silent'], { stdio: 'ignore' });
  for (let i = 0; i < 50 && !await serving(); i++) await new Promise((r) => setTimeout(r, 200));
}

const one = (run) => new Promise((resolve) => {
  fs.rmSync(path.join(into, run.name), { recursive: true, force: true }); // what a stopped run left, never a finished one
  const child = spawn(process.execPath, [path.join(here, 'playtest.mjs'), '--task', run.task, '--model', run.model, '--effort', run.effort,
    '--variant', run.variant, '--out', path.join(into, run.name)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let said = '';
  child.stdout.on('data', (chunk) => { said += chunk; });
  child.stderr.on('data', (chunk) => { said += chunk; });
  child.on('close', (code) => { console.log(`${new Date().toISOString()} ${run.name}: ${said.split('\n')[0]}${code ? ` (exit ${code})` : ''}`); resolve(); });
});

for (let i = 0; i < plan.length; i += parallel) {
  if (i > 0) await new Promise((r) => setTimeout(r, gapSeconds * 1000));
  await Promise.all(plan.slice(i, i + parallel).map(one));
}
server?.kill();
console.log(`Judge the runs, link the pictures the findings rest on from ${path.join(into, 'README.md')}, then keep only those:`);
console.log(`  node ${path.relative(process.cwd(), path.join(here, 'keep-pictures.mjs'))} ${path.relative(process.cwd(), into)}`);
