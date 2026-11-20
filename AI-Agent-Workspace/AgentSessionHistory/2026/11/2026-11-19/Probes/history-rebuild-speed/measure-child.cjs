// Preloaded (`node --require`) into a summarizing process to time it from the inside, changing nothing it computes.
//
// It records, and writes as `<RS_OUT>/<pid>.json` when the process exits:
// - node's own start-up marks (`performance.nodeTiming`) and how long the main module's synchronous loading took;
// - for the built JavaScript only (the TypeScript under tsx defines its exports as getters that cannot be wrapped):
//   wall and processor time inside the generator's passes, by wrapping the writable CommonJS exports of the engine's
//   and generator's modules, cross-module calls only, the outermost call of a function counted when it recurses;
//   each language adapter's `analyze`, apart for the index pass and the analysis pass; each grammar's load;
// - processor time by thread, named as the kernel names it (`/proc/self/task/*/stat`), at each top-level boundary and
//   at exit, and of the process's waited-for children (git) from `/proc/self/stat`;
// - peak resident memory.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { performance } = require("node:perf_hooks");

const OUT = process.env.RS_OUT;
const TICK = 100; // clock ticks per second on Linux (getconf CLK_TCK)
const now = () => performance.now();

// Each thread's processor seconds (utime + stime), and from schedstat its seconds on a processor and waiting on a run
// queue for one, summed by the thread's kind: "main", or the kernel's name for it with its number taken off.
function threads() {
  const out = {};
  try {
    for (const tid of fs.readdirSync("/proc/self/task")) {
      const stat = fs.readFileSync(`/proc/self/task/${tid}/stat`, "utf8");
      const close = stat.lastIndexOf(")");
      const name = stat.slice(stat.indexOf("(") + 1, close);
      const fields = stat.slice(close + 2).split(" ");
      const cpu = (Number(fields[11]) + Number(fields[12])) / TICK;
      const [run, wait, slices] = fs.readFileSync(`/proc/self/task/${tid}/schedstat`, "utf8").trim().split(" ").map(Number);
      const kind = Number(tid) === process.pid ? "main" : name.replace(/[0-9]+$/u, "").trim();
      const entry = (out[kind] ??= { n: 0, cpu: 0, run: 0, wait: 0, slices: 0 });
      entry.n += 1;
      entry.cpu += cpu;
      entry.run += run / 1e9;
      entry.wait += wait / 1e9;
      entry.slices += slices;
    }
  } catch {
    // a thread that ended between the listing and its read
  }
  return out;
}

function childrenCpu() {
  const stat = fs.readFileSync("/proc/self/stat", "utf8");
  const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
  return { user: Number(fields[13]) / TICK, system: Number(fields[14]) / TICK };
}

const record = {
  pid: process.pid,
  argv: process.argv.slice(1),
  preloadAt: now(),
  // The monotonic clock at the same moment, in microseconds, as a CPU profile's timestamps count it.
  monotonicAtPreload: Number(process.hrtime.bigint() / 1000n),
  nodeTiming: undefined,
  mainLoad: undefined,
  marks: [],
  functions: {},
  adapters: {},
  grammars: {},
  cpuAtPreload: process.cpuUsage()
};

function mark(label) {
  const cpu = process.cpuUsage();
  record.marks.push({ label, at: now(), user: cpu.user / 1e6, system: cpu.system / 1e6, rss: process.memoryUsage.rss(), threads: threads() });
}

// The wrapped functions: by module path suffix, the export names to time. Top-level ones also mark the boundaries.
const WRAP = {
  "generator/dist/generator.js": { generateLiveDocs: "top" },
  "engine/dist/live-docs/discovery.js": { discoverTargetFiles: "top", discoverDocuments: "top", buildWorkspaceIndexes: "top" },
  "engine/dist/live-docs/sourceAnalysis.js": { analyzeSourceFile: "inner" },
  "engine/dist/live-docs/adapters/index.js": { analyzeWithLanguageAdapters: "inner" },
  "engine/dist/live-docs/symbolExtraction.js": { collectExportedSymbols: "inner" },
  "engine/dist/live-docs/dependencies.js": { collectDependencies: "inner", augmentWithReExportedSymbols: "inner" },
  "engine/dist/live-docs/heuristics/dom.js": { inferDomDependencies: "inner" },
  "engine/dist/live-docs/heuristics/routes.js": { inferRouteDependencies: "inner" },
  "engine/dist/live-docs/relatedDocs.js": { citingDocuments: "top", relatedDocsOf: "inner" },
  "engine/dist/live-docs/graphFiles.js": { readLiveDocGraph: "top", writeLiveDocGraph: "top" },
  "engine/dist/live-docs/document.js": { renderLiveDoc: "inner", parseLiveDoc: "inner" },
  "engine/dist/live-docs/compose.js": { composeSymbolBlocks: "inner", composeDependencies: "inner", composeEntries: "inner", composeReExports: "inner", composeCitedBy: "inner" },
  "engine/dist/live-docs/history/summary.js": { summarizeGraph: "top" },
  "engine/dist/live-docs/history/textStore.js": { putTexts: "top" },
  "engine/dist/tooling/gitIgnored.js": { gitIgnored: "inner" },
  "engine/dist/tooling/sourceText.js": { readSourceText: "inner" },
  "engine/dist/live-docs/adapters/treeSitter.js": { parseSource: "inner" }
};

