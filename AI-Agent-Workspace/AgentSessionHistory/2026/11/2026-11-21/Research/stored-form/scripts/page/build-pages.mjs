// Research of November 21, 2026 (not product code). Builds one measuring page per design: its reader and writer
// bundled into one inline script admitted by its hash, under the Explorer's kind of policy (no network at all,
// WebAssembly allowed to compile), and, for a reading page, the stored bytes inline as base64.
//
//   node build-pages.mjs <out folder> <sql-wasm-inline.js> [<corpus> <stored folder>]
//
// Writes write-<design>.html for every design and, when a corpus is named, read-<design>-<corpus>.html carrying
// <stored folder>/<corpus>.<module>.bin (the database's bytes gzipped, as the page carries them). Prints each page's
// bytes and its script's bytes.
import { build } from "esbuild";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [outDir, sqlInline, corpus, storedDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
// Page module, and the Node-written stored file its reading page carries.
const designs = {
  "json": ["d0-json", "d0-json"],
  "press": ["d1-press", "d1-press"],
  "press-stream": ["d1s-press-stream", "d1s-press-stream"],
  "sqlite": ["d2-sqlite-page", "d2-sqlite-node"],
  "ledger": ["d3-ledger", "d3-ledger"],
  "parts": ["d4-parts", "d4-parts"],
  "hdf5": ["d5-hdf5-page", "d5-hdf5-node"],
  "ledger-indexed": ["d6-ledger-indexed", "d6-ledger-indexed"],
  "press-kept": ["d1k-press-kept", "d1k-press-kept"],
  "ledger-indexed-careful": ["d6r-ledger-indexed-careful", "d6-ledger-indexed"]
};
// h5wasm's browser build, looked for beside sql.js in the same node_modules.
const h5wasmEsm = path.resolve(sqlInline, "../../../h5wasm/dist/esm/hdf5_hl.js");
const policy = (hash) => `default-src 'none'; script-src 'sha256-${hash}' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`;
const sizes = {};
for (const [key, [module, storedModule]] of Object.entries(designs)) {
  const entry = path.join(outDir, `entry-${key}.mjs`);
  fs.writeFileSync(entry, `import * as design from ${JSON.stringify(path.join(here, "..", "designs", `${module}.mjs`))};\nimport { bench } from ${JSON.stringify(path.join(here, "page-bench.mjs"))};\nbench(design);\n`);
  const result = await build({ entryPoints: [entry], bundle: true, format: "iife", minify: true, write: false, platform: "browser", target: "es2022", alias: { "sql.js-inline": sqlInline, "h5wasm-esm": h5wasmEsm }, external: ["fs", "path", "crypto", "node:fs", "node:path", "node:crypto"], logLevel: "error" });
  fs.rmSync(entry);
  const script = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const hash = crypto.createHash("sha256").update(script).digest("base64");
  const page = (data) => `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy(hash)}"><title>${key}</title></head><body>${data === undefined ? "" : `<script type="application/octet-stream" id="data">${data}</script>`}<script>${script}</script></body></html>`;
  fs.writeFileSync(path.join(outDir, `write-${key}.html`), page());
  sizes[key] = { scriptBytes: Buffer.byteLength(script) };
  if (corpus) {
    const storedPath = path.join(storedDir, `${corpus}.${storedModule}.bin`);
    if (!fs.existsSync(storedPath)) continue;
    let stored = fs.readFileSync(storedPath);
    if (key === "sqlite") stored = zlib.gzipSync(stored, { level: 6 });
    const html = page(stored.toString("base64"));
    fs.writeFileSync(path.join(outDir, `read-${key}-${corpus}.html`), html);
    Object.assign(sizes[key], { storedBytes: stored.length, pageBytes: Buffer.byteLength(html) });
  }
}
console.log(JSON.stringify(sizes));
