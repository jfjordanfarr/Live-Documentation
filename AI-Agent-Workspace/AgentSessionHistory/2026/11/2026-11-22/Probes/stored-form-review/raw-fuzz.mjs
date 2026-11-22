// Probe of 2026-11-22 (not product code), the stored form's review: mutants made inside the sections, below the
// hashes, which the package's fuzzer never makes (its mutations are of the stored bytes, so a hash or the inflater
// refuses nearly all of them before any section's grammar is read). Each mutant changes one uncompressed section and
// is set down again with every hash and the end right, so that it reaches the grammar's checks. Two oracles:
//
// - **One set of facts, one name.** Whatever the module accepts, written again from the facts it read, must give the
//   same content name and the same text. An accepted file that is not in its one form shows here as a second name.
// - **A blind reader.** The Python reader written from the specification alone (its record is
//   `../stored-form-second-reader/`) predates the symbols' documentation list, so it is asked only about bases with no
//   symbols. It and the module must agree: the same text, or both refuse.
//
//   node <this folder>/raw-fuzz.mjs <repository root> <mutants> <out.json>
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { deflateRawSync, inflateRawSync } from "node:zlib";

const run = promisify(execFile);
const [root, howMany, out] = process.argv.slice(2);
const M = await import(path.join(root, "packages/stored-form/src/storedForm.ts"));
const T = await import(path.join(root, "packages/stored-form/test/testScans.ts"));
const python = path.join(root, "AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-second-reader/python-reader/reader.py");
const scratch = path.join(os.tmpdir(), `stored-form-raw-fuzz-${process.pid}`);
mkdirSync(scratch, { recursive: true });

const SIGNATURE = Buffer.from([0x89, 0x46, 0x50, 0x4b, 0x0d, 0x0a, 0x1a, 0x0a]);
const sha = (b) => createHash("sha256").update(b).digest();
function framesOf(bytes) {
  const out = [];
  for (let at = 8; at < bytes.length; ) {
    const stored = bytes.readUInt32LE(at + 9);
    out.push({ kind: bytes[at], count: bytes.readUInt32LE(at + 1), raw: inflateRawSync(bytes.subarray(at + 45, at + 45 + stored)) });
    at += 45 + stored;
  }
  return out;
}
function framed(frames) {
  const parts = [SIGNATURE];
  const hashes = [];
  frames.forEach((f) => {
    const raw = f.kind === 6 ? sha(Buffer.concat(hashes)) : f.raw;
    const hash = sha(raw);
    hashes.push(hash);
    const stored = deflateRawSync(raw);
    const header = Buffer.alloc(13);
    header[0] = f.kind;
    header.writeUInt32LE(f.kind === 6 ? frames.length - 1 : f.count, 1);
    header.writeUInt32LE(raw.length, 5);
    header.writeUInt32LE(stored.length, 9);
    parts.push(header, hash, stored);
  });
  return Buffer.concat(parts);
}

const noSymbols = (scan) => ({ ...scan, files: scan.files.map((f) => ({ ...f, symbols: [] })) });
const scans = [
  ["everyFact", T.everyFact(), false],
  ["seeded 3 x 40", T.seededScan(3, 40), false],
  ["seeded 9 x 300", T.seededScan(9, 300), false],
  ["everyFact, no symbols", noSymbols(T.everyFact()), true],
  ["seeded 4 x 40, no symbols", noSymbols(T.seededScan(4, 40)), true]
];
const bases = [];
for (const [name, scan, blind] of scans) {
  const w = await M.writeScan(scan);
  if (!w.ok) throw new Error(`${name}: ${w.reason}`);
  bases.push({ name, frames: framesOf(Buffer.from(w.value)), blind });
}

function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const INTERESTING = [0, 1, 2, 0x7f, 0x80, 0x81, 0xbf, 0xc0, 0xc3, 0xe0, 0xed, 0xef, 0xf0, 0xf4, 0xf5, 0xff, 0x2f, 0x5c, 0x3a, 0x2e];

