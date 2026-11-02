# packages/explorer/src/client/history/file-identity.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/file-identity.test.ts
- Generated At: 2026-11-01T21:06:14.340Z

## Authored
### Purpose
Keep historical selections distinct across renames, deletion and reuse of the same path, and reject shared identities whose file or commit never existed in the bundle's history.

### Notes
Added with the [November 1 historical-discovery repair](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2). The synthetic sequence independently names a renamed-and-deleted file, a transient file, a surviving rename and an unrelated later file at the deleted path. Assertions cover their identity and absence on both sides of their lifetimes, rather than comparing one encoding routine with itself.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`format.CommitInfo`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`sequence.SequenceBuilder`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape) (type-only)
- [`file-identity.historicalDirectories`](./file-identity.ts.mdmd.md#symbol-historicaldirectories)
- [`file-identity.historicalNode`](./file-identity.ts.mdmd.md#symbol-historicalnode)
- [`file-identity.historicalOrigin`](./file-identity.ts.mdmd.md#symbol-historicalorigin)
- [`file-identity.referenceAt`](./file-identity.ts.mdmd.md#symbol-referenceat)
- [`file-identity.referenceFor`](./file-identity.ts.mdmd.md#symbol-referencefor)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
