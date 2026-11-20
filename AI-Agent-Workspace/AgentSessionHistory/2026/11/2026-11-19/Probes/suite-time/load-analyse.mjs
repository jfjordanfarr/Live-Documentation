#!/usr/bin/env node
// Reads what `load-profile.ts --profile` wrote for one scenario (its Chrome trace and V8 CPU profile) and prints, for
// the window from navigation to the picture at rest: the page's main thread by DevTools' kinds of work (script, style
// and layout, paint, garbage collection, parsing, idle), the script's time by source module and by function (self and
// total, mapped through the bundle's source map), and every long task with the functions that filled it.
//
//   node <this file> <out dir> <scenario> <rest ms> [bundle dir, default dist/explorer]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve("package.json"));
const { TraceMap, originalPositionFor } = require("@jridgewell/trace-mapping");

const [outDir, scenario, restArg, bundleArg] = process.argv.slice(2);
const rest = Number(restArg);
const bundle = path.resolve(bundleArg ?? "dist/explorer");
const trace = JSON.parse(fs.readFileSync(path.join(outDir, `${scenario}.trace.json`), "utf8"));
const profile = JSON.parse(fs.readFileSync(path.join(outDir, `${scenario}.cpuprofile`), "utf8"));
const events = trace.traceEvents ?? trace;

// The page's main thread: the CrRendererMain whose process navigated.
const threadNames = new Map();
for (const e of events) if (e.ph === "M" && e.name === "thread_name") threadNames.set(`${e.pid}:${e.tid}`, e.args.name);
const nav = events.filter(e => e.name === "navigationStart" && threadNames.get(`${e.pid}:${e.tid}`) === "CrRendererMain" && e.args?.data?.documentLoaderURL?.startsWith("http"));
if (!nav.length) throw new Error("no navigationStart on a renderer main thread");
const navStart = nav[nav.length - 1];
const main = `${navStart.pid}:${navStart.tid}`;
const t0 = navStart.ts, t1 = navStart.ts + rest * 1000;

// Self time of every slice on the main thread inside the window, from its nesting.
const slices = [];
const open = [];
for (const e of events.filter(e => `${e.pid}:${e.tid}` === main).sort((a, b) => a.ts - b.ts)) {
  if (e.ph === "X" && e.dur !== undefined) slices.push({ name: e.name, ts: e.ts, end: e.ts + e.dur, args: e.args });
  else if (e.ph === "B") open.push(e);
  else if (e.ph === "E") { const b = open.pop(); if (b) slices.push({ name: b.name, ts: b.ts, end: e.ts, args: b.args }); }
}
slices.sort((a, b) => a.ts - b.ts || b.end - a.end);
const stack = [];
const self = new Map();
const clip = s => Math.max(0, Math.min(s.end, t1) - Math.max(s.ts, t0));
for (const s of slices) {
  while (stack.length && stack[stack.length - 1].end <= s.ts) stack.pop();
  s.self = clip(s);
  if (stack.length) stack[stack.length - 1].self -= s.self;
  stack.push(s);
}
for (const s of slices) self.set(s.name, (self.get(s.name) ?? 0) + Math.max(0, s.self));
const KINDS = [
  ["script", /^(EvaluateScript|FunctionCall|TimerFire|FireAnimationFrame|FireIdleCallback|EventDispatch|RunMicrotasks|v8\.|V8\.|XHRReadyStateChange|XHRLoad|ResourceReceivedData|MajorGC|MinorGC|BlinkGC|ThreadState|GCEvent|CompileScript|CompileCode|ParseScriptOnBackground|EvaluateModule|HandlePostMessage|ProfileCall|TimerInstall|RequestAnimationFrame|RequestIdleCallback|PerformanceObserver|ScheduleStyleRecalculation|InvalidateLayout|ParserBlocking)/],
  ["style and layout", /^(UpdateLayoutTree|RecalculateStyles|Layout|UpdateLayerTree|HitTest|LayoutShift|IntersectionObserverController|ComputeIntersections|PrePaint|UpdateLayer|LocalFrameView::RunPostLifecycleSteps|ResizeObserver)/],
  ["paint and composite", /^(Paint|PaintImage|PaintSetup|RasterTask|Layerize|Commit|CompositeLayers|UpdateLayer|Decode|Draw|ImageDecodeTask|GPUTask|BeginMainThreadFrame|BeginFrame|Animation|Screenshot|ScrollLayer|SetLayerTreeId|NeedsBeginFrameChanged|ActivateLayerTree)/],
  ["parse HTML and CSS", /^(ParseHTML|ParseAuthorStyleSheet)/]
];
const kindOf = name => (KINDS.find(([, re]) => re.test(name)) ?? ["other"])[0];
const byKind = {};
for (const [name, ms] of self) byKind[kindOf(name)] = (byKind[kindOf(name)] ?? 0) + ms / 1000;
const busy = Object.entries(byKind).filter(([k]) => k !== "other").reduce((a, [, v]) => a + v, 0) + (byKind.other ?? 0);
const gc = [...self].filter(([n]) => /GC|garbage/i.test(n)).reduce((a, [, v]) => a + v / 1000, 0);
// Top-level tasks: the window's work as the scheduler ran it.
const tasks = slices.filter(s => s.name === "RunTask" && clip(s) > 0);
const taskTime = tasks.reduce((a, s) => a + clip(s), 0) / 1000;

