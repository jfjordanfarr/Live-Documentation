// The weight of one bundled Node script holding the generator, the engine and their packages (TypeScript among them),
// as esbuild would write it for `node generate.js`. Size only: the grammars' paths (treeSitter.ts reads __dirname and
// require.resolve) would need a seam before such a bundle runs. Run from the repository root: node <this file>
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import path from "node:path";

const result = await build({
  entryPoints: [path.join(process.cwd(), "packages/generator/src/generator.ts")],
  bundle: true, write: false, metafile: true, minify: true, platform: "node", format: "cjs", target: "node22",
  alias: { "@live-documentation/engine": path.join(process.cwd(), "packages/engine/src") }, logLevel: "silent"
});
const js = result.outputFiles[0].contents;
const shares = {};
for (const [input, info] of Object.entries(result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].inputs)) {
  const tail = input.split("node_modules/")[1];
  const key = tail ? tail.split("/").slice(0, tail.startsWith("@") ? 2 : 1).join("/") : input.includes("packages/engine") ? "engine" : "generator";
  shares[key] = (shares[key] ?? 0) + info.bytesInOutput;
}
console.log(JSON.stringify({ bundle: js.byteLength, gzip: gzipSync(js, { level: 9 }).byteLength, shares: Object.fromEntries(Object.entries(shares).sort((a, b) => b[1] - a[1]).slice(0, 8)) }));
