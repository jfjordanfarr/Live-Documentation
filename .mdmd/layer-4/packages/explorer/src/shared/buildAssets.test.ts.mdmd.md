# packages/explorer/src/shared/buildAssets.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/shared/buildAssets.test.ts
- Generated At: 2026-10-19T17:42:51.289Z

## Authored
### Purpose
Proves that failed client asset compilation or stylesheet copying releases the temporary directory and never calls the output writer.

### Notes
- Added with the resource-lifetime repair after a review found that asset directories made for Explorer exports were not removed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`buildAssets.withExplorerAssets`](./buildAssets.ts.mdmd.md#symbol-withexplorerassets)
- `vitest` - `afterEach`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
