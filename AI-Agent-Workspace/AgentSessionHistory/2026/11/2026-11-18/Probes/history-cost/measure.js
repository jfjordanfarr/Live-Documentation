// Measurement only: how large would history.json become with symbol rows and links (rung 2) and descriptions (rung 3)?
// Reads the committed mirror along the first-parent mainline with one git log and one git cat-file --batch.
"use strict";
const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const REPO = "/workspaces/Live-Documentation";
const OUT = __dirname;
const { parseLiveDoc } = require(path.join(REPO, "packages/engine/dist/live-docs/document.js"));
const { linkTarget } = require(path.join(REPO, "packages/engine/dist/live-docs/graph.js"));
const LOCATION = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
const PREFIX = ".mdmd/layer-4/";
const SUFFIX = ".mdmd.md";

const history = JSON.parse(fs.readFileSync(path.join(REPO, "dist/explorer/explorer-history.json"), "utf8"));
const HEAD = history.source.head;

function git(args) {
  return execFileSync("git", args, { cwd: REPO, maxBuffer: 1 << 30, encoding: "utf8" });
}

const mainline = git(["rev-list", "--first-parent", "--reverse", HEAD]).trim().split("\n");
if (mainline.length !== history.steps.length + 1) throw new Error(`mainline ${mainline.length} vs steps ${history.steps.length}`);
for (let k = 1; k < mainline.length; k++) if (history.steps[k - 1].commit.id !== mainline[k]) throw new Error(`step ${k} mismatch`);

// Raw changes per commit to the mirror.
const raw = git(["log", "--first-parent", "--diff-merges=first-parent", "--raw", "--no-abbrev", "-M", "--format=C %H", HEAD, "--", PREFIX]);
const changesByCommit = new Map();
let cur = null;
for (const line of raw.split("\n")) {
  if (line.startsWith("C ")) { cur = []; changesByCommit.set(line.slice(2), cur); continue; }
  if (!line.startsWith(":")) continue;
  const [meta, ...paths] = line.split("\t");
  const [, , oldBlob, newBlob, status] = meta.split(" ");
  cur.push({ status: status[0], oldBlob, newBlob, from: paths[0], to: paths[paths.length - 1] });
}
const isDoc = (p) => p && p.startsWith(PREFIX) && p.endsWith(SUFFIX);
const codePathOf = (docPath) => docPath.slice(PREFIX.length, -SUFFIX.length);

// Every blob needed.
const ZERO = "0".repeat(40);
const blobs = new Set();
for (const list of changesByCommit.values()) for (const c of list) {
  if (c.oldBlob !== ZERO && isDoc(c.from)) blobs.add(c.oldBlob);
  if (c.newBlob !== ZERO && isDoc(c.to)) blobs.add(c.newBlob);
}

function sectionsText(symbol) {
  return symbol.sections.map((s) => `${s.title}\n${s.body.join("\n")}`).join("\n");
}

