# packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-hierarchy-ts
- Generated At: 2026-03-24T03:05:19.830Z

## Authored

### Purpose

Barrel file detection and semantic adjustment for the Membrane Map hierarchy, ensuring `index.ts`/`index.js` re-export files are absorbed into their parent directory's membrane boundary rather than rendered as standalone leaf tiles.

### Notes

- Created during [Dev Day 80 Step 2](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) after a deliberate scope-down decision: the original plan included `namespaceToHierarchy` for C# namespace grouping, but the namespace data pipeline from server to client didn't exist, so Step 2 was scoped to barrel detection only (namespace mode deferred to LD-1207).
- `BARREL_PATTERNS` is a hardcoded set of known barrel file names (`index.ts`, `index.js`, `index.mjs`, `mod.rs`, `__init__.py`) covering JS/TS, Rust, and Python ecosystems.
- `applyBarrelSemantics` returns a new tree (does not mutate input) — a solo barrel file is kept to avoid zero-weight invisible membranes.
- Reuses the existing `buildHierarchy` from `layoutUtils.ts` rather than reimplementing path-to-tree conversion, applying barrel removal as a post-processing pass on the `DirectoryNode` tree.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.830Z","inputHash":"faaef2a61c74344b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `isBarrelFile` {#symbol-isbarrelfile}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts#L25)

##### `isBarrelFile` — Summary

Returns true if the given filename matches a known barrel file pattern.

#### `applyBarrelSemantics` {#symbol-applybarrelsemantics}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts#L41)
- Returns: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)
- Parameters: `root`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)

##### `applyBarrelSemantics` — Summary

Recursively applies barrel-as-membrane semantics to a DirectoryNode tree.

For each directory that contains a barrel file AND at least one other file,
the barrel file is removed from the directory's `nodes` array. The membrane
boundary itself represents the barrel's re-export surface.

When a barrel file is the only file in a directory, it is kept — removing
it would leave the membrane with zero weight, making it invisible.

This function returns a new tree (does not mutate the input).

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [hierarchy.test.ts](./hierarchy.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
