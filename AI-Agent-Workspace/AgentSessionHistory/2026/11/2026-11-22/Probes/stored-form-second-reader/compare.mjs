#!/usr/bin/env node
// The second reader's answers set beside the module's (README.md beside this file). Written on 2026-11-22.
//
//   node compare.mjs <out.json> --reader "<command>" [--skip a,b] [--parallel 4] <dir>...
//
// Each <dir> holds samples and the module's answers.json (samples.ts answers). The reader is run once per sample as
// `<command> read <file>` for a .fpk and `<command> name <file>` for a .txt, alone in a process with a wall-clock limit
// and an address-space limit (prlimit), its standard output kept whole and its peak resident memory measured
// (peak.py, since GNU time is not installed). Every sample gets one of: same (the module's text byte for byte, or the module's content name),
// both refuse, or a disagreement named by what each did.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const option = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const [out, ...dirs] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const reader = option('--reader').split(' ');
const skip = new Set((option('--skip', '') ?? '').split(',').filter(Boolean));
const parallel = Number(option('--parallel', 4));
const MiB = 1024 * 1024;
const peakScript = path.join(path.dirname(new URL(import.meta.url).pathname), 'peak.py');

/** The limits: ten seconds and a gibibyte, and for a larger file a second and 256 bytes of address space per KiB. */
const limits = (size) => ({ seconds: 10 + Math.ceil(size / 1024 / 1024) * 60, bytes: 1024 * MiB + 256 * size });

function runOne(kind, file, size) {
  const { seconds, bytes } = limits(size);
  return new Promise((resolve) => {
    const began = Date.now();
    const child = spawn('/usr/bin/python3', ['-I', peakScript, 'prlimit', `--as=${bytes}`, '--', 'timeout', '-s', 'KILL', String(seconds), ...reader, kind, file], { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = []; let err = '';
    child.stdout.on('data', (c) => chunks.push(c));
    child.stderr.on('data', (c) => { err += c; });
    child.on('close', (code) => {
      const stdout = Buffer.concat(chunks);
      const lines = err.trim().split('\n');
      const peakKb = Number(lines.at(-1)) || null;
      resolve({ code, wallMs: Date.now() - began, stdout, stderr: lines.slice(0, -1).join('\n').slice(-2000), peakMb: peakKb && Math.round(peakKb / 1024), limitSeconds: seconds, limitMb: Math.round(bytes / MiB) });
    });
  });
}

async function pool(items, size, fn) {
  const results = []; let next = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i]); } }));
  return results;
}

const jobs = [];
for (const dir of dirs) {
  const answers = JSON.parse(fs.readFileSync(path.join(dir, 'answers.json'), 'utf8'));
  for (const [f, module] of Object.entries(answers)) if (!skip.has(f)) jobs.push({ dir, f, module });
}

const results = await pool(jobs, parallel, async ({ dir, f, module }) => {
  const file = path.join(dir, f);
  const size = fs.statSync(file).size;
  const kind = f.endsWith('.fpk') ? 'read' : 'name';
  const r = await runOne(kind, file, size);
  const text = r.stdout.toString('utf8');
  const oneRefusal = /^refused:[^\n]*\n?$/.test(text);
  let reader;
  if (r.code === 137 || r.code === 124) reader = 'killed at the time limit';
  else if (r.code !== 0 && /MemoryError|Cannot allocate|cannot allocate/.test(r.stderr)) reader = 'ran out of its memory limit';
  // The brief set what is printed, not the exit status: a one-line refusal with status 1 is a refusal.
  else if (r.code === 1 && oneRefusal) reader = 'refused';
  else if (r.code !== 0) reader = `exited ${r.code}`;
  else if (oneRefusal) reader = 'refused';
  else if (text.startsWith('refused:')) reader = 'refused, but not in one line';
  else reader = 'answered';
  let outcome;
  if (reader === 'refused' && !module.reads) outcome = 'both refuse';
  else if (reader === 'answered' && module.reads) {
    const same = kind === 'read' ? createHash('sha256').update(r.stdout).digest('hex') === module.textSha256 : text.trim() === module.name;
    outcome = same ? 'same' : 'both answer, differently';
  } else if (reader === 'refused' && module.reads) outcome = 'second reader refuses, module answers';
  else if (reader === 'answered' && !module.reads) outcome = 'second reader answers, module refuses';
  else outcome = `second reader ${reader}`;
  const line = { dir: path.basename(dir), file: f, size, kind, outcome, module: module.reads ? 'answers' : `refuses: ${module.reason}`, reader: reader === 'refused' || reader.startsWith('refused') ? text.trim().slice(0, 300) : reader === 'answered' ? `answered, ${r.stdout.length} bytes` : reader, stderr: r.stderr.slice(-600), wallMs: r.wallMs, peakMb: r.peakMb, limitSeconds: r.limitSeconds, limitMb: r.limitMb };
  if (outcome !== 'same' && outcome !== 'both refuse') console.log(`${outcome}: ${f} (${line.reader.slice(0, 160)})`);
  if (outcome === 'both answer, differently') fs.writeFileSync(`${out}.${f}.out`, r.stdout);
  return line;
});

const tally = {};
for (const r of results) { const key = `${r.dir} ${r.kind} ${r.outcome}`; tally[key] = (tally[key] ?? 0) + 1; }
const slowest = [...results].sort((a, b) => b.wallMs - a.wallMs).slice(0, 5).map((r) => `${r.file} ${r.wallMs} ms, ${r.peakMb} MB`);
const heaviest = [...results].sort((a, b) => b.peakMb - a.peakMb).slice(0, 5).map((r) => `${r.file} ${r.peakMb} MB of ${r.limitMb}`);
fs.writeFileSync(out, JSON.stringify({ reader: reader.join(' '), tally, slowest, heaviest, results }, null, 1));
console.log(JSON.stringify({ tally, slowest, heaviest }, null, 1));
