// Holds every summary of the oracle's cache that a new cache also holds to the new one, unzipped, byte for byte but
// for the lens key each names, and every text the new cache's store holds to the oracle's text of the same name. For
// a cache made under another lens than the oracle's, by code that should say the same: the key is a label a summary
// carries (`"lens":"<key>"`, its second field), and nothing it says is made from it. Reads both, writes neither.
//
//   node same-summaries-any-lens.cjs <oracle cache folder> <new cache folder>
//
// Exits 1 when a summary or a text differs, or a summary of the new cache is not in the oracle.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { gunzipSync } = require("node:zlib");

const [oracle, fresh] = process.argv.slice(2);
const LENS = /^\{"format":("[^"]*"),"lens":"[0-9a-f]{16}",/u;
const unlensed = (file) => {
  const text = gunzipSync(fs.readFileSync(file)).toString("utf8");
  if (!LENS.test(text)) throw new Error(`${file} does not begin with a format and a lens key`);
  return text.replace(LENS, '{"format":$1,"lens":"",');
};
let same = 0;
let texts = 0;
let faults = 0;
let notInNew = 0;
const names = new Set(fs.readdirSync(fresh).filter((entry) => entry.endsWith(".json.gz") && !entry.endsWith(".index.json.gz")));
for (const name of fs.readdirSync(oracle).filter((entry) => entry.endsWith(".json.gz") && !entry.endsWith(".index.json.gz"))) {
  if (!names.has(name)) {
    notInNew += 1;
    continue;
  }
  names.delete(name);
  if (unlensed(path.join(oracle, name)) === unlensed(path.join(fresh, name))) same += 1;
  else {
    console.log(`${name} differs from the oracle's`);
    faults += 1;
  }
}
for (const name of names) {
  console.log(`${name} is not in the oracle`);
  faults += 1;
}
const store = path.join(fresh, "texts");
if (fs.existsSync(store)) {
  for (const folder of fs.readdirSync(store)) {
    for (const name of fs.readdirSync(path.join(store, folder))) {
      const theirs = path.join(oracle, "texts", folder, name);
      if (fs.existsSync(theirs) && fs.readFileSync(theirs).equals(fs.readFileSync(path.join(store, folder, name)))) texts += 1;
      else {
        console.log(`the text ${name} is not the oracle's`);
        faults += 1;
      }
    }
  }
}
console.log(`${same} summaries identical to the oracle's but for the lens key, ${faults} faults, ${texts} texts identical; ${notInNew} of the oracle's summaries not in the new cache`);
process.exitCode = faults === 0 ? 0 : 1;
