# packages/explorer/src/client/history/navigation.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/navigation.test.ts
- Generated At: 2026-11-01T21:06:14.496Z

## Authored
### Purpose
Verify that direct history navigation finds actual commits and that narrowing a dense period preserves global step identities, date positions and change significance.

### Notes
Added with the [November 1 timeline repair](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2). Cases include a hash that also occurs in a newer message, displayed dates with offsets, a long gap followed by hundreds of commits, singleton ranges and reversed bounds.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`navigation.findCommits`](./navigation.ts.mdmd.md#symbol-findcommits)
- [`navigation.rangedTickModel`](./navigation.ts.mdmd.md#symbol-rangedtickmodel)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
