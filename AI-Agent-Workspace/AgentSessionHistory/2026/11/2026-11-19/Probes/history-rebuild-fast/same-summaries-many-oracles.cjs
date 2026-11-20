// Holds every summary of a new cache to the same commit's summary in the first of several oracle caches that holds
// it, unzipped, byte for byte but for the lens key each names. For the landing of 2026-11-20, where no one old cache
// holds every commit: the cache made before that night holds the line up to it, and a cache made that night by the
// unchanged code holds the night's commits. Reads every folder, writes none.
//
//   node same-summaries-many-oracles.cjs <new cache folder> <oracle cache folder> [<oracle cache folder> ...]
//
// Prints each summary that differs with the first place the two texts part, and each the oracles do not hold; exits 1
// when a summary differs. A summary no oracle holds is counted and named, and is not a fault by itself: the caller
// says which commits it expects there (the joining branch's own, which no old code summarized).
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { gunzipSync } = require("node:zlib");

const [fresh, ...oracles] = process.argv.slice(2);
if (!fresh || oracles.length === 0) {
  console.error("usage: same-summaries-many-oracles.cjs <new cache folder> <oracle cache folder> [...]");
  process.exit(2);
}
const LENS = /^\{"format":("[^"]*"),"lens":"[0-9a-f]{16}",/u;
const unlensed = (file) => {
  const text = gunzipSync(fs.readFileSync(file)).toString("utf8");
  if (!LENS.test(text)) throw new Error(`${file} does not begin with a format and a lens key`);
  return text.replace(LENS, '{"format":$1,"lens":"",');
};
const summaries = (folder) => fs.readdirSync(folder).filter((entry) => entry.endsWith(".json.gz") && !entry.endsWith(".index.json.gz"));
const held = oracles.map((folder) => new Set(summaries(folder)));
const same = oracles.map(() => 0);
const differing = [];
const unheld = [];
for (const name of summaries(fresh).sort()) {
  const at = held.findIndex((names) => names.has(name));
  if (at < 0) {
    unheld.push(name);
    continue;
  }
  const theirs = unlensed(path.join(oracles[at], name));
  const ours = unlensed(path.join(fresh, name));
  if (theirs === ours) {
    same[at] += 1;
    continue;
  }
  let first = 0;
  while (first < theirs.length && first < ours.length && theirs[first] === ours[first]) first += 1;
  differing.push(name);
  console.log(`${name} differs from ${oracles[at]} at character ${first} (${theirs.length} against ${ours.length}):`);
  console.log(`  the oracle's: ${JSON.stringify(theirs.slice(Math.max(0, first - 80), first + 160))}`);
  console.log(`  the new one's: ${JSON.stringify(ours.slice(Math.max(0, first - 80), first + 160))}`);
}
for (const name of unheld) console.log(`${name} is in no oracle`);
oracles.forEach((folder, index) => console.log(`${same[index]} summaries identical but for the lens key to ${folder}`));
console.log(`${same.reduce((sum, count) => sum + count, 0)} identical, ${differing.length} differing, ${unheld.length} in no oracle, of ${summaries(fresh).length} in ${fresh}`);
process.exitCode = differing.length === 0 ? 0 : 1;
