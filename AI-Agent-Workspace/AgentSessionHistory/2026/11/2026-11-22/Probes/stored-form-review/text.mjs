// Probe of 2026-11-22 (not product code), the stored form's review: the text export's cost, a path written on every
// line and a file of many lines. From the repository's root:
//   node <this folder>/text.mjs $PWD/packages/stored-form/src/storedForm.ts
const M = await import(process.argv[2]);
const head = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };
const sym = { name: "", kind: "", flags: [], references: [], sections: [], documentation: [] };
const scan = (path, n) => ({ head, files: [{ codePath: path, layer: 0, entries: [], authored: "", symbols: Array.from({ length: n }, () => sym), dependencies: [] }] });

for (const [L, n] of [[16, 1000], [1024, 2000], [1024, 20000], [4096, 20000], [16, 149000], [16, 200000]]) {
  const w = await M.writeScan(scan("a".repeat(L), n));
  if (!w.ok) { console.log(L, n, "write refused", w.reason); continue; }
  const bytes = w.value;
  const read = await M.readScan(bytes);
  const t0 = performance.now();
  let answer;
  try {
    const t = await M.textOf(bytes);
    answer = t.ok ? `text of ${t.value.length} bytes` : `refused: ${t.reason}`;
  } catch (e) {
    answer = `THREW ${e.name}: ${e.message}`;
  }
  console.log(`path ${L} B, ${n} symbols: file ${bytes.length} B, read ${read.ok}, bound ${M.inflationBound(bytes.length)}; textOf: ${answer} in ${(performance.now() - t0).toFixed(0)} ms`);
}
