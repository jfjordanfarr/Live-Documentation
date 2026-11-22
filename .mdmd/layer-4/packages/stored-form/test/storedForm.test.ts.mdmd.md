# `packages/stored-form/test/storedForm.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/stored-form/test/storedForm.test.ts`
- Generated At: 2026-11-22T02:13:56.342Z

## Authored
### Purpose
Holds the stored form to its requirements on made scans: every fact read back; the same bytes written as facts arrive, in the pieces handed on, as all at once; binary to text to binary the same bytes and text to binary to text the same text; one text for one set of facts; the graph's edges landing only on scanned files; a stopped write gone on with to the same bytes; facts it cannot hold refused while the writer goes on; and files whole in shape but not in their one form refused.

### Notes
The refusals of non-canonical files are made by setting the frames down again with their own hashes, so that each reaches the check it is for rather than a hash's. The last case holds that the module imports nothing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- `node:zlib` - `deflateRawSync`, `inflateRawSync`
- [`storedForm.CHUNK`](../src/storedForm.ts.mdmd.md#symbol-chunk)
- [`storedForm.SIGNATURE`](../src/storedForm.ts.mdmd.md#symbol-signature)
- [`storedForm.Scan`](../src/storedForm.ts.mdmd.md#symbol-scan)
- [`storedForm.StoredFile`](../src/storedForm.ts.mdmd.md#symbol-storedfile)
- [`storedForm.bytesOfText`](../src/storedForm.ts.mdmd.md#symbol-bytesoftext)
- [`storedForm.comparePaths`](../src/storedForm.ts.mdmd.md#symbol-comparepaths)
- [`storedForm.createWriter`](../src/storedForm.ts.mdmd.md#symbol-createwriter)
- [`storedForm.graphOf`](../src/storedForm.ts.mdmd.md#symbol-graphof)
- [`storedForm.openScan`](../src/storedForm.ts.mdmd.md#symbol-openscan)
- [`storedForm.readScan`](../src/storedForm.ts.mdmd.md#symbol-readscan)
- [`storedForm.resumeFrom`](../src/storedForm.ts.mdmd.md#symbol-resumefrom)
- [`storedForm.scanOfText`](../src/storedForm.ts.mdmd.md#symbol-scanoftext)
- [`storedForm.textOf`](../src/storedForm.ts.mdmd.md#symbol-textof)
- [`storedForm.textOfScan`](../src/storedForm.ts.mdmd.md#symbol-textofscan)
- [`storedForm.writeScan`](../src/storedForm.ts.mdmd.md#symbol-writescan)
- [`testScans.everyFact`](./testScans.ts.mdmd.md#symbol-everyfact)
- [`testScans.random`](./testScans.ts.mdmd.md#symbol-random)
- [`testScans.seededScan`](./testScans.ts.mdmd.md#symbol-seededscan)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
