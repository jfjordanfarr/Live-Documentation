// Probe of 2026-11-22 (not product code): today's index.json made from a stored scan, as the generator prints it, and
// gzipped, so that a scan that never had an index (five times DNN) has its JSON baseline.
//
//   node <this folder>/index-of.mjs <file.bin> <out.json.gz>
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const { graphOf, readScan } = await import(new URL("../../../../../../../packages/stored-form/src/storedForm.ts", import.meta.url).href);
const [input, out] = process.argv.slice(2);
const read = await readScan(new Uint8Array(readFileSync(input)));
if (!read.ok) throw new Error(read.reason);
const text = `${JSON.stringify(graphOf(read.value), null, 2)}\n`;
const gz = gzipSync(text);
writeFileSync(out, gz);
console.log(JSON.stringify({ indexBytes: Buffer.byteLength(text), indexGzip: gz.length, compactGzip: gzipSync(JSON.stringify(graphOf(read.value))).length }));
