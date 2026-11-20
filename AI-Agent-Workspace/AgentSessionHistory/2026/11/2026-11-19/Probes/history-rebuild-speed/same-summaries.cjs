// Holds every summary of a scratch cache to the oracle's summary of the same commit, unzipped, byte for byte, and
// every text of the scratch cache's store to the oracle's text of the same name. Reads both, writes neither.
//
//   node same-summaries.cjs <oracle cache folder> <scratch cache folder> [<scratch cache folder> ...]
//
// Exits 1 when a summary or a text differs, or a summary the scratch cache holds is missing from the oracle.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { gunzipSync } = require("node:zlib");

const [oracle, ...scratches] = process.argv.slice(2);
let faults = 0;
for (const scratch of scratches) {
  let same = 0;
  let texts = 0;
  for (const name of fs.readdirSync(scratch).filter((entry) => entry.endsWith(".json.gz"))) {
    const theirs = path.join(oracle, name);
    if (!fs.existsSync(theirs)) {
      console.log(`${scratch}: ${name} is not in the oracle`);
      faults += 1;
      continue;
    }
    if (gunzipSync(fs.readFileSync(path.join(scratch, name))).equals(gunzipSync(fs.readFileSync(theirs)))) same += 1;
    else {
      console.log(`${scratch}: ${name} differs from the oracle's`);
      faults += 1;
    }
  }
  const store = path.join(scratch, "texts");
  if (fs.existsSync(store)) {
    for (const folder of fs.readdirSync(store)) {
      for (const name of fs.readdirSync(path.join(store, folder))) {
        const theirs = path.join(oracle, "texts", folder, name);
        if (fs.existsSync(theirs) && fs.readFileSync(theirs).equals(fs.readFileSync(path.join(store, folder, name)))) texts += 1;
        else {
          console.log(`${scratch}: the text ${name} is not the oracle's`);
          faults += 1;
        }
      }
    }
  }
  console.log(`${scratch}: ${same} summaries identical to the oracle's once unzipped; ${texts} texts identical`);
}
process.exitCode = faults === 0 ? 0 : 1;
