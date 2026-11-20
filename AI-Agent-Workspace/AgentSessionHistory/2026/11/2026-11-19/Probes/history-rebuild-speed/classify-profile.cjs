// Sorts the main thread's samples of a summarizing process's CPU profile (node --cpu-prof, run by pool-driver.cjs with
// measure-child.cjs) by what the work depends on, and by the generator's pass it fell in.
//
//   node classify-profile.cjs <file.cpuprofile> <measure-child record .json>
//
// A sample is classed by the innermost frame of its stack that a rule names (so a resolution called from a parse is
// resolution). "bytes" marks work that is a function of one file's bytes alone; "tree" work that reads the rest of the
// tree or the indexes built from it; "output" the writing of the docs, the graph and the summary; "fixed" what every
// process pays whatever the commit. The pass is the window of the measure's marks the sample's time falls in.
"use strict";
const fs = require("node:fs");

const [profileFile, recordFile] = process.argv.slice(2);
const profile = JSON.parse(fs.readFileSync(profileFile, "utf8"));
const record = JSON.parse(fs.readFileSync(recordFile, "utf8"));
const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
const parent = new Map();
for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);

// Innermost first: [test on the frame, class]. Function names, then files.
const RULES = [
  [(f) => f.functionName === "(garbage collector)", "fixed: garbage collection"],
  [(f) => f.functionName === "(idle)", "waiting: idle (a read, git, a timer)"],
  [(f) => f.functionName === "(program)", "other: native, unattributed"],
  [(f) => f.url.startsWith("wasm://") || /^\$?wasm-function|^ts_|^\$ts_/u.test(f.functionName), "bytes: tree-sitter parse (WebAssembly)"],
  [(f) => ["resolveDependency", "resolveWorkspaceAlias", "resolveAliasCandidates", "resolveWithExtensions", "fileExists"].includes(f.functionName), "tree: resolve an import against the files"],
  [(f) => ["augmentWithReExportedSymbols", "collectReExportStarSymbols", "gatherExportedSymbolsFromFile"].includes(f.functionName), "tree: re-exported symbols from providers"],
  [(f) => f.functionName === "inferDomDependencies", "tree: DOM inference"],
  [(f) => f.functionName === "inferRouteDependencies" || f.functionName === "collectRouteCalls", "tree: route inference"],
  [(f) => f.functionName === "createSourceFile" || f.functionName === "parseSourceFile", "bytes: TypeScript parse"],
  [(f) => f.functionName === "collectExportedSymbols", "bytes: TypeScript symbols"],
  [(f) => f.functionName === "collectDependencies" || f.functionName === "dynamicImports" || f.functionName === "extractImportNames", "bytes: TypeScript specifiers"],
  [(f) => f.functionName === "decodeSourceText" || f.functionName === "readSourceText" || f.functionName === "isBinaryContent", "bytes: read and decode"],
  [(f) => f.functionName === "gitIgnored" || /\/glob\/|\/minimatch\/|\/path-scurry\/|\/ignore\//u.test(f.url), "tree: discovery (walk, globs, ignore)"],
  [(f) => ["discoverTargetFiles", "discoverDocuments", "walk", "keptByGitAndConfiguration", "scansWithin", "scansAbove", "isScan", "gitIgnoresCase", "authoredReading"].includes(f.functionName), "tree: discovery (walk, globs, ignore)"],
  [(f) => f.functionName === "citingDocuments" || f.functionName === "markdownLinkTargets" || /markdownLinks\.(js|ts)$/u.test(f.url), "tree: documents' links (Cited By)"],
  [(f) => f.functionName === "readLiveDocGraph" || f.functionName === "writeLiveDocGraph" || /graphFiles\.(js|ts)$|\/graph\.(js|ts)$/u.test(f.url), "output: graph read back and written"],
  [(f) => /history\/summary\.(js|ts)$|textStore\.(js|ts)$/u.test(f.url) || f.functionName === "summarizeGraph" || f.functionName === "putTexts", "output: summary and text store"],
  [(f) => /compose\.(js|ts)$|document\.(js|ts)$|githubSlugger/u.test(f.url), "output: compose, render, read back the docs"],
  [(f) => /\/adapters\/(?!index)[a-zA-Z.]+\.(js|ts)$/u.test(f.url), "adapter"],
  [(f) => f.functionName === "buildWorkspaceIndexes" || f.functionName === "computePublicSymbolHeadingInfo", "tree: the index pass's own work (registering symbols and entries)"],
  [(f) => /\/typescript\/lib\//u.test(f.url), "bytes: TypeScript (other)"],
  [(f) => /\/web-tree-sitter\//u.test(f.url), "bytes: tree-sitter runtime"],
  [(f) => /generator\.(js|ts)$/u.test(f.url), "output: the generator's loop"],
  [(f) => f.url.startsWith("node:") || f.url === "", "other: node internals"]
];

// The rule earliest in RULES that any frame of the stack meets, so that a parse called through node's or TypeScript's
// own frames is still a parse, and a parse called by a resolver is the resolver's.
const classCache = new Map();
function classOf(id) {
  if (classCache.has(id)) return classCache.get(id);
  let best = RULES.length;
  let bestFrame;
  for (let cursor = id; cursor !== undefined; cursor = parent.get(cursor)) {
    const frame = nodes.get(cursor).callFrame;
    for (let index = 0; index < best; index += 1) {
      if (RULES[index][0](frame)) {
        best = index;
        bestFrame = frame;
        break;
      }
    }
  }
  let name = best < RULES.length ? RULES[best][1] : "other";
  if (name === "adapter") name = `adapter: ${/\/adapters\/([a-zA-Z.]+)\.(js|ts)$/u.exec(bestFrame.url)[1].replace(/\..*$/u, "")} (extraction and its own resolution)`;
  classCache.set(id, name);
  return name;
}

// The measure's marks, on the profile's clock.
const offset = record.monotonicAtPreload - record.preloadAt * 1000;
const marks = record.marks.map((mark) => ({ label: mark.label, at: mark.at * 1000 + offset }));
const markAt = (label) => marks.find((mark) => mark.label === label)?.at;
const windows = [
  ["start-up and module loading", -Infinity, markAt("task:read")],
  ["authored blocks read", markAt("task:read"), markAt("generateLiveDocs:start")],
  ["discovery", markAt("generateLiveDocs:start"), markAt("buildWorkspaceIndexes:start")],
  ["index pass", markAt("buildWorkspaceIndexes:start"), markAt("buildWorkspaceIndexes:end")],
  ["documents and Cited By", markAt("buildWorkspaceIndexes:end"), markAt("citingDocuments:end")],
  ["analysis pass (per file)", markAt("citingDocuments:end"), markAt("readLiveDocGraph:start")],
  ["graph read and written", markAt("readLiveDocGraph:start"), markAt("generateLiveDocs:end")],
  ["summary and text store", markAt("generateLiveDocs:end"), Infinity]
];
const windowOf = (time) => windows.find(([, from, to]) => time >= from && time < to)?.[0] ?? "?";

const table = new Map();
const byClass = new Map();
let at = profile.startTime;
let total = 0;
profile.samples.forEach((id, index) => {
  const delta = profile.timeDeltas[index] ?? 0;
  at += delta;
  total += delta;
  const pass = windowOf(at);
  const cls = pass === "start-up and module loading" ? "fixed: start-up and module loading" : classOf(id);
  const key = `${pass}\t${cls}`;
  table.set(key, (table.get(key) ?? 0) + delta);
  byClass.set(cls, (byClass.get(cls) ?? 0) + delta);
});
console.log(`main thread samples over ${(total / 1e6).toFixed(2)} s`);
const buckets = new Map();
for (const [cls, us] of byClass) {
  const bucket = cls.split(":")[0];
  buckets.set(bucket, (buckets.get(bucket) ?? 0) + us);
}
console.log(`buckets: ${[...buckets].sort((a, b) => b[1] - a[1]).map(([bucket, us]) => `${bucket} ${(us / 1e6).toFixed(2)}`).join(", ")}`);
console.log("\nby class:");
for (const [cls, us] of [...byClass].sort((a, b) => b[1] - a[1])) console.log(`${(us / 1e6).toFixed(2).padStart(7)} s  ${cls}`);
console.log("\nby pass and class:");
for (const [pass] of windows) {
  const rows = [...table].filter(([key]) => key.startsWith(`${pass}\t`)).sort((a, b) => b[1] - a[1]);
  const sum = rows.reduce((s, [, us]) => s + us, 0);
  console.log(`${(sum / 1e6).toFixed(2).padStart(7)} s  ${pass}`);
  for (const [key, us] of rows) if (us > 20000) console.log(`${"".padStart(9)}${(us / 1e6).toFixed(2).padStart(7)} s  ${key.split("\t")[1]}`);
}
