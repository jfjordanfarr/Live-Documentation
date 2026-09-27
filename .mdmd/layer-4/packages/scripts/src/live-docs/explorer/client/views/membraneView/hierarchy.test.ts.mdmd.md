# packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-hierarchy-test-ts
- Generated At: 2026-09-27T21:43:39.342Z

## Authored
### Purpose

Verifies barrel file detection (`isBarrelFile`) and barrel-as-membrane semantic adjustment (`applyBarrelSemantics`), ensuring barrels are correctly identified across JS/TS/Rust/Python patterns and removed from leaf rendering when siblings exist.

### Notes

- 9 tests covering: positive/negative barrel pattern matching, barrel removal when siblings exist, barrel preservation when it's the only file, recursive application through nested directories, and immutability of the input tree.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:39.342Z","inputHash":"b7583b18cfe304ab"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`hierarchy.applyBarrelSemantics`](./hierarchy.ts.mdmd.md#symbol-applybarrelsemantics)
- [`hierarchy.isBarrelFile`](./hierarchy.ts.mdmd.md#symbol-isbarrelfile)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
