// Probe of 2026-11-22 (not product code), the stored form's review: which of the reader's checks the package
// fuzzer's 800 mutants reach, each refusal bucketed by the check that made it. From the repository's root:
//   node --max-old-space-size=4096 <this folder>/fuzz-reach.mjs $PWD/packages/stored-form
import { constants, deflateRawSync } from "node:zlib";
const pkg = process.argv[2];
const M = await import(`${pkg}/src/storedForm.ts`);
const T = await import(`${pkg}/test/testScans.ts`);
const { mutant } = await import(`${pkg}/test/fuzz/mutants.mjs`);
const bases = [];
for (const scan of [T.everyFact(), T.seededScan(3, 300)]) bases.push((await M.writeScan(scan)).value);
const bomb = new Uint8Array(deflateRawSync(Buffer.alloc(256 * 1024 * 1024), { level: constants.Z_BEST_SPEED }));
const buckets = new Map();
const bucket = (reason) =>
  reason
    .replace(/^the facts of "[^"]*": /u, "")
    .replace(/\d+/gu, "N")
    .replace(/"[^"]*"/gu, "S")
    .replace(/kind N at byte N/u, "kind N");
for (let seed = 0; seed < 800; seed += 1) {
  const base = bases[Math.floor(seed / 8) % bases.length];
  const { kind, bytes } = mutant(base, seed, bomb);
  const r = await M.readScan(bytes);
  const key = r.ok ? "(read)" : bucket(r.reason);
  const entry = buckets.get(key) ?? { n: 0, kinds: new Set() };
  entry.n += 1;
  entry.kinds.add(kind);
  buckets.set(key, entry);
}
for (const [key, { n, kinds }] of [...buckets].sort((a, b) => b[1].n - a[1].n)) console.log(String(n).padStart(4), key.slice(0, 110), "|", [...kinds].join(", "));