const active = new Map(); // function name -> depth
let indexPassDepth = 0;

function account(name, wall, cpu) {
  const f = (record.functions[name] ??= { calls: 0, wall: 0, cpu: 0 });
  f.calls += 1;
  f.wall += wall;
  f.cpu += cpu;
}

function wrap(name, original, kind) {
  const wrapped = function (...args) {
    const depth = active.get(name) ?? 0;
    active.set(name, depth + 1);
    if (name === "buildWorkspaceIndexes") indexPassDepth += 1;
    if (kind === "top" && depth === 0) mark(`${name}:start`);
    const began = now();
    const cpuBegan = process.cpuUsage();
    const done = () => {
      active.set(name, (active.get(name) ?? 1) - 1);
      if (name === "buildWorkspaceIndexes") indexPassDepth -= 1;
      if (depth === 0) {
        const cpu = process.cpuUsage(cpuBegan);
        account(name, now() - began, (cpu.user + cpu.system) / 1e6);
        if (kind === "top") mark(`${name}:end`);
      }
    };
    let result;
    try {
      result = original.apply(this, args);
    } catch (error) {
      done();
      throw error;
    }
    if (result && typeof result.then === "function") {
      return result.then(
        (value) => (done(), value),
        (error) => {
          done();
          throw error;
        }
      );
    }
    done();
    return result;
  };
  return wrapped;
}

function wrapAdapters(adapters) {
  for (const adapter of adapters) {
    const original = adapter.analyze;
    adapter.analyze = async function (input) {
      const pass = indexPassDepth > 0 ? "index" : "analysis";
      const key = `${adapter.id}:${pass}`;
      const began = now();
      const cpuBegan = process.cpuUsage();
      try {
        return await original.call(this, input);
      } finally {
        const cpu = process.cpuUsage(cpuBegan);
        const a = (record.adapters[key] ??= { calls: 0, wall: 0, cpu: 0 });
        a.calls += 1;
        a.wall += now() - began;
        a.cpu += (cpu.user + cpu.system) / 1e6;
      }
    };
  }
}

const patched = new Set();
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (isMain) {
    const began = now();
    mark("main:start");
    try {
      return originalLoad.apply(this, arguments);
    } finally {
      record.mainLoad = { began, ended: now() };
      mark("main:loaded");
    }
  }
  const exports = originalLoad.apply(this, arguments);
  let file;
  try {
    file = Module._resolveFilename(request, parent).split(path.sep).join("/");
  } catch {
    return exports;
  }
  if (patched.has(file)) return exports;
  for (const [suffix, names] of Object.entries(WRAP)) {
    if (!file.endsWith(`/packages/${suffix}`)) continue;
    patched.add(file);
    for (const [name, kind] of Object.entries(names)) {
      const descriptor = Object.getOwnPropertyDescriptor(exports, name);
      if (descriptor && descriptor.writable && typeof descriptor.value === "function") exports[name] = wrap(name, descriptor.value, kind);
    }
    if (suffix === "engine/dist/live-docs/adapters/index.js" && Array.isArray(exports.LANGUAGE_ADAPTERS)) wrapAdapters(exports.LANGUAGE_ADAPTERS);
  }
  if (file.endsWith("/web-tree-sitter/web-tree-sitter.cjs") || /\/web-tree-sitter\/.*\.c?js$/u.test(file)) {
    if (!patched.has("web-tree-sitter") && exports.Language && typeof exports.Language.load === "function") {
      patched.add("web-tree-sitter");
      const load = exports.Language.load;
      exports.Language.load = async function (input) {
        const began = now();
        try {
          return await load.call(this, input);
        } finally {
          const name = typeof input === "string" ? path.basename(input) : "bytes";
          record.grammars[name] = { at: began, wall: now() - began };
        }
      };
    }
  }
  return exports;
};

// The task file is read once the main module has loaded, whether node loaded it as CommonJS or through tsx's hooks.
const readFile = fs.promises.readFile;
fs.promises.readFile = function (file, ...rest) {
  if (file === process.argv[2] && !record.marks.some((entry) => entry.label === "task:read")) mark("task:read");
  return readFile.call(this, file, ...rest);
};

process.on("exit", () => {
  if (!OUT) return;
  mark("exit");
  record.nodeTiming = performance.nodeTiming.toJSON ? performance.nodeTiming.toJSON() : { ...performance.nodeTiming };
  const usage = process.resourceUsage();
  record.resourceUsage = { user: usage.userCPUTime / 1e6, system: usage.systemCPUTime / 1e6, maxRSS: usage.maxRSS * 1024, majorFaults: usage.majorPageFault, minorFaults: usage.minorPageFault, voluntary: usage.voluntaryContextSwitches, involuntary: usage.involuntaryContextSwitches, fsRead: usage.fsRead, fsWrite: usage.fsWrite };
  record.children = childrenCpu();
  record.threadsAtExit = threads();
  record.exitAt = now();
  try {
    const task = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
    record.commit = task.commit;
  } catch {
    // not a summarizing process
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${process.pid}.json`), JSON.stringify(record));
});
