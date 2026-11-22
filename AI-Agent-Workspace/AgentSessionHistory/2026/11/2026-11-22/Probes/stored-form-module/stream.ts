// Probe of 2026-11-22 (not product code): the stored form written as facts arrive from disk, as the engine's sink
// would write it, so that the facts are never whole in memory.
//
//   npx tsx --tsconfig ./tsconfig.base.json <this folder>/stream.ts lines <index.json> <out.ndjson> [copies]
//     one line for the head, then one line per file, in the stored form's order. With `copies`, the scan repeated
//     under that many folders, each copy's links naming only its own copy: the research's "five times DNN".
//   ... stream.ts write <in.ndjson> <out.bin>
//     in a fresh process: each line read, handed to the writer, and each piece it sets down appended to the file.
import { closeSync, createReadStream, openSync, readFileSync, writeFileSync, writeSync } from "node:fs";
import { createInterface } from "node:readline";

import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { comparePaths, createWriter, type ScanHead, type StoredFile } from "../../../../../../../packages/stored-form/src/storedForm";

import { scanOfGraph } from "./scan-of-graph";

/** The file under a copy's folder: its path and every target its links name moved there. */
function copied(file: StoredFile, folder: string): StoredFile {
  const move = <T extends { target?: string }>(v: T): T => (v.target === undefined ? v : { ...v, target: `${folder}/${v.target}` });
  return {
    ...file,
    codePath: `${folder}/${file.codePath}`,
    symbols: file.symbols.map((s) => ({ ...s, references: s.references.map((r) => (r.role === "Parameters" ? { ...r, parameters: r.parameters.map((p) => ({ ...p, types: p.types.map(move) })) } : { ...r, types: r.types.map(move) })) })),
    dependencies: file.dependencies.map(move)
  };
}

function lines(indexPath: string, out: string, copies: number): void {
  const scan = scanOfGraph(JSON.parse(readFileSync(indexPath, "utf8")) as LiveDocGraph, "live-documentation 0.0.0");
  let files = scan.files;
  if (copies > 1) {
    files = [];
    for (let k = 0; k < copies; k += 1) for (const f of scan.files) files.push(copied(f, `copy-${k}`));
    files.sort((a, b) => comparePaths(a.codePath, b.codePath));
  }
  const fd = openSync(out, "w");
  writeSync(fd, `${JSON.stringify(scan.head)}\n`);
  for (const f of files) writeSync(fd, `${JSON.stringify(f)}\n`);
  closeSync(fd);
  console.log(JSON.stringify({ files: files.length }));
}

async function write(input: string, out: string): Promise<void> {
  const start = process.hrtime.bigint();
  const fd = openSync(out, "w");
  const reader = createInterface({ input: createReadStream(input), crlfDelay: Infinity });
  let writer: ReturnType<typeof createWriter> | undefined;
  for await (const line of reader) {
    if (writer === undefined) {
      writer = createWriter(JSON.parse(line) as ScanHead, { onBytes: (b) => void writeSync(fd, b) });
      continue;
    }
    await writer.add(JSON.parse(line) as StoredFile);
  }
  const whole = await writer!.finish();
  closeSync(fd);
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  const onDisk = readFileSync(out);
  console.log(JSON.stringify({ files: writer!.files(), bytes: whole.length, sameAsReturned: Buffer.compare(onDisk, Buffer.from(whole)) === 0, ms: Math.round(ms), peakMb: Math.round(process.resourceUsage().maxRSS / 1024) }));
  writeFileSync(`${out}.done`, "");
}

const [mode, a, b, c] = process.argv.slice(2);
void (async () => {
  if (mode === "lines") lines(a, b, Number(c ?? 1));
  else if (mode === "write") await write(a, b);
  else throw new Error("usage: stream.ts lines <index.json> <out.ndjson> [copies] | write <in.ndjson> <out.bin>");
})().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
