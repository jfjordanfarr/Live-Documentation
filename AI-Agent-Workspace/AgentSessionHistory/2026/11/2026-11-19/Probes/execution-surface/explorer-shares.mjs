// The Explorer's own script as `visualize` builds it (same esbuild options as buildAssets.ts), by package share, with
// and without its source map, and gzipped. Run from the repository root: node <this file>
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import path from "node:path";

const result = await build({
  entryPoints: [path.join(process.cwd(), "packages/explorer/src/client/index.ts")],
  bundle: true, write: false, metafile: true, minify: true, format: "iife", target: "es2022", sourcemap: true,
  outfile: "/virtual/index.js", logLevel: "silent", loader: { ".ts": "ts" }
});
const js = result.outputFiles.find((f) => f.path.endsWith(".js"));
const map = result.outputFiles.find((f) => f.path.endsWith(".map"));
const shares = {};
for (const [input, info] of Object.entries(result.metafile.outputs[Object.keys(result.metafile.outputs).find((k) => k.endsWith(".js"))].inputs)) {
  const tail = input.split("node_modules/")[1];
  const key = tail ? tail.split("/").slice(0, tail.startsWith("@") ? 2 : 1).join("/") : input.includes("packages/engine") ? "engine" : "explorer client";
  shares[key] = (shares[key] ?? 0) + info.bytesInOutput;
}
console.log(JSON.stringify({ js: js.contents.byteLength, jsGzip: gzipSync(js.contents, { level: 9 }).byteLength, sourceMap: map.contents.byteLength, shares: Object.fromEntries(Object.entries(shares).sort((a, b) => b[1] - a[1])) }, null, 1));
