// Aggregate a CPU profile's samples between the press markers: self time by function (source-mapped), and inclusive
// time for named functions, and the press's top-level pieces. Usage, from the repository's root:
//   node analyze.mjs <profile> dist/explorer/static/index.js.map [top] [a native function whose callers to list]
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const { TraceMap, originalPositionFor } = require("@jridgewell/trace-mapping");

const [profilePath, mapPath, topArg] = process.argv.slice(2);
const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const map = new TraceMap(fs.readFileSync(mapPath, "utf8"));
const nodes = new Map(profile.nodes.map(node => [node.id, node]));
const parent = new Map();
for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
const nameOf = node => {
  const frame = node.callFrame;
  if (frame.url.endsWith("index.js") && frame.lineNumber >= 0) {
    const pos = originalPositionFor(map, { line: frame.lineNumber + 1, column: frame.columnNumber });
    const file = (pos.source ?? "?").split("/").slice(-1)[0];
    return `${pos.name ?? frame.functionName ?? "(anon)"} ${file}:${pos.line}`;
  }
  return frame.functionName || frame.url || "(native)";
};
const names = new Map();
const label = id => { if (!names.has(id)) names.set(id, nameOf(nodes.get(id))); return names.get(id); };
const stack = id => { const out = []; for (let at = id; at !== undefined; at = parent.get(at)) out.push(at); return out; };

let t = profile.startTime;
const times = profile.timeDeltas.map(delta => (t += delta));
let start = -1, end = -1;
profile.samples.forEach((id, i) => {
  const frames = stack(id).map(each => nodes.get(each).callFrame.functionName);
  if (frames.includes("__pressStartMarker")) start = i;
  if (frames.includes("__pressEndMarker") && end < 0 && start >= 0) end = i;
});
const callersOf = process.argv[5];
const callers = new Map();
const self = new Map(), inclusive = new Map();
let total = 0;
for (let i = start + 1; i < end; i++) {
  const dt = (times[i + 1] ?? times[i]) - times[i];
  total += dt;
  const ids = stack(profile.samples[i]);
  const key = label(ids[0]);
  self.set(key, (self.get(key) ?? 0) + dt);
  for (const name of new Set(ids.map(label))) inclusive.set(name, (inclusive.get(name) ?? 0) + dt);
  if (callersOf && key === callersOf) { const chain = ids.slice(1, 4).map(label).join(" < "); callers.set(chain, (callers.get(chain) ?? 0) + dt); }
}
const tops = new Map();
for (let i = start + 1; i < end; i++) {
  const dt = (times[i + 1] ?? times[i]) - times[i];
  const ids = stack(profile.samples[i]).reverse();
  const key = ids.slice(1, 3).map(label).join(" > ");
  tops.set(key, (tops.get(key) ?? 0) + dt);
}
for (const [k, v] of [...tops].sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`TOP ${(v / 1000).toFixed(1).padStart(8)}  ${k}`);
if (callersOf) for (const [k, v] of [...callers].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`CALLER ${(v / 1000).toFixed(1).padStart(8)}  ${k}`);
const top = Number(topArg ?? 25);
console.log(`press window ${(total / 1000).toFixed(1)} ms`);
console.log("SELF");
for (const [k, v] of [...self].sort((a, b) => b[1] - a[1]).slice(0, top)) console.log(`  ${(v / 1000).toFixed(1).padStart(8)}  ${k}`);
console.log("INCLUSIVE");
for (const [k, v] of [...inclusive].sort((a, b) => b[1] - a[1]).slice(0, top * 2)) console.log(`  ${(v / 1000).toFixed(1).padStart(8)}  ${k}`);
