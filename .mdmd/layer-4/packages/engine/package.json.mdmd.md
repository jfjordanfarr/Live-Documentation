# packages/engine/package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/package.json
- Generated At: 2026-10-08T16:03:26.338Z

## Authored
### Purpose
The manifest of the engine package: configuration, language adapters, the analysis of a source file, the grammar of a Live Doc and the graph derived from the docs. Every module is exported by its path (`@live-documentation/engine/<path>`), so the generator, the Explorer, the CLI scripts and the tests import the module they need and no barrel.

### Notes
- Born 2025-10-16 as `packages/shared` and renamed to the engine on 2026-09-28 (`690f5d27`), when the shared package was understood as the one that does the analysis. Its build copies the PowerShell AST emitter beside its compiled adapter, since the adapter runs it as a script. The tree-sitter grammars come from `@vscode/tree-sitter-wasm` on `web-tree-sitter`; `glob` and `ignore` walk the workspace by the configured globs and its `.gitignore` in `discovery.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `@live-documentation/engine` {#symbol-live-documentationengine}
- Type: package
- Source: [source](../../../../packages/engine/package.json#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@vscode/tree-sitter-wasm@^0.3.0`
- `glob@^13.0.6`
- `ignore@^7.0.5`
- `typescript@^5.4.0`
- `web-tree-sitter@^0.27.0`
<!-- LIVE-DOC:END Dependencies -->
