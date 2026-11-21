// Probe of November 21, 2026 (not product code): a generator of histories that put every rule of git's rename
// detection to work, made by git itself (`git init`, then `git fast-import` fed one stream), for the rename oracle to
// hold the port to git where real histories never decide a rule. Each commit deletes some files and adds others: some
// copies or edits of what it deleted (a few lines changed or many, around the 50 % and 75 % bars), several identical
// sources for one destination, file names shared across folders and unique ones, empty files, binary files (a NUL in
// the first 8,000 bytes, or after them), CRLF text, executables and symbolic links. In about half the commits one of
// three scenarios is set up for the next, each made so that one rule decides (see `scenarios`). Seeded, so a case can
// be made again.
//   node rename-cases.mjs <new folder> <seed> <commits>
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [folder, seedText = "1", commitsText = "200"] = process.argv.slice(2);
let seed = Number(seedText) >>> 0 || 1;
const random = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 2 ** 32;
};
const pick = (list) => list[Math.floor(random() * list.length)];
const words = ["alpha", "beta", "gamma", "delta", "const x = 1;", "return y;", "}", "{", "", "import a from 'b';", "// note", "if (z) {", "end", "  value += 2;", "export default q;"];
const names = ["index.js", "util.js", "README.md", "a.txt", "b.txt", "main.c", "lib.rs", "data.bin", "notes.md", "x.js", "y.js", "z.js"];
const folders = ["", "src/", "src/core/", "lib/", "docs/", "test/", "test/unit/", "old/"];

function text(lines, crlf) {
  const body = Array.from({ length: lines }, () => (random() < 0.3 ? `${pick(words)} ${Math.floor(random() * 50)}` : pick(words)));
  return Buffer.from(body.join(crlf ? "\r\n" : "\n") + (random() < 0.8 ? (crlf ? "\r\n" : "\n") : ""));
}
function edit(bytes, share) {
  const lines = bytes.toString("latin1").split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    if (random() < share) lines[i] = random() < 0.5 ? `${pick(words)} ${Math.floor(random() * 1000)}` : "";
  }
  if (random() < share) lines.splice(Math.floor(random() * lines.length), 0, ...Array.from({ length: Math.floor(random() * 6) }, () => pick(words)));
  return Buffer.from(lines.join("\n"), "latin1");
}
function binary(size, early) {
  const bytes = Buffer.alloc(size);
  for (let i = 0; i < size; i += 1) bytes[i] = 32 + Math.floor(random() * 90);
  bytes[early ? Math.floor(random() * Math.min(size, 8000)) : Math.min(size - 1, 8000 + Math.floor(random() * 100))] = 0;
  return bytes;
}
function fresh() {
  const r = random();
  if (r < 0.05) return { mode: "100644", bytes: Buffer.alloc(0) };
  if (r < 0.1) return { mode: "100644", bytes: binary(200 + Math.floor(random() * 9000), random() < 0.7) };
  if (r < 0.14) return { mode: "120000", bytes: Buffer.from(pick(names)) };
  return { mode: random() < 0.1 ? "100755" : "100644", bytes: text(1 + Math.floor(random() * 80), random() < 0.15) };
}
const path = () => {
  for (;;) {
    const candidate = `${pick(folders)}${random() < 0.6 ? pick(names) : `f${Math.floor(random() * 400)}.${pick(["js", "txt", "md"])}`}`;
    if (!files.has(candidate) && ![...files.keys()].some((p) => p.startsWith(`${candidate}/`) || candidate.startsWith(`${p}/`))) return candidate;
  }
};
const files = new Map();
for (let i = 0; i < 40; i += 1) files.set(path(), fresh());