/** One mutant: a section's uncompressed bytes changed in one of nine ways, by the seed alone. */
function mutant(seed) {
  const next = random(seed);
  const int = (n) => Math.floor(next() * n);
  const base = bases[seed % bases.length];
  const frames = base.frames.map((f) => ({ ...f, raw: Buffer.from(f.raw) }));
  const choices = frames.map((f, i) => i).filter((i) => frames[i].kind !== 6 && frames[i].raw.length > 0);
  const i = choices[int(choices.length)];
  const f = frames[i];
  const at = int(f.raw.length);
  const how = int(9);
  let what;
  switch (how) {
    case 0:
      f.raw[at] ^= 1 << int(8);
      what = "a bit flipped";
      break;
    case 1:
      f.raw[at] = INTERESTING[int(INTERESTING.length)];
      what = "a byte set";
      break;
    case 2:
      f.raw = Buffer.concat([f.raw.subarray(0, at), Buffer.from([INTERESTING[int(INTERESTING.length)]]), f.raw.subarray(at)]);
      what = "a byte put in";
      break;
    case 3:
      f.raw = Buffer.concat([f.raw.subarray(0, at), f.raw.subarray(at + 1)]);
      what = "a byte taken out";
      break;
    case 4:
      // A one-byte number written in two: b as (b | 0x80) 0x00, which no shortest form writes.
      if (f.raw[at] < 0x80) f.raw = Buffer.concat([f.raw.subarray(0, at), Buffer.from([f.raw[at] | 0x80, 0]), f.raw.subarray(at + 1)]);
      what = "a number written longer";
      break;
    case 5:
      f.count = Math.max(0, f.count + (next() < 0.5 ? -1 : 1));
      what = "a count one off";
      break;
    case 6: {
      // Two bytes swapped: in the strings, two strings' letters; in the records, two numbers.
      const j = int(f.raw.length);
      [f.raw[at], f.raw[j]] = [f.raw[j], f.raw[at]];
      what = "two bytes swapped";
      break;
    }
    case 7:
      f.raw[at] = (f.raw[at] + (next() < 0.5 ? 1 : 255)) & 0xff;
      what = "a byte one off";
      break;
    default:
      f.raw = f.raw.subarray(0, at);
      what = "a section cut";
  }
  return { base, kind: ["", "head", "strings", "records", "paths", "wires"][f.kind], what, bytes: framed(frames) };
}

const findings = [];
const tally = { mutants: 0, accepted: 0, refused: 0, blindAsked: 0 };
const reasons = new Map();
const jobs = Array.from({ length: Number(howMany) }, (_, seed) => seed);
async function one(seed) {
  const { base, kind, what, bytes } = mutant(seed);
  tally.mutants += 1;
  const read = await M.readScan(bytes);
  let text;
  if (read.ok) {
    tally.accepted += 1;
    const again = await M.writeScan({ head: read.value.head, files: read.value.files });
    const t = await M.textOf(bytes);
    text = t.ok ? t.value : `refused: ${t.reason}`;
    if (!again.ok) findings.push({ seed, base: base.name, kind, what, finding: `accepted, but its facts cannot be written again: ${again.reason}` });
    else {
      const second = await M.readScan(again.value);
      if (!second.ok || second.value.name !== read.value.name) findings.push({ seed, base: base.name, kind, what, finding: `accepted, and its facts written again have another name: ${read.value.name} against ${second.ok ? second.value.name : second.reason}` });
      const t2 = await M.textOf(again.value);
      if (!t2.ok || t2.value !== text) findings.push({ seed, base: base.name, kind, what, finding: "accepted, and its facts written again have another text" });
    }
  } else {
    tally.refused += 1;
    const key = read.reason.replace(/^the facts of "[^"]*": /u, "").replace(/\d+/gu, "N").replace(/"(?:[^"\\]|\\.)*"/gu, "S");
    reasons.set(key, (reasons.get(key) ?? 0) + 1);
  }
  if (base.blind) {
    tally.blindAsked += 1;
    const file = path.join(scratch, `m${seed}.fpk`);
    writeFileSync(file, bytes);
    let answer;
    try {
      answer = (await run("python3", ["-I", python, "read", file], { maxBuffer: 1 << 28, timeout: 60_000 })).stdout;
    } catch (error) {
      answer = error.stdout ?? `failed: ${error.message}`;
    }
    rmSync(file);
    const blindRefused = answer.startsWith("refused:");
    if (read.ok !== !blindRefused || (read.ok && answer !== text)) {
      findings.push({ seed, base: base.name, kind, what, finding: `the module ${read.ok ? "reads it" : `refuses it (${read.reason})`}; the blind reader ${blindRefused ? answer.trim() : "reads it"}${read.ok && !blindRefused ? (answer === text ? ", the same text" : ", another text") : ""}` });
    }
  }
}
const queue = [...jobs];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let seed = queue.shift(); seed !== undefined; seed = queue.shift()) await one(seed);
}));
rmSync(scratch, { recursive: true, force: true });
const byReason = [...reasons].sort((a, b) => b[1] - a[1]);
writeFileSync(out, `${JSON.stringify({ tally, findings, refusals: Object.fromEntries(byReason) }, null, 1)}\n`);
console.log(JSON.stringify(tally), `${findings.length} findings; ${byReason.length} distinct refusals`);
for (const f of findings.slice(0, 20)) console.log(JSON.stringify(f));
