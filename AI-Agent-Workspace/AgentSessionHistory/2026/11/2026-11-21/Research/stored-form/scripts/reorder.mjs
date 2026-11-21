// Research of November 21, 2026 (not product code). Facts that do not arrive in path order: what a bounded wait costs
// a form that needs the order, against a sort at the end.
//
//   node reorder.mjs <facts.ndjson> <design> <spread> <wait|sort>
//
// The files arrive out of order as readers finishing at different times would hand them over: file i is finished at
// i + d, d drawn evenly from [0, spread) by a fixed generator, and handed over in the order of those times. So no file
// arrives more than `spread` places from where it belongs.
//   wait: the sink holds what arrived early and releases files in path order as soon as each one's turn comes; it never
//         holds more than about `spread` files.
//   sort: the sink holds every file, sorts them at the end, then writes.
// Each line is read from the file at its own offset when it "arrives", so the input is never whole in memory.
import fs from "node:fs";

const [input, designName, spreadText, mode] = process.argv.slice(2);
const spread = Number(spreadText);
const design = await import(`./designs/${designName}.mjs`);
const peakMb = () => Math.round(process.resourceUsage().maxRSS / 1024);

// Where each line begins.
const fd = fs.openSync(input, "r");
const size = fs.fstatSync(fd).size;
const starts = [];
{
  const chunk = Buffer.alloc(1 << 20);
  let at = 0;
  starts.push(0);
  while (at < size) {
    const n = fs.readSync(fd, chunk, 0, chunk.length, at);
    for (let i = 0; i < n; i += 1) if (chunk[i] === 10) starts.push(at + i + 1);
    at += n;
  }
}
const lineAt = (k) => {
  const length = starts[k + 1] - starts[k] - 1;
  const buf = Buffer.alloc(length);
  fs.readSync(fd, buf, 0, length, starts[k]);
  return buf.toString("utf8");
};
const head = JSON.parse(lineAt(0));
const total = head.files;
// The order of arrival: a fixed generator, so every run sees the same disorder.
let seed = 2463534242;
const random = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const order = Array.from({ length: total }, (_, i) => ({ i, t: i + random() * spread })).sort((a, b) => a.t - b.t).map((x) => x.i);
let displaced = 0;
order.forEach((i, k) => { displaced = Math.max(displaced, Math.abs(i - k)); });

const baseMb = peakMb();
const t0 = process.hrtime.bigint();
const w = design.writer({ root: head.root, baseLayer: head.baseLayer, extension: head.extension });
let held = 0;
let maxHeld = 0;
if (mode === "wait") {
  const waiting = new Map();
  let next = 0;
  for (const i of order) {
    waiting.set(i, JSON.parse(lineAt(i + 1)));
    held = waiting.size;
    maxHeld = Math.max(maxHeld, held);
    while (waiting.has(next)) {
      const [path, record, outbound] = waiting.get(next);
      waiting.delete(next);
      await w.add(path, record, outbound);
      next += 1;
    }
  }
} else {
  const all = [];
  for (const i of order) all.push(JSON.parse(lineAt(i + 1)));
  maxHeld = all.length;
  all.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  for (const [path, record, outbound] of all) await w.add(path, record, outbound);
}
const bytes = await w.finish();
console.log(JSON.stringify({ design: design.name, spread, mode, files: total, furthestDisplaced: displaced, maxHeld, ms: Math.round(Number(process.hrtime.bigint() - t0) / 1e6), peakMb: peakMb(), peakMbBefore: baseMb, bytes: bytes.length }));
