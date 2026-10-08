# packages/generator/package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/package.json
- Generated At: 2026-09-30T16:22:05.492Z

## Authored
### Purpose
The manifest of the generator package: one entry, `generator.ts`, that analyses a workspace through the engine and writes one Live Doc per source file, preserving authored sections, and the graph index after every run.

### Notes
- Born 2025-10-16 as `packages/server`, the language server behind the VS Code extension, and renamed to the generator on 2026-09-27 (`cad63bdd`) when the extension and the server were removed and what remained was the generator. It depends on the engine alone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `@live-documentation/generator` {#symbol-live-documentationgenerator}
- Type: package
- Source: [source](../../../../packages/generator/package.json#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`package.@live-documentation/engine`](../engine/package.json.mdmd.md#symbol-live-documentationengine)
<!-- LIVE-DOC:END Dependencies -->
