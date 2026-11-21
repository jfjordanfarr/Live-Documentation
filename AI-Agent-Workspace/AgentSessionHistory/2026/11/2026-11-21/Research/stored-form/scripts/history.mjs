// Research of November 21, 2026 (not product code). Many moments of one folder's facts: how much each design holds
// once, and "what changed between two commits" answered by each.
//
//   node history.mjs <out.json> <moment.json> <moment.json> ...      (oldest first)
//
// Each moment is the facts of one commit, made by facts.cjs over that commit's tree under today's generator (the
// history's one lens). Printed and written: bytes of all moments kept as separate files of each design; bytes of the
// ledger kept as its first moment and then each step's added and removed lines; bytes of one file of parts holding
// every moment; the parts shared; and the time of the question between the first and the last moment, which every
// design must answer alike.
import fs from "node:fs";
import zlib from "node:zlib";
import { canonical, comparePaths, decoder } from "./designs/common.mjs";
import * as json from "./designs/d0-json.mjs";
import * as press from "./designs/d1-press.mjs";
import * as ledger from "./designs/d3-ledger.mjs";
import * as parts from "./designs/d4-parts.mjs";
import { recordFrom } from "./designs/ledger-core.mjs";

const [outPath, ...momentPaths] = process.argv.slice(2);
const graphs = momentPaths.map((p) => JSON.parse(fs.readFileSync(p, "utf8")));
const ms = (t0) => +(Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1);
const out = { moments: momentPaths.map((p) => p.split("/").pop()), files: graphs.map((g) => Object.keys(g.files).length) };

// ---------------------------------------------------------------------------------------------------------------
// Bytes
// ---------------------------------------------------------------------------------------------------------------
const separately = {};
for (const d of [json, press, ledger]) {
  let total = 0;
  for (const g of graphs) total += (await d.encode(g)).length;
  separately[d.name] = total;
}
// The ledger as a first moment and then each step's lines added and removed, the whole gzipped once.
const ledgerLines = graphs.map((g) => decoder.decode(ledger.text(g)).split("\n"));
let deltaText = ledgerLines[0].join("\n");
const steps = [];
for (let i = 1; i < graphs.length; i += 1) {
  const before = new Set(ledgerLines[i - 1]);
  const after = new Set(ledgerLines[i]);
  const removed = ledgerLines[i - 1].filter((l) => !after.has(l));
  const added = ledgerLines[i].filter((l) => !before.has(l));
  steps.push({ removed: removed.length, added: added.length });
  deltaText += `\n@@ step ${i}\n${removed.map((l) => `-${l}`).join("\n")}\n${added.map((l) => `+${l}`).join("\n")}`;
}
const ledgerWithDeltas = zlib.gzipSync(Buffer.from(deltaText), { level: 6 }).length;
const cuts = [];
for (const g of graphs) cuts.push(await parts.cut(g));
const pool = await parts.pack(cuts);
const distinct = new Set(cuts.flatMap((c) => c.manifest.parts.map((p) => p.hash)));
const named = cuts.reduce((a, c) => a + c.manifest.parts.length, 0);
out.bytes = {
  "each moment its own file, summed": separately,
  "ledger: the first moment, then each step's lines": ledgerWithDeltas,
  "parts: every moment in one file": pool.length,
  "parts: one moment alone (the last)": (await parts.encode(graphs[graphs.length - 1])).length
};
out.ledgerSteps = steps;
out.parts = { named, distinct: distinct.size, sharedPercent: +((100 * (named - distinct.size)) / named).toFixed(1), perMoment: cuts.map((c) => c.manifest.parts.length) };

