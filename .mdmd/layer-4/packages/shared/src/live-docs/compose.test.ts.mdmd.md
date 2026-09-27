# packages/shared/src/live-docs/compose.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/compose.test.ts
- Generated At: 2026-09-27T23:21:31.233Z

## Authored
### Purpose
Proves composition: a symbol becomes a heading with its kind, source line and documentation; a type reference links to the doc that declares it, or within the doc when declared there; dependencies link each imported symbol to its anchor; and what is composed is what the grammar writes back.

### Notes
- Replaced `renderPublicSymbolLines.test.ts` on 2026-09-27, which asserted on rendered lines; these assertions are on the model.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`compose.composeDependencies`](./compose.ts.mdmd.md#symbol-composedependencies)
- [`compose.composeSymbolBlocks`](./compose.ts.mdmd.md#symbol-composesymbolblocks)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
