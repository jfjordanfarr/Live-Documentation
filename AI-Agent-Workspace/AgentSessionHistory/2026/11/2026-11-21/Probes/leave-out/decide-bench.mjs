#!/usr/bin/env node
// How long `leaveOut` takes to decide a whole listing, in Node and in a browser page, apart from the time to list it.
//
//   node decide-bench.mjs listing <folder> <out.json>        writes the folder's full listing and its ignore files' texts
//   node decide-bench.mjs node <listing.json>                 decides every path in Node, three times
//   node decide-bench.mjs bundle <out.js>                     writes the function bundled for a page, before the lane
//   node decide-bench.mjs page <listing.json> <rate> <bundle.js>          the same in headless Chromium, from that bundle, its processor slowed by
//                                                             the browser's own throttle; only through the browser lane,
//                                                             under `taskset -c 0,1` to hold it to two cores
//
// Every folder of the listing is asked `folder()`, and every file `file()`, as a walk that lists everything would ask;
// a walk that prunes asks less. The page is the function bundled by esbuild into one inline script.
import { build } from "esbuild";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../../../../../..");
const [mode, input, third] = process.argv.slice(2);

const bundle = async () => (await build({
  stdin: { contents: `import { leaveOut } from ${JSON.stringify(path.join(repo, "packages/engine/src/tooling/leaveOut.ts"))}; globalThis.leaveOut = leaveOut;`, resolveDir: repo, loader: "ts" },
  bundle: true, write: false, format: "iife", platform: "browser", target: "es2022", logLevel: "silent"
})).outputFiles[0].text;

/** The decide step over a listing: every folder, then every file, by a fresh decider. */
const DECIDE = `(listing) => {
  const started = performance.now();
  const decide = globalThis.leaveOut({ ignoreFiles: listing.ignoreFiles, gitIgnoreCase: true, startingList: listing.startingList, ownOutput: [".live-documentation"] });
  let kept = 0;
  for (const folder of listing.folders) decide.folder(folder);
  for (const file of listing.files) if (decide.file(file).kept) kept += 1;
  return { ms: performance.now() - started, kept, paths: listing.folders.length + listing.files.length };
}`;

if (mode === "listing") {
  const files = [];
  const folders = [];
  const ignoreFiles = [];
  const walk = (relative) => {
    for (const entry of fs.readdirSync(path.join(input, relative), { withFileTypes: true })) {
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        folders.push(child);
        walk(child);
      } else {
        files.push(child);
        if (entry.name === ".gitignore" || entry.name.toLowerCase() === ".tfignore") ignoreFiles.push({ path: child, text: fs.readFileSync(path.join(input, child), "utf8") });
      }
    }
  };
  walk("");
  const startingList = fs.readFileSync(path.join(here, "starting-lists", "fixed-list.txt"), "utf8").split("\n");
  fs.writeFileSync(third, JSON.stringify({ files, folders, ignoreFiles, startingList }));
  console.log(`${files.length} files, ${folders.length} folders, ${ignoreFiles.length} ignore files`);
} else if (mode === "bundle") {
  fs.writeFileSync(input, await bundle());
} else if (mode === "node") {
  const listing = JSON.parse(fs.readFileSync(input, "utf8"));
  // The bundle itself, run here, so that Node and the page decide with the same code.
  new Function(await bundle())();
  const decide = new Function(`return ${DECIDE}`)();
  for (let run = 0; run < 3; run++) console.log(JSON.stringify({ where: "node", run, ...decide(listing), load: os.loadavg()[0].toFixed(1) }));
} else if (mode === "page") {
  const { chromium } = await import("@playwright/test");
  const rate = Number(third ?? 1);
  const listing = JSON.parse(fs.readFileSync(input, "utf8"));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><script>${fs.readFileSync(process.argv[5], "utf8")}</script>`);
  const cdp = await page.context().newCDPSession(page);
  if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  for (let run = 0; run < 3; run++) {
    const result = await page.evaluate(`(${DECIDE})(${JSON.stringify(listing)})`);
    console.log(JSON.stringify({ where: "page", rate, cores: os.availableParallelism(), run, ...result, load: os.loadavg()[0].toFixed(1) }));
  }
  await browser.close();
} else {
  console.error("Usage: decide-bench.mjs listing <folder> <out.json> | bundle <out.js> | node <listing.json> | page <listing.json> <rate> <bundle.js>");
  process.exit(2);
}
