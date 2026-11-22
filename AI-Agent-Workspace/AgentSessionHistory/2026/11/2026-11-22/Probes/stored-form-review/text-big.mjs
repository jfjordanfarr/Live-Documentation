// Probe of 2026-11-22 (not product code), the stored form's review: the text export of a file well under the bound
// whose text passes what a JavaScript string can hold. From the repository's root, in a process of its own:
//   node --max-old-space-size=2048 <this folder>/text-big.mjs $PWD/packages/stored-form/src/storedForm.ts 32768 18000
const M = await import(process.argv[2]);
const [L, n] = [Number(process.argv[3]), Number(process.argv[4])];
const head = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };
const sym = { name: "", kind: "", flags: [], references: [], sections: [], documentation: [] };
const w = await M.writeScan({ head, files: [{ codePath: "a".repeat(L), layer: 0, entries: [], authored: "", symbols: Array.from({ length: n }, () => sym), dependencies: [] }] });
if (!w.ok) throw new Error(w.reason);
console.log(`file ${w.value.length} B, bound ${M.inflationBound(w.value.length)}`);
const t0 = performance.now();
try {
  const t = await M.textOf(w.value);
  console.log(t.ok ? `text of ${t.value.length}` : `refused: ${t.reason}`);
} catch (e) {
  console.log(`THREW ${e.name}: ${e.message}`);
}
console.log(`${(performance.now() - t0).toFixed(0)} ms, rss ${(process.memoryUsage().rss / 1048576).toFixed(0)} MiB`);
