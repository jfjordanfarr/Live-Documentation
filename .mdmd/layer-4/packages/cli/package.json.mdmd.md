# packages/cli/package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/cli/package.json
- Generated At: 2026-10-08T16:03:26.322Z

## Authored
### Purpose
The manifest of the CLI package: a `live-docs` binary that is not yet publishable. It depends on the engine and the Explorer packages and builds its one source file with `tsc`; the root's `npm run build` does not include it.

### Notes
- Born 2025-12-15 as "pre-publish prep" (`7aea17b7`), with the npm metadata the root manifest carries. Its source, `src/index.ts`, spawns `tsx` on the scripts under this repository's `scripts/live-docs/` by a path relative to the package, which works inside this repository and nowhere else; its own comment says a published form would compile the scripts first. Nothing builds, imports or tests the package, so what it offers today is `npm run live-docs:*` under another name. Whether to keep the shell until publishing is near or delete it and build the real package then is the owner's call, asked on 2026-10-08.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `@live-documentation/cli` {#symbol-live-documentationcli}
- Type: package
- Source: [source](../../../../packages/cli/package.json#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`package.@live-documentation/engine`](../engine/package.json.mdmd.md#symbol-live-documentationengine)
- [`package.@live-documentation/explorer`](../explorer/package.json.mdmd.md#symbol-live-documentationexplorer)
<!-- LIVE-DOC:END Dependencies -->
