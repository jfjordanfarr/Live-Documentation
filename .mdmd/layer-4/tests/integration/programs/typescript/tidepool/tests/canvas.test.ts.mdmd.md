# tests/integration/programs/typescript/tidepool/tests/canvas.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/tidepool/tests/canvas.test.ts
- Generated At: 2026-11-16T20:15:28.116Z

## Authored
### Purpose
Paints an empty pool beside the saved picture `snapshot.png`; since the sample is never run, it checks only that the picture is there.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). Reads the snapshot with `readFileSync` and `import.meta.url`, which the generator does not record as a use of the asset: the TypeScript reader follows only imports of code and JSON. That gap is kept on purpose, so the sample shows an asset a real project uses that the map cannot connect.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- [`canvas.drawPool`](../src/render/canvas.ts.mdmd.md#symbol-drawpool)
- [`helpers.emptyPool`](./helpers.ts.mdmd.md#symbol-emptypool)
<!-- LIVE-DOC:END Dependencies -->
