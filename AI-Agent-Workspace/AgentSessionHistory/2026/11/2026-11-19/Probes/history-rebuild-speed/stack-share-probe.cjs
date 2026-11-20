// A first look, by the root, at one idea: bound TypeScript's parser by the stack it really uses, not by a count of the
// tree it leaves. A warmed process parses with only a share of its stack left (the rest taken up by plain recursion
// first); is what it reads so always within what a fresh process reads with the whole stack?
//
//   node stack-share-probe.cjs <path to typescript> [share, default 0.3333]
//
// For each construct: F, the most levels a fresh process reads (a process per trial); W, the most a warmed process
// reads with the whole stack; S, the most a warmed process reads with the share. Wanted: S well below F.
//
// Every process it starts is given the node flags this one was started with (since the second measurement of
// 2026-11-20, no-opt-probe.sh, which starts it with V8's optimizing compilers off); with none, it runs as it did for
// stack-share-probe.out.
"use strict";
const { spawnSync } = require("node:child_process");
const tsPath = process.argv[2];
const share = Number(process.argv[3] ?? 1 / 3);
const ts = require(tsPath);

const CONSTRUCTS = {
  "tuple types": [(n) => `type T = ${"[".repeat(n)}number${"]".repeat(n)};`, "m.ts"],
  "type arguments": [(n) => `type T = ${"Array<".repeat(n)}number${">".repeat(n)};`, "m.ts"],
  "arrays": [(n) => `const x = ${"[".repeat(n)}1${"]".repeat(n)};`, "m.ts"],
  "calls": [(n) => `${"f(".repeat(n)}1${")".repeat(n)};`, "m.ts"],
  "parentheses": [(n) => `const x = ${"(".repeat(n)}1${")".repeat(n)};`, "m.ts"],
  "comparisons side by side": [(n) => `export const x = f(${Array(n).fill("a < a").join(", ")});`, "m.ts"],
  "a < b < c": [(n) => `const x = ${Array(n).fill("a").join(" < ")};`, "m.ts"],
  "JSDoc tuple types": [(n) => `/** @type {${"[".repeat(n)}number${"]".repeat(n)}} */\nexport const x = 1;`, "m.js"],
  "JSDoc default": [(n) => `/** @param {number} [a=${"[".repeat(n)}1${"]".repeat(n)}] */\nfunction f(a) {}`, "m.js"],
  "object literals": [(n) => `const x = ${"{a:".repeat(n)}1${"}".repeat(n)};`, "m.ts"],
  "arrow bodies": [(n) => `const x = ${"() => ".repeat(n)}1;`, "m.ts"],
  "conditionals": [(n) => `const x = ${"a ? b : ".repeat(n)}c;`, "m.ts"],
  "object types": [(n) => `type T = ${"{a:".repeat(n)}number${"}".repeat(n)};`, "m.ts"],
  "JSX elements": [(n) => `const x = ${"<a>".repeat(n)}${"</a>".repeat(n)};`, "m.tsx"]
};

const reads = (text, name) => {
  try {
    ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
};
let reached = 0;
function descend(levels, then) {
  reached += 1;
  if (levels === 0) return then();
  return descend(levels - 1, then);
}
function room() {
  reached = 0;
  try {
    descend(Infinity, undefined);
  } catch {
    // The stack ran out: `reached` is how far it went.
  }
  return reached;
}
const withShare = (portion, then) => descend(Math.floor(room() * (1 - portion)), then);
const most = (holds) => {
  let low = 1;
  let high = 2;
  while (holds(high)) {
    low = high;
    high *= 2;
    if (high > 200000) return Infinity;
  }
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (holds(middle)) low = middle;
    else high = middle;
  }
  return low;
};

if (process.argv[4] === "trial") {
  const [make, name] = CONSTRUCTS[process.argv[5]];
  process.exit(reads(make(Number(process.argv[6])), name) ? 0 : 3);
}
if (process.argv[4] === "warm") {
  const [make, name] = CONSTRUCTS[process.argv[5]];
  for (let round = 0; round < 300; round += 1) reads(make(100), name);
  for (let round = 0; round < 5; round += 1) room();
  const whole = most((n) => reads(make(n), name));
  const shared = most((n) => withShare(share, () => reads(make(n), name)));
  const began = process.hrtime.bigint();
  for (let round = 0; round < 200; round += 1) withShare(share, () => 0);
  const each = Number(process.hrtime.bigint() - began) / 200 / 1000;
  console.log(JSON.stringify({ whole, shared, room: room(), microsecondsEach: +each.toFixed(1) }));
  process.exit(0);
}
console.log(`share ${share.toFixed(3)}, node ${process.version}, typescript ${ts.version}`);
console.log("construct | F fresh, whole stack | W warm, whole stack | S warm, the share | W/F | S/F");
for (const name of Object.keys(CONSTRUCTS)) {
  const fresh = most((n) => spawnSync(process.execPath, [...process.execArgv, __filename, tsPath, String(share), "trial", name, String(n)]).status === 0);
  const warm = JSON.parse(spawnSync(process.execPath, [...process.execArgv, __filename, tsPath, String(share), "warm", name], { encoding: "utf8" }).stdout);
  console.log(`${name} | ${fresh} | ${warm.whole} | ${warm.shared} | ${(warm.whole / fresh).toFixed(2)} | ${(warm.shared / fresh).toFixed(2)} | ballast ${warm.microsecondsEach} µs`);
}
