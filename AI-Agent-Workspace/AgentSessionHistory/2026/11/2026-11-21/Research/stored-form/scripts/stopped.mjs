// Research of November 21, 2026 (not product code). A scan stopped at 60 %: what is left, and can it go on from there.
//
//   node stopped.mjs sqlite <facts.ndjson> <db path>     writes the database on disk as facts arrive, and is killed
//                                                         (process.exit, no finish) after 60 % of the files
//   node stopped.mjs salvage-sqlite <db path>           opens what is left and says how many files it holds, and the last
//   node stopped.mjs ledger <facts.ndjson>              the ledger written as facts arrive and stopped after 60 % of the
//                                                         files; says how many whole files the bytes let out can give back
//
// The ledger's case needs no kill: a gzip stream appended to a file as it is made is, when the writing stops, the
// bytes the stream had let out by then, a prefix of the whole file.
import fs from "node:fs";
import zlib from "node:zlib";
import { createInterface } from "node:readline";
import { DatabaseSync } from "node:sqlite";

const [mode, a] = process.argv.slice(2);
if (mode === "sqlite") {
  const { writer } = await import("./designs/d2-sqlite-node.mjs");
  const lines = createInterface({ input: fs.createReadStream(process.argv[3]), crlfDelay: Infinity });
  let w;
  let total;
  let n = 0;
  for await (const line of lines) {
    if (!line) continue;
    if (!w) {
      const head = JSON.parse(line);
      total = head.files;
      w = writer({ root: head.root, baseLayer: head.baseLayer, extension: head.extension }, process.argv[4]);
      continue;
    }
    const [path, record] = JSON.parse(line);
    await w.add(path, record);
    n += 1;
    if (n === Math.floor(total * 0.6)) {
      console.log(JSON.stringify({ stoppedAfter: n, of: total, lastPath: path }));
      process.exit(0); // no COMMIT of the open batch, no index, no VACUUM: as a closed lid leaves it
    }
  }
} else if (mode === "salvage-sqlite") {
  const db = new DatabaseSync(a);
  const files = db.prepare("SELECT count(*) AS n, max(path) AS last FROM files").get();
  const edges = db.prepare("SELECT count(*) AS n FROM edges").get();
  console.log(JSON.stringify({ bytesOnDisk: fs.statSync(a).size, journalLeft: fs.existsSync(`${a}-journal`), filesHeld: files.n, lastPath: files.last, edgesHeld: edges.n, resume: "go on after the last path held; the open batch of up to 512 files was rolled back" }));
} else if (mode === "ledger") {
  // The ledger written as facts arrive, stopped after 60 % of the files: what its stream had let out by then.
  const { writer } = await import("./designs/d3-ledger.mjs");
  const input = createInterface({ input: fs.createReadStream(a), crlfDelay: Infinity });
  let w;
  let total;
  let n = 0;
  let cut;
  let lastPath;
  for await (const line of input) {
    if (!line) continue;
    if (!w) {
      const head = JSON.parse(line);
      total = head.files;
      w = writer({ root: head.root, baseLayer: head.baseLayer, extension: head.extension });
      continue;
    }
    const [path, record] = JSON.parse(line);
    await w.add(path, record);
    n += 1;
    if (n === Math.floor(total * 0.6)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      cut = w.emitted();
      lastPath = path;
      break;
    }
  }
  const whole = { length: (await w.finish()).length };
  const text = zlib.gunzipSync(cut, { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString("utf8");
  const recovered = text.split("\n");
  recovered.pop(); // the last line may be cut
  const files = recovered.filter((l) => l.includes('","F",')).map((l) => JSON.parse(l)[0]);
  // The last file's lines may be cut short: the files certainly whole are those before the last file line.
  console.log(JSON.stringify({ stoppedAfter: n, of: total, lastPathHanded: lastPath, bytesKept: cut.length, bytesIfClosedThere: whole.length, textRecovered: text.length, linesRecovered: recovered.length, filesSeen: files.length, filesCertainlyWhole: Math.max(0, files.length - 1), resumeAfter: files[files.length - 2] ?? null }));
}