// Scenarios that make one rule of git's decide: their sources are made in one commit, kept out of the random churn,
// and in the next commit deleted with their destination added.
const reserved = new Set();
const triggers = [];
const put = (p, bytes, mode = "100644") => {
  if (files.has(p)) return;
  files.set(p, { mode, bytes });
  reserved.add(p);
};
const drop = (p) => {
  files.delete(p);
  reserved.delete(p);
};
const scenarios = [
  (c) => {
    // A destination whose file name only one source shares, while another source with another name is more alike:
    // git's pass over unique file names pairs the first if it is at least 75 % alike, before the full comparison.
    const a = text(20 + Math.floor(random() * 40), false);
    const b = edit(a, pick([0.05, 0.15, 0.3, 0.45]));
    const pa = `${pick(folders)}u${c}.js`;
    const pb = `${pick(folders)}v${c}.js`;
    put(pa, a);
    put(pb, b);
    triggers.push(() => {
      drop(pa);
      drop(pb);
      files.set(`${pick(folders)}moved${c}/u${c}.js`, { mode: "100644", bytes: edit(b, pick([0, 0.03, 0.1])) });
    });
  },
  (c) => {
    // More than four sources equally alike to one destination, none sharing its name: git keeps the first four.
    const t = text(30, false);
    const sources = Array.from({ length: 4 + Math.floor(random() * 4) }, (_, k) => `${pick(folders)}w${c}-${k}.txt`);
    for (const n of sources) put(n, t);
    triggers.push(() => {
      for (const n of sources) drop(n);
      files.set(`${pick(folders)}z${c}.txt`, { mode: "100644", bytes: edit(t, 0.1) });
    });
  },
  (c) => {
    // Several identical sources for one identical destination: git takes the first unused.
    const t = fresh();
    const sources = Array.from({ length: 2 + Math.floor(random() * 3) }, (_, k) => `${pick(folders)}s${c}-${k}.md`);
    for (const n of sources) put(n, t.bytes, t.mode);
    triggers.push(() => {
      for (const n of sources) drop(n);
      files.set(`${pick(folders)}t${c}.md`, { mode: t.mode, bytes: t.bytes });
    });
  }
];

const chunks = [];
const emit = (text) => chunks.push(Buffer.from(text));
let mark = 0;
const blobMark = (bytes) => {
  mark += 1;
  emit(`blob\nmark :${mark}\ndata ${bytes.length}\n`);
  chunks.push(bytes);
  emit("\n");
  return mark;
};
let previous;
for (let c = 0; c < Number(commitsText); c += 1) {
  if (c > 0) {
    for (const trigger of triggers.splice(0)) trigger();
    // About a quarter of the files go each commit, more once there are over 120 of them.
    const gone = [...files.keys()].filter((p) => !reserved.has(p) && random() < (files.size > 120 ? 0.5 : 0.15 + random() * 0.2));
    const removed = gone.map((p) => [p, files.get(p)]);
    for (const p of gone) files.delete(p);
    for (const [, spec] of removed) {
      const r = random();
      if (r < 0.25) files.set(path(), spec);
      else if (r < 0.65 && spec.mode !== "120000") files.set(path(), { mode: random() < 0.1 ? "100755" : spec.mode, bytes: edit(spec.bytes, pick([0.05, 0.2, 0.3, 0.45, 0.5, 0.6])) });
      else if (r < 0.75 && files.size < 150) {
        // One source, its exact copy added under two names, or two identical sources for one name.
        files.set(path(), spec);
        files.set(path(), spec);
      }
    }
    for (let i = files.size > 150 ? 0 : Math.floor(random() * 6); i > 0; i -= 1) files.set(path(), fresh());
    for (const [p, spec] of files) if (!reserved.has(p) && random() < 0.05 && spec.mode !== "120000") files.set(p, { mode: spec.mode, bytes: edit(spec.bytes, 0.1) });
  }
  if (c > 0 && random() < 0.5) pick(scenarios)(c);
  // A blob is written once, the first time its content is listed; a copy shares its source's mark.
  const listing = [...files].map(([p, spec]) => `M ${spec.mode} :${(spec.mark ??= blobMark(spec.bytes))} ${p}\n`).join("");
  mark += 1;
  const message = `case ${c}`;
  emit(`commit refs/heads/main\nmark :${mark}\ncommitter Case <case@example.invalid> ${1700000000 + c * 60} +0000\ndata ${message.length}\n${message}\n`);
  if (previous !== undefined) emit(`from :${previous}\n`);
  emit(`deleteall\n${listing}\n`);
  previous = mark;
  if (c % 25 === 0) process.stderr.write(`commit ${c}, ${files.size} files\n`);
}
fs.mkdirSync(folder, { recursive: true });
execFileSync("git", ["init", "--quiet", "--initial-branch=main", folder]);
execFileSync("git", ["-C", folder, "fast-import", "--quiet"], { input: Buffer.concat(chunks), maxBuffer: 1 << 28 });
console.log(JSON.stringify({ folder, seed: Number(seedText), commits: Number(commitsText), objects: mark }));