// The CPU profile: each sample's time and stack, its functions mapped to their sources.
const maps = new Map();
const mapFor = url => {
  if (!url.includes("/static/index.js")) return null;
  const local = path.join(bundle, new URL(url).pathname.replace(/^\//, "")) + ".map";
  if (!maps.has(local)) maps.set(local, fs.existsSync(local) ? new TraceMap(fs.readFileSync(local, "utf8")) : null);
  return maps.get(local);
};
const sourceLines = new Map();
const lineOf = (source, line) => {
  if (!sourceLines.has(source)) sourceLines.set(source, fs.existsSync(source) ? fs.readFileSync(source, "utf8").split("\n") : []);
  return sourceLines.get(source)[line - 1] ?? "";
};
const nodes = new Map(profile.nodes.map(n => [n.id, n]));
for (const n of profile.nodes) for (const c of n.children ?? []) nodes.get(c).parent = n.id;
const named = new Map();
const nameOf = node => {
  if (named.has(node.id)) return named.get(node.id);
  const f = node.callFrame;
  let key, module;
  const map = f.url ? mapFor(f.url) : null;
  if (map) {
    const pos = originalPositionFor(map, { line: f.lineNumber + 1, column: f.columnNumber });
    if (pos.source) {
      const source = path.resolve(path.dirname(path.join(bundle, "static/index.js")), pos.source);
      const rel = source.replace(/^.*?\/(packages\/|node_modules\/)/, "$1");
      const text = lineOf(source, pos.line);
      const guess = (text.slice(pos.column).match(/^(?:export\s+)?(?:async\s+)?(?:function\*?\s+)?([A-Za-z_$][\w$]*)/) || text.match(/(?:function\*?\s+|const\s+|let\s+|(?:^|\s)(?:get|set|static|async)?\s*)([A-Za-z_$][\w$]*)\s*(?:=|\()/) || [])[1];
      const fn = pos.name ?? guess ?? f.functionName ?? "(anonymous)";
      key = `${fn} (${rel}:${pos.line})`;
      module = rel.startsWith("node_modules/") ? rel.split("/").slice(0, rel.split("/")[1].startsWith("@") ? 3 : 2).join("/") : rel;
    }
  }
  if (!key) {
    key = f.url ? `${f.functionName || "(anonymous)"} (${f.url.replace(/^https?:\/\/[^/]+/, "")}:${f.lineNumber + 1})` : (f.functionName || "(anonymous)");
    module = f.url ? f.url.replace(/^https?:\/\/[^/]+/, "") : f.functionName.startsWith("(") ? f.functionName : `native ${f.functionName}`;
  }
  const value = { key, module };
  named.set(node.id, value);
  return value;
};
let at = profile.startTime;
const selfFn = new Map(), totalFn = new Map(), selfModule = new Map();
const samplesAt = [];
for (let i = 0; i < profile.samples.length; i += 1) {
  const previous = at;
  at += profile.timeDeltas[i];
  const next = i + 1 < profile.timeDeltas.length ? profile.timeDeltas[i + 1] : 0;
  const dt = Math.max(0, next) / 1000; // ms this sample stands for (the interval until the next sample)
  if (at < t0 || at > t1) continue;
  const leaf = nodes.get(profile.samples[i]);
  const { key, module } = nameOf(leaf);
  samplesAt.push({ at, leaf: key, dt, stack: [] });
  selfFn.set(key, (selfFn.get(key) ?? 0) + dt);
  selfModule.set(module, (selfModule.get(module) ?? 0) + dt);
  const seen = new Set();
  for (let n = leaf; n; n = n.parent ? nodes.get(n.parent) : undefined) {
    const k = nameOf(n).key;
    if (seen.has(k)) continue;
    seen.add(k);
    totalFn.set(k, (totalFn.get(k) ?? 0) + dt);
    samplesAt[samplesAt.length - 1].stack.push(k);
  }
  void previous;
}
const sampled = samplesAt.reduce((a, s) => a + s.dt, 0);
const top = (map, n) => [...map].sort((a, b) => b[1] - a[1]).slice(0, n);
const fmt = v => v.toFixed(0).padStart(6);

console.log(`# ${scenario}: navigation to rest ${rest.toFixed(0)} ms`);
console.log(`main thread inside the window: RunTask ${taskTime.toFixed(0)} ms busy of ${rest.toFixed(0)} (${(100 * taskTime / rest).toFixed(0)}%), idle ${(rest - taskTime).toFixed(0)} ms`);
console.log("by kind (trace self time, ms):", Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, Math.round(v)])), "of which GC", Math.round(gc));
console.log("top trace slices by self time (ms):", top(new Map([...self].map(([k, v]) => [k, v / 1000])), 14).map(([k, v]) => `${k} ${v.toFixed(0)}`).join("; "));
console.log(`\nCPU profile in the window: ${sampled.toFixed(0)} ms sampled`);
console.log("by module (self ms):");
for (const [k, v] of top(selfModule, 22)) console.log(`${fmt(v)}  ${k}`);
console.log("by function, self ms:");
for (const [k, v] of top(selfFn, 25)) console.log(`${fmt(v)}  ${k}`);
console.log("by function, total ms (inclusive):");
for (const [k, v] of top(totalFn, 40)) console.log(`${fmt(v)}  ${k}`);
console.log("\nlong tasks (> 50 ms):");
for (const s of tasks.filter(s => s.end - s.ts > 50_000)) {
  const inside = samplesAt.filter(x => x.at >= s.ts && x.at <= s.end);
  const tally = new Map();
  for (const x of inside) for (const k of x.stack) tally.set(k, (tally.get(k) ?? 0) + x.dt);
  const own = new Map();
  for (const x of inside) own.set(x.leaf, (own.get(x.leaf) ?? 0) + x.dt);
  const kinds = new Map();
  for (const c of slices.filter(c => c.ts >= s.ts && c.end <= s.end && c !== s)) kinds.set(kindOf(c.name), (kinds.get(kindOf(c.name)) ?? 0) + Math.max(0, c.self) / 1000);
  console.log(`at ${((s.ts - t0) / 1000).toFixed(0)} ms, ${((s.end - s.ts) / 1000).toFixed(0)} ms: ${[...kinds].filter(([, v]) => v >= 5).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(", ")}`);
  console.log(`    deepest named callers: ${top(tally, 12).filter(([k]) => !/^\(|anonymous/.test(k)).slice(0, 6).map(([k, v]) => `${k} ${v.toFixed(0)}`).join("; ")}`);
  console.log(`    self: ${top(own, 5).map(([k, v]) => `${k} ${v.toFixed(0)}`).join("; ")}`);
}
