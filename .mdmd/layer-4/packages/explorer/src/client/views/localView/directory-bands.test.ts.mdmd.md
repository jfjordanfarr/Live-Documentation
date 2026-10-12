# packages/explorer/src/client/views/localView/directory-bands.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/directory-bands.test.ts
- Generated At: 2026-10-12T19:35:22.606Z

## Authored
### Purpose

Checks nested directory grouping independently of the DOM: shared rows for disjoint column intervals, separate rows for overlaps, loose files beside subdirectories and single-child chain collapse.

### Notes

- Carries forward the directory-band cases from the March 26 pin-layout tests, when cross-column grouping was introduced. The [October 12 retirement](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4) removed the tests of the retired BFS ranking while retaining the grouping invariants used by the Local Map.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directory-bands.computeDirectoryBands`](./directory-bands.ts.mdmd.md#symbol-computedirectorybands)
- [`directory-bands.parentDirectory`](./directory-bands.ts.mdmd.md#symbol-parentdirectory)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
