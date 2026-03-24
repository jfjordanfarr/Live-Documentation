# packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-hierarchy-test-ts
- Generated At: 2026-03-24T03:05:19.809Z

## Authored

### Purpose

Verifies barrel file detection (`isBarrelFile`) and barrel-as-membrane semantic adjustment (`applyBarrelSemantics`), ensuring barrels are correctly identified across JS/TS/Rust/Python patterns and removed from leaf rendering when siblings exist.

### Notes

- 9 tests covering: positive/negative barrel pattern matching, barrel removal when siblings exist, barrel preservation when it's the only file, recursive application through nested directories, and immutability of the input tree.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.809Z","inputHash":"ae105ab29ca2183a"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [hierarchy.ts](./hierarchy.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->
