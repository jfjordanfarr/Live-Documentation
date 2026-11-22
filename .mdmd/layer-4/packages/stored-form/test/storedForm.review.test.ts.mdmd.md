# `packages/stored-form/test/storedForm.review.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/stored-form/test/storedForm.review.test.ts`
- Generated At: 2026-11-22T07:12:57.268Z

## Authored
### Purpose
Holds the stored form to the findings of an independent review of 2026-11-22. Each case is the file or the text that breaks one of the guarantees its specification states, and it fails until the module or the text is mended. The guarantees:
- **A reader's cost is bounded by the file it is handed.** Five cases break it: a text that writes a file's path on every line; a text of too many lines for one call; a graph that sorts paths from their first letter; a whole read that inflates every frame before it checks any; and the memory one byte of a file costs once read.
- **One set of facts has one text.** The end line written six other ways.
- **The whole graph gives every file the view gives.** A file named `__proto__`.
- **A valid text is the text of a valid file.** One string past the section limit.

One case holds the package's fuzzer to reaching a section's grammar. Four cases state a rule the specification's text should settle, and are skipped, each with its reason in its name.

### Notes
Written by a reviewer who did not build the module, from the specification read whole first. [The review's record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-review/README.md) measures each finding at larger sizes with the probes beside it, and says which sentence of the specification each breaks.

On 2026-11-22, 15 cases fail, 1 passes (the text the end-line cases are made from) and 4 are skipped. The builder mends on top of this file: a case that passes after a mend proves that mend.
- **Three cases time their work** against a read run beside them, not against a clock, so that a loaded machine slows both sides.
- **Two hold a few hundred megabytes while they run:** the memory case, and the text of a 64 MiB string.
- **Within the bound by padding.** A file meant to sit within the inflation bound is made so by leading its first stream of records with empty stored blocks. Those inflate to nothing, and any raw deflate stream is allowed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:v8` - `setFlagsFromString`
- `node:vm` - `runInNewContext`
- `node:zlib` - `deflateRawSync`, `inflateRawSync`
- [`storedForm.MAX_SECTION`](../src/storedForm.ts.mdmd.md#symbol-max_section)
- [`storedForm.SIGNATURE`](../src/storedForm.ts.mdmd.md#symbol-signature)
- [`storedForm.Scan`](../src/storedForm.ts.mdmd.md#symbol-scan) (type-only)
- [`storedForm.ScanHead`](../src/storedForm.ts.mdmd.md#symbol-scanhead) (type-only)
- [`storedForm.StoredFile`](../src/storedForm.ts.mdmd.md#symbol-storedfile) (type-only)
- [`storedForm.StoredSymbol`](../src/storedForm.ts.mdmd.md#symbol-storedsymbol) (type-only)
- [`storedForm.bytesOfText`](../src/storedForm.ts.mdmd.md#symbol-bytesoftext)
- [`storedForm.createWriter`](../src/storedForm.ts.mdmd.md#symbol-createwriter)
- [`storedForm.graphOf`](../src/storedForm.ts.mdmd.md#symbol-graphof)
- [`storedForm.graphViewOf`](../src/storedForm.ts.mdmd.md#symbol-graphviewof)
- [`storedForm.inflationBound`](../src/storedForm.ts.mdmd.md#symbol-inflationbound)
- [`storedForm.openScan`](../src/storedForm.ts.mdmd.md#symbol-openscan)
- [`storedForm.readScan`](../src/storedForm.ts.mdmd.md#symbol-readscan)
- [`storedForm.scanOfText`](../src/storedForm.ts.mdmd.md#symbol-scanoftext)
- [`storedForm.textOf`](../src/storedForm.ts.mdmd.md#symbol-textof)
- [`storedForm.textOfScan`](../src/storedForm.ts.mdmd.md#symbol-textofscan)
- [`storedForm.writeScan`](../src/storedForm.ts.mdmd.md#symbol-writescan)
- [`testScans.everyFact`](./testScans.ts.mdmd.md#symbol-everyfact)
- [`testScans.seededScan`](./testScans.ts.mdmd.md#symbol-seededscan)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
