# packages/explorer/src/client/views/worldMap/imports.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/worldMap/imports.test.ts
- Generated At: 2026-11-12T21:56:27.140Z

## Authored
### Purpose
Holds the World Map's modules to what they may read: each other, the engine's board, the board's join, the graph and the doc reader, and three client helpers that carry no facts of their own (HTML escaping, the address the page was opened at, the icon button). It is the test the World Map plan's standing rule names: the World Map reads a board and the graphs its things name, and never source ([World Map](../../../../../../../layer-3/world-map.mdmd.md#the-standing-rules)).

### Notes
- Written on 2026-11-12, when the builder of the World Map repairs found that the rule of 2026-10-09 named a test no commit had ever held; the root asked for it, since a document may not claim a test that is not there. It reads each non-test module of the folder with TypeScript's own `preProcessFile`, so imports, re-exports and dynamic imports all count, and names each stranger it finds. Shown failing on a deliberate `node:fs` and `../../types` import in `model.ts` before it was kept ([the round's evidence](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/world-map-repairs/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`, `readdirSync`
- `node:path` - `path`
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
