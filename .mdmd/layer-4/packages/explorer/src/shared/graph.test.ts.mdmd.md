# packages/explorer/src/shared/graph.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/shared/graph.test.ts
- Generated At: 2026-10-30T16:26:09.542Z

## Authored
### Purpose
Checks that projecting canonical documentation into Explorer links preserves documented multiplicity without duplicating type relationships.

### Notes
A rendered-and-parsed fixture combines imports, repeated parameter types, return types, inheritance, reciprocal dependencies and an external dependency. Counts are checked against explicit document facts and the canonical graph is required to remain unchanged. A second fixture (2026-10-30) holds the stats' total: a signature naming one type in three places is one link and three references, and a dependency with no target counts outside the scan; `documentedReferences` counts a link without a count as one.

Created for [the October 13 shared-preset implementation](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.LiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.parseLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.deriveLiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`graph.documentedReferences`](./graph.ts.mdmd.md#symbol-documentedreferences)
- [`graph.explorerGraphOf`](./graph.ts.mdmd.md#symbol-explorergraphof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
