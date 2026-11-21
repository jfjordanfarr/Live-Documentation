// Research of November 21, 2026 (not product code). The resumable press in Node: written as facts arrive, every frame
// appended to a file as it is set down; stopped after 60 % of the files with no finish; then gone on with from what
// the file holds. Prints one line of JSON per step.
//
//   node kept.mjs full   <facts.ndjson> <out>      the whole scan, unstopped, appended frame by frame
//   node kept.mjs stop   <facts.ndjson> <out>      the same, ended by process.exit after 60 % of the files
//   node kept.mjs resume <facts.ndjson> <out>      finds what <out> holds, keeps it up to its last whole chunk, goes on
import crypto from "node:crypto";
import fs from "node:fs";
import { createInterface } from "node:readline";
import { nameOf, resumeFrom, writer } from "./designs/d1k-press-kept.mjs";

const [mode, input, out] = process.argv.slice(2);
const peakMb = () => Math.round(process.resourceUsage().maxRSS / 1024);
const t0 = process.hrtime.bigint();
const ms = () => Math.round(Number(process.hrtime.bigint() - t0) / 1e6);
const record = { mode };
let skip = 0;
let state;
if (mode === "resume") {
  const cut = new Uint8Array(fs.readFileSync(out));
  const found = await resumeFrom(cut);
  record.bytesFound = cut.length;
  record.bytesKept = found.keptBytes;
  record.filesBack = found.files;
  record.lastPath = found.lastPath;
  fs.truncateSync(out, found.keptBytes);
  state = found.state;
  skip = found.files;
  record.resumeReadMs = ms();
} else {
  fs.writeFileSync(out, new Uint8Array([0x4c, 0x44, 0x50, 0x33])); // "LDP3"
}
const lines = createInterface({ input: fs.createReadStream(input), crlfDelay: Infinity });
let w;
let total;
let n = 0;
for await (const line of lines) {
  if (!line) continue;
  if (!w) {
    const head = JSON.parse(line);
    total = head.files;
    w = writer({ root: head.root, baseLayer: head.baseLayer, extension: head.extension }, { state, onFrame: (bytes) => fs.appendFileSync(out, bytes) });
    continue;
  }
  n += 1;
  if (n <= skip) continue;
  const [path, rec, outbound] = JSON.parse(line);
  await w.add(path, rec, outbound);
  if (mode === "stop" && n === Math.floor(total * 0.6)) {
    record.stoppedAfter = n;
    record.of = total;
    record.bytesOnDisk = fs.statSync(out).size;
    record.ms = ms();
    record.peakMb = peakMb();
    console.log(JSON.stringify(record));
    process.exit(0); // no finish: as a closed lid leaves it
  }
}
await w.finish();
const bytes = fs.readFileSync(out);
record.files = total;
record.bytes = bytes.length;
record.sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
record.name = nameOf(new Uint8Array(bytes));
record.ms = ms();
record.peakMb = peakMb();
console.log(JSON.stringify(record));