// A doc's facts: symbols, symbol-level links, authored text, symbol descriptions. The doc path decides link resolution;
// a blob is parsed once per doc path it appears under (renames reuse the same blob under a new path: re-resolve).
function facts(text, docPath) {
  let doc;
  try { doc = parseLiveDoc(text); } catch (e) { return { failed: String(e.message || e).slice(0, 80) }; }
  const symbols = new Map(); // name -> {kind, line, desc}
  const slugToName = new Map();
  for (const s of doc.symbols) {
    const name = s.name.replace(/ \(.*\)$/, "");
    symbols.set(name, { kind: s.kind, line: s.source ? s.source.line : -1, desc: sectionsText(s) });
    if (s.slug) slugToName.set(s.slug, name);
  }
  const links = new Map(); // key -> count
  const add = (fromName, kind, link) => {
    if (!link) return;
    const t = linkTarget(docPath, link, LOCATION);
    if (!t) return;
    const key = `${fromName}\u0000${kind}\u0000${t.codePath}\u0000${t.anchor || ""}`;
    links.set(key, (links.get(key) || 0) + 1);
  };
  for (const d of doc.dependencies) add("", d.qualifiers.includes("re-export") ? "re-export" : "import", d.link);
  for (const s of doc.symbols) {
    const name = s.name.replace(/ \(.*\)$/, "");
    for (const r of s.references) {
      if (r.role === "Parameters") { for (const p of r.parameters) for (const t of p.types) add(name, "parameter", t.link); }
      else for (const t of r.types) add(name, r.role, t.link);
    }
  }
  const hasSymbolSection = /^### Public Symbols/m.test(text);
  return { symbols, links, authored: doc.authored, archetype: doc.archetype, hasSymbolSection, rawSymbolHeads: (text.match(/^#### /gm) || []).length };
}

async function readBlobs(ids) {
  const texts = new Map();
  await new Promise((resolve, reject) => {
    const proc = spawn("git", ["cat-file", "--batch"], { cwd: REPO });
    let buf = Buffer.alloc(0);
    proc.stdout.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      for (;;) {
        const nl = buf.indexOf(10);
        if (nl < 0) return;
        const header = buf.subarray(0, nl).toString();
        const [id, , size] = header.split(" ");
        const n = Number(size);
        if (buf.length < nl + 1 + n + 1) return;
        texts.set(id, buf.subarray(nl + 1, nl + 1 + n).toString("utf8"));
        buf = buf.subarray(nl + 1 + n + 1);
      }
    });
    proc.on("error", reject);
    proc.on("close", resolve);
    proc.stdin.end([...ids].join("\n") + "\n");
  });
  return texts;
}

// Line diff as ops [at, deleted, ...inserted] (LCS).
function lineOps(a, b) {
  const A = a ? a.split("\n") : [], B = b ? b.split("\n") : [];
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let qa = A.length, qb = B.length; while (qa > p && qb > p && A[qa - 1] === B[qb - 1]) { qa--; qb--; }
  const a2 = A.slice(p, qa), b2 = B.slice(p, qb);
  if (a2.length * b2.length > 4e6) return [[p, a2.length, ...b2]];
  const n = a2.length, m = b2.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a2[i] === b2[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ops = []; let i = 0, j = 0, op = null;
  const flush = () => { if (op) { ops.push(op); op = null; } };
  while (i < n || j < m) {
    if (i < n && j < m && a2[i] === b2[j]) { flush(); i++; j++; }
    else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { if (!op) op = [p + i, 0]; op.push(b2[j]); j++; }
    else { if (!op) op = [p + i, 0]; op[1]++; i++; }
  }
  flush();
  return ops;
}

(async () => {
  const texts = await readBlobs(blobs);
  const cache = new Map();
  const factsOf = (blob, docPath) => {
    const key = blob + docPath;
    let f = cache.get(key);
    if (!f) { f = facts(texts.get(blob), docPath); cache.set(key, f); }
    return f;
  };

  // Interners shared with today's file.
  const pathIds = new Map(history.paths.map((p, i) => [p, i]));
  const extraPaths = [];
  const pid = (p) => { let i = pathIds.get(p); if (i === undefined) { i = history.paths.length + extraPaths.length; pathIds.set(p, i); extraPaths.push(p); } return i; };
  const names = new Map(); const nameList = [];
  const nid = (s) => { let i = names.get(s); if (i === undefined) { i = nameList.length; names.set(s, i); nameList.push(s); } return i; };
  const kinds = new Map(); const kindList = [];
  const kid = (s) => { let i = kinds.get(s); if (i === undefined) { i = kindList.length; kinds.set(s, i); kindList.push(s); } return i; };

  const state = new Map(); // docPath -> blob
  const perStep = []; // index k: { r2, r3full, r3diff, stats }
  const failures = []; const formatTrack = [];

  const linkTuple = (code, key, count) => {
    const [from, kind, to, anchor] = key.split("\u0000");
    const t = [pid(code), from ? nid(from) : -1, pid(to), anchor ? nid(anchor) : -1, kid(kind)];
    if (count !== undefined) t.push(count);
    return t;
  };

  function snapshot() {
    const syms = [], links = [], authored = [], descs = [];
    for (const [docPath, blob] of state) {
      const f = factsOf(blob, docPath);
      if (f.failed) continue;
      const code = codePathOf(docPath);
      for (const [name, s] of f.symbols) { syms.push([pid(code), nid(name), kid(s.kind)]); if (s.desc) descs.push([pid(code), nid(name), s.desc]); }
      for (const [key, count] of f.links) links.push(linkTuple(code, key, count));
      if (f.authored) authored.push([pid(code), f.authored]);
    }
    return { symbols: syms, links, authored, descriptions: descs };
  }

  const keyframes = {};
  for (let k = 0; k < mainline.length; k++) {
    const list = changesByCommit.get(mainline[k]) || [];
    const r2 = { symbolsAdded: [], symbolsRemoved: [], symbolsRenamed: [], linksAdded: [], linksRemoved: [], linksChanged: [] };
    const r3full = { authored: [], descriptions: [] };
    const r3diff = { authored: [], descriptions: [] };
    let docsChanged = 0;
    const renames = new Map(list.filter((c) => c.status === "R" && isDoc(c.from) && isDoc(c.to)).map((c) => [codePathOf(c.from), codePathOf(c.to)]));
    const moveKey = (key) => { const parts = key.split("\u0000"); const to = renames.get(parts[2]); if (to) parts[2] = to; return parts.join("\u0000"); };
    for (const c of list) {
      const beforeBlob = isDoc(c.from) && c.status !== "A" ? state.get(c.from) : undefined;
      if (isDoc(c.from) && (c.status === "D" || c.status === "R")) state.delete(c.from);
      if (isDoc(c.to) && c.status !== "D") state.set(c.to, c.newBlob);
      if (!isDoc(c.to) || c.status === "D") continue; // a dead file's facts die with it
      docsChanged++;
      const code = codePathOf(c.to);
      const after = factsOf(c.newBlob, c.to);
      const before = beforeBlob ? factsOf(beforeBlob, c.from) : null;
      if (after.failed) { failures.push([k, c.to, after.failed]); continue; }
      const bs = before && !before.failed ? before.symbols : new Map();
      const bl0 = before && !before.failed ? before.links : new Map();
      const bl = renames.size ? new Map([...bl0].map(([key, n]) => [moveKey(key), n])) : bl0;
      const ba = before && !before.failed ? before.authored : "";
      const removed = [...bs.keys()].filter((n) => !after.symbols.has(n));
      const added = [...after.symbols.keys()].filter((n) => !bs.has(n));
      // A rename: one removed and one added of the same kind at the same source line.
      const renamedFrom = new Set(), renamedTo = new Set();
      for (const r of removed) for (const a of added) {
        if (renamedTo.has(a) || renamedFrom.has(r)) continue;
        const x = bs.get(r), y = after.symbols.get(a);
        if (x.kind === y.kind && x.line === y.line && x.line >= 0) { r2.symbolsRenamed.push([pid(code), nid(r), nid(a)]); renamedFrom.add(r); renamedTo.add(a); }
      }
      for (const r of removed) if (!renamedFrom.has(r)) r2.symbolsRemoved.push([pid(code), nid(r)]);
      for (const a of added) if (!renamedTo.has(a)) r2.symbolsAdded.push([pid(code), nid(a), kid(after.symbols.get(a).kind)]);
      for (const [key, count] of after.links) {
        const was = bl.get(key);
        if (was === undefined) r2.linksAdded.push(linkTuple(code, key, count));
        else if (was !== count) r2.linksChanged.push(linkTuple(code, key, count));
      }
      for (const key of bl.keys()) if (!after.links.has(key)) r2.linksRemoved.push(linkTuple(code, key));
      if (after.authored !== ba) {
        r3full.authored.push([pid(code), after.authored]);
        r3diff.authored.push([pid(code), ...(ba ? lineOps(ba, after.authored) : [[0, 0, ...after.authored.split("\n")]])]);
      }
      for (const [name, s] of after.symbols) {
        const old = bs.get(name);
        const prev = old ? old.desc : "";
        if (s.desc !== prev) {
          r3full.descriptions.push([pid(code), nid(name), s.desc]);
          r3diff.descriptions.push([pid(code), nid(name), ...(prev ? lineOps(prev, s.desc) : [[0, 0, ...s.desc.split("\n")]])]);
        }
      }
    }
    const strip = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v.length > 0));
    perStep.push({ k, commit: mainline[k], docsChanged, r2: strip(r2), r3full: strip(r3full), r3diff: strip(r3diff) });
    // Format tracking: share of the docs in state that parse and carry symbols in the current grammar.
    if (k % 20 === 0 || k === mainline.length - 1) {
      let total = 0, parsed = 0, symHeads = 0, symParsed = 0, withSlug = 0;
      for (const [docPath, blob] of state) {
        total++;
        const f = factsOf(blob, docPath);
        if (f.failed) continue;
        parsed++; symHeads += f.rawSymbolHeads; symParsed += f.symbols.size;
      }
      formatTrack.push({ k, commit: mainline[k].slice(0, 8), date: k ? history.steps[k - 1].commit.date : history.base.commit.date, docs: total, parsed, symHeads, symParsed });
    }
    if (k > 0 && k % 32 === 0) keyframes[k] = snapshot();
  }
  keyframes.last = snapshot();
  fs.writeFileSync(path.join(OUT, "perStep.json"), JSON.stringify(perStep));
  fs.writeFileSync(path.join(OUT, "keyframes.json"), JSON.stringify(keyframes));
  fs.writeFileSync(path.join(OUT, "tables.json"), JSON.stringify({ extraPaths, nameList, kindList }));
  fs.writeFileSync(path.join(OUT, "formatTrack.json"), JSON.stringify(formatTrack, null, 1));
  fs.writeFileSync(path.join(OUT, "failures.json"), JSON.stringify(failures.slice(0, 200), null, 1));
  console.log(`blobs ${blobs.size}, commits touching mirror ${changesByCommit.size}, failures ${failures.length}, names ${nameList.length}, extra paths ${extraPaths.length}`);
})();
