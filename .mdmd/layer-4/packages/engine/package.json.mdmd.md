# packages/engine/package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/package.json
- Entry: tooling
- Generated At: 2026-11-18T17:31:24.036Z

## Authored
### Purpose
The manifest of the engine package: configuration, language adapters, the analysis of a source file, the grammar of a Live Doc and the graph derived from the docs. Every module is exported by its path (`@live-documentation/engine/<path>`), so the generator, the Explorer, the CLI scripts and the tests import the module they need and no barrel. Its files are the compiled `dist` and the `grammars` the engine builds itself.

### Notes
- Born 2025-10-16 as `packages/shared` and renamed to the engine on 2026-09-28 (`690f5d27`), when the shared package was understood as the one that does the analysis. Its build is the compiler alone; from 2026-09-27 to 2026-10-16 it also copied the PowerShell AST emitter beside the compiled adapter, which ran it, until the adapter moved to the grammar. The tree-sitter grammars come from `@vscode/tree-sitter-wasm` on `web-tree-sitter`, but for the ones under `grammars/`, PowerShell's since 2026-10-16, built here from an upstream grammar and a patch upstream has not yet taken and committed as wasm so that a user needs nothing else ([the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16)). `glob` and `ignore` walk the workspace by the configured globs and its `.gitignore` in `discovery.ts`. `smol-toml` (2026-10-16) reads the Cargo and Python manifests, the one library added for the four manifest adapters, which the owner approved: "That's a worthy dependency." ([Turn 3 of the October 16 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)).
- Since 2026-11-18 `glob` 14 and `minimatch` 11, a major version each, taken because the advisories of that month against the lines before them had no fix there ([the round](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-dependency-round-landed)). `minimatch` 11 matches each path segment with a matcher that does not backtrack, in place of a regular expression, from a new package of the same author (`@isaacs/nonrecursive-glob-match`); `glob` 14 reads rooted and Windows ignore patterns differently, and this repository has neither. Both were run beside their predecessors before the change, over every tracked path with every pattern the configuration, the audits and the engine's walks use: no path was selected differently.

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
- `glob@^14.0.6`
- `ignore@^7.0.5`
- `minimatch@^11.0.9`
- `smol-toml@^1.9.1`
- `typescript@^5.4.0`
- `web-tree-sitter@^0.27.0`
<!-- LIVE-DOC:END Dependencies -->
