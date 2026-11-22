// Probe of 2026-11-22 (not product code), the stored form's review: `comparePaths` against UTF-8 byte order, on every
// pair of strings of up to two code points drawn from the boundaries of every range. From the repository's root:
//   node <this folder>/order.mjs $PWD/packages/stored-form/src/storedForm.ts
const M = await import(process.argv[2]);
const points = [0x01, 0x2e, 0x2f, 0x41, 0x61, 0x7f, 0x80, 0x7ff, 0x800, 0xd7ff, 0xe000, 0xfeff, 0xfffd, 0xffff, 0x10000, 0x1f600, 0x10fffe, 0x10ffff];
const singles = points.map((p) => String.fromCodePoint(p));
const strings = ["", ...singles, ...singles.flatMap((a) => singles.map((b) => a + b))];
let pairs = 0;
let wrong = 0;
for (const a of strings) {
  for (const b of strings) {
    pairs += 1;
    const want = Math.sign(Buffer.compare(Buffer.from(a), Buffer.from(b)));
    if (M.comparePaths(a, b) !== want) {
      wrong += 1;
      if (wrong < 5) console.log("wrong:", JSON.stringify(a), JSON.stringify(b));
    }
  }
}
console.log(`${pairs} pairs, ${wrong} wrong`);
