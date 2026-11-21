#!/usr/bin/env node
// Builds the scanning page of the standing check that the engine runs in a browser page: the engine and generator as
// they stand, bundled by esbuild for a browser with the stand-ins of this folder in place of Node's modules and of
// `glob`, the grammars the readers load inlined as gzip in base64, and one inline script admitted by its hash. The
// page is test scaffolding, opened from disk by `tests/e2e/page-scan.spec.ts`; nothing here is the product.
//
//   node tests/page-scan/build-page.mjs --out <folder>      writes page.html and inputs.json there
//
// `npm run e2e:bundles` runs it into `dist/page-scan`. `bundleScanner` is also the first level of the check, which
// needs no browser (`node-needs.test.ts`): the bundle must build, and esbuild's own account of it (its metafile) says
// which modules of the engine it holds and which of Node's modules each imports.
import { build } from "esbuild";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

import { ENGINE_ROOT } from "./stand-ins/engine-root.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(here, "..", "..");

/**
 * The stand-in that answers in the page for each of Node's modules the scan's path imports, and for `glob`. A module
 * of the engine or the generator that imports any other of Node's modules stops the build, naming both: that is a new
 * dependence on Node, to be given a stand-in and listed. A package from `node_modules` may import others (TypeScript
 * does, for its command line's file system, which `createSourceFile` never touches); they are left unresolved, so
 * that a call of one throws in the page, and `node-needs.json` lists them.
 */
export const STAND_INS = {
  fs: "fs.mjs",
  "fs/promises": "fs-promises.mjs",
  path: "path.mjs",
  url: "url.mjs",
  process: "process.mjs",
  child_process: "child_process.mjs",
  glob: "glob.mjs"
};

/**
 * The `.wasm` files the readers load, repository-relative: the tree-sitter runtime, the engine's own build of the
 * PowerShell grammar, and the bundled grammars the other readers name (`readTree("<grammar>", …)`). The page puts each
 * at `ENGINE_ROOT/<this path>`, which is where the engine looks.
 */
export const GRAMMARS = [
  "node_modules/web-tree-sitter/web-tree-sitter.wasm",
  "packages/engine/grammars/powershell/tree-sitter-powershell.wasm",
  ...["c-sharp", "cpp", "go", "java", "python", "ruby", "rust"].map((grammar) => `node_modules/@vscode/tree-sitter-wasm/wasm/tree-sitter-${grammar}.wasm`)
];

const standIn = (name) => path.join(here, "stand-ins", name);
const inside = (file, folder) => !path.relative(path.join(REPO, folder), file).startsWith("..");

/** The plugin that puts the stand-ins in place of Node's modules and of `glob`, and refuses a new dependence on Node. */
const standIns = {
  name: "stand-ins",
  setup(builder) {
    builder.onResolve({ filter: /.*/ }, (args) => {
      if (args.path === "real-web-tree-sitter") return { path: path.join(REPO, "node_modules/web-tree-sitter/web-tree-sitter.js") };
      if (args.path === "web-tree-sitter") return { path: standIn("web-tree-sitter.mjs") };
      if (args.path === "glob") return { path: standIn(STAND_INS.glob) };
      if (!isBuiltin(args.path)) return undefined;
      const name = args.path.replace(/^node:/u, "");
      if (STAND_INS[name]) return { path: standIn(STAND_INS[name]) };
      if (inside(args.importer, "packages")) {
        return { errors: [{ text: `${path.relative(REPO, args.importer)} imports ${args.path}, which the scanning page has no stand-in for: write one in tests/page-scan/stand-ins, name it in STAND_INS, and list it in tests/page-scan/node-needs.json` }] };
      }
      return { path: args.path, external: true };
    });
  }
};

/** The bundle of the page's script, built in memory: its text and esbuild's metafile. */
export async function bundleScanner({ minify = true } = {}) {
  const result = await build({
    entryPoints: [path.join(here, "page-entry.mjs")],
    bundle: true,
    write: false,
    metafile: true,
    minify,
    format: "iife",
    platform: "browser",
    target: "es2022",
    absWorkingDir: REPO,
    plugins: [standIns],
    // treeSitter.ts finds its grammars by `__dirname` and `require.resolve`, which a page has not: they answer here
    // under ENGINE_ROOT, the first as a constant for that one module (no other module of the bundle reaches it), the
    // second through a counted function of the stand-ins.
    define: { __dirname: JSON.stringify(`${ENGINE_ROOT}/packages/engine/src/live-docs/adapters`), "require.resolve": "requireResolve" },
    inject: [standIn("require-resolve.mjs")],
    logLevel: "silent"
  });
  return { script: result.outputFiles[0].text, metafile: result.metafile };
}

/**
 * The files a bundle was built from, repository-relative, each with the digest of its bytes, to tell a page built
 * from other sources. Esbuild also names inputs that are no file (`(disabled):source-map-support`, a module a
 * package's `browser` field turns off), which are left out.
 */
export function bundleInputs(metafile) {
  return Object.fromEntries(Object.keys(metafile.inputs).filter((input) => !/^\([a-z-]+\):/u.test(input)).sort().map((input) => [input, createHash("sha256").update(fs.readFileSync(path.join(REPO, input))).digest("hex")]));
}

/** Writes `page.html` and `inputs.json` into `out`; returns the page's path. */
export async function buildScanPage(out) {
  const { script, metafile } = await bundleScanner();
  const blocks = GRAMMARS.map((file) => {
    const packed = gzipSync(fs.readFileSync(path.join(REPO, file)), { level: 9 }).toString("base64");
    return `<script type="application/octet-stream" data-path="${ENGINE_ROOT}/${file}">${packed}</script>`;
  }).join("\n");
  const hash = createHash("sha256").update(script).digest("base64");
  const policy = `default-src 'none'; script-src 'sha256-${hash}' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${policy}">
<title>Scanning page</title>
<style>body{font:14px system-ui;margin:16px}#log{white-space:pre-wrap;font:12px monospace}</style>
</head><body>
<p><label>Choose a folder to scan: <input id="folder" type="file" webkitdirectory></label></p>
<pre id="log"></pre>
${blocks}
<script>${script}</script>
</body></html>
`;
  fs.mkdirSync(out, { recursive: true });
  const page = path.join(out, "page.html");
  fs.writeFileSync(page, html);
  fs.writeFileSync(path.join(out, "inputs.json"), `${JSON.stringify({ grammars: Object.fromEntries(GRAMMARS.map((file) => [file, createHash("sha256").update(fs.readFileSync(path.join(REPO, file))).digest("hex")])), script: bundleInputs(metafile) }, null, 2)}\n`);
  return page;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const flag = process.argv.indexOf("--out");
  if (flag === -1 || !process.argv[flag + 1]) {
    console.error("Usage: node tests/page-scan/build-page.mjs --out <folder>");
    process.exit(2);
  }
  try {
    console.log(`Wrote ${path.relative(REPO, await buildScanPage(path.resolve(process.argv[flag + 1])))}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