// ---------------------------------------------------------------------------------------------------------------
// "What changed between two commits", first against last
// ---------------------------------------------------------------------------------------------------------------
const first = graphs[0];
const last = graphs[graphs.length - 1];
function summarize(born, dead, changed) {
  return { born: born.length, dead: dead.length, changed: changed.length, sample: changed.slice(0, 3) };
}
const answers = {};
{
  // JSON: inflate and parse both wholes, then compare every file.
  const [a, b] = [await json.encode(first), await json.encode(last)];
  const t0 = process.hrtime.bigint();
  const [ra, rb] = [await (await json.open(a)).all(), await (await json.open(b)).all()];
  const pa = Object.keys(ra.files);
  const pb = new Set(Object.keys(rb.files));
  const born = [...pb].filter((p) => !(p in ra.files));
  const dead = pa.filter((p) => !pb.has(p));
  const changed = pa.filter((p) => pb.has(p) && canonical({ ...ra.files[p], inbound: 0, outbound: 0 }) !== canonical({ ...rb.files[p], inbound: 0, outbound: 0 }));
  answers[json.name] = { ms: ms(t0), ...summarize(born, dead, changed) };
}
{
  // Press: decode both wholes, compare every record.
  const [a, b] = [await press.encode(first), await press.encode(last)];
  const t0 = process.hrtime.bigint();
  const [ra, rb] = [await press.open(a), await press.open(b)];
  const [pa, pbList] = [await ra.paths(), await rb.paths()];
  const pb = new Set(pbList);
  const common = pa.filter((p) => pb.has(p));
  const [xa, xb] = [await ra.records(common), await rb.records(common)];
  const changed = common.filter((_, i) => canonical(xa[i]) !== canonical(xb[i]));
  answers[press.name] = { ms: ms(t0), ...summarize(pbList.filter((p) => !pa.includes(p)), pa.filter((p) => !pb.has(p)), changed) };
}
{
  // Ledger: the lines of the one not in the other, then the files those lines name.
  const [a, b] = [await ledger.encode(first), await ledger.encode(last)];
  const t0 = process.hrtime.bigint();
  const inflate = async (x) => decoder.decode(zlib.gunzipSync(x)).split("\n").slice(1);
  const [la, lb] = [await inflate(a), await inflate(b)];
  const [sa, sb] = [new Set(la), new Set(lb)];
  const touched = new Set();
  for (const l of la) if (l && !sb.has(l)) touched.add(JSON.parse(l)[0]);
  for (const l of lb) if (l && !sa.has(l)) touched.add(JSON.parse(l)[0]);
  const fa = new Set(la.filter((l) => l.includes('","F",')).map((l) => JSON.parse(l)[0]));
  const fb = new Set(lb.filter((l) => l.includes('","F",')).map((l) => JSON.parse(l)[0]));
  const born = [...fb].filter((p) => !fa.has(p));
  const dead = [...fa].filter((p) => !fb.has(p));
  const changed = [...touched].filter((p) => fa.has(p) && fb.has(p)).sort(comparePaths);
  answers[ledger.name] = { ms: ms(t0), ...summarize(born, dead, changed) };
}
{
  // Parts: compare the two manifests' part names; read only the parts that differ.
  const t0 = process.hrtime.bigint();
  const ra = await parts.open(pool, null, 0);
  const rb = await parts.open(pool, null, graphs.length - 1);
  const hashesA = new Map(ra.manifest.parts.map((p) => [p.dir, p.hash]));
  const hashesB = new Map(rb.manifest.parts.map((p) => [p.dir, p.hash]));
  const dirs = [...new Set([...hashesA.keys(), ...hashesB.keys()])].filter((d) => hashesA.get(d) !== hashesB.get(d));
  const born = [];
  const dead = [];
  const changed = [];
  let partsRead = 0;
  for (const d of dirs) {
    const linesOf = async (r, hashes) => {
      if (!hashes.has(d)) return new Map();
      partsRead += 1;
      const text = await r.part(hashes.get(d));
      const byPath = new Map();
      for (const p of text.paths()) byPath.set(p, canonical(recordFrom(text.linesOf(p))));
      return byPath;
    };
    const [ma, mb] = [await linesOf(ra, hashesA), await linesOf(rb, hashesB)];
    for (const p of mb.keys()) if (!ma.has(p)) born.push(p);
    for (const p of ma.keys()) if (!mb.has(p)) dead.push(p);
    for (const [p, v] of ma) if (mb.has(p) && mb.get(p) !== v) changed.push(p);
  }
  changed.sort(comparePaths);
  answers[parts.name] = { ms: ms(t0), partsRead, partsInMoment: rb.manifest.parts.length, ...summarize(born, dead, changed) };
}
out.whatChanged = answers;
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
