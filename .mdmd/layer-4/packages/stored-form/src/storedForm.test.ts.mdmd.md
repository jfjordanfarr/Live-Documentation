# `packages/stored-form/src/storedForm.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/stored-form/src/storedForm.test.ts`
- Generated At: 2026-11-22T01:31:13.813Z

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
- [`storedForm.CHUNK`](./storedForm.ts.mdmd.md#symbol-chunk)
- [`storedForm.SIGNATURE`](./storedForm.ts.mdmd.md#symbol-signature)
- [`storedForm.Scan`](./storedForm.ts.mdmd.md#symbol-scan)
- [`storedForm.StoredFile`](./storedForm.ts.mdmd.md#symbol-storedfile)
- [`storedForm.bytesOfText`](./storedForm.ts.mdmd.md#symbol-bytesoftext)
- [`storedForm.createWriter`](./storedForm.ts.mdmd.md#symbol-createwriter)
- [`storedForm.graphOf`](./storedForm.ts.mdmd.md#symbol-graphof)
- [`storedForm.openScan`](./storedForm.ts.mdmd.md#symbol-openscan)
- [`storedForm.readScan`](./storedForm.ts.mdmd.md#symbol-readscan)
- [`storedForm.resumeFrom`](./storedForm.ts.mdmd.md#symbol-resumefrom)
- [`storedForm.scanOfText`](./storedForm.ts.mdmd.md#symbol-scanoftext)
- [`storedForm.textOf`](./storedForm.ts.mdmd.md#symbol-textof)
- [`storedForm.textOfScan`](./storedForm.ts.mdmd.md#symbol-textofscan)
- [`storedForm.writeScan`](./storedForm.ts.mdmd.md#symbol-writescan)
- [`testScans.everyFact`](./testScans.ts.mdmd.md#symbol-everyfact)
- [`testScans.seededScan`](./testScans.ts.mdmd.md#symbol-seededscan)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
