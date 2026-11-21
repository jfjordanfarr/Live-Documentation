// Builds the scanning page of the probe of November 19 (its entry and most of its stand-ins, read from that folder)
// from the engine as it stands today, with the stand-ins the engine has come to need since: `node:process`, and two
// more calls of `node:fs`. Writes page.html and sizes.json into the folder named by --out. Run from the repository
// root: node <this file> --out <scratch folder>
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const here = path.join(path.dirname(new URL(import.meta.url).pathname), "../../../2026-11-19/Probes/execution-surface");
const own = path.dirname(new URL(import.meta.url).pathname);
const repo = process.cwd();
const out = process.argv[process.argv.indexOf("--out") + 1];
mkdirSync(out, { recursive: true });
const shim = (name) => path.join(here, "shims", name);
const alias = {
  "node:fs": path.join(own, "shims/fs.mjs"), fs: path.join(own, "shims/fs.mjs"), "node:fs/promises": path.join(own, "shims/fs.mjs"), "fs/promises": path.join(own, "shims/fs.mjs"),
  "node:path": shim("path.mjs"), path: shim("path.mjs"),
  "node:child_process": shim("child_process.mjs"), child_process: shim("child_process.mjs"),
  "node:os": shim("misc.mjs"), os: shim("misc.mjs"), "node:url": shim("misc.mjs"), url: shim("misc.mjs"),
  "node:crypto": shim("misc.mjs"), crypto: shim("misc.mjs"), "node:zlib": shim("misc.mjs"), "node:util": shim("misc.mjs"),
  glob: shim("glob.mjs"),
  "node:process": path.join(own, "shims/process.mjs"), process: path.join(own, "shims/process.mjs"),
  "web-tree-sitter": shim("tree-sitter.mjs"),
  "real-web-tree-sitter": path.join(repo, "node_modules/web-tree-sitter/web-tree-sitter.js"),
  "@probe/generator": path.join(repo, "packages/generator/src/generator.ts"),
  "@live-documentation/engine": path.join(repo, "packages/engine/src")
};
const result = await build({
  entryPoints: [path.join(here, "page-entry.mjs")],
  bundle: true, write: false, metafile: true, minify: true, format: "iife", platform: "browser", target: "es2022",
  alias,
  define: { __dirname: '"/engine/src/live-docs/adapters"', "require.resolve": "__probeResolve" },
  banner: { js: 'var __probeResolve=(s)=>"/node_modules/"+s;' },
  external: ["perf_hooks", "inspector", "source-map-support", "buffer", "module", "node:module", "worker_threads", "node:worker_threads"],
  logLevel: "warning"
});
const script = result.outputFiles[0].text;

// The share of the script by package, from esbuild's own account of its output.
const shares = {};
for (const [input, info] of Object.entries(result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].inputs)) {
  const key = input.includes("node_modules/") ? input.split("node_modules/")[1].split("/").slice(0, input.split("node_modules/")[1].startsWith("@") ? 2 : 1).join("/")
    : input.includes("packages/engine") ? "engine" : input.includes("packages/generator") ? "generator" : "probe shims";
  shares[key] = (shares[key] ?? 0) + info.bytesInOutput;
}

const grammars = [
  ["web-tree-sitter.wasm", "node_modules/web-tree-sitter/web-tree-sitter.wasm"],
  ["tree-sitter-powershell.wasm", "packages/engine/grammars/powershell/tree-sitter-powershell.wasm"],
  ...["c-sharp", "cpp", "go", "java", "python", "rust"].map((g) => [`tree-sitter-${g}.wasm`, `node_modules/@vscode/tree-sitter-wasm/wasm/tree-sitter-${g}.wasm`])
];
const grammarSizes = {};
const blocks = grammars.map(([name, file]) => {
  const raw = readFileSync(path.join(repo, file));
  const packed = gzipSync(raw, { level: 9 }).toString("base64");
  grammarSizes[name] = { raw: raw.byteLength, embedded: packed.length };
  return `<script type="application/octet-stream" data-name="${name}">${packed}</script>`;
}).join("\n");

const hash = createHash("sha256").update(script).digest("base64");
const csp = `default-src 'none'; script-src 'sha256-${hash}' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>Scan probe</title>
<style>body{font:14px system-ui;margin:16px}#log{white-space:pre-wrap;font:12px monospace}</style>
</head><body>
<p><button id="pick" type="button">Pick a folder</button> <label>or choose one: <input id="folder" type="file" webkitdirectory></label> <button id="blank" type="button">Save a blank copy</button></p>
<pre id="log"></pre>
<script type="application/json" data-map></script>
${blocks}
<script>${script}</script>
</body></html>
`;
writeFileSync(path.join(out, "page.html"), html);
const sizes = { page: Buffer.byteLength(html), script: Buffer.byteLength(script), scriptGzip: gzipSync(script, { level: 9 }).byteLength, grammarSizes, shares };
writeFileSync(path.join(out, "sizes.json"), JSON.stringify(sizes, null, 2));
console.log(JSON.stringify(sizes, null, 2));
