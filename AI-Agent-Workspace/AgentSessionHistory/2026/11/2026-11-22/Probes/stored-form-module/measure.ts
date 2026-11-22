// Probe of 2026-11-22 (not product code): the stored form measured against today's graph index on a real scan.
//
//   npx tsx --tsconfig ./tsconfig.base.json <this folder>/measure.ts write <index.json> <out.bin>
//     checks the stored form against the index and writes it: the graph read back equal to the index's, field by
//     field and as printed; binary -> text -> binary the same bytes; text -> binary -> text the same text.
//   ... measure.ts read <out.bin> | json <index.json.gz>
//     in a fresh process: time to the first answer (what depends on the most depended-on file, by name), time to the
//     whole map (every fact and the graph), and the process's peak memory.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";

import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { bytesOfText, graphOf, openScan, readScan, scanOfText, textOf, writeScan } from "../../../../../../../packages/stored-form/src/storedForm";

import { scanOfGraph } from "./scan-of-graph";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? "null" : canonical(v))).join(",")}]`;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

const ms = (start: bigint): number => Math.round(Number(process.hrtime.bigint() - start) / 1e5) / 10;
const peak = (): number => Math.round(process.resourceUsage().maxRSS / 1024);

async function write(indexPath: string, out: string): Promise<void> {
  const text = readFileSync(indexPath);
  const graph = JSON.parse(text.toString("utf8")) as LiveDocGraph;
  const scan = scanOfGraph(graph, "live-documentation 0.0.0");
  let t = process.hrtime.bigint();
  const written = await writeScan(scan);
  if (!written.ok) throw new Error(written.reason);
  const writeMs = ms(t);
  const bytes = written.value;
  writeFileSync(out, bytes);
  writeFileSync(`${indexPath}.gz`, gzipSync(text));
  const read = await readScan(bytes);
  if (!read.ok) throw new Error(read.reason);
  const back = graphOf(read.value);
  const sameFacts = canonical(back) === canonical(graph);
  const samePrint = `${JSON.stringify(back, null, 2)}\n` === text.toString("utf8");
  t = process.hrtime.bigint();
  const asText = await textOf(bytes);
  if (!asText.ok) throw new Error(asText.reason);
  const textMs = ms(t);
  const again = await bytesOfText(asText.value);
  if (!again.ok) throw new Error(again.reason);
  const sameBytes = Buffer.compare(Buffer.from(again.value), Buffer.from(bytes)) === 0;
  const textAgain = await textOf(again.value);
  const sameText = textAgain.ok && textAgain.value === asText.value;
  const parsed = scanOfText(asText.value);
  const frames = { raw: 0 };
  void frames;
  console.log(
    JSON.stringify({
      files: scan.files.length,
      indexBytes: text.length,
      indexGzip: gzipSync(text).length,
      indexCompactGzip: gzipSync(Buffer.from(JSON.stringify(graph))).length,
      storedBytes: bytes.length,
      textBytes: Buffer.byteLength(asText.value),
      textGzip: gzipSync(Buffer.from(asText.value)).length,
      writeMs,
      textMs,
      sameFacts,
      samePrint,
      sameBytes,
      sameText,
      textParses: parsed.ok,
      name: read.value.name,
      peakMb: peak()
    })
  );
}

async function readStored(path: string): Promise<void> {
  const start = process.hrtime.bigint();
  const bytes = new Uint8Array(readFileSync(path));
  const opened = await openScan(bytes);
  if (!opened.ok) throw new Error(opened.reason);
  const scan = opened.value;
  let hub = 0;
  for (let i = 0; i < scan.paths.length; i += 1) if (scan.inbound(i).length > scan.inbound(hub).length) hub = i;
  const answer = scan.inbound(hub).map((j) => scan.paths[j]);
  const firstMs = ms(start);
  const whole = await readScan(bytes);
  if (!whole.ok) throw new Error(whole.reason);
  const graph = graphOf(whole.value);
  const wholeMs = ms(start);
  console.log(JSON.stringify({ form: "stored", subject: scan.paths[hub], dependents: answer.length, firstMs, wholeMs, files: Object.keys(graph.files).length, peakMb: peak() }));
}

function readJson(path: string): void {
  const start = process.hrtime.bigint();
  const graph = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")) as LiveDocGraph;
  let hub = "";
  for (const [p, f] of Object.entries(graph.files)) if (!hub || f.inbound.length > graph.files[hub].inbound.length) hub = p;
  const answer = graph.files[hub].inbound;
  const firstMs = ms(start);
  console.log(JSON.stringify({ form: "index.json.gz", subject: hub, dependents: answer.length, firstMs, wholeMs: firstMs, files: Object.keys(graph.files).length, peakMb: peak() }));
}

const [mode, a, b] = process.argv.slice(2);
void (async () => {
  if (mode === "write") await write(a, b);
  else if (mode === "read") await readStored(a);
  else if (mode === "json") readJson(a);
  else throw new Error("usage: measure.ts write <index.json> <out.bin> | read <out.bin> | json <index.json.gz>");
})().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
